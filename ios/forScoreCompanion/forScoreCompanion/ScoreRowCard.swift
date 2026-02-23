import SwiftUI

struct ScoreRowCard: View {
    let file: CompanionFile
    let onShare: () -> Void
    let onOpenDownload: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: BrandTheme.Spacing.sm) {
            Text(file.originalName)
                .font(.headline)
                .foregroundStyle(BrandTheme.Colors.textPrimary)
                .lineLimit(2)

            HStack(spacing: BrandTheme.Spacing.sm) {
                chip(file.extensionValue.uppercased())
                chip(ByteCountFormatter.string(fromByteCount: Int64(file.size), countStyle: .file))
                chip(file.uploadedDate?.formatted(date: .abbreviated, time: .shortened) ?? "Unknown date")
            }

            HStack(spacing: BrandTheme.Spacing.sm) {
                Button("Share to forScore", action: onShare)
                    .buttonStyle(.borderedProminent)
                    .tint(BrandTheme.Colors.primary)
                Button("Open Download", action: onOpenDownload)
                    .buttonStyle(.bordered)
                    .tint(BrandTheme.Colors.textMuted)
            }
            .font(.subheadline.weight(.semibold))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard()
    }

    private func chip(_ value: String) -> some View {
        Text(value)
            .font(.caption.bold())
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(
                Capsule(style: .continuous)
                    .fill(Color.white.opacity(0.10))
            )
            .foregroundStyle(BrandTheme.Colors.textMuted)
    }
}
