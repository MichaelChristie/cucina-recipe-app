import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            InspirationView()
                .tabItem {
                    Label("Inspiration", systemImage: "sparkles")
                }
            
            IngredientView()
                .tabItem {
                    Label("Ingredients", systemImage: "leaf")
                }
            
            CuisineStyleView()
                .tabItem {
                    Label("Cuisine", systemImage: "fork.knife")
                }
            
            AccountView()
                .tabItem {
                    Label("Account", systemImage: "person.circle")
                }
        }
        .tint(Color("PrimaryColor"))
    }
}

#Preview {
    MainTabView()
    .preferredColorScheme(.dark)

} 
