import Foundation

extension String {
    static func open(at file: URL) throws -> Self {
        let data = try Data(contentsOf: file)
        return String(data: data, encoding: .utf8) ?? ""
    }

    var nsRange: NSRange {
        NSRange(startIndex..<endIndex, in: self)
    }

    func substring(_ range: NSRange) -> String {
        self[Range(range, in: self)!].trimmingCharacters(in: .whitespacesAndNewlines)
    }

    func camelcaseToSnakecase() -> Self {
        let acronymPattern = "([A-Z]+)([A-Z][a-z]|[0-9])"
        let normalPattern = "([a-z0-9])([A-Z])"

        // module prefix separator
        var string = self
        string.insert("_", at: string.index(string.startIndex, offsetBy: 2))

        return string
            .processCamalCaseRegex(pattern: acronymPattern)?
            .processCamalCaseRegex(pattern: normalPattern)?
            .lowercased() ?? lowercased()
    }

    private func processCamalCaseRegex(pattern: String) -> String? {
        let regex = try? NSRegularExpression(pattern: pattern, options: [])
        return regex?.stringByReplacingMatches(in: self, options: [], range: nsRange, withTemplate: "$1_$2")
    }

    func lowerCamelcase() -> Self {
        var string = self
        for i in string.indices {
            guard let next = string.index(i, offsetBy: 1, limitedBy: string.endIndex) else {
                break
            }
            if i == string.startIndex || string[next].isUppercase {
                string.replaceSubrange(i..<next, with: string[i].lowercased())
            } else {
                break
            }
        }
        return string
    }
}

