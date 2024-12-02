import { Link, useLocation } from 'react-router-dom';
import Layout from './Layout';

const tabs = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Recipes', path: '/admin/recipes' },
  { name: 'Users', path: '/admin/users' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <Layout>
      {/* Admin Tab Bar */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.path}
                className={`${
                  location.pathname === tab.path
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Page Content */}
      {children}
    </Layout>
  );
} 