import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../services/authService';
import UserMenu from './UserMenu';
import toast from 'react-hot-toast';
import AnimatedLogo from './AnimatedLogo';
import { 
  HomeIcon, 
  BookOpenIcon, 
  CubeIcon,
  UserGroupIcon, 
  TagIcon 
} from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
import Logo from './Logo';

const adminNavigation = [
  { name: 'Dashboard', path: '/admin', icon: HomeIcon },
  { name: 'Recipes', path: '/admin/recipes', icon: BookOpenIcon },
  { name: 'Ingredients', path: '/admin/ingredients', icon: CubeIcon },
  { name: 'Users', path: '/admin/users', icon: UserGroupIcon },
  { name: 'Tags', path: '/admin/tags', icon: TagIcon },
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
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Manage Recipes', href: '/admin/recipes' },
    { label: 'Manage Ingredients', href: '/admin/ingredients' },
    { label: 'Manage Users', href: '/admin/users' },
    { label: 'Manage Tags', href: '/admin/tags' },
    { label: 'Sign Out', onClick: handleLogout },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-tasty-background/80">
        <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
          <div className="relative flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Logo />
                {/* <AnimatedLogo className="h-8 w-8 text-gray-600 mx-2" /> */}
                <span className="hidden sm:block ml-2 text-xl font-bold text-gray-800">Cucina</span>
              </Link>
            </div>

            {/* Search Bar - Only show on home page */}
            {!isManageRoute && (
              <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-center">
                <div className="max-w-lg w-full lg:max-w-xs">
                  <SearchBar onSearch={() => {
                    // Add your search logic here
                  }} />
                </div>
              </div>
            )}

            {/* Admin tabs - centered */}
            {isManageRoute && (
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center h-full space-x-8">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${
                        location.pathname === item.path
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
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
    </>
  );
}

