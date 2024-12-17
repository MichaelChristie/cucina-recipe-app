import Foundation

struct RecipeStep: Identifiable, Codable {
    let id: String
    let text: String
    let confirmed: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case text
        case confirmed
    }
} 