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
        .onAppear {
            // Set tab bar appearance to dark
            let appearance = UITabBarAppearance()
            appearance.configureWithDefaultBackground()
            appearance.backgroundColor = .black
            UITabBar.appearance().scrollEdgeAppearance = appearance
            UITabBar.appearance().standardAppearance = appearance
        }
        .tint(Color("SelectedColor"))
    }
}

#Preview {
    MainTabView()
        .preferredColorScheme(.dark)
} 
