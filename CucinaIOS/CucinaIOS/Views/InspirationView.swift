import SwiftUI
import FirebaseFirestore
import AVKit
import Combine

struct MediaLoadingState {
    var image: UIImage?
    var player: AVPlayer?
    var isLoading = false
}

struct InspirationView: View {
    @StateObject private var recipeService = RecipeService()
    @State private var testMessage = "Testing Firebase Connection..."
    @State private var visibleRecipeID: String?
    @State private var selectedRecipe: Recipe?
    @State private var showingRecipeDetail = false
    @State private var preloadedIndices = Set<Int>()
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView(.vertical, showsIndicators: false) {
                    LazyVStack(spacing: 0) {
                        if recipeService.recipes.isEmpty {
                            Text("No recipes found")
                                .frame(width: geometry.size.width, height: geometry.size.height)
                                .background(Color.gray.opacity(0.2))
                        } else {
                            ForEach(Array(recipeService.recipes.enumerated()), id: \.element.uniqueId) { index, recipe in
                                RecipeCard(recipe: recipe, isVisible: visibleRecipeID == recipe.uniqueId)
                                    .frame(width: geometry.size.width, height: geometry.size.height)
                                    .onAppear {
                                        visibleRecipeID = recipe.uniqueId
                                        preloadContent(currentIndex: index)
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
                .navigationDestination(isPresented: $showingRecipeDetail) {
                    if let recipe = selectedRecipe {
                        RecipeDetailView(recipe: recipe)
                    }
                }
                .task {
                    do {
                        try await recipeService.fetchRecipes()
                        testMessage = "Successfully connected to Firebase! Found \(recipeService.recipes.count) recipes."
                    } catch {
                        testMessage = "Error connecting to Firebase: \(error.localizedDescription)"
                    }
                }
            }
            .ignoresSafeArea()
        }
    }
    
    private func preloadContent(currentIndex: Int) {
        let preloadRange = 1...2 // Preload next 2 items
        
        for offset in preloadRange {
            let targetIndex = currentIndex + offset
            guard targetIndex < recipeService.recipes.count,
                  !preloadedIndices.contains(targetIndex) else { continue }
            
            preloadedIndices.insert(targetIndex)
            let recipe = recipeService.recipes[targetIndex]
            
            // Preload video
            if let video = recipe.video {
                let asset = AVAsset(url: URL(string: video.url)!)
                let playerItem = AVPlayerItem(asset: asset)
                _ = AVPlayer(playerItem: playerItem) // Create player to cache
            }
            // Preload image
            else if let image = recipe.image, let url = URL(string: image) {
                URLSession.shared.dataTask(with: url) { _, _, _ in }.resume()
            }
        }
    }
}

struct RecipeCard: View {
    let recipe: Recipe
    let isVisible: Bool
    @State private var isLiked = false
    @State private var isSaved = false
    @State private var mediaState = MediaLoadingState()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .trailing) {
                // Media Content
                if isVisible {
                    if let video = recipe.video {
                        if let player = mediaState.player {
                            VideoPlayer(player: player)
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geometry.size.width, height: geometry.size.height + geometry.safeAreaInsets.top)
                                .offset(y: -geometry.safeAreaInsets.top)
                                .clipped()
                                .onAppear {
                                    player.play()
                                    player.actionAtItemEnd = .none
                                    NotificationCenter.default.addObserver(
                                        forName: .AVPlayerItemDidPlayToEndTime,
                                        object: player.currentItem,
                                        queue: .main) { _ in
                                            player.seek(to: .zero)
                                            player.play()
                                    }
                                }
                                .onDisappear {
                                    player.pause()
                                }
                        }
                    } else if let image = recipe.image, let url = URL(string: image) {
                        AsyncImage(url: url) { phase in
                            // ... existing AsyncImage code ...
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
    
    private func loadMedia() {
        guard !mediaState.isLoading else { return }
        mediaState.isLoading = true
        
        if let video = recipe.video {
            let player = AVPlayer(url: URL(string: video.url)!)
            player.isMuted = true
            mediaState.player = player
        } else if let imageURL = recipe.image {
            // ... existing image loading code ...
        }
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
    RecipeCard(recipe: .sampleRecipe, isVisible: true)
        .frame(height: 800)
}
 
