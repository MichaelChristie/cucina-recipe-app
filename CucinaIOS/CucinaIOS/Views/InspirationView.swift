import SwiftUI
// import FirebaseFirestore
import AVKit
import Combine

class MediaCache: ObservableObject {
    static let shared = MediaCache()
    private var images: [String: UIImage] = [:]
    private var players: [String: AVPlayer] = [:]
    private var loadingTasks: [String: Task<Void, Never>] = [:]
    private var observations: [String: NSKeyValueObservation] = [:]
    
    // Add maximum cache sizes
    private let maxPlayers = 3
    private let maxImages = 10
    
    func getImage(for url: String) -> UIImage? {
        images[url]
    }
    
    func getPlayer(for url: String) -> AVPlayer? {
        print("🔍 Fetching player for: \(url)")
        if let player = players[url] {
            print("📦 Found cached player with status: \(player.status.rawValue)")
            if player.status == .readyToPlay {
                // Reset and prepare player for playback
                player.seek(to: .zero)
                player.rate = 1.0
                print("▶️ Player ready for playback")
            }
        }
        return players[url]
    }
    
    func cache(image: UIImage, for url: String) {
        images[url] = image
    }
    
    func cache(player: AVPlayer, for url: String) {
        print("💾 Caching player for: \(url)")
        
        // Remove oldest players if we exceed max cache size
        if players.count >= maxPlayers {
            print("⚠️ Cache full, removing oldest player")
            let oldestUrl = players.keys.first
            if let oldestUrl = oldestUrl {
                players[oldestUrl]?.pause()
                players.removeValue(forKey: oldestUrl)
            }
        }
        
        players[url] = player
    }
    
    func cancelLoading(for url: String) {
        loadingTasks[url]?.cancel()
        loadingTasks[url] = nil
    }
    
    func setLoadingTask(_ task: Task<Void, Never>, for url: String) {
        loadingTasks[url] = task
    }
    
    func cleanup() {
        print("🧹 Starting MediaCache cleanup")
        players.values.forEach { player in
            player.pause()
            print("⏹️ Paused player")
        }
        observations.values.forEach { observation in
            observation.invalidate()
            print("🗑️ Invalidated observation")
        }
        players.removeAll()
        observations.removeAll()
        loadingTasks.values.forEach { $0.cancel() }
        loadingTasks.removeAll()
        print("✨ MediaCache cleanup complete")
    }
    
    deinit {
        cleanup()
    }
    
    func storeObservation(_ observation: NSKeyValueObservation, for url: String) {
        observations[url] = observation
    }
}

struct MediaLoadingState {
    var image: UIImage?
    var player: AVPlayer?
    var isLoading = false
    var timeObserver: Any?
    var observations: [NSKeyValueObservation]?
}

