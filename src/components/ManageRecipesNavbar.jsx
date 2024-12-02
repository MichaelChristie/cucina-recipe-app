import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ManageRecipesNavbar({ onAddClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8 text-gray-600 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M11 4a1 1 0 112 0v4a1 1 0 11-2 0V4zm0 7a1 1 0 112 0v9a1 1 0 11-2 0v-9zm-5-3a1 1 0 112 0v12a1 1 0 11-2 0V8zm10 0a1 1 0 112 0v12a1 1 0 11-2 0V8z"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-800">Recipe Manager</span>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex-1 flex items-center justify-end px-2 lg:ml-6">
              <button
                onClick={onAddClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md 
                         shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500 mr-4"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add New Recipe
              </button>
            </div>

            {/* Account Dropdown */}
            <div className="flex items-center">
              <div className="ml-3 relative">
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

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                             bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Back to Home
                    </Link>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Log Out</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
} 