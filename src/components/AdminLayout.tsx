import { FC } from 'react';
import Layout from './Layout';
import { AdminLayoutProps } from '../types/admin';

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