struct InspirationView: View {
    @StateObject private var recipeService = RecipeService()
    @StateObject private var mediaCache = MediaCache.shared
    @State private var testMessage = "Testing Firebase Connection..."
    @State private var visibleRecipeID: String?
    @State private var selectedRecipe: Recipe?
    @State private var showingRecipeDetail = false
    @State private var preloadedIndices = Set<Int>()
    private let preloadWindow = 2 // Number of items to preload in each direction
    @State private var isLoading = true
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ZStack {
                    ScrollView(.vertical, showsIndicators: false) {
                        LazyVStack(spacing: 0) {
                            if recipeService.recipes.isEmpty && !isLoading {
                                Text("No recipes found")
                                    .frame(width: geometry.size.width, height: geometry.size.height)
                                    .background(Color.gray.opacity(0.2))
                            } else {
                                ForEach(Array(recipeService.recipes.enumerated()), id: \.element.uniqueId) { index, recipe in
                                    RecipeCard(
                                        recipe: recipe,
                                        isVisible: visibleRecipeID == recipe.uniqueId,
                                        mediaCache: mediaCache
                                    )
                                    .frame(width: geometry.size.width, height: geometry.size.height)
                                    .onAppear {
                                        visibleRecipeID = recipe.uniqueId
                                        preloadContent(currentIndex: index)
                                        print("📺 Showing recipe \(index + 1) of \(recipeService.recipes.count)")
                                    }
                                    .onDisappear {
                                        if visibleRecipeID == recipe.uniqueId {
                                            visibleRecipeID = nil
                                        }
                                    }
                                    .onTapGesture {
                                        selectedRecipe = recipe
                                        showingRecipeDetail = true
                                    }
                                }
                            }
                        }
                    }
                    .scrollTargetBehavior(.paging)
                    .refreshable {
                        await loadInitialContent()
                    }
                    
                    if isLoading {
                        ProgressView("Loading recipes...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .background(Color.black.opacity(0.3))
                    }
                }
                .navigationDestination(isPresented: $showingRecipeDetail) {
                    if let recipe = selectedRecipe {
                        RecipeDetailView(recipe: recipe)
                    }
                }
                .task {
                    await loadInitialContent()
                }
            }
            .ignoresSafeArea()
        }
    }
    
    private func loadInitialContent() async {
        isLoading = true
        do {
            try await recipeService.fetchRecipes()
            if !recipeService.recipes.isEmpty {
                preloadContent(currentIndex: 0)
            }
        } catch {
            print("Error loading recipes: \(error)")
        }
        isLoading = false
    }
    
    private func preloadContent(currentIndex: Int) {
        // Calculate range of indices to preload
        let startIndex = max(0, currentIndex - preloadWindow)
        let endIndex = min(recipeService.recipes.count - 1, currentIndex + preloadWindow)
        
        for index in startIndex...endIndex {
            guard !preloadedIndices.contains(index) else { continue }
            
            preloadedIndices.insert(index)
            let recipe = recipeService.recipes[index]
            
            // Create a background task for preloading
            Task {
                await preloadMedia(for: recipe)
            }
        }
    }
    
    private func preloadMedia(for recipe: Recipe) async {
        if let video = recipe.video {
            print("🎬 Starting preload for video: \(video.url)")
            let task = Task {
                do {
                    let player = AVPlayer(url: URL(string: video.url)!)
                    player.isMuted = true
                    
                    // Create a new async/await wrapper for AVPlayer readiness
                    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                        let observation = player.observe(\.status, options: [.new]) { player, _ in
                            switch player.status {
                            case .readyToPlay:
                                print("✅ Video preloaded successfully: \(video.url)")
                                MediaCache.shared.cache(player: player, for: video.url)
                                continuation.resume()
                            case .failed:
                                print("❌ Video preload failed: \(video.url)")
                                if let error = player.error {
                                    continuation.resume(throwing: error)
                                } else {
                                    continuation.resume(throwing: NSError(domain: "VideoPreloadError", code: -1))
                                }
                            case .unknown:
                                print("⏳ Video load status unknown: \(video.url)")
                                // Don't resume continuation here - wait for ready or failed
                            @unknown default:
                                break
                            }
                        }
                        
                        // Store observation to prevent deallocation
                        MediaCache.shared.storeObservation(observation, for: video.url)
                    }
                } catch {
                    print("❌ Video preload error: \(error)")
                }
            }
            MediaCache.shared.setLoadingTask(task, for: video.url)
        } else if let imageUrl = recipe.image {
            // Preload image
            let task = Task {
                guard let url = URL(string: imageUrl) else { return }
                do {
                    let (data, _) = try await URLSession.shared.data(from: url)
                    if let image = UIImage(data: data) {
                        MediaCache.shared.cache(image: image, for: imageUrl)
                    }
                } catch {
                    print("Error preloading image: \(error)")
                }
            }
            MediaCache.shared.setLoadingTask(task, for: imageUrl)
        }
    }
}

