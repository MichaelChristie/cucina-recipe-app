import { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { AnimateLayoutChanges, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';

interface SortableTestItemProps {
  id: string;
  content: string;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { isSorting, wasSorting } = args;
  
  if (isSorting || wasSorting) {
    return defaultAnimateLayoutChanges(args);
  }

  return true;
};

export const SortableTestItem: FC<SortableTestItemProps> = ({ id, content }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting
  } = useSortable({ 
    id,
    animateLayoutChanges
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease, opacity 200ms ease',
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    touchAction: 'none',
    scale: isDragging ? 1.02 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-white p-4 rounded-lg border border-gray-200 transition-all duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-80' : ''
      } ${isSorting ? 'transition-transform' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <Bars3Icon className="h-5 w-5 text-gray-500" />
      </div>
      <span>{content}</span>
    </div>
  );
};

export default SortableTestItem; 