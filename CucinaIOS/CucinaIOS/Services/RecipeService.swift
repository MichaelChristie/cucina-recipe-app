import Foundation
import FirebaseFirestore

@MainActor
class RecipeService: ObservableObject {
    @Published var recipes: [Recipe] = []
    private let db = Firestore.firestore()
    
    func fetchRecipes() async throws {
        let recipesRef = db.collection("recipes")
        let querySnapshot = try await recipesRef.getDocuments()
        
        // Debug: Print first recipe in detail
        if let firstDoc = querySnapshot.documents.first {
            print("\n📝 FIREBASE DATA STRUCTURE:")
            print("=========================")
            let data = firstDoc.data()
            for (key, value) in data {
                print("\(key): \(type(of: value)) = \(value)")
            }
            print("\n")
        }
        
        self.recipes = try querySnapshot.documents.compactMap { document in
            do {
                let recipe = try document.data(as: Recipe.self)
                return recipe
            } catch {
                print("❌ Decoding Error for document \(document.documentID):")
                print("Error: \(error)")
                
                // Print the problematic fields
                let data = document.data()
                print("📄 Raw Data Fields:")
                for (key, value) in data {
                    print("- \(key): \(type(of: value)) = \(value)")
                }
                return nil
            }
        }
    }
} 
