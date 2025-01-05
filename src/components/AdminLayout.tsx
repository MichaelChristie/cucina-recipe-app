import { FC } from 'react';
import Layout from './Layout';
import { AdminLayoutProps } from '../types/admin';
import { HomeIcon, BookOpenIcon, TagIcon, BeakerIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Recipes', href: '/admin/recipes', icon: BookOpenIcon },
  { name: 'Tags', href: '/admin/tags', icon: TagIcon },
  { name: 'Ingredients', href: '/admin/ingredients', icon: BeakerIcon },
  { name: 'Utils', href: '/admin/utils', icon: WrenchScrewdriverIcon },
];

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </Layout>
  );
};

export default AdminLayout; 