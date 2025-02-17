import Foundation
import FirebaseFirestore
import FirebaseCore
import FirebaseAuth

@MainActor
class RecipeService: ObservableObject {
    @Published var recipes: [Recipe] = []
    @Published var loadingState: LoadingState = .idle
    private let db: Firestore
    private var tagCache: [String: Recipe.Tag] = [:] // Cache for tag data
    
    init() {
        // Ensure Firebase is initialized
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
            print("📱 Firebase configured")
        } else {
            print("📱 Firebase already configured")
        }
        self.db = Firestore.firestore()
        print("🔥 Firestore instance created")
        
        // Print Firebase configuration
        if let app = FirebaseApp.app() {
            print("📱 Firebase app name: \(app.name)")
            print("🔧 Project ID: \(app.options.projectID ?? "none")")
            print("🌐 Database URL: \(app.options.databaseURL ?? "none")")
        }
    }
    
    enum LoadingState {
        case idle
        case loading
        case loaded(count: Int)
        case error(Error)
    }
    
    // Helper function to fetch a single tag by ID
    private func fetchTag(id: String) async throws -> Recipe.Tag? {
        // Check cache first
        if let cachedTag = tagCache[id] {
            print("📱 Using cached tag for ID: \(id)")
            return cachedTag
        }
        
        print("📱 Fetching tag with ID: \(id)")
        let tagDoc = try await db.collection("tags").document(id).getDocument()
        
        guard let data = tagDoc.data() else {
            print("❌ No data found for tag ID: \(id)")
            return nil
        }
        
        // Create tag from document data
        let tag = Recipe.Tag(
            id: tagDoc.documentID,
            name: data["name"] as? String ?? "Unknown Tag",
            emoji: data["emoji"] as? String,
            category: data["category"] as? String
        )
        
        // Cache the tag
        tagCache[id] = tag
        print("📱 Cached tag: \(tag.name) (\(tag.id))")
        
        return tag
    }
    
    // Helper function to resolve all tags for a recipe
    private func resolveTagsForRecipe(_ recipe: inout Recipe) async {
        print("📱 Resolving tags for recipe: \(recipe.title)")
        var resolvedTags: [Recipe.Tag] = []
        
        for tag in recipe.tags {
            do {
                if let resolvedTag = try await fetchTag(id: tag.id) {
                    resolvedTags.append(resolvedTag)
                    print("✅ Resolved tag: \(resolvedTag.name) with emoji: \(resolvedTag.emoji ?? "none")")
                }
            } catch {
                print("❌ Error resolving tag \(tag.id): \(error.localizedDescription)")
            }
        }
        
        recipe.tags = resolvedTags
    }
    
    func fetchRecipes() async throws {
        print("📚 Starting recipe fetch")
        loadingState = .loading
        
        do {
            // Test connection to Firestore
            print("🔍 Testing Firestore connection")
            let recipesCollection = db.collection("recipes")
            print("📂 Collection path: \(recipesCollection.path)")
            
            // Get all documents without any ordering first
            print("📥 Attempting to fetch all recipes without ordering")
            let allDocsSnapshot = try await recipesCollection.getDocuments()
            print("📊 Total documents found: \(allDocsSnapshot.documents.count)")
            
            if allDocsSnapshot.documents.isEmpty {
                print("⚠️ No documents found in recipes collection")
                recipes = []
                loadingState = .loaded(count: 0)
                return
            }
            
            // If we have documents, proceed with ordered fetch
            print("🔄 Fetching ordered recipes")
            let snapshot = try await recipesCollection.order(by: "position").getDocuments()
            print("📦 Got \(snapshot.documents.count) documents from ordered query")
            
            // Print first document data for debugging
            if let firstDoc = snapshot.documents.first {
                print("📄 First document data: \(firstDoc.data())")
            }
            
            let decoder = Firestore.Decoder()
            var loadedRecipes: [Recipe] = []
            var failedRecipes: [(documentId: String, error: Error)] = []
            
            for document in snapshot.documents {
                do {
                    print("🔄 Processing document: \(document.documentID)")
                    // Print raw document data
                    print("📄 Document data: \(document.data())")
                    
                    // First decode the recipe
                    var recipe = try decoder.decode(Recipe.self, from: document.data())
                    recipe.id = document.documentID
                    
                    // Resolve tags for this recipe
                    await resolveTagsForRecipe(&recipe)
                    
                    loadedRecipes.append(recipe)
                    print("✅ Successfully decoded recipe: \(recipe.title)")
                } catch {
                    print("❌ Failed to decode recipe \(document.documentID)")
                    print("💥 Error details: \(error)")
                    if let decodingError = error as? DecodingError {
                        switch decodingError {
                        case .keyNotFound(let key, _):
                            print("🔑 Missing key: \(key)")
                        case .typeMismatch(let type, _):
                            print("📝 Type mismatch: expected \(type)")
                        default:
                            print("🤔 Other decoding error: \(decodingError)")
                        }
                    }
                    failedRecipes.append((document.documentID, error))
                }
            }
            
            if !failedRecipes.isEmpty {
                print("⚠️ Failed to decode \(failedRecipes.count) recipes:")
                failedRecipes.forEach { documentId, error in
                    print("  - \(documentId): \(error)")
                }
            }
            
            recipes = loadedRecipes
            loadingState = .loaded(count: loadedRecipes.count)
            print("✅ Successfully loaded \(loadedRecipes.count) recipes")
            
        } catch let error as NSError {
            print("❌ Error fetching recipes: \(error)")
            print("Error code: \(error.code)")
            print("Error description: \(error.localizedDescription)")
            if let errorDescription = error.userInfo["NSLocalizedDescription"] as? String {
                print("Detailed error: \(errorDescription)")
            }
            loadingState = .error(error)
            throw error
        }
    }
} 
