import Navbar from './Navbar';

export default function Layout({ children, showNavbarActions = true }) {
  return (
    <>
      <Navbar showActions={showNavbarActions} />
      <div className="min-h-screen bg-tasty-background p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </>
  );
} 