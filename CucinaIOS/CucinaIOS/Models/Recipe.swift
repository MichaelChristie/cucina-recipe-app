import Foundation
import FirebaseFirestore

struct Ingredient: Codable {
    var amount: Double
    var ingredientId: String
    var name: String
    var unit: String
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        ingredientId = try container.decode(String.self, forKey: .ingredientId)
        name = try container.decode(String.self, forKey: .name)
        unit = try container.decode(String.self, forKey: .unit)
        
        // Handle amount that could be string or number
        if let stringAmount = try? container.decode(String.self, forKey: .amount) {
            amount = Double(stringAmount) ?? 0
        } else {
            amount = try container.decode(Double.self, forKey: .amount)
        }
    }
}

struct Step: Codable {
    var text: String
    var confirmed: Bool
    
    enum CodingKeys: String, CodingKey {
        case text
        case confirmed
    }
}

struct Recipe: Identifiable, Codable {
    @FirebaseFirestore.DocumentID var id: String?
    var title: String
    var description: String
    var ingredients: [Ingredient]
    var instructions: [String]
    var cuisineType: String
    var dietaryTags: [String]
    var prepTime: Int
    var cookTime: Int
    var servings: Int
    var imageURL: String?
    var videoURL: String?
    var createdAt: Date
    var updatedAt: Date
    
    var uniqueId: String {
        return id ?? UUID().uuidString
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case ingredients
        case instructions = "steps"
        case cuisineType = "cuisine_type"
        case dietaryTags = "dietary_tags"
        case prepTime = "prepTime"
        case cookTime = "cookTime"
        case servings
        case imageURL = "image"
        case videoURL = "video_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decodeIfPresent(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        description = try container.decode(String.self, forKey: .description)
        ingredients = try container.decode([Ingredient].self, forKey: .ingredients)
        
        // Handle steps/instructions which are an array of Step objects
        if let steps = try? container.decode([Step].self, forKey: .instructions) {
            instructions = steps.map { $0.text }
        } else {
            instructions = []
        }
        
        cuisineType = try container.decodeIfPresent(String.self, forKey: .cuisineType) ?? "Unknown"
        dietaryTags = try container.decodeIfPresent([String].self, forKey: .dietaryTags) ?? []
        
        // Handle prep time that could be string or number
        if let prepTimeString = try? container.decode(String.self, forKey: .prepTime) {
            prepTime = Int(prepTimeString.replacingOccurrences(of: "mins", with: "")) ?? 0
        } else {
            prepTime = try container.decodeIfPresent(Int.self, forKey: .prepTime) ?? 0
        }
        
        // Handle cook time that could be string or number
        if let cookTimeString = try? container.decode(String.self, forKey: .cookTime) {
            cookTime = Int(cookTimeString.replacingOccurrences(of: "mins", with: "")) ?? 0
        } else {
            cookTime = try container.decodeIfPresent(Int.self, forKey: .cookTime) ?? 0
        }
        
        servings = try container.decodeIfPresent(Int.self, forKey: .servings) ?? 1
        imageURL = try container.decodeIfPresent(String.self, forKey: .imageURL)
        videoURL = try container.decodeIfPresent(String.self, forKey: .videoURL)
        
        // Handle dates
        if let timestamp = try? container.decode(Timestamp.self, forKey: .createdAt) {
            createdAt = timestamp.dateValue()
        } else {
            createdAt = Date()
        }
        
        if let timestamp = try? container.decode(Timestamp.self, forKey: .updatedAt) {
            updatedAt = timestamp.dateValue()
        } else {
            updatedAt = Date()
        }
    }
} 
