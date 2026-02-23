import SwiftUI

@main
struct forScoreCompanionApp: App {
    @StateObject private var sessionStore = SessionStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(sessionStore)
                .tint(BrandTheme.Colors.primary)
        }
    }
}
