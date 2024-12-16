import { FC } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showNavbarActions?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
}

const Layout: FC<LayoutProps> = ({ children, showNavbarActions = true }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Recipes', href: '/admin/recipes' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Tags', href: '/admin/tags' }
  ];

  return (
    <>
      <Navbar showActions={showNavbarActions}>
        <div className="flex space-x-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                pathname === item.href
                  ? 'border-tasty-green text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </Navbar>
      <div className="min-h-screen bg-tasty-background p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout; 