struct RecipeCard: View {
    let recipe: Recipe
    let isVisible: Bool
    let mediaCache: MediaCache
    @State private var isLiked = false
    @State private var isSaved = false
    @State private var mediaState = MediaLoadingState()
    @State private var playerReady = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .trailing) {
                // Media Content
                if isVisible {
                    if let video = recipe.video {
                        if let player = mediaCache.getPlayer(for: video.url) ?? mediaState.player {
                            VideoPlayer(player: player)
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geometry.size.width, height: geometry.size.height + geometry.safeAreaInsets.top)
                                .offset(y: -geometry.safeAreaInsets.top)
                                .clipped()
                                .onAppear {
                                    logPlayerStatus(player: player, url: video.url)
                                    setupVideoPlayback(player: player, url: video.url)
                                }
                                .onDisappear {
                                    cleanupVideoPlayback(player: player)
                                }
                        }
                    } else if let imageUrl = recipe.image {
                        if let cachedImage = mediaCache.getImage(for: imageUrl) {
                            Image(uiImage: cachedImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geometry.size.width, height: geometry.size.height + geometry.safeAreaInsets.top)
                                .offset(y: -geometry.safeAreaInsets.top)
                                .clipped()
                        } else {
                            AsyncImage(url: URL(string: imageUrl)) { phase in
                                switch phase {
                                case .empty:
                                    ProgressView()
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                        .frame(width: geometry.size.width, height: geometry.size.height + geometry.safeAreaInsets.top)
                                        .offset(y: -geometry.safeAreaInsets.top)
                                        .clipped()
                                case .failure:
                                    Color.gray
                                @unknown default:
                                    EmptyView()
                                }
                            }
                        }
                    }
                } else {
                    // Placeholder for non-visible cards
                    Color.black
                }
                
                // Gradient overlay
                LinearGradient(
                    gradient: Gradient(
                        colors: [
                            Color.black.opacity(0.85),
                            Color.black.opacity(0.6),
                            Color.black.opacity(0.4),
                            Color.black.opacity(0)
                        ]
                    ),
                    startPoint: .bottom,
                    endPoint: .center
                )
                .frame(height: geometry.size.height * 0.7)
                .frame(maxHeight: .infinity, alignment: .bottom)
                
                // Side Icons - Centered vertically
                VStack(spacing: 24) {
                    // Push icons to vertical center
                    Spacer()
                    
                    // Like Button
                    Button(action: {
                        isLiked.toggle()
                    }) {
                        Image(systemName: isLiked ? "heart.fill" : "heart")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 28, height: 28)
                            .foregroundColor(isLiked ? .red : .white)
                    }
                    
                    // Share Button
                    Button(action: {
                        // Share action
                    }) {
                        Image(systemName: "paperplane.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 28, height: 28)
                            .foregroundColor(.white)
                    }
                    
                    // Save Button
                    Button(action: {
                        isSaved.toggle()
                    }) {
                        Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 28, height: 28)
                            .foregroundColor(isSaved ? .yellow : .white)
                    }
                    
                    // Equal spacer to center the icons
                    Spacer()
                }
                .padding(.trailing, 24)
                
                // Content overlay (title, description, tags)
                VStack(alignment: .leading, spacing: 16) {
                    Spacer()
                    
                    // Title and Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text(recipe.title)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text(recipe.description)
                            .font(.body)
                            .foregroundColor(.white.opacity(0.9))
                            .lineLimit(3)
                            .multilineTextAlignment(.leading)
                    }
                    
                    // Tags
                    HStack(spacing: 8) {
                        ForEach(["spanish", "datenight"], id: \.self) { tag in
                            Text("#\(tag)")
                                .font(.subheadline)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(16)
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.bottom, 56)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, geometry.safeAreaInsets.bottom + 48)
            }
            .onAppear {
                loadMedia()
            }
        }
    }
    
    private func setupLoopPlayback(for player: AVPlayer) {
        print("🔄 Setting up loop playback")
        NotificationCenter.default.removeObserver(self, name: .AVPlayerItemDidPlayToEndTime, object: nil)
        NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: player.currentItem,
            queue: .main) { _ in
                print("🔁 Video reached end, looping")
                player.seek(to: .zero)
                player.play()
            }
    }
    
    private func loadMedia() {
        guard !mediaState.isLoading else { 
            print("⚠️ Media already loading, skipping...")
            return 
        }
        mediaState.isLoading = true
        
        if let video = recipe.video {
            print("🎥 Loading video for recipe: \(recipe.title)")
            print("🎥 Video URL: \(video.url)")
            
            if let cachedPlayer = mediaCache.getPlayer(for: video.url) {
                print("📦 Found cached player")
                mediaState.player = cachedPlayer
                
                // Create fresh player item
                let playerItem = AVPlayerItem(url: URL(string: video.url)!)
                print("🔄 Created new player item for cached player")
                
                // Configure player
                cachedPlayer.replaceCurrentItem(with: playerItem)
                cachedPlayer.isMuted = true
                
                // Force playback
                print("▶️ Attempting immediate playback")
                cachedPlayer.playImmediately(atRate: 1.0)
                
            } else {
                print("🆕 Creating new player")
                let player = AVPlayer(url: URL(string: video.url)!)
                player.automaticallyWaitsToMinimizeStalling = false
                player.isMuted = true
                
                // Force immediate playback attempt
                player.playImmediately(atRate: 1.0)
                
                mediaState.player = player
                MediaCache.shared.cache(player: player, for: video.url)
            }
        }
    }
    
    private func logPlayerStatus(player: AVPlayer, url: String) {
        print("🎮 Setting up VideoPlayer with URL: \(url)")
        print("🎮 Current player status: \(player.status.rawValue)")
        print("🎮 Current item status: \(String(describing: player.currentItem?.status.rawValue))")
    }
    
    private func setupVideoPlayback(player: AVPlayer, url: String) {
        print("📺 VideoPlayer appeared")
        
        // Create new player item
        let playerItem = AVPlayerItem(url: URL(string: url)!)
        print("🔄 Created new player item")
        
        // Configure player
        player.replaceCurrentItem(with: playerItem)
        player.isMuted = true
        player.actionAtItemEnd = .none
        
        // Add item status observation
        let itemObservation = playerItem.observe(\.status) { item, _ in
            print("📼 Item status changed to: \(item.status.rawValue)")
            if item.status == .readyToPlay {
                print("✅ Item ready to play")
                DispatchQueue.main.async {
                    player.seek(to: .zero)
                    player.playImmediately(atRate: 1.0)
                    print("▶️ Play command issued")
                }
            }
        }
        
        // Add player status observation
        let playerObservation = player.observe(\.status) { player, _ in
            print("🎮 Player status changed to: \(player.status.rawValue)")
        }
        
        // Add timeControlStatus observation
        let timeControlObservation = player.observe(\.timeControlStatus) { player, _ in
            print("⏱ Time control status changed to: \(player.timeControlStatus.rawValue)")
            if player.timeControlStatus != .playing {
                print("⚠️ Player not playing, attempting to restart")
                player.playImmediately(atRate: 1.0)
            }
        }
        
        // Store observations
        mediaState.observations = [itemObservation, playerObservation, timeControlObservation]
        
        // Force initial playback
        print("🔄 Forcing initial playback")
        player.seek(to: .zero)
        player.playImmediately(atRate: 1.0)
        
        // Set up periodic time observer
        let timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600),
            queue: .main
        ) { time in
            print("⏰ Playback status:")
            print("  Time: \(time.seconds)")
            print("  Rate: \(player.rate)")
            print("  Playing: \(player.timeControlStatus == .playing)")
            print("  Item status: \(String(describing: player.currentItem?.status.rawValue))")
            
            // If not playing, try to restart
            if player.timeControlStatus != .playing {
                print("🔄 Attempting to restart playback")
                player.playImmediately(atRate: 1.0)
            }
        }
        mediaState.timeObserver = timeObserver
    }
    
    private func cleanupVideoPlayback(player: AVPlayer) {
        print("⏹️ VideoPlayer disappeared")
        mediaState.observations?.forEach { $0.invalidate() }
        mediaState.observations = nil
        if let timeObserver = mediaState.timeObserver {
            player.removeTimeObserver(timeObserver)
        }
        player.pause()
    }
}

