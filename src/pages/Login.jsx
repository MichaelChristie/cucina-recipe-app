import { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in');
      navigate('/manage-recipes');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password);
        toast.success('Account created successfully');
      } else {
        await signInWithEmail(formData.email, formData.password);
        toast.success('Successfully signed in');
      }
      navigate('/manage-recipes');
    } catch (error) {
      console.error('Error with email auth:', error);
      toast.error(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    }
  };

  if (user) {
    navigate('/manage-recipes');
    return null;
  }

  return (
    <Layout showNavbarActions={false}>
      <div className="flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6">
            {isSignUp ? 'Create Account' : 'Login'}
          </h1>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign In/Up */}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-blue-600 hover:text-blue-800 mb-4"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </Layout>
  );
} 