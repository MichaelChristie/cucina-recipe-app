import SwiftUI
import FirebaseCore


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