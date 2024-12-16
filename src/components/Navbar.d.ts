declare module './Navbar' {
  interface NavbarProps {
    children: React.ReactNode;
    showActions?: boolean;
  }

  const Navbar: React.FC<NavbarProps>;
  export default Navbar;
} 