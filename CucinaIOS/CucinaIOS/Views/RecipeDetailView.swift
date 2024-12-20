import SwiftUI

struct RecipeDetailView: View {
    let recipe: Recipe
    @Environment(\.dismiss) private var dismiss
    
    // Compute the appropriate media URL
    private var headerImageURL: String? {
        // Prefer static image over video
        if let image = recipe.image, !image.isEmpty {
            return image
        }
        // Don't return video URL - we don't want to show video in detail view
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
                    VStack(alignment: .leading, spacing: 16) {
                        RecipeHeaderInfo(recipe: recipe)
                        RecipeIngredients(ingredients: recipe.ingredients)
                        RecipeTags(tags: recipe.tags)
                    }
                    .padding()
                    .background(
                        Rectangle()
                            .fill(.background)
                            .cornerRadius(30, corners: [.topLeft, .topRight])
                    )
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
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

// MARK: - Header Info Component
private struct RecipeHeaderInfo: View {
    let recipe: Recipe
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(recipe.title)
                .font(.system(size: 34, weight: .regular, design: .serif))
                .foregroundColor(Color("PrimaryColor"))
            Text(recipe.description)
                .font(.body)
                .foregroundColor(.secondary)
            HStack(spacing: 20) {
                if let prepTime = recipe.prepTime {
                    Label("\(prepTime) min", systemImage: "clock")
                }
                Spacer()
                Label("\(recipe.servings) servings", systemImage: "person.2")
            }
            .foregroundColor(.secondary)
        }
    }
}

// MARK: - Ingredients Component
private struct RecipeIngredients: View {
    let ingredients: [RecipeIngredient]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Ingredients")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(Array(ingredients.enumerated()), id: \.offset) { index, ingredient in
                IngredientRowView(ingredient: ingredient)
            }
        }
        .padding(.top)
    }
}

// MARK: - Instructions Component
private struct RecipeInstructions: View {
    let steps: [Recipe.Step]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Instructions")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(Array(steps.indices), id: \.self) { index in
                let step = steps[index]
                HStack(alignment: .top, spacing: 12) {
                    Text("\(index + 1).")
                        .fontWeight(.bold)
                    Text(step.text)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.vertical, 4)
            }
        }
        .padding(.top)
    }
}

// MARK: - Tags Component
private struct RecipeTags: View {
    let tags: [Int]?
    
    var body: some View {
        if let tags = tags, !tags.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text("Tags")
                    .font(.title2)
                    .fontWeight(.bold)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(tags, id: \.self) { tag in
                            Text("#\(tag)")
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.gray.opacity(0.2))
                                .cornerRadius(20)
                        }
                    }
                }
            }
            .padding(.top)
        }
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
                .padding(.top, 16)
        } else {
            // Handle regular ingredient
            HStack {
                Text("\(ingredient.amount?.formatted() ?? "") \(ingredient.unit ?? "")")
                    .frame(width: 100, alignment: .leading)
                Text(ingredient.name ?? "")
                Spacer()
            }
            .padding(.vertical, 4)
        }
    }
}

#Preview {
    NavigationStack {
        RecipeDetailView(recipe: .sampleRecipe)
    }
} 
