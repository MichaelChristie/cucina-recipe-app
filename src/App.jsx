import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Recipes from './pages/admin/Recipes';
import Users from './pages/admin/Users';
import RecipeDetails from './pages/RecipeDetails';
import RecipeEditor from './pages/admin/RecipeEditor';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><Navigate to="/admin/dashboard" /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/admin/recipes/new" element={<ProtectedRoute><RecipeEditor /></ProtectedRoute>} />
        <Route path="/admin/recipes/edit/:id" element={<ProtectedRoute><RecipeEditor /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}