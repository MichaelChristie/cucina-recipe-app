import { getValidTags } from '../utils/tagUtils';

{tags && (
  <div className="flex flex-wrap gap-1 mt-2">
    {getValidTags(tags, allTags).map(tag => (
      <span
        key={tag.id}
        className="inline-flex items-center px-2 py-0.5 rounded-full 
                   text-xs font-medium bg-olive-50 text-olive-600"
      >
        {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
        {tag.name}
      </span>
    ))}
  </div>
)} 