import SwiftUI
import UIKit

struct RemoteScore: Identifiable, Decodable {
    let id: String
    let originalName: String
    let extensionValue: String
    let size: Int
    let uploadedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case originalName
        case extensionValue = "extension"
        case size
        case uploadedAt
    }
}

struct APIResponse: Decodable {
    let files: [RemoteScore]
}

struct ShareToForScoreView: View {
    @State private var files: [RemoteScore] = []
    @State private var loading = false
    @State private var message: String?

    // Replace with your deployed backend URL.
    private let baseURL = URL(string: "https://your-domain.example.com")!

    var body: some View {
        NavigationView {
            Group {
                if loading {
                    ProgressView("Loading scores…")
                } else if files.isEmpty {
                    ContentUnavailableView(
                        "No Uploaded Scores",
                        systemImage: "music.note.list",
                        description: Text("Upload files from the web app first.")
                    )
                } else {
                    List(files) { file in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(file.originalName)
                                .font(.headline)
                            HStack {
                                Text(file.extensionValue.uppercased())
                                Text("•")
                                Text(ByteCountFormatter.string(fromByteCount: Int64(file.size), countStyle: .file))
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)

                            Button("Share to forScore") {
                                share(file: file)
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .padding(.vertical, 6)
                    }
                }
            }
            .navigationTitle("forScore Companion")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Refresh") {
                        Task { await loadFiles() }
                    }
                }
            }
        }
        .task {
            await loadFiles()
        }
        .alert("Notice", isPresented: Binding(
            get: { message != nil },
            set: { if !$0 { message = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(message ?? "")
        }
    }

    @MainActor
    private func loadFiles() async {
        loading = true
        defer { loading = false }

        do {
            let url = baseURL.appendingPathComponent("/api/files")
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode(APIResponse.self, from: data)
            files = decoded.files
        } catch {
            message = "Failed to load files: \(error.localizedDescription)"
        }
    }

    private func share(file: RemoteScore) {
        let url = baseURL.appendingPathComponent("/api/files/\(file.id)/download")
        let activity = UIActivityViewController(activityItems: [url], applicationActivities: nil)

        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let root = windowScene.windows.first?.rootViewController else {
            message = "Unable to open share sheet."
            return
        }

        root.present(activity, animated: true)
    }
}
