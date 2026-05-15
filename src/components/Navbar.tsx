'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Dices, Bookmark, Play } from 'lucide-react';
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
          perPage: 6 
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
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-black/80 backdrop-blur-2xl py-3 border-b border-white/5 shadow-2xl' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Play fill="black" size={20} className="ml-0.5 text-black" />
          </div>
          <div className="text-2xl font-black text-white tracking-tighter">
            KAGE<span className="text-primary">.</span>
          </div>
        </Link>

        {/* Search Bar - More Refined */}
        <div className="flex-1 max-w-lg mx-12 relative hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search for an anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
            />
          </div>

          {/* Cinematic Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-4 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-2">
                {searchResults.map((anime) => (
                  <Link
                    key={anime.id}
                    href={`/details/${anime.id}`}
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-white/5">
                      <img src={anime.coverImage.large} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {anime.title.english || anime.title.romaji}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mt-1">
                        <span className="text-primary">{anime.status}</span>
                        <span>•</span>
                        <span>{anime.episodes} EPS</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-3 bg-white/5 text-center">
                <button className="text-[10px] font-black tracking-widest text-gray-500 hover:text-white uppercase transition-colors">
                  View All Results
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="flex items-center gap-8">
          <button 
            onClick={handleRandom}
            className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-primary transition-all uppercase tracking-widest hidden lg:flex"
          >
            <Dices size={18} /> Surprise
          </button>
          <Link 
            href="/bookmarks" 
            className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-primary transition-all uppercase tracking-widest hidden lg:flex"
          >
            <Bookmark size={18} /> Library
          </Link>
          <button className="lg:hidden text-white">
            <Menu size={28} />
          </button>
        </div>
      </div>
    </nav>
  );
}
