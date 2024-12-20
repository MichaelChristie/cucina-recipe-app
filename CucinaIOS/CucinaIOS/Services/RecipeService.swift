import Foundation
import FirebaseFirestore


@MainActor
class RecipeService: ObservableObject {
    @Published var recipes: [Recipe] = []
    private let db = Firestore.firestore()
    
    func fetchRecipes() async throws {
        print("🔍 Starting to fetch recipes...")
        
        let recipesRef = db.collection("recipes")
        // Temporarily remove ordering and limit to debug
        // .order(by: "created_at", descending: true)
        // .limit(to: 50)
        
        do {
            let querySnapshot = try await recipesRef.getDocuments()
            print("📊 Found \(querySnapshot.documents.count) documents in Firestore")
            
            // Print first document raw data
            if let firstDoc = querySnapshot.documents.first {
                print("📝 First document data:")
                print(firstDoc.data())
            }
            
            self.recipes = try querySnapshot.documents.compactMap { document in
                do {
                    let recipe = try document.data(as: Recipe.self)
                    print("✅ Successfully decoded recipe: \(recipe.title)")
                    return recipe
                } catch {
                    print("❌ Error decoding document \(document.documentID):")
                    print("Error details: \(error)")
                    
                    // Print the raw data for debugging
                    let data = document.data()
                    print("📄 Document fields:")
                    for (key, value) in data {
                        print("- \(key): \(type(of: value)) = \(value)")
                    }
                    
                    // Try to decode individual fields
                    print("🔍 Attempting to decode individual fields...")
                    let decoder = Firestore.Decoder()
                    do {
                        let id = try document.get("id") as? String ?? document.documentID
                        let title = try document.get("title") as? String
                        print("- ID: \(id)")
                        print("- Title: \(title ?? "nil")")
                    } catch {
                        print("Field decoding error: \(error)")
                    }
                    
                    return nil
                }
            }
            
            print("📱 Successfully loaded \(self.recipes.count) recipes")
            
        } catch {
            print("💥 Error fetching documents: \(error)")
            throw error
        }
    }
} 
