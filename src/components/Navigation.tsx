import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, CogIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';

const navigation = [
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

const Navigation = () => {
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              className="text-sm font-medium text-gray-600 hover:text-gray-900" 
              href="/admin/dashboard"
            >
              Dashboard
            </a>
            {/* ... Food dropdown ... */}
            <a 
              className="text-sm font-medium text-gray-600 hover:text-gray-900" 
              href="/admin/users"
            >
              Users
            </a>
            <a 
              className="text-sm font-medium text-gray-600 hover:text-gray-900" 
              href="/admin/utils"
            >
              <span className="flex items-center">
                <CogIcon className="h-4 w-4 mr-1" />
                Utility
              </span>
            </a>
          </div>

          {/* Mobile Navigation */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

// ... rest of your Navigation component code 