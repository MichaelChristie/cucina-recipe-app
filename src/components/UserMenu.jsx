import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu({ isOpen, onClose, onLogout }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 
                 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      {user ? (
        <>
          <div className="block px-4 py-2 text-sm text-gray-700">
            {user.email}
          </div>
          <Link 
            to="/" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Home
          </Link>
          <Link 
            to="/manage-recipes" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Manage Recipes
          </Link>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link 
            to="/login" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Sign In
          </Link>
        </>
      )}
    </div>
  );
}

UserMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
}; 