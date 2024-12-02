import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

export default function ManageRecipesNavbar({ onAddClick, onLogoutClick, showActions = true }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [user]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    onLogoutClick();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8 text-gray-600 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M11 4a1 1 0 112 0v4a1 1 0 11-2 0V4zm0 7a1 1 0 112 0v9a1 1 0 11-2 0v-9zm-5-3a1 1 0 112 0v12a1 1 0 11-2 0V8zm10 0a1 1 0 112 0v12a1 1 0 11-2 0V8z"/>
                </svg>
                <span className="text-xl font-bold">Recipe Manager</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {showActions && (
              <button
                onClick={onAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Recipe
              </button>
            )}

            {/* Account Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>

              <UserMenu 
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

ManageRecipesNavbar.propTypes = {
  onAddClick: PropTypes.func,
  onLogoutClick: PropTypes.func,
  showActions: PropTypes.bool
}; 