import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu } from '@headlessui/react';

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  accountMenuItems?: MenuItem[];
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, onLogout }) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <Menu>
      <Menu.Items
        className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 
                   bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[60]"
      >
        {user ? (
          <>
            <Menu.Item>
              <div className="block px-4 py-2 text-sm text-gray-700">
                {user.email}
              </div>
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <Link 
                  to="/" 
                  className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                  onClick={onClose}
                >
                  Home
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <Link 
                  to="/admin/dashboard" 
                  className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                  onClick={onClose}
                >
                  Admin Dashboard
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                >
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </>
        ) : (
          <Menu.Item>
            {({ active }) => (
              <Link 
                to="/login" 
                className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                onClick={onClose}
              >
                Sign In
              </Link>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  );
};

export default UserMenu; 