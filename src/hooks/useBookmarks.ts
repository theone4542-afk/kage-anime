'use client';

import { useState, useEffect } from 'react';

export interface Bookmark {
  id: number;
  title: string;
  image: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('kage_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    };
    
    load();
    window.addEventListener('bookmarks-updated', load);
    return () => window.removeEventListener('bookmarks-updated', load);
  }, []);

  const toggleBookmark = (anime: Bookmark) => {
    const saved = localStorage.getItem('kage_bookmarks');
    let current: Bookmark[] = saved ? JSON.parse(saved) : [];
    
    const isBookmarked = current.some((b) => b.id === anime.id);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = current.filter((b) => b.id !== anime.id);
    } else {
      newBookmarks = [...current, anime];
    }
    
    localStorage.setItem('kage_bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
    window.dispatchEvent(new CustomEvent('bookmarks-updated'));
  };

  const isBookmarked = (id: number) => bookmarks.some((b) => b.id === id);

  return { bookmarks, toggleBookmark, isBookmarked };
}
