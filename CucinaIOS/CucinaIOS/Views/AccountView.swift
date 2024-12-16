import SwiftUI

struct AccountView: View {
    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .frame(width: 60, height: 60)
                            .foregroundColor(.gray)
                        
                        VStack(alignment: .leading) {
                            Text("Sign In")
                                .font(.headline)
                            Text("Manage your account")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        .padding(.leading, 8)
                    }
                    .padding(.vertical, 8)
                }
                
                Section(header: Text("Preferences")) {
                    NavigationLink(destination: Text("Saved Recipes")) {
                        Label("Saved Recipes", systemImage: "heart.fill")
                    }
                    
                    NavigationLink(destination: Text("Dietary Preferences")) {
                        Label("Dietary Preferences", systemImage: "leaf.fill")
                    }
                    
                    NavigationLink(destination: Text("Notifications")) {
                        Label("Notifications", systemImage: "bell.fill")
                    }
                }
                
                Section(header: Text("About")) {
                    NavigationLink(destination: Text("Help Center")) {
                        Label("Help Center", systemImage: "questionmark.circle.fill")
                    }
                    
                    NavigationLink(destination: Text("Privacy Policy")) {
                        Label("Privacy Policy", systemImage: "lock.fill")
                    }
                }
            }
            .navigationTitle("Account")
        }
    }
} 