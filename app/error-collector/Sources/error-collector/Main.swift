import Foundation
import ArgumentParser

private let enumRegex = try! NSRegularExpression(pattern: "NS_ERROR_ENUM\\((?<domain>[a-zA-Z,\\s]+)\\)\\s+\\{(?<codes>[^}]+)\\}")

@main
struct Main: AsyncParsableCommand {
    @Option(
        name: .customLong("path"),
        help: "path to Xcode.app.",
        transform: URL.init(fileURLWithPath:)
    )
    var xcodePath: URL

    @Option(
        name: [.customLong("output"), .customShort("o")],
        help: "path to output json file.",
        transform: URL.init(fileURLWithPath:)
    )
    var outputPath: URL?

    @Flag(
        name: .customLong("pretty-print"),
        help: "output json with pritty printed."
    )
    var isPrettyPrint: Bool = false

    private var fileManager: FileManager { .default }

    private var platforms: [URL] {
        let platforms = xcodePath
            .appendingPathComponent("Contents/Developer/Platforms")
        return [
            platforms
                .appendingPathComponent("MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks"),
            platforms
                .appendingPathComponent("iPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk/System/Library/Frameworks")
        ]
    }

    struct JSON: Encodable {
        var version: Version
        var errors: [ErrorDefinition]
    }

    func validate() throws {
        for url in platforms {
            if !fileManager.fileExists(atPath: url.path) {
                throw ValidationError("framework directory not found. \(url.path)")
            }
        }
    }

    func run() async throws {
        let json = JSON(
            version: try .from(at: xcodePath),
            errors: try collectErrorDefinitions()
        )

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys, isPrettyPrint ? .prettyPrinted : []]
        let data = try encoder.encode(json)
        let string = String(data: data, encoding: .utf8) ?? ""

        if let outputPath {
            try string.write(to: outputPath, atomically: true, encoding: .utf8)
        } else {
            print(string)
        }
    }

    // MARK: - private
    private func collectErrorDefinitions() throws -> [ErrorDefinition] {
        var results: [String: ErrorDefinition] = [:]

        for frameworks in platforms {
            let dirs = try fileManager.contentsOfDirectory(at: frameworks, includingPropertiesForKeys: [])
            for item in dirs {
                for def in try findErrorDefinitions(inFrameworks: item) {
                    if let old = results[def.domain] {
                        if old.codes != def.codes {
                            print("in domain: \(def.domain), \(old.codes.map(\.name)) not equals \(def.codes.map(\.name))\n")
                        }
                        if old.codes.count < def.codes.count {
                            // override by a greater number of codes definitions
                            results[def.domain] = def
                        }
                    } else {
                        results[def.domain] = def
                    }
                }
            }
        }

        return results.values.sorted(by: { ($0.module, $0.domain) < ($1.module, $1.domain) })
    }

    private func findErrorDefinitions(inFrameworks path: URL) throws -> [ErrorDefinition] {
        var headers = path.appendingPathComponent("Headers")
        guard fileManager.fileExists(atPath: headers.path) else { return [] }

        var apinotes: [String: String?] = [:]
        var results: [ErrorDefinition] = []
        headers = headers
            .deletingLastPathComponent()
            .appendingPathComponent((try? fileManager.destinationOfSymbolicLink(atPath: headers.path)) ?? "Headers")

        let moduleName = path.deletingPathExtension().lastPathComponent

        let items = try fileManager.contentsOfDirectory(at: headers, includingPropertiesForKeys: [])
        for item in items where item.lastPathComponent.hasSuffix(".h") {
            results.append(contentsOf: try findErrorDefinitions(inFile: item, at: moduleName, apinotes: &apinotes))
        }
        return results
    }

    private func findErrorDefinitions(inFile path: URL,
                                      at moduleName: String,
                                      apinotes cache: inout [String: String?]) throws -> [ErrorDefinition] {
        lazy var apinotes: String? = {
            if cache.keys.contains(moduleName) {
                return cache[moduleName] ?? nil
            }
            let notes = try? String.open(at: path.deletingLastPathComponent().appendingPathComponent("\(moduleName).apinotes"))
            cache[moduleName] = notes
            return notes
        }()

        let contents: String
        do {
            contents = try .open(at: path)
        } catch {
            print("error at", path.lastPathComponent, error)
            return []
        }
        let matches = enumRegex.matches(in: contents, range: contents.nsRange)

        var results: [ErrorDefinition] = []
        for match in matches {
            let domain = contents.substring(match.range(withName: "domain"))
            let codes = contents.substring(match.range(withName: "codes"))
            if domain.contains("MyErrorDomain") {
                // sample code
                continue
            }
            var def = ErrorDefinition.from(module: moduleName, rawDomain: domain, rawCodes: codes)
            if !findSwiftNames(for: &def.codes, with: apinotes) {
                inferSwiftNames(for: &def.codes)
                // `NSCocoaErrorDomain` almost has suffix `Error`, but swift representation has no `Error`.
                // so, remove it manually.
                if def.domain == "NSCocoaErrorDomain" {
                    for (i, code) in def.codes.enumerated() where code.name.hasSuffix("Error") {
                        def.codes[i].swiftName = code.swiftName.map { String($0.dropLast(5)) }
                    }
                }
            }
            results.append(def)
        }
        return results
    }
}

private func findSwiftNames(for codes: inout [ErrorDefinition.Code], with apinotes: String?) -> Bool {
    guard let apinotes else { return false }

    var mutableCodes = codes
    for (i, code) in mutableCodes.enumerated() {
        let regex = try! NSRegularExpression(pattern: "- Name: \(code.name)\n\\s+SwiftName:\\s(?<swiftName>[a-zA-Z]+)")
        guard let match = regex.firstMatch(in: apinotes, range: apinotes.nsRange) else { return false }
        mutableCodes[i].swiftName = apinotes.substring(match.range(withName: "swiftName"))
    }

    codes = mutableCodes
    return true
}

private func inferSwiftNames(for codes: inout [ErrorDefinition.Code]) {
    var offset = 0
    let names = codes.map { $0.name.camelcaseToSnakecase().components(separatedBy: "_") }
    while true {
        var buf: String?

        func check() -> Bool {
            for name in names {
                guard name.indices.contains(offset) else { return false }
                if buf == nil {
                    buf = name[offset]
                } else if buf != name[offset] {
                    return false
                }
            }
            offset += 1
            return true
        }

        if !check() {
            break
        }
    }

    for (i, name) in names.enumerated() {
        let prefix = name.prefix(offset).joined().count
        codes[i].swiftName = String(codes[i].name.dropFirst(prefix)).lowerCamelcase()
    }
}
