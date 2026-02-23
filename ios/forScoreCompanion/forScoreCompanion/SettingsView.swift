import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var sessionStore: SessionStore
    @State private var editedBaseURL = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: BrandTheme.Spacing.lg) {
                    VStack(alignment: .leading, spacing: BrandTheme.Spacing.sm) {
                        Text("Connection")
                            .font(.headline)
                            .foregroundStyle(BrandTheme.Colors.textPrimary)
                        TextField("Backend URL", text: $editedBaseURL)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .padding(.horizontal, BrandTheme.Spacing.md)
                            .padding(.vertical, BrandTheme.Spacing.sm)
                            .background(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(Color.white.opacity(0.08))
                            )
                            .foregroundStyle(BrandTheme.Colors.textPrimary)
                        Button("Save URL") {
                            sessionStore.setBaseURL(editedBaseURL)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(BrandTheme.Colors.primary)
                    }
                    .glassCard()

                    VStack(alignment: .leading, spacing: BrandTheme.Spacing.sm) {
                        Text("Linked device")
                            .font(.headline)
                            .foregroundStyle(BrandTheme.Colors.textPrimary)
                        if let pairedDevice = sessionStore.pairedDevice {
                            Text(pairedDevice.name)
                                .font(.subheadline.bold())
                                .foregroundStyle(BrandTheme.Colors.textPrimary)
                            Text("Token preview: \(pairedDevice.tokenPreview)")
                                .font(.caption)
                                .foregroundStyle(BrandTheme.Colors.textMuted)
                        } else {
                            Text("No linked device metadata loaded yet.")
                                .font(.caption)
                                .foregroundStyle(BrandTheme.Colors.textMuted)
                        }
                        HStack(spacing: BrandTheme.Spacing.sm) {
                            Button("Refresh files") {
                                Task { await sessionStore.refreshFiles() }
                            }
                            .buttonStyle(.bordered)

                            Button("Sign out", role: .destructive) {
                                sessionStore.signOut()
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                    .glassCard()
                }
                .padding(BrandTheme.Spacing.lg)
            }
            .background(BrandTheme.Colors.background.ignoresSafeArea())
            .navigationTitle("Settings")
            .onAppear {
                editedBaseURL = sessionStore.baseURLString
            }
        }
    }
}
