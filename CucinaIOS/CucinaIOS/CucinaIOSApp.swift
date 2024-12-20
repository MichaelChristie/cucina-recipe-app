import SwiftUI
import FirebaseCore
import AVFoundation


class AppDelegate: NSObject, UIApplicationDelegate {
  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    FirebaseApp.configure()

    // Configure URL cache and session
    let config = URLSessionConfiguration.default
    config.requestCachePolicy = .returnCacheDataElseLoad
    config.urlCache = URLCache(memoryCapacity: 50 * 1024 * 1024,    // 50 MB
                             diskCapacity: 100 * 1024 * 1024,        // 100 MB
                             diskPath: "image_cache")
    config.timeoutIntervalForRequest = 30
    config.timeoutIntervalForResource = 300
    config.httpMaximumConnectionsPerHost = 4
    URLSession.shared.configuration.httpMaximumConnectionsPerHost = 4

    // Configure tab bar appearance
    let appearance = UITabBarAppearance()
    appearance.configureWithDefaultBackground()
    appearance.backgroundColor = .systemBackground
    
    // Set the active tab color using PrimaryColor from Assets
    let primaryColor = UIColor(named: "PrimaryColor") ?? .systemBlue
    
    // Configure selected state
    appearance.stackedLayoutAppearance.selected.iconColor = primaryColor
    appearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: primaryColor]
    
    // Configure all layout appearances (stacked, inline, compact)
    let appearances = [
        appearance.stackedLayoutAppearance,
        appearance.inlineLayoutAppearance,
        appearance.compactInlineLayoutAppearance
    ]
    
    appearances.forEach { itemAppearance in
        itemAppearance.selected.iconColor = primaryColor
        itemAppearance.selected.titleTextAttributes = [.foregroundColor: primaryColor]
    }
    
    UITabBar.appearance().scrollEdgeAppearance = appearance
    UITabBar.appearance().standardAppearance = appearance
    
    // Ensure the tint color is set for the tab bar
    UITabBar.appearance().tintColor = primaryColor

    return true
  }
}

@main
struct CucinaIOSApp: App {
  // register app delegate for Firebase setup
  @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate


  var body: some Scene {
    WindowGroup {
      MainTabView()
    }
      
  }
}

#Preview {
    MainTabView()
}

// Use this version for older Xcode versions
struct CucinaIOSApp_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
    }
}

class YourViewController: UIViewController {
    private var player: AVPlayer?
    private var playerItem: AVPlayerItem?
    private var statusObservation: NSKeyValueObservation?
    
    func prepareAndPlayVideo(with url: URL) {
        // Clean up existing player and observations
        statusObservation?.invalidate()
        player?.pause()
        
        // Create new player item and player
        playerItem = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: playerItem)
        
        // Observe player status using modern KVO
        statusObservation = player?.observe(\.status, options: [.new]) { [weak self] player, _ in
            DispatchQueue.main.async {
                switch player.status {
                case .readyToPlay:
                    print("Player is ready to play")
                    // Only preroll when player is ready
                    Task {
                        do {
                            try await player.preroll(atRate: 1.0)
                            player.play()
                        } catch {
                            print("Preroll failed:", error)
                        }
                    }
                case .failed:
                    print("Player failed:", player.error ?? "unknown error")
                case .unknown:
                    print("Player status is unknown")
                @unknown default:
                    break
                }
            }
        }
    }
    
    deinit {
        statusObservation?.invalidate()
        player?.pause()
        player = nil
    }
}
