import Foundation
import ArgumentParser

private func URLByName(_ lhs: URL, _ rhs: URL) -> Bool {
    lhs.lastPathComponent < rhs.lastPathComponent
}

let enumRegex = try! NSRegularExpression(pattern: "NS_ERROR_ENUM\\((?<domain>[a-zA-Z,\\s]+)\\)\\s+\\{(?<codes>[^}]+)\\}")

@main
struct Main: AsyncParsableCommand {
    @Option(
        name: .customLong("path"),
        help: "path to Xcode.app.",
        transform: { path in
            URL(fileURLWithPath: path)
                .appendingPathComponent("Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/System/Library/Frameworks")
        }
    )
    var frameworks: URL

    @Flag(
        name: .customLong("pretty-print"),
        help: "output json with pritty print."
    )
    var isPrettyPrint: Bool = false

    @Option(
        name: [.customLong("output"), .customShort("o")],
        help: "path to output json file.",
        transform: { path in
            URL(fileURLWithPath: path)
        }
    )
    var outputPath: URL?

    private var fileManager: FileManager { .default }

    func validate() throws {
        if !fileManager.fileExists(atPath: frameworks.path) {
            throw ValidationError("framework directory not found. \(frameworks.path)")
        }
    }

    func run() async throws {
        var results: [ErrorCodes] = []

        for item in try fileManager
            .contentsOfDirectory(at: frameworks, includingPropertiesForKeys: [])
            .sorted(by: URLByName)
        {
            results.append(contentsOf: try findErrorCodes(inFrameworks: item))
        }

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys, isPrettyPrint ? .prettyPrinted : []]
        let data = try encoder.encode(results)
        let json = String(data: data, encoding: .utf8) ?? ""

        if let outputPath {
            try json.write(to: outputPath, atomically: true, encoding: .utf8)
        } else {
            print(json)
        }
    }

    private func findErrorCodes(inFrameworks path: URL) throws -> [ErrorCodes] {
        var headers = path.appendingPathComponent("Headers")
        guard fileManager.fileExists(atPath: headers.path) else { return [] }

        var results: [ErrorCodes] = []
        headers = headers
            .deletingLastPathComponent()
            .appendingPathComponent(try fileManager.destinationOfSymbolicLink(atPath: headers.path))
        for item in try fileManager
            .contentsOfDirectory(at: headers, includingPropertiesForKeys: [])
            .sorted(by: URLByName)
        where item.lastPathComponent.hasSuffix(".h")
        {
            results.append(contentsOf: try findErrorCodes(inFile: item, at: path.deletingPathExtension().lastPathComponent))
        }
        return results
    }

    private func findErrorCodes(inFile path: URL, at moduleName: String) throws -> [ErrorCodes] {
        let contents: String
        do {
            let data = try Data(contentsOf: path)
            contents = String(data: data, encoding: .utf8) ?? ""
        } catch {
            print("error at", path.lastPathComponent, error)
            return []
        }
        let matches = enumRegex.matches(in: contents, range: contents.nsRange)

        func substring(_ range: NSRange) -> String {
            contents[Range(range, in: contents)!].trimmingCharacters(in: .whitespacesAndNewlines)
        }

        var results: [ErrorCodes] = []
        for match in matches {
            let domain = substring(match.range(withName: "domain"))
            let codes = substring(match.range(withName: "codes"))
            if domain.contains("MyErrorDomain") {
                // sample code
                continue
            }
            results.append(.from(module: moduleName, rawDomain: domain, rawCodes: codes))
        }
        return results
    }
}
