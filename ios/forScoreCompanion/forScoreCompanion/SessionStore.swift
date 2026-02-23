import Foundation

@MainActor
final class SessionStore: ObservableObject {
    @Published var baseURLString: String
    @Published var pairedDevice: LinkedDevice?
    @Published var files: [CompanionFile] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiClient = APIClient()
    private let tokenKey = "forScoreCompanion.authToken"
    private let defaultsBaseURLKey = "forScoreCompanion.baseURL"
    private let defaultsDeviceNameKey = "forScoreCompanion.deviceName"

    init() {
        self.baseURLString = UserDefaults.standard.string(forKey: defaultsBaseURLKey) ?? "http://localhost:3002/"
    }

    var token: String? {
        KeychainStore.readToken(for: tokenKey)
    }

    var hasSession: Bool {
        token != nil
    }

    var suggestedDeviceName: String {
        UserDefaults.standard.string(forKey: defaultsDeviceNameKey) ?? "My iPhone"
    }

    func setBaseURL(_ value: String) {
        baseURLString = value
        UserDefaults.standard.set(value, forKey: defaultsBaseURLKey)
    }

    func setDeviceName(_ value: String) {
        UserDefaults.standard.set(value, forKey: defaultsDeviceNameKey)
    }

    func pair(code: String, deviceName: String) async {
        do {
            guard let baseURL = normalizeBaseURL(baseURLString) else {
                throw APIClientError.invalidURL
            }

            setDeviceName(deviceName)
            let result = try await apiClient.exchangePairingCode(
                baseURL: baseURL,
                code: code,
                deviceName: deviceName
            )
            KeychainStore.save(token: result.token, for: tokenKey)
            pairedDevice = result.device
            errorMessage = nil
            await refreshFiles()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refreshFiles() async {
        do {
            guard let baseURL = normalizeBaseURL(baseURLString) else {
                throw APIClientError.invalidURL
            }
            guard let token else {
                throw APIClientError.unauthorized
            }

            isLoading = true
            defer { isLoading = false }

            let response = try await apiClient.fetchFiles(baseURL: baseURL, token: token)
            pairedDevice = response.device
            files = response.files
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func downloadableURL(for file: CompanionFile) -> URL? {
        guard let baseURL = normalizeBaseURL(baseURLString) else {
            return nil
        }
        return baseURL.appending(path: "api/files/\(file.id)/download")
    }

    func fetchShareFileURL(for file: CompanionFile) async throws -> URL {
        guard let baseURL = normalizeBaseURL(baseURLString) else {
            throw APIClientError.invalidURL
        }
        return try await apiClient.downloadFile(baseURL: baseURL, file: file)
    }

    func signOut() {
        KeychainStore.removeToken(for: tokenKey)
        files = []
        pairedDevice = nil
    }

    private func normalizeBaseURL(_ value: String) -> URL? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return nil
        }
        let withProtocol = trimmed.hasPrefix("http://") || trimmed.hasPrefix("https://")
            ? trimmed
            : "https://\(trimmed)"
        guard var url = URL(string: withProtocol) else {
            return nil
        }
        if !url.absoluteString.hasSuffix("/") {
            url.append(path: "")
        }
        return url
    }
}
