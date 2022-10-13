import Foundation

extension String {
    var nsRange: NSRange {
        NSRange(startIndex..<endIndex, in: self)
    }

    func substring(_ range: NSRange) -> String {
        self[Range(range, in: self)!].trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
