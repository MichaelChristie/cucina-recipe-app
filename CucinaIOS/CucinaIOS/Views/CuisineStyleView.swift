import SwiftUI

struct CuisineStyleView: View {
    @State private var selectedCuisine: String?
    @State private var selectedDiet: String?
    
    let cuisines = ["Italian", "Japanese", "Mexican", "Indian", "Mediterranean", "American"]
    let diets = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"]
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Cuisine Type")) {
                    ForEach(cuisines, id: \.self) { cuisine in
                        HStack {
                            Text(cuisine)
                            Spacer()
                            if selectedCuisine == cuisine {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.blue)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            selectedCuisine = (selectedCuisine == cuisine) ? nil : cuisine
                        }
                    }
                }
                
                Section(header: Text("Dietary Preferences")) {
                    ForEach(diets, id: \.self) { diet in
                        HStack {
                            Text(diet)
                            Spacer()
                            if selectedDiet == diet {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.blue)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            selectedDiet = (selectedDiet == diet) ? nil : diet
                        }
                    }
                }
                
                Section {
                    Button(action: {
                        // Implement filter application
                    }) {
                        Text("Apply Filters")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("Cuisine & Diet")
        }
    }
} 