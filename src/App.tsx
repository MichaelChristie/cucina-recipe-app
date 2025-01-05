import { FC, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Recipes from './pages/admin/Recipes';
import Users from './pages/admin/Users';
import RecipeDetails from './pages/RecipeDetails';
import RecipeEditor from './pages/admin/RecipeEditor.tsx';
import { UnitPreferenceProvider } from './context/UnitPreferenceContext';
import { favoriteService } from './services/favoriteService';

// import { UnitPreferenceProvider } from './contexts/UnitPreferenceContext';
import TagManager from './pages/admin/TagManager';
import IngredientManager from './pages/admin/IngredientManager';
import { AdminUtils } from './pages/AdminUtils';
import Test from './pages/Test';

// Create a wrapper component for RecipeDetails
const RecipeDetailsWrapper: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const userFavorites = await favoriteService.getFavorites();
    setFavorites(new Set(userFavorites));
  };

  const handleToggleFavorite = async (recipeId: string) => {
    const isFavorited = await favoriteService.toggleFavorite(recipeId);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.add(recipeId);
      } else {
        newFavorites.delete(recipeId);
      }
      return newFavorites;
    });
  };

  return (
    <RecipeDetails 
      isFavorite={id ? favorites.has(id) : false}
      onToggleFavorite={handleToggleFavorite}
    />
  );
};

const App: FC = () => {
  return (
    <AuthProvider>
      <UnitPreferenceProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/recipes" 
            element={
              <ProtectedRoute>
                <Recipes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipe/:id" 
            element={<RecipeDetailsWrapper />} 
          />
          <Route 
            path="/admin/recipes/new" 
            element={
              <ProtectedRoute>
                <RecipeEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/recipes/:id/edit" 
            element={
              <ProtectedRoute>
                <RecipeEditor />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/tags" element={<TagManager />} />
          <Route 
            path="/admin/ingredients" 
            element={
              <ProtectedRoute>
                <IngredientManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/utils" 
            element={
              <ProtectedRoute>
                <AdminUtils />
              </ProtectedRoute>
            }
          />
          <Route path="/test" element={<Test />} />
        </Routes>
      </UnitPreferenceProvider>
    </AuthProvider>
  );
};

export default App; 