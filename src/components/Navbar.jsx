import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../services/authService';
import UserMenu from './UserMenu';
import toast from 'react-hot-toast';
import AnimatedLogo from './AnimatedLogo';

const adminTabs = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Recipes', path: '/admin/recipes' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Tags', path: '/admin/tags' },
];

export default function Navbar({ onAddClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isManageRoute = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await logOut();
      toast.success('Successfully signed out');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Update the account menu items
  const accountMenuItems = [
    { label: 'Admin Dashboard', href: '/admin/dashboard' },
    { label: 'Manage Recipes', href: '/admin/recipes' },
    { label: 'Manage Users', href: '/admin/users' },
    { label: 'Manage Tags', href: '/admin/tags' },
    { label: 'Sign Out', onClick: handleLogout },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
          <div className="relative flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <AnimatedLogo className="h-8 w-8 text-gray-600 mx-2" />
                <span className="hidden sm:block ml-2 text-xl font-bold text-gray-800">Cucina</span>
              </Link>
            </div>

            {/* Search Bar - Only show on home page */}
            {!isManageRoute && (
              <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-center">
                <div className="max-w-lg w-full lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                               placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                               focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search recipes..."
                      type="search"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Admin tabs - centered */}
            {isManageRoute && (
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center h-full space-x-8">
                {adminTabs.map((tab) => (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    className={`${
                      location.pathname === tab.path
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Account Dropdown - always on right */}
            <div className="flex items-center ml-auto">
              <div className="relative">
                <button
                  type="button"
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-blue-500"
                  onClick={handleMenuToggle}
                >
                  <span className="sr-only">Open user menu</span>
                  <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>

                <UserMenu 
                  isOpen={isMenuOpen}
                  onClose={handleMenuClose}
                  onLogout={handleLogout}
                  accountMenuItems={accountMenuItems}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer for all pages since navbar is now always fixed */}
      <div className="h-16"></div>
    </>
  );
}

