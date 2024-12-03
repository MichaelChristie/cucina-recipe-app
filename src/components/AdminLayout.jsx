import Layout from './Layout';

export default function AdminLayout({ children }) {
  return (
    <Layout>
      {/* Page Content */}
      {children}
    </Layout>
  );
} 