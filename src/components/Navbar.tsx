import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import UserMenu from './UserMenu';
import toast from 'react-hot-toast';
import AnimatedLogo from './AnimatedLogo';
import Logo from './Logo';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface NavbarProps {
  onAddClick?: () => void;
  children?: React.ReactNode;
  showActions?: boolean;
}

// Updated navigation structure
const adminNavigation = {
  main: [
    { name: 'Dashboard', path: '/admin' },
  ],
  food: {
    name: 'Food',
    items: [
      { name: 'Recipes', path: '/admin/recipes' },
      { name: 'Ingredients', path: '/admin/ingredients' },
      { name: 'Tag Manager', path: '/admin/tags' },
    ]
  },
  users: { name: 'Users', path: '/admin/users' }
};

export default function Navbar({ onAddClick, children, showActions }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isManageRoute = location.pathname.startsWith('/admin');

  // Updated scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 400);
      document.body.classList.toggle('scrolled', scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
      await logOut();
      toast.success('Successfully signed out');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to sign out');
    }
  };

  const accountMenuItems: MenuItem[] = [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Manage Recipes', href: '/admin/recipes' },
    { label: 'Manage Ingredients', href: '/admin/ingredients' },
    { label: 'Manage Users', href: '/admin/users' },
    { label: 'Manage Tags', href: '/admin/tags' },
    { label: 'Sign Out', onClick: handleLogout },
  ];

  return (
    <nav className={`${
      isSticky 
        ? 'fixed top-0 left-0 right-0 transition-all duration-200 bg-tasty-background/80 backdrop-blur-sm shadow-lg' 
        : 'relative bg-tasty-background'
    } z-50`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo section */}
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="flex items-center">
                <Logo />
                <span className="hidden sm:block ml-2 text-xl font-bold text-gray-900">
                  Cucina
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Only show on admin routes */}
            {isManageRoute && (
              <div className="hidden md:flex items-center space-x-6">
                {/* Main nav item */}
                <Link
                  to="/admin"
                  className={`text-sm font-medium ${
                    location.pathname === '/admin'
                      ? 'text-tasty-green'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Food Dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="group flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                    <span>Food</span>
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {adminNavigation.food.items.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.path}
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } ${
                                  location.pathname === item.path ? 'text-tasty-green' : 'text-gray-700'
                                } block px-4 py-2 text-sm`}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* Users nav item */}
                <Link
                  to="/admin/users"
                  className={`text-sm font-medium ${
                    location.pathname === '/admin/users'
                      ? 'text-tasty-green'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Users
                </Link>
              </div>
            )}
          </div>

          {/* Center - Search Bar */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-full max-w-lg transition-all duration-200 ${
            isSearchOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle search
            }}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-full py-2 pl-4 pr-10 
                           focus:outline-none focus:ring-2 focus:ring-tasty-green/20 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Right side menu - Search, User menu, and Mobile Admin Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Search</span>
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-600" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
              </button>

              <UserMenu 
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={handleLogout}
                accountMenuItems={accountMenuItems}
              />
            </div>

            {/* Mobile Admin Menu Button - Only show on admin routes and mobile */}
            {isManageRoute && (
              <button
                type="button"
                className="md:hidden flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open admin menu</span>
                <Bars3Icon className="h-8 w-8 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - full width but content aligned */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="pt-2 pb-3 space-y-1">
              {/* Main Navigation Items */}
              {adminNavigation.main.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  } flex items-center px-4 py-2 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Food Section */}
              <div className="border-t border-gray-200 pt-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                  <span>Food</span>
                </div>
                {adminNavigation.food.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    } flex items-center px-8 py-2 text-base font-medium`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
} 