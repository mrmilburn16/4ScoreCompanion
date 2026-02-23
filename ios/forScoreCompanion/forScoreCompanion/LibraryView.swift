import SwiftUI
import UIKit

struct LibraryView: View {
    @EnvironmentObject private var sessionStore: SessionStore

    @State private var selectedFileForShare: URL?
    @State private var isPreparingShare = false

    var body: some View {
        NavigationStack {
            Group {
                if sessionStore.files.isEmpty {
                    VStack(spacing: BrandTheme.Spacing.md) {
                        Image(systemName: "music.note.list")
                            .font(.system(size: 40, weight: .bold))
                            .foregroundStyle(BrandTheme.Colors.textMuted)
                        Text("No files yet")
                            .font(.title3.bold())
                            .foregroundStyle(BrandTheme.Colors.textPrimary)
                        Text("Upload files from the web app, then pull to refresh.")
                            .font(.subheadline)
                            .foregroundStyle(BrandTheme.Colors.textMuted)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, BrandTheme.Spacing.xl)
                } else {
                    ScrollView {
                        LazyVStack(spacing: BrandTheme.Spacing.md) {
                            ForEach(sessionStore.files) { file in
                                ScoreRowCard(
                                    file: file,
                                    onShare: { Task { await shareFile(file) } },
                                    onOpenDownload: { openDownload(file) }
                                )
                            }
                        }
                        .padding(.horizontal, BrandTheme.Spacing.md)
                        .padding(.bottom, BrandTheme.Spacing.xl)
                    }
                    .refreshable {
                        await sessionStore.refreshFiles()
                    }
                }
            }
            .background(BrandTheme.Colors.background.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    NavigationLink {
                        ImportGuideView()
                    } label: {
                        Text("Guide")
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await sessionStore.refreshFiles() }
                    } label: {
                        if sessionStore.isLoading {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.clockwise")
                        }
                    }
                }
            }
            .navigationTitle("Your Files")
            .onAppear {
                Task { await sessionStore.refreshFiles() }
            }
            .sheet(isPresented: Binding(
                get: { selectedFileForShare != nil },
                set: { if !$0 { selectedFileForShare = nil } }
            )) {
                if let fileURL = selectedFileForShare {
                    ActivityView(activityItems: [fileURL])
                }
            }
            .alert("Action failed", isPresented: Binding(
                get: { sessionStore.errorMessage != nil },
                set: { if !$0 { sessionStore.errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(sessionStore.errorMessage ?? "")
            }
        }
    }

    private func openDownload(_ file: CompanionFile) {
        guard let url = sessionStore.downloadableURL(for: file) else {
            sessionStore.errorMessage = "Could not build download URL."
            return
        }
        UIApplication.shared.open(url)
    }

    private func shareFile(_ file: CompanionFile) async {
        guard !isPreparingShare else {
            return
        }
        isPreparingShare = true
        defer { isPreparingShare = false }

        do {
            let fileURL = try await sessionStore.fetchShareFileURL(for: file)
            selectedFileForShare = fileURL
        } catch {
            sessionStore.errorMessage = error.localizedDescription
        }
    }
}
