import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject private var sessionStore: SessionStore

    @State private var baseURL = ""
    @State private var pairingCode = ""
    @State private var deviceName = ""
    @State private var isPairing = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: BrandTheme.Spacing.lg) {
                    VStack(alignment: .leading, spacing: BrandTheme.Spacing.sm) {
                        Text("forScore Companion")
                            .font(.system(size: 32, weight: .black))
                            .foregroundStyle(BrandTheme.Colors.textPrimary)
                        Text("Pair this app with your web dashboard to sync files and share them to forScore.")
                            .font(.subheadline)
                            .foregroundStyle(BrandTheme.Colors.textMuted)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .glassCard()

                    VStack(alignment: .leading, spacing: BrandTheme.Spacing.sm) {
                        formField(title: "Backend URL", placeholder: "https://your-domain.com", text: $baseURL)
                            .keyboardType(.URL)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                        formField(title: "Pairing code", placeholder: "ABCD-EFGH", text: $pairingCode)
                            .textInputAutocapitalization(.characters)
                        formField(title: "Device name", placeholder: "Mike’s iPhone", text: $deviceName)
                    }
                    .glassCard()

                    Button {
                        Task {
                            isPairing = true
                            sessionStore.setBaseURL(baseURL)
                            await sessionStore.pair(code: pairingCode, deviceName: deviceName)
                            isPairing = false
                        }
                    } label: {
                        Text(isPairing ? "Pairing…" : "Pair iOS app")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.Colors.primary)
                    .disabled(isPairing || pairingCode.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding(BrandTheme.Spacing.xl)
            }
            .background(BrandTheme.Colors.background.ignoresSafeArea())
            .navigationTitle("Connect")
            .onAppear {
                baseURL = sessionStore.baseURLString
                deviceName = sessionStore.suggestedDeviceName
            }
            .alert("Pairing failed", isPresented: Binding(
                get: { sessionStore.errorMessage != nil },
                set: { if !$0 { sessionStore.errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(sessionStore.errorMessage ?? "")
            }
        }
    }

    private func formField(title: String, placeholder: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(BrandTheme.Colors.textMuted)
            TextField(placeholder, text: text)
                .textFieldStyle(.plain)
                .padding(.horizontal, BrandTheme.Spacing.md)
                .padding(.vertical, BrandTheme.Spacing.sm)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.white.opacity(0.08))
                )
                .foregroundStyle(BrandTheme.Colors.textPrimary)
        }
    }
}
