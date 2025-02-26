import { FC } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <div className="relative w-full">
      <input 
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white 
                 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 
                 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Search recipes..."
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar; 