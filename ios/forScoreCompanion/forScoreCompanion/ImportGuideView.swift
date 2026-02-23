import SwiftUI

struct ImportGuideView: View {
    private let steps: [String] = [
        "Tap Share to forScore for a score in this app.",
        "In the iOS share sheet, choose forScore.",
        "If forScore is hidden, tap More and add it to Favorites.",
        "Confirm import in forScore."
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: BrandTheme.Spacing.md) {
                Text("Import Guide")
                    .font(.largeTitle.bold())
                    .foregroundStyle(BrandTheme.Colors.textPrimary)

                Text("Use these steps to send files into forScore.")
                    .font(.subheadline)
                    .foregroundStyle(BrandTheme.Colors.textMuted)

                ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                    HStack(alignment: .top, spacing: BrandTheme.Spacing.sm) {
                        Text("\(index + 1)")
                            .font(.caption.bold())
                            .padding(8)
                            .background(Circle().fill(BrandTheme.Colors.primary))
                            .foregroundStyle(.white)
                        Text(step)
                            .font(.body)
                            .foregroundStyle(BrandTheme.Colors.textPrimary)
                    }
                    .glassCard()
                }
            }
            .padding(BrandTheme.Spacing.lg)
        }
        .background(BrandTheme.Colors.background.ignoresSafeArea())
        .navigationTitle("forScore Steps")
    }
}
