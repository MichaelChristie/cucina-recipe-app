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
    <div className="min-h-screen bg-tasty-background">
      <Navbar showActions={showNavbarActions} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 