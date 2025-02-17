import SwiftUI

// Recipe Badge Component
struct RecipeBadge: View {
    let tag: Recipe.Tag
    let type: BadgeType
    
    enum BadgeType {
        case method
        case cuisine
        case dietary
        case style
        case season
        
        var colors: (background: Color, text: Color) {
            switch self {
            case .method:
                return (Color(hex: "f2f7f2"), Color(hex: "2d5a27")) // earthgreen colors
            case .cuisine:
                return (Color(hex: "f4f5e9"), Color(hex: "5a5c3f")) // olive colors
            case .dietary:
                return (Color(hex: "fdf4f4"), Color(hex: "a92f2f")) // cookred colors
            case .style:
                return (Color(hex: "f9f7f0"), Color(hex: "8b7e55")) // khaki colors
            case .season:
                return (Color(hex: "f2f7f2"), Color(hex: "2d5a27")) // earthgreen colors
            }
        }
        
        static func getType(for category: String?) -> BadgeType {
            guard let category = category?.lowercased() else { return .style }
            
            switch category {
            case "method":
                return .method
            case "cuisine":
                return .cuisine
            case "dietary":
                return .dietary
            case "season":
                return .season
            default:
                return .style
            }
        }
    }
    
    var body: some View {
        HStack(spacing: 6) {
            if let emoji = tag.emoji {
                Text(emoji)
                    .font(.system(size: 14))
            }
            Text(tag.name)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(type.colors.text)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(type.colors.background)
        .cornerRadius(16)
    }
}

struct RecipeDetailView: View {
    let recipe: Recipe
    @Environment(\.dismiss) private var dismiss
    
    private var headerImageURL: String? {
        if let image = recipe.image, !image.isEmpty {
            return image
        }
        return nil
    }
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            ZStack(alignment: .top) {
                // Image layer
                RecipeHeaderImage(imageURL: headerImageURL)
                    .ignoresSafeArea()
                    .frame(maxWidth: .infinity)
                

                
                // Content layer
                VStack(alignment: .leading, spacing: 0) {
                    // Spacer to push content below image
                    Color.clear
                        .frame(height: 250)
                    
                    // Content
                    VStack(alignment: .leading, spacing: 24) {
                        // Title and Description
                        VStack(alignment: .leading, spacing: 12) {
                            // Recipe Badges
                            if !recipe.tags.isEmpty {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(recipe.tags, id: \.id) { tag in
                                            RecipeBadge(
                                                tag: tag,
                                                type: .getType(for: tag.category)
                                            )
                                        }
                                    }
                                }
                                .padding(.bottom, 4)
                            }
                            
                            Text(recipe.title)
                                .font(.system(size: 34, weight: .regular, design: .serif))
                                .foregroundColor(Color("PrimaryColor"))
                            Text(recipe.description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                        
                        // Quick Info Grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            // Prep Time
                            if let prepTime = recipe.prepTime {
                                QuickInfoPanel(
                                    icon: "clock",
                                    title: "Prep Time",
                                    value: "\(prepTime) min",
                                    bgColor: Color(hex: "f2f7f2"), // earthgreen-50
                                    iconColor: Color(hex: "2d5a27")  // earthgreen-600
                                )
                            }
                            
                            // Cook Time
                            if let cookTime = recipe.cookTime {
                                QuickInfoPanel(
                                    icon: "flame",
                                    title: "Cook Time",
                                    value: "\(cookTime) min",
                                    bgColor: Color(hex: "fdf4f4"), // cookred-50
                                    iconColor: Color(hex: "a92f2f")  // cookred-600
                                )
                            }
                            
                            // Difficulty
                            if let difficulty = recipe.difficulty {
                                QuickInfoPanel(
                                    icon: "chart.bar",
                                    title: "Difficulty",
                                    value: difficulty,
                                    bgColor: Color(hex: "f4f5e9"), // olive-50
                                    iconColor: Color(hex: "5a5c3f")  // olive-600
                                )
                            }
                            
                            // Servings
                            if let servings = recipe.servings {
                                QuickInfoPanel(
                                    icon: "person.2",
                                    title: "Servings",
                                    value: "\(servings) servings",
                                    bgColor: Color(hex: "f9f7f0"), // khaki-50
                                    iconColor: Color(hex: "8b7e55")  // khaki-600
                                )
                            }
                        }
                        
                        // Ingredients Section
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Ingredients")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.bottom, 2)
                            
                            ForEach(Array(recipe.ingredients.enumerated()), id: \.offset) { index, ingredient in
                                IngredientRowView(ingredient: ingredient)
                            }
                        }
                        
                        // Steps Section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Method")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            ForEach(Array(recipe.steps.enumerated()), id: \.offset) { index, step in
                                HStack(alignment: .top, spacing: 16) {
                                    // Step number circle
                                    Text("\(index + 1)")
                                        .font(.headline)
                                        .foregroundColor(Color("PrimaryColor"))
                                        .frame(width: 32, height: 32)
                                        .background(Color("PrimaryColor").opacity(0.1))
                                        .clipShape(Circle())
                                    
                                    // Step text
                                    Text(step.text)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                                .padding(.vertical, 8)
                            }
                        }
                    }
                    .padding(24)
                    .background(Color(hex: "F8F7F4"))
                    .cornerRadius(30, corners: [.topLeft, .topRight])
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
    }
}

// Quick Info Panel Component
struct QuickInfoPanel: View {
    let icon: String
    let title: String
    let value: String
    let bgColor: Color
    let iconColor: Color
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(iconColor)
                .frame(width: 40, height: 40)
                .background(bgColor)
                .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.headline)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color.white)
        .cornerRadius(12)
    }
}

// Add Color extension for hex support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Header Image Component
private struct RecipeHeaderImage: View {
    let imageURL: String?
    
    var body: some View {
        GeometryReader { geometry in
            if let imageURL = imageURL, 
               !imageURL.isEmpty,
               // Make sure we're not trying to load a video URL
               !imageURL.lowercased().contains("mp4"),
               let url = URL(string: imageURL) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(maxWidth: geometry.size.width)
                            .frame(height: 520)
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: geometry.size.width)
                            .frame(height: 520)
                            .clipped()
                            .offset(y: -120)
                    case .failure:
                        PlaceholderImage()
                    @unknown default:
                        EmptyView()
                    }
                }
            } else {
                PlaceholderImage()
            }
        }
        .frame(height: 520)
    }
}

// MARK: - Helper Views
private struct PlaceholderImage: View {
    var body: some View {
        ZStack {
            Color.gray.opacity(0.3)
            VStack(spacing: 12) {
                Image(systemName: "fork.knife.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .foregroundColor(.gray)
                Text("No Image Available")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .frame(height: 300)
    }
}

// Add this extension for rounded corners
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

// Update the ingredient row view to handle RecipeIngredient
struct IngredientRowView: View {
    let ingredient: RecipeIngredient
    
    var body: some View {
        if ingredient.type == "divider" {
            // Handle divider type
            Text(ingredient.label ?? "")
                .font(.headline)
                .padding(.top, 12)
        } else {
            // Handle regular ingredient
            HStack {
                Text("\(ingredient.amount?.formatted() ?? "") \(ingredient.unit ?? "")")
                    .frame(width: 100, alignment: .leading)
                Text(ingredient.name ?? "")
                Spacer()
            }
            .padding(.vertical, 2)
        }
    }
}

#Preview {
    NavigationStack {
        RecipeDetailView(recipe: .sampleRecipe)
    }
} 
