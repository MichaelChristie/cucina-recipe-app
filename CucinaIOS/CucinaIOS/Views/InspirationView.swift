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
    var timeObserver: (AVPlayer, Any)? // Track which player the observer belongs to
    var observations: [NSKeyValueObservation]?
}

struct InspirationView: View {
    @StateObject private var recipeService = RecipeService()
    @StateObject private var mediaCache = MediaCache.shared
    @State private var visibleRecipeID: String?
    @State private var selectedRecipe: Recipe?
    @State private var showingRecipeDetail = false
    @State private var preloadedIndices = Set<Int>()
    private let preloadWindow = 2 // Number of items to preload in each direction
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ZStack {
                    ScrollView(.vertical, showsIndicators: false) {
                        LazyVStack(spacing: 0) {
                            switch recipeService.loadingState {
                            case .idle, .loading:
                                ProgressView("Loading recipes...")
                                    .frame(width: geometry.size.width, height: geometry.size.height)
                                
                            case .loaded(let count):
                                if count == 0 {
                                    VStack(spacing: 16) {
                                        Text("No recipes found")
                                            .font(.title2)
                                            .foregroundColor(.secondary)
                                        
                                        Text("Check your Firebase connection and data")
                                            .font(.subheadline)
                                            .foregroundColor(.secondary)
                                            .multilineTextAlignment(.center)
                                            .padding(.horizontal)
                                    }
                                    .frame(width: geometry.size.width, height: geometry.size.height)
                                    .background(Color.gray.opacity(0.1))
                                } else {
                                    ForEach(Array(recipeService.recipes.enumerated()), id: \.element.uniqueId) { index, recipe in
                                        RecipeCard(
                                            recipe: recipe,
                                            isVisible: visibleRecipeID == recipe.uniqueId,
                                            mediaCache: mediaCache,
                                            onRecipeSelect: { selectedRecipe in
                                                self.selectedRecipe = selectedRecipe
                                                self.showingRecipeDetail = true
                                            }
                                        )
                                        .frame(width: geometry.size.width, height: geometry.size.height)
                                        .onAppear {
                                            visibleRecipeID = recipe.uniqueId
                                            preloadContent(currentIndex: index)
                                            print("📺 Showing recipe \(index + 1) of \(recipeService.recipes.count): \(recipe.title)")
                                        }
                                        .onDisappear {
                                            if visibleRecipeID == recipe.uniqueId {
                                                visibleRecipeID = nil
                                            }
                                        }
                                    }
                                }
                                
                            case .error(let error):
                                VStack(spacing: 16) {
                                    Text("Error loading recipes")
                                        .font(.title2)
                                        .foregroundColor(.red)
                                    
                                    Text(error.localizedDescription)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal)
                                    
                                    Button("Try Again") {
                                        Task {
                                            await loadInitialContent()
                                        }
                                    }
                                    .buttonStyle(.bordered)
                                }
                                .frame(width: geometry.size.width, height: geometry.size.height)
                                .background(Color.gray.opacity(0.1))
                            }
                        }
                    }
                    .scrollTargetBehavior(.paging)
                    .refreshable {
                        await loadInitialContent()
                    }
                }
                .navigationDestination(isPresented: $showingRecipeDetail) {
                    if let recipe = selectedRecipe {
                        RecipeDetailView(recipe: recipe)
                    }
                }
                .task {
                    if case .idle = recipeService.loadingState {
                        await loadInitialContent()
                    }
                }
            }
            .ignoresSafeArea()
        }
    }
    
    private func loadInitialContent() async {
        do {
            try await recipeService.fetchRecipes()
            if !recipeService.recipes.isEmpty {
                preloadContent(currentIndex: 0)
            }
        } catch {
            print("Error loading recipes: \(error)")
        }
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
    let onRecipeSelect: (Recipe) -> Void
    @State private var isLiked = false
    @State private var isSaved = false
    @State private var mediaState = MediaLoadingState()
    @State private var playerReady = false
    @State private var isAudioEnabled = false
    @State private var showAudioIcon = false
    
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
                                .kenBurnsEffect()
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
                                        .kenBurnsEffect()
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
                
                // Content Areas with Different Tap Behaviors
                ZStack(alignment: .trailing) {
                    // Audio Control Area (Left side)
                    Color.clear
                        .contentShape(Rectangle())
                        .onTapGesture {
                            isAudioEnabled.toggle()
                            if let player = mediaState.player {
                                player.isMuted = !isAudioEnabled
                            }
                            showAudioIcon = true
                            withAnimation {
                                showAudioIcon = true
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                withAnimation {
                                    showAudioIcon = false
                                }
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: geometry.size.height * 0.7)
                    
                    // Side Icons Column
                    VStack(spacing: 24) {
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
                                .contentShape(Rectangle().size(width: 44, height: 44))
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
                                .contentShape(Rectangle().size(width: 44, height: 44))
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
                                .contentShape(Rectangle().size(width: 44, height: 44))
                        }
                        
                        Spacer()
                    }
                    .frame(width: 80)
                    .padding(.trailing, 24)
                }
                
                // Audio Icon Overlay
                if showAudioIcon {
                    VStack {
                        Image(systemName: isAudioEnabled ? "speaker.wave.2.fill" : "speaker.slash.fill")
                            .foregroundColor(.white)
                            .font(.system(size: 32))
                            .opacity(0.9)
                            .frame(maxWidth: .infinity)
                            .frame(height: geometry.size.height * 0.7)
                            .background(Color.black.opacity(0.2))
                        
                        Spacer()
                    }
                }
                
                // Content overlay (title, description, tags)
                VStack(alignment: .leading, spacing: 16) {
                    Spacer()
                    
                    // Title and Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text(recipe.title)
                            .font(.system(size: 32, weight: .regular, design: .serif))
                            .foregroundColor(.white)
                        
                        Text(recipe.description)
                            .font(.body)
                            .foregroundColor(.white.opacity(0.9))
                            .lineLimit(3)
                            .multilineTextAlignment(.leading)
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        onRecipeSelect(recipe)
                    }
                    
                    // Tags
                    HStack(spacing: 8) {
                        ForEach(recipe.tags.prefix(3), id: \.id) { tag in
                            HStack(spacing: 4) {
                                if let emoji = tag.emoji {
                                    Text(emoji)
                                        .font(.subheadline)
                                }
                                Text(tag.name)
                                    .font(.subheadline)
                            }
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
                // Ensure audio starts muted
                if let player = mediaState.player {
                    player.isMuted = true
                }
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
            
            let config = VideoPlayerConfiguration.default
            
            if let cachedPlayer = mediaCache.getPlayer(for: video.url) {
                print("📦 Found cached player")
                setupOptimizedPlayer(cachedPlayer, with: config, url: video.url)
            } else {
                print("🆕 Creating new player")
                setupNewPlayer(for: video.url, with: config)
            }
        }
    }
    
    private func setupOptimizedPlayer(_ player: AVPlayer, with config: VideoPlayerConfiguration, url: String) {
        print("🔄 Setting up optimized player")
        
        // Only attempt preroll if player is ready
        guard player.status == .readyToPlay else {
            print("⚠️ Player not ready for preroll, setting up basic playback")
            player.play()
            return
        }
        
        // Create and configure asset
        let asset = AVURLAsset(url: URL(string: url)!)
        
        // Load asset asynchronously
        Task {
            do {
                try await asset.load(.isPlayable)
                
                // Configure player item with optimized settings
                let playerItem = AVPlayerItem(asset: asset)
                playerItem.preferredPeakBitRate = config.quality.bitRate
                playerItem.preferredForwardBufferDuration = config.bufferDuration
                
                // Configure player
                player.replaceCurrentItem(with: playerItem)
                player.automaticallyWaitsToMinimizeStalling = true
                player.isMuted = true
                
                // Wait for player to be ready before attempting preroll
                try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                    let observation = player.observe(\.status, options: [.new]) { observedPlayer, _ in
                        if observedPlayer.status == .readyToPlay {
                            continuation.resume()
                        } else if observedPlayer.status == .failed {
                            continuation.resume(throwing: observedPlayer.error ?? NSError(domain: "PlayerError", code: -1))
                        }
                    }
                    mediaState.observations = [observation]
                }
                
                // Now safe to attempt preroll
                if try await player.preroll(atRate: 1.0) {
                    print("✅ Preroll successful")
                    player.playImmediately(atRate: 1.0)
                } else {
                    print("⚠️ Preroll failed, falling back to normal playback")
                    player.play()
                }
                
                mediaState.player = player
                MediaCache.shared.cache(player: player, for: url)
                
            } catch {
                print("❌ Player setup failed: \(error)")
                // Fallback to basic playback
                player.play()
            }
        }
    }
    
    private func setupNewPlayer(for url: String, with config: VideoPlayerConfiguration) {
        let asset = AVURLAsset(url: URL(string: url)!)
        let keys = ["playable"]
        
        // Create player with optimized settings
        Task {
            do {
                // Load asset
                try await asset.load(.isPlayable)
                
                let playerItem = AVPlayerItem(asset: asset)
                playerItem.preferredPeakBitRate = config.quality.bitRate
                playerItem.preferredForwardBufferDuration = config.bufferDuration
                
                let player = AVPlayer(playerItem: playerItem)
                player.automaticallyWaitsToMinimizeStalling = true
                player.isMuted = true
                
                // Add error recovery
                let statusObservation = player.observe(\.status) { player, _ in
                    if player.status == .failed {
                        print("🔄 Player failed, attempting recovery")
                        let newItem = AVPlayerItem(url: URL(string: url)!)
                        player.replaceCurrentItem(with: newItem)
                    }
                }
                mediaState.observations = [statusObservation]
                
                // Attempt preroll with timeout
                let prerollSuccess = try await withTimeout(config.preloadTimeout) {
                    try await player.preroll(atRate: 1.0)
                }
                
                if prerollSuccess {
                    print("✅ New player preroll successful")
                    player.playImmediately(atRate: 1.0)
                } else {
                    print("⚠️ New player preroll failed, attempting direct playback")
                    player.play()
                }
                
                mediaState.player = player
                MediaCache.shared.cache(player: player, for: url)
                
            } catch {
                print("❌ New player setup failed: \(error)")
                // Fallback to basic player
                let player = AVPlayer(url: URL(string: url)!)
                player.play()
                mediaState.player = player
                MediaCache.shared.cache(player: player, for: url)
            }
        }
    }
    
    // Helper function for timeout
    func withTimeout<T>(_ timeout: TimeInterval, operation: @escaping () async throws -> T) async throws -> T {
        try await withThrowingTaskGroup(of: T.self) { group in
            group.addTask {
                try await operation()
            }
            
            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(timeout * 1_000_000_000))
                throw NSError(domain: "Timeout", code: -1)
            }
            
            let result = try await group.next()!
            group.cancelAll()
            return result
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
        
        // Store strong references
        mediaState.player = player
        
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
                    // Don't attempt preroll here, just play
                    player.play()
                    print("▶️ Play command issued")
                }
            }
        }
        
        // Add player status observation
        let playerObservation = player.observe(\.status) { observedPlayer, _ in
            print("🎮 Player status changed to: \(observedPlayer.status.rawValue)")
        }
        
        // Add timeControlStatus observation with weak self to prevent retain cycles
        let timeControlObservation = player.observe(\.timeControlStatus) { [weak player] observedPlayer, _ in
            print("⏱ Time control status changed to: \(observedPlayer.timeControlStatus.rawValue)")
            if observedPlayer.timeControlStatus != .playing {
                print("⚠️ Player not playing, attempting to restart")
                DispatchQueue.main.async {
                    player?.play()
                }
            }
        }
        
        // Store observations
        mediaState.observations = [itemObservation, playerObservation, timeControlObservation]
        
        // Only play if ready, otherwise wait for ready status
        if player.status == .readyToPlay {
            print("🔄 Player ready, starting playback")
            player.seek(to: .zero)
            player.play()
        } else {
            print("⏳ Waiting for player to be ready")
        }
    }
    
    private func cleanupVideoPlayback(player: AVPlayer) {
        print("⏹️ VideoPlayer disappeared")
        
        // Remove observers first
        mediaState.observations?.forEach { $0.invalidate() }
        mediaState.observations = nil
        
        // Remove time observer if it exists and matches the current player
        if let (observerPlayer, observer) = mediaState.timeObserver {
            if observerPlayer === player {  // Check if it's the same player instance
                player.removeTimeObserver(observer)
                print("🗑️ Removed time observer")
            }
            mediaState.timeObserver = nil
        }
        
        // Pause and reset player
        player.pause()
        player.replaceCurrentItem(with: nil)
        
        // Clear state
        mediaState.player = nil
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
            RecipeIngredient(amount: 1.0, ingredientId: "1", name: "Spaghetti", unit: "pound", id: nil, label: nil, type: nil),
            RecipeIngredient(amount: 4.0, ingredientId: "2", name: "Eggs", unit: "large", id: nil, label: nil, type: nil),
            RecipeIngredient(amount: 1.0, ingredientId: "3", name: "Pecorino Romano", unit: "cup", id: nil, label: nil, type: nil)
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
        mediaCache: MediaCache.shared,
        onRecipeSelect: { _ in }
    )
    .frame(height: 800)
}

// Add VideoQuality enum
enum VideoQuality {
    case low, medium, high
    
    var bitRate: Double {
        switch self {
        case .low: return 800_000    // 800Kbps
        case .medium: return 1_500_000 // 1.5Mbps
        case .high: return 3_000_000   // 3Mbps
        }
    }
    
    var preferredHeight: CGFloat {
        switch self {
        case .low: return 480    // 480p
        case .medium: return 720  // 720p
        case .high: return 1080   // 1080p
        }
    }
}

// Add VideoPlayerConfiguration to manage playback settings
struct VideoPlayerConfiguration {
    let quality: VideoQuality
    let bufferDuration: Double
    let preloadTimeout: Double
    
    static let `default` = VideoPlayerConfiguration(
        quality: .medium,
        bufferDuration: 4.0,
        preloadTimeout: 10.0
    )
}

// Add this extension to help with finding parent view
extension UIView {
    static func getParentViewController() -> UIViewController? {
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first as? UIWindowScene
        let window = windowScene?.windows.first
        return window?.rootViewController
    }
}
 
