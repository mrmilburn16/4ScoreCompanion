import Foundation

struct CompanionFile: Codable, Identifiable, Hashable {
    let id: String
    let originalName: String
    let storedName: String
    let extensionValue: String
    let contentType: String
    let size: Int
    let uploadedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case originalName
        case storedName
        case extensionValue = "extension"
        case contentType
        case size
        case uploadedAt
    }

    var uploadedDate: Date? {
        ISO8601DateFormatter().date(from: uploadedAt)
    }
}

struct LinkedDevice: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let createdAt: String
    let lastSeenAt: String?
    let tokenPreview: String
}

struct PairingCodeResponse: Codable {
    let code: String
    let expiresAt: String
}

struct PairingExchangeRequest: Codable {
    let code: String
    let deviceName: String
}

struct PairingExchangeResponse: Codable {
    let token: String
    let device: LinkedDevice
}

struct MobileFilesResponse: Codable {
    let device: LinkedDevice
    let files: [CompanionFile]
}

struct APIErrorResponse: Codable, Error {
    let error: String
    let detail: String?
}
