import Foundation
import FirebaseFirestore
// import FirebaseFirestoreSwift

struct Recipe: Identifiable, Codable {
    @DocumentID var id: String?
    let title: String
    let description: String
    let ingredients: [Ingredient]
    let steps: [Step]
    let cookTime: String?
    let prepTime: String?
    let servings: Int
    let difficulty: String?
    let category: String?
    let nutrition: Nutrition
    let image: String?
    let tags: [Int]
    let video: VideoMetadata?
    
    // Computed properties
    var uniqueId: String { id ?? UUID().uuidString }
    
    struct Step: Codable {
        let text: String
        let confirmed: Bool
    }
    
    struct Nutrition: Codable {
        let calories: String
        let protein: String
        let carbs: String
        let fat: String
    }
    
    struct VideoMetadata: Codable {
        let url: String
        let size: Int
        let format: String
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case ingredients
        case steps
        case cookTime
        case prepTime
        case servings
        case difficulty
        case category
        case nutrition
        case image
        case tags
        case video
    }
}

struct Ingredient: Codable {
    let ingredientId: String
    let name: String
    let amount: Double
    let unit: String
} 
