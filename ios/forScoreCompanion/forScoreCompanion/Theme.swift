import SwiftUI

enum BrandTheme {
    enum Colors {
        static let background = Color(red: 0.035, green: 0.04, blue: 0.07)
        static let card = Color(red: 0.075, green: 0.09, blue: 0.14)
        static let cardAlt = Color(red: 0.10, green: 0.13, blue: 0.19)
        static let primary = Color(red: 0.21, green: 0.55, blue: 0.98)
        static let accent = Color(red: 0.39, green: 0.39, blue: 0.98)
        static let success = Color(red: 0.13, green: 0.75, blue: 0.44)
        static let warning = Color(red: 0.95, green: 0.63, blue: 0.20)
        static let danger = Color(red: 0.96, green: 0.31, blue: 0.42)
        static let textPrimary = Color.white
        static let textMuted = Color.white.opacity(0.72)
    }

    enum Spacing {
        static let xs: CGFloat = 6
        static let sm: CGFloat = 10
        static let md: CGFloat = 14
        static let lg: CGFloat = 18
        static let xl: CGFloat = 24
    }
}

struct GlassCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(BrandTheme.Spacing.lg)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(LinearGradient(
                        colors: [BrandTheme.Colors.card, BrandTheme.Colors.cardAlt],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Color.white.opacity(0.08), lineWidth: 1)
            )
    }
}

extension View {
    func glassCard() -> some View {
        modifier(GlassCard())
    }
}
