'use client';

import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useBookmarks, Bookmark } from '@/hooks/useBookmarks';

interface BookmarkButtonProps {
  anime: Bookmark;
}

export default function BookmarkButton({ anime }: BookmarkButtonProps) {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const active = isBookmarked(anime.id);

  return (
    <button
      onClick={() => toggleBookmark(anime)}
      className={`mt-3 flex items-center justify-center gap-2 font-bold py-4 rounded-xl w-full transition-all border ${
        active 
        ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' 
        : 'bg-secondary text-gray-400 border-white/5 hover:border-primary/50 hover:text-white'
      }`}
    >
      <BookmarkIcon fill={active ? "white" : "none"} size={20} /> 
      {active ? 'In Library' : 'Add to Library'}
    </button>
  );
}
