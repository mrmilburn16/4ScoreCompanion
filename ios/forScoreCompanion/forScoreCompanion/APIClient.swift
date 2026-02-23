import Foundation

enum APIClientError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid backend URL."
        case .invalidResponse:
            return "The server response was invalid."
        case .unauthorized:
            return "Unauthorized. Pair your device again."
        case let .server(message):
            return message
        }
    }
}

final class APIClient {
    func exchangePairingCode(baseURL: URL, code: String, deviceName: String) async throws -> PairingExchangeResponse {
        let endpoint = baseURL.appending(path: "api/pairing/exchange")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(PairingExchangeRequest(code: code, deviceName: deviceName))

        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)
        return try JSONDecoder().decode(PairingExchangeResponse.self, from: data)
    }

    func fetchFiles(baseURL: URL, token: String) async throws -> MobileFilesResponse {
        let endpoint = baseURL.appending(path: "api/mobile/files")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response: response, data: data)
        return try JSONDecoder().decode(MobileFilesResponse.self, from: data)
    }

    func downloadFile(baseURL: URL, file: CompanionFile) async throws -> URL {
        let endpoint = baseURL.appending(path: "api/files/\(file.id)/download")
        let (data, response) = try await URLSession.shared.data(from: endpoint)
        try validate(response: response, data: data)

        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent(file.originalName)
        try data.write(to: fileURL, options: .atomic)
        return fileURL
    }

    private func validate(response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        if (200 ..< 300).contains(httpResponse.statusCode) {
            return
        }

        if httpResponse.statusCode == 401 {
            throw APIClientError.unauthorized
        }

        if let apiError = try? JSONDecoder().decode(APIErrorResponse.self, from: data) {
            throw APIClientError.server(apiError.error)
        }

        throw APIClientError.server("Request failed with status \(httpResponse.statusCode).")
    }
}
