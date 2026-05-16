'use client';

import { useBookmarks } from '@/hooks/useBookmarks';
import Image from 'next/image';
import Link from 'next/link';
import { Play, BookmarkX } from 'lucide-react';

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useBookmarks();

  return (
    <main className="min-h-screen p-8 md:p-16 pt-24">
      <div className="container mx-auto">
        <h1 className="text-4xl font-black mb-12 flex items-center gap-4">
          <span className="w-3 h-10 bg-primary rounded-full" />
          My Library
        </h1>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <BookmarkX className="text-gray-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your library is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Start adding your favorite anime to keep track of them and access them quickly.
            </p>
            <Link 
              href="/" 
              className="bg-primary text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
            >
              Discover Anime
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
            {bookmarks.map((anime) => (
              <div key={anime.id} className="group relative">
                <Link href={`/watch/${anime.id}`}>
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-secondary">
                    <Image
                      src={anime.image}
                      alt={anime.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="text-primary" size={48} fill="#caff33" />
                    </div>
                  </div>
                </Link>
                <div className="mt-3">
                  <h3 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                    {anime.title}
                  </h3>
                  <button 
                    onClick={() => toggleBookmark(anime)}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors mt-1"
                  >
                    Remove from Library
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
