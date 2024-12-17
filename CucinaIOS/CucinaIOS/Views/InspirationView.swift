import SwiftUI
import FirebaseFirestore

struct InspirationView: View {
    @StateObject private var recipeService = RecipeService()
    @State private var testMessage = "Testing Firebase Connection..."
    @State private var visibleRecipeID: String?
    @State private var selectedRecipe: Recipe?
    @State private var showingRecipeDetail = false
    
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
 
