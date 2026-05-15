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
    const saved = localStorage.getItem('kage_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (anime: Bookmark) => {
    const isBookmarked = bookmarks.some((b) => b.id === anime.id);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((b) => b.id !== anime.id);
    } else {
      newBookmarks = [...bookmarks, anime];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('kage_bookmarks', JSON.stringify(newBookmarks));
  };

  const isBookmarked = (id: number) => bookmarks.some((b) => b.id === id);

  return { bookmarks, toggleBookmark, isBookmarked };
}
