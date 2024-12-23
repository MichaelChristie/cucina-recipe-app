import Foundation
import FirebaseFirestore

@MainActor
class RecipeService: ObservableObject {
    @Published var recipes: [Recipe] = []
    private let db = Firestore.firestore()
    
    func fetchRecipes() async throws {
        let recipesRef = db.collection("recipes")
        
        // Query recipes ordered by position
        let snapshot = try await recipesRef
            .order(by: "position", descending: false)
            .getDocuments()
        
        let decoder = Firestore.Decoder()
        
        let fetchedRecipes = try snapshot.documents.compactMap { document -> Recipe in
            var recipe = try decoder.decode(Recipe.self, from: document.data())
            // Manually set the id since we're not using @DocumentID
            recipe.id = document.documentID
            return recipe
        }
        
        self.recipes = fetchedRecipes
    }
} 
