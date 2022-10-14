import Foundation

struct Version: Encodable {
    var xcode: String
    var build: String

    static func from(at xcodePath: URL) throws -> Self {
        struct InfoPlist: Decodable {
            var CFBundleShortVersionString: String
            var ProductBuildVersion: String
        }
        let data: Data
        do {
            data = try Data(contentsOf: xcodePath.appendingPathComponent("Contents/version.plist"))
        } catch {
            throw DecodingError.valueNotFound(Data.self, .init(codingPath: [], debugDescription: "missing version.plist"))
        }
        let raw = try PropertyListDecoder().decode(InfoPlist.self, from: data)
        return .init(xcode: raw.CFBundleShortVersionString, build: raw.ProductBuildVersion)
    }
}
