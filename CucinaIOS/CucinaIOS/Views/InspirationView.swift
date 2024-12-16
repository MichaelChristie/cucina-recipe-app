import SwiftUI
import FirebaseFirestore

struct InspirationView: View {
    @StateObject private var recipeService = RecipeService()
    @State private var testMessage = "Testing Firebase Connection..."
    @State private var visibleRecipeID: String?
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView(.vertical, showsIndicators: false) {
                LazyVStack(spacing: 0) {
                    if recipeService.recipes.isEmpty {
                        Text("No recipes found")
                            .frame(width: geometry.size.width, height: geometry.size.height)
                            .background(Color.gray.opacity(0.2))
                    } else {
                        ForEach(recipeService.recipes, id: \.uniqueId) { recipe in
                            RecipeCard(recipe: recipe, isVisible: visibleRecipeID == recipe.uniqueId)
                                .frame(width: geometry.size.width, height: geometry.size.height)
                                .onAppear {
                                    visibleRecipeID = recipe.uniqueId
                                }
                                .onDisappear {
                                    if visibleRecipeID == recipe.uniqueId {
                                        visibleRecipeID = nil
                                    }
                                }
                        }
                    }
                }
            }
            .scrollTargetBehavior(.paging)
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

struct RecipeCard: View {
    let recipe: Recipe
    let isVisible: Bool
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Background Image
                if isVisible, let imageURL = recipe.imageURL, let url = URL(string: imageURL) {
                    AsyncImage(url: url, transaction: .init(animation: .easeInOut)) { phase in
                        switch phase {
                        case .empty:
                            ProgressView()
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .background(Color.gray.opacity(0.3))
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geometry.size.width, height: geometry.size.height + geometry.safeAreaInsets.top)
                                .offset(y: -geometry.safeAreaInsets.top)
                                .clipped()
                        case .failure(_):
                            Color.black
                                .overlay(
                                    Image(systemName: "photo.fill")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: 50)
                                        .foregroundColor(.white.opacity(0.5))
                                )
                        @unknown default:
                            Color.black
                        }
                    }
                } else {
                    Color.black
                        .overlay(
                            Image(systemName: "photo.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 50)
                                .foregroundColor(.white.opacity(0.5))
                        )
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
                
                // Content overlay
                VStack(alignment: .leading, spacing: 16) {
                    Spacer()
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
                    
                    // Recipe Details
                    VStack(alignment: .leading, spacing: 12) {
                        // Ingredients preview
                        if !recipe.ingredients.isEmpty {
                            Text("Ingredients: " + recipe.ingredients.prefix(3).map { "\($0.amount) \($0.unit) \($0.name)" }.joined(separator: ", "))
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.8))
                                .lineLimit(1)
                        }
                        
                        // Time and Servings
                        HStack(spacing: 20) {
                            Label("\(recipe.prepTime + recipe.cookTime) min", systemImage: "clock")
                            Spacer()
                            Label("\(recipe.servings) servings", systemImage: "person.2")
                        }
                        .foregroundColor(.white.opacity(0.8))
                        .font(.subheadline)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, geometry.safeAreaInsets.bottom + 120) // Increased bottom padding to shift content up
            }
        }
    }
} 