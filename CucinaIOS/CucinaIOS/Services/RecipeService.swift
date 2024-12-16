import Foundation
import FirebaseFirestore

@MainActor
class RecipeService: ObservableObject {
    @Published var recipes: [Recipe] = []
    private let db = Firestore.firestore()
    
    func fetchRecipes() async throws {
        let recipesRef = db.collection("recipes")
        let querySnapshot = try await recipesRef.getDocuments()
        
        print("Found \(querySnapshot.documents.count) documents")
        
        self.recipes = try querySnapshot.documents.compactMap { document in
            print("\n🔍 Processing document: \(document.documentID)")
            print("📄 Raw Data: \(document.data())")
            
            do {
                let recipe = try document.data(as: Recipe.self)
                print("✅ Successfully decoded recipe: \(recipe.title)")
                print("🖼️ Image URL after decoding: \(recipe.imageURL ?? "No image URL")")
                return recipe
            } catch {
                print("❌ Error decoding recipe: \(error)")
                print("🔎 Available fields in document: \(document.data().keys)")
                if let imageURL = document.data()["image"] as? String {
                    print("📸 Image field value: \(imageURL)")
                }
                
                // Attempt flexible parsing
                print("Attempting flexible parsing for recipe")
                if let title = document.data()["title"] as? String,
                   let imageURL = document.data()["image"] as? String {
                    print("Flexible parsing result - Title: \(title), Image: \(imageURL)")
                }
                return nil
            }
        }
        
        print("\nFinal recipes count: \(recipes.count)")
    }
} 
