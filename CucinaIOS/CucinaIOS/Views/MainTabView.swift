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
            // Set tab bar appearance
            let appearance = UITabBarAppearance()
            appearance.configureWithDefaultBackground()
            
            // Set background to sage-50
            appearance.backgroundColor = UIColor(Color(hex: "f2f7f2"))
            
            // Set unselected items to sage-400
            appearance.stackedLayoutAppearance.normal.iconColor = UIColor(Color(hex: "8b9f89"))
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor(Color(hex: "8b9f89"))]
            
            // Set selected items to earthgreen-600
            appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color(hex: "2d5a27"))
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor(Color(hex: "2d5a27"))]
            
            UITabBar.appearance().scrollEdgeAppearance = appearance
            UITabBar.appearance().standardAppearance = appearance
        }
        .tint(Color(hex: "2d5a27")) // earthgreen-600
    }
}

#Preview {
    MainTabView()
        .preferredColorScheme(.dark)
} 
