import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var sessionStore: SessionStore

    var body: some View {
        Group {
            if sessionStore.hasSession {
                TabView {
                    LibraryView()
                        .tabItem {
                            Label("Library", systemImage: "music.note.list")
                        }

                    SettingsView()
                        .tabItem {
                            Label("Settings", systemImage: "gearshape")
                        }
                }
            } else {
                OnboardingView()
            }
        }
        .background(BrandTheme.Colors.background.ignoresSafeArea())
        .preferredColorScheme(.dark)
    }
}
