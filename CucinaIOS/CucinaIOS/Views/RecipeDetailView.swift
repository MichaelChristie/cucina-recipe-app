import SwiftUI

struct RecipeDetailView: View {
    let recipe: Recipe
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            ZStack(alignment: .top) {
                // Image layer
                RecipeHeaderImage(imageURL: recipe.imageURL)
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
                        RecipeTags(tags: recipe.dietaryTags)
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
            if let imageURL = imageURL, let url = URL(string: imageURL) {
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
                Label("\(recipe.prepTime + recipe.cookTime) min", systemImage: "clock")
                Spacer()
                Label("\(recipe.servings) servings", systemImage: "person.2")
            }
            .foregroundColor(.secondary)
        }
    }
}

// MARK: - Ingredients Component
private struct RecipeIngredients: View {
    let ingredients: [Ingredient]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Ingredients")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(ingredients, id: \.ingredientId) { ingredient in
                HStack {
                    Text("•")
                    Text("\(ingredient.amount, specifier: "%.1f") \(ingredient.unit) \(ingredient.name)")
                }
                .padding(.vertical, 4)
            }
        }
        .padding(.top)
    }
}

// MARK: - Instructions Component
private struct RecipeInstructions: View {
    let steps: [[String: Any]]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Instructions")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(Array(steps.indices), id: \.self) { index in
                let step = steps[index]
                if let text = step["text"] as? String {
                    HStack(alignment: .top, spacing: 12) {
                        Text("\(index + 1).")
                            .fontWeight(.bold)
                        Text(text)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .padding(.top)
    }
}

// MARK: - Tags Component
private struct RecipeTags: View {
    let tags: [String]
    
    var body: some View {
        if !tags.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text("Tags")
                    .font(.title2)
                    .fontWeight(.bold)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(tags, id: \.self) { tag in
                            Text(tag)
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
        Image(systemName: "photo.fill")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(height: 300)
            .background(Color.gray.opacity(0.3))
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

#Preview {
    NavigationStack {
        RecipeDetailView(recipe: .sampleRecipe)
    }
} 
