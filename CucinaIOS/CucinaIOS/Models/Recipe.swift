import Foundation
import FirebaseFirestore

struct Recipe: Identifiable, Codable {
    @DocumentID var id: String?
    let title: String
    let description: String
    let ingredients: [RecipeIngredient]
    let steps: [Step]
    let cookTime: String?
    let prepTime: String?
    let servings: String?
    let difficulty: String?
    let category: String?
    let nutrition: Nutrition
    let image: String?
    let tags: [Int]
    let video: VideoMetadata?
    let showTagsPanel: Bool?
    
    // Computed properties
    var uniqueId: String { id ?? UUID().uuidString }
    
    struct Step: Codable {
        let text: String
        let confirmed: Bool
    }
    
    struct Nutrition: Codable {
        let calories: String
        
        // Optional fields since they're not always present
        let protein: String?
        let carbs: String?
        let fat: String?
    }
    
    struct VideoMetadata: Codable {
        let url: String
        let size: Int
        let format: String
    }
}

// New struct to handle different types of ingredients
struct RecipeIngredient: Codable {
    // For regular ingredients
    let amount: Double?
    let ingredientId: String?
    let name: String?
    let unit: String?
    
    // For divider/label type ingredients
    let id: String?
    let label: String?
    let type: String?
    
    enum CodingKeys: String, CodingKey {
        case amount, ingredientId, name, unit, id, label, type
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Try to decode as a divider first
        if let id = try? container.decode(String.self, forKey: .id),
           let label = try? container.decode(String.self, forKey: .label),
           let type = try? container.decode(String.self, forKey: .type) {
            self.id = id
            self.label = label
            self.type = type
            self.amount = nil
            self.ingredientId = nil
            self.name = nil
            self.unit = nil
        } else {
            // Decode as a regular ingredient
            self.amount = try? container.decode(Double.self, forKey: .amount)
            self.ingredientId = try container.decode(String.self, forKey: .ingredientId)
            self.name = try container.decode(String.self, forKey: .name)
            self.unit = try container.decode(String.self, forKey: .unit)
            self.id = nil
            self.label = nil
            self.type = nil
        }
    }
    
    init(amount: Double?, ingredientId: String?, name: String?, unit: String?, id: String? = nil, label: String? = nil, type: String? = nil) {
        self.amount = amount
        self.ingredientId = ingredientId
        self.name = name
        self.unit = unit
        self.id = id
        self.label = label
        self.type = type
    }
}
