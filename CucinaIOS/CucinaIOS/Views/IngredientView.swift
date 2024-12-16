import SwiftUI

struct IngredientView: View {
    @State private var searchText = ""
    @State private var selectedIngredients: Set<String> = []
    
    let sampleIngredients = ["Tomatoes", "Pasta", "Olive Oil", "Garlic", "Onions", "Cheese"]
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText)
                
                ScrollView {
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(sampleIngredients, id: \.self) { ingredient in
                            IngredientButton(
                                ingredient: ingredient,
                                isSelected: selectedIngredients.contains(ingredient),
                                action: {
                                    if selectedIngredients.contains(ingredient) {
                                        selectedIngredients.remove(ingredient)
                                    } else {
                                        selectedIngredients.insert(ingredient)
                                    }
                                }
                            )
                        }
                    }
                    .padding()
                }
                
                if !selectedIngredients.isEmpty {
                    Button(action: {
                        // Implement recipe search
                    }) {
                        Text("Find Recipes")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
                    }
                    .padding()
                }
            }
            .navigationTitle("Ingredients")
        }
    }
}

struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search ingredients", text: $text)
                .textFieldStyle(RoundedBorderTextFieldStyle())
        }
        .padding(.horizontal)
    }
}

struct IngredientButton: View {
    let ingredient: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(ingredient)
                .font(.subheadline)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(isSelected ? Color.blue : Color.gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(8)
        }
    }
} 