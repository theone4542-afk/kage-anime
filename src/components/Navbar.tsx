'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Dices, Bookmark } from 'lucide-react';
import { client, SEARCH_ANIME_QUERY, getRandomAnimeId } from '@/lib/anilist';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const data: any = await client.request(SEARCH_ANIME_QUERY, { 
          search: searchQuery, 
          page: 1, 
          perPage: 5 
        });
        setSearchResults(data.Page.media);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRandom = async () => {
    const id = await getRandomAnimeId();
    if (id) router.push(`/details/${id}`);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-primary tracking-tighter">
          KAGE<span className="text-white">.ANIME</span>
        </Link>

        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-secondary border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {searchResults.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/details/${anime.id}`}
                  onClick={() => setSearchQuery('')}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <img src={anime.coverImage.large} alt="" className="w-10 h-14 object-cover rounded" />
                  <div>
                    <div className="text-sm font-bold text-white line-clamp-1">{anime.title.english || anime.title.romaji}</div>
                    <div className="text-xs text-gray-400">{anime.status} • {anime.episodes} eps</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={handleRandom}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors hidden sm:flex"
          >
            <Dices size={18} /> Surprise
          </button>
          <Link href="/bookmarks" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors hidden sm:flex">
            <Bookmark size={18} /> Library
          </Link>
          <button className="md:hidden">
            <Menu className="text-white" />
          </button>
        </div>
      </div>
    </nav>
  );
}
