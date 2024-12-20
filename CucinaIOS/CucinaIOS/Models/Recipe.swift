import Foundation

struct Recipe: Codable, Identifiable {
    let id: String
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
    
    // Computed properties for compatibility
    var imageURL: String? { image }
    var uniqueId: String { id }
    var dietaryTags: [String] { [] } // TODO: Convert tag IDs to names
    
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
        case id, title, description, ingredients, steps
        case cookTime, prepTime, servings, difficulty
        case category, nutrition, image, tags, video
    }
}

struct Ingredient: Codable {
    let ingredientId: String
    let name: String
    let amount: Double
    let unit: String
} 
