import Foundation

struct ErrorDefinition: Encodable, Hashable {
    struct Code: Encodable, Hashable {
        var name: String
        var value: Value
        var unspecified: Bool?
        var sameAs: String?
        var swiftName: String?

        enum Value: Encodable, Hashable {
            case int(Int)
            case string(String)

            func encode(to encoder: Encoder) throws {
                switch self {
                case .int(let val):
                    try val.encode(to: encoder)

                case .string(let val):
                    try val.encode(to: encoder)
                }
            }
        }
    }
    var module: String
    var domain: String
    var codes: [Code]

    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.domain == rhs.domain
    }
}

extension ErrorDefinition {
    static func from(module: String, rawDomain: String, rawCodes: String) -> Self {
        let domain = rawDomain.components(separatedBy: ",").first ?? rawDomain
        let formatted = formatCodes(rawCodes[...])
        var codes: [Code] = []
        for rawCode in formatted {
            if let code = Code.from(rawCode: rawCode, previous: codes) {
                codes += [code]
            }
        }
        return .init(module: module, domain: domain, codes: codes)
    }
}

private let codeRegex = try! NSRegularExpression(pattern: "(?<name>[a-zA-Z]+)([^=]*=\\s*(?<value>[0-9a-zA-Z-\"']+))?,?")

extension ErrorDefinition.Code {
    static func from(rawCode: String, previous: [Self]) -> Self? {
        guard let match = codeRegex.firstMatch(in: rawCode, range: rawCode.nsRange) else {
            fatalError("regex failure: \(rawCode)")
        }

        let name = rawCode.substring(match.range(withName: "name"))
        if name.hasSuffix("ErrorMinimum") || name.hasSuffix("ErrorMaximum") {
            // skip error boundaries enum case
            return nil
        }

        let valueRange = match.range(withName: "value")
        guard let value = valueRange.location != NSNotFound ? rawCode.substring(valueRange) : nil else {
            // int (auto-increment)
            func toInt(_ code: Self?) -> Int? {
                switch code?.value {
                case .int(let value): return value
                case .string: return nil
                case nil: return nil
                }
            }
            let prev = previous.reversed().lazy.compactMap(toInt).first ?? -1
            return .init(name: name, value: .int(prev + 1), unspecified: true)
        }

        if let found = previous.first(where: { $0.name == value }) {
            return .init(name: name, value: found.value, sameAs: found.name)
        }

        let constants: [String: Any] = [
            "NSIntegerMax": NSIntegerMax
        ]
        let intValue = Int(value)
        let isIntValue = intValue != nil || constants[value] is Int
        assert(previous.allSatisfy({ code in
            switch code.value {
            case .int: return isIntValue
            case .string: return !isIntValue
            }
        }))
        return .init(
            name: name,
            value: (constants[value] as? Int ?? intValue).map(Value.int) ?? .string(value),
            sameAs: constants.keys.contains(value) ? value : nil
        )
    }
}

private func formatCodes(_ input: Substring) -> [String] {
    var cursor = input.startIndex

    func peek() -> Character? {
        guard cursor < input.endIndex else { return nil }
        return input[cursor]
    }
    func consume() -> Character? {
        guard let ch = peek() else { return nil }
        defer { cursor = input.index(after: cursor) }
        return ch
    }

    enum CommentParen {
        case slash
        case asterisk
        case sharp

        var character: Character {
            switch self {
            case .slash: return "/"
            case .asterisk: return "*"
            case .sharp: return "#"
            }
        }
    }

    var formatted = ""
    var comment: CommentParen?
    while let ch = consume() {
        if ch.isWhitespace || ch.isNewline {
            if ch.isNewline, comment == .slash || comment == .sharp {
                comment = nil
            }
            formatted.append(ch)
            continue
        }
        if ch == "/" {
            guard let next = peek() else { continue }
            guard ["/", "*"].contains(next) else { continue }
            if comment == nil {
                comment = next == "/" ? .slash : .asterisk
            }
            _ = consume()
            continue
        }
        if ch == "#" {
            if comment == nil {
                comment = .sharp
            }
            continue
        }
        if ch == comment?.character {
            guard peek() == "/" else { continue }
            comment = nil
            _ = consume()
            continue
        }
        if comment != nil {
            continue
        }
        formatted.append(ch)
    }

    return formatted
        .components(separatedBy: "\n")
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }
}
