import * as React from 'react';
import { Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, CogIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';

interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { 
    name: 'Food',
    href: '/admin/recipes',
    children: [
      { name: 'Recipes', href: '/admin/recipes' },
      { name: 'Tags', href: '/admin/tags' },
      { name: 'Ingredients', href: '/admin/ingredients' }
    ]
  },
  { name: 'Users', href: '/admin/users' },
  { name: 'Utility', href: '/admin/utils', icon: CogIcon }
];

const Navigation: React.FC = () => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navigation;