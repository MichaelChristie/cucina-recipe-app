import { FC } from 'react';
import Layout from './Layout';
import { AdminLayoutProps } from '../types/admin';

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Layout>
        {children}
    </Layout>
  );
};

export default AdminLayout; 