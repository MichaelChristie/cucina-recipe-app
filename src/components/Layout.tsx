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
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="min-h-screen">
        <div className="">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 