#Preview {
    InspirationView()
        .environmentObject(RecipeService()) // Provide the environment object
}

// For older Xcode versions
struct InspirationView_Previews: PreviewProvider {
    static var previews: some View {
        InspirationView()
            .environmentObject(RecipeService())
    }
}

// Comment out the problematic preview code until we fix it
extension Recipe {
    static var sampleRecipe: Recipe {
        let ingredients = [
            Ingredient(ingredientId: "1", name: "Spaghetti", amount: 1.0, unit: "pound"),
            Ingredient(ingredientId: "2", name: "Eggs", amount: 4.0, unit: "large"),
            Ingredient(ingredientId: "3", name: "Pecorino Romano", amount: 1.0, unit: "cup")
        ]
        
        return try! JSONDecoder().decode(Recipe.self, from: """
        {
            "id": "preview-1",
            "title": "Spaghetti Carbonara",
            "description": "Classic Italian pasta dish made with eggs, cheese, pancetta and black pepper",
            "ingredients": \(String(data: try! JSONEncoder().encode(ingredients), encoding: .utf8)!),
            "steps": [
                {"text": "Boil pasta", "confirmed": false},
                {"text": "Mix eggs and cheese", "confirmed": false},
                {"text": "Combine and serve", "confirmed": false}
            ],
            "cuisine_type": "Italian",
            "dietary_tags": ["pasta", "italian", "dinner"],
            "prepTime": 15,
            "cookTime": 20,
            "servings": 4,
            "image": "https://example.com/carbonara.jpg",
            "created_at": \(Date().timeIntervalSince1970),
            "updated_at": \(Date().timeIntervalSince1970)
        }
        """.data(using: .utf8)!)
    }
}

#Preview {
    InspirationView()
        .environmentObject(RecipeService())
}

#Preview("Recipe Card") {
    RecipeCard(
        recipe: .sampleRecipe,
        isVisible: true,
        mediaCache: MediaCache.shared
    )
    .frame(height: 800)
}
 
