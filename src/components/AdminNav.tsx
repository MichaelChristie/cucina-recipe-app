import { CogIcon } from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Utilities',
    href: '/admin/utils',
    icon: CogIcon
  }
]; 