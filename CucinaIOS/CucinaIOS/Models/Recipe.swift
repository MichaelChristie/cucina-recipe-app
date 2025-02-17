import Foundation
import FirebaseFirestore

struct Recipe: Identifiable, Codable {
    var id: String?
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
    var tags: [Tag]
    let video: VideoMetadata?
    let showTagsPanel: Bool?
    var position: Int?
    
    // Computed properties
    var uniqueId: String { id ?? UUID().uuidString }
    
    struct Step: Codable {
        let text: String
        let confirmed: Bool?
        
        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            
            // First try to decode as a string (simple format)
            if let stringValue = try? container.decode(String.self) {
                self.text = stringValue
                self.confirmed = nil
                return
            }
            
            // If that fails, try to decode as a keyed container
            let keyedContainer = try decoder.container(keyedBy: CodingKeys.self)
            
            // Try all possible text field variations
            if let text = try? keyedContainer.decode(String.self, forKey: .text) {
                self.text = text
            } else if let description = try? keyedContainer.decode(String.self, forKey: .description) {
                self.text = description
            } else if let instruction = try? keyedContainer.decode(String.self, forKey: .instruction) {
                self.text = instruction
            } else {
                // If we can't find any text field, print the available keys for debugging
                print("⚠️ Available keys in step: \(keyedContainer.allKeys.map { $0.stringValue })")
                throw DecodingError.dataCorruptedError(
                    in: container,
                    debugDescription: "Step must contain either 'text', 'description', or 'instruction' field"
                )
            }
            
            self.confirmed = try? keyedContainer.decode(Bool.self, forKey: .confirmed)
        }
        
        func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode(text, forKey: .text)
            if let confirmed = confirmed {
                try container.encode(confirmed, forKey: .confirmed)
            }
        }
        
        private enum CodingKeys: String, CodingKey {
            case text
            case description
            case instruction
            case confirmed
            case step  // Some recipes might use 'step' field
        }
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
    
    struct Tag: Codable, Hashable {
        let id: String
        let name: String
        let emoji: String?
        let category: String?
        
        init(id: String, name: String, emoji: String? = nil, category: String? = nil) {
            self.id = id
            self.name = name
            self.emoji = emoji
            self.category = category
        }
        
        init(from decoder: Decoder) throws {
            if let container = try? decoder.container(keyedBy: CodingKeys.self) {
                id = try container.decode(String.self, forKey: .id)
                
                // Try to decode name, but handle cryptic IDs better
                if let decodedName = try? container.decode(String.self, forKey: .name),
                   !decodedName.contains("-") && decodedName.count < 20 { // Only use name if it looks valid
                    name = decodedName
                } else {
                    // For cryptic IDs, just show a generic label
                    name = "Recipe Tag"
                }
                
                // Add logging for emoji decoding
                if let emojiString = try container.decodeIfPresent(String.self, forKey: .emoji) {
                    print("📱 Decoded emoji for tag \(name):")
                    print("  - Raw string: \(emojiString)")
                    print("  - Length: \(emojiString.count)")
                    print("  - Unicode scalars: \(emojiString.unicodeScalars.map { String(format: "%02X", $0.value) })")
                    emoji = emojiString
                } else {
                    print("📱 No emoji found for tag \(name)")
                    emoji = "🏷️" // Default emoji for tags without one
                }
                
                category = try container.decodeIfPresent(String.self, forKey: .category)
                print("📱 Decoded tag: id=\(id), name=\(name), emoji=\(emoji ?? "nil"), category=\(category ?? "nil")")
            } else {
                // If it's just a string ID, use a generic label
                let container = try decoder.singleValueContainer()
                let value = try container.decode(String.self)
                id = value
                name = "Recipe Tag"
                emoji = "🏷️"
                category = nil
                print("📱 Decoded simple tag with generic name: id=\(id), name=\(name)")
            }
        }
    }
    
    enum CodingKeys: String, CodingKey {
        case id, title, description, ingredients, steps, cookTime, prepTime
        case servings, difficulty, category, nutrition, image, tags, video
        case showTagsPanel, position
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decodeIfPresent(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        description = try container.decode(String.self, forKey: .description)
        ingredients = try container.decode([RecipeIngredient].self, forKey: .ingredients)
        steps = try container.decode([Step].self, forKey: .steps)
        cookTime = try container.decodeIfPresent(String.self, forKey: .cookTime)
        prepTime = try container.decodeIfPresent(String.self, forKey: .prepTime)
        difficulty = try container.decodeIfPresent(String.self, forKey: .difficulty)
        category = try container.decodeIfPresent(String.self, forKey: .category)
        nutrition = try container.decode(Nutrition.self, forKey: .nutrition)
        image = try container.decodeIfPresent(String.self, forKey: .image)
        video = try container.decodeIfPresent(VideoMetadata.self, forKey: .video)
        showTagsPanel = try container.decodeIfPresent(Bool.self, forKey: .showTagsPanel)
        position = try container.decodeIfPresent(Int.self, forKey: .position)
        
        // Handle servings that could be either String or Int
        if let servingsStr = try? container.decodeIfPresent(String.self, forKey: .servings) {
            servings = servingsStr
        } else if let servingsInt = try? container.decodeIfPresent(Int.self, forKey: .servings) {
            servings = String(servingsInt)
        } else {
            servings = nil
        }
        
        // Try to decode tags in different formats
        if let tagObjects = try? container.decode([Tag].self, forKey: .tags) {
            // If tags are already in Tag format
            tags = tagObjects
        } else if let intTags = try? container.decode([Int].self, forKey: .tags) {
            // If tags are integers, convert to Tag objects
            tags = intTags.map { Tag(id: String($0), name: String($0), emoji: nil, category: nil) }
        } else if let stringTags = try? container.decode([String].self, forKey: .tags) {
            // If tags are strings, convert to Tag objects
            tags = stringTags.map { Tag(id: $0, name: $0, emoji: nil, category: nil) }
        } else {
            tags = []
        }
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
