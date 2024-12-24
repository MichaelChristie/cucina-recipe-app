import { Fragment, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
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
  const navigate = useNavigate();
  const location = useLocation();
  const isManageRoute = location.pathname.startsWith('/admin');

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
    <nav className="bg-black/5 backdrop-blur-sm shadow-sm relative z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo section */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center">
              <Logo />
              <span className="hidden sm:block ml-2 text-xl font-bold text-white">
                Cucina
              </span>
            </Link>
          </div>

          {/* Center navigation - desktop */}
          {isManageRoute && (
            <div className="hidden md:flex items-center space-x-8">
              {/* Main Navigation Items */}
              {adminNavigation.main.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } flex items-center px-3 py-2 text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Food Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 text-base font-medium">
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
                  <Menu.Items className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {adminNavigation.food.items.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.path}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } ${
                              location.pathname === item.path ? 'text-blue-600' : 'text-gray-700'
                            } block px-4 py-2 text-base`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>

              <Link
                to={adminNavigation.users.path}
                className={`${
                  location.pathname === adminNavigation.users.path
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex items-center px-3 py-2 text-base font-medium`}
              >
                {adminNavigation.users.name}
              </Link>
            </div>
          )}

          {/* Right side menu - aligned with content */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-8 w-8" />
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-white" />
              </button>

              <UserMenu 
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={handleLogout}
                accountMenuItems={accountMenuItems}
              />
            </div>
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