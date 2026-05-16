import { client, TRENDING_ANIME_QUERY } from '@/lib/anilist';
import Image from 'next/image';
import Link from 'next/link';
import { Play, TrendingUp, Star } from 'lucide-react';

async function getTrending() {
  const data: any = await client.request(TRENDING_ANIME_QUERY, { page: 1, perPage: 13 });
  return data.Page.media;
}

export default async function Home() {
  const trending = await getTrending();
  const hero = trending[0];

  return (
    <main className="min-h-screen bg-[#050505]">
      {/* Hero Section - More Cinematic */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <Image
          src={hero.bannerImage || hero.coverImage.extraLarge}
          alt={hero.title.romaji}
          fill
          className="object-cover opacity-50 scale-105 animate-pulse-slow"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 md:p-20 w-full md:w-3/4 lg:w-1/2 z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4 tracking-widest uppercase">
            <TrendingUp size={18} /> #1 Trending Anime
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-[1.1] tracking-tighter">
            {hero.title.english || hero.title.romaji}
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-xl leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: hero.description }} />
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href={`/watch/${hero.id}`}
              className="flex items-center gap-3 bg-primary text-black px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              <Play fill="black" size={24} /> WATCH NOW
            </Link>
            <Link 
              href={`/details/${hero.id}`}
              className="bg-white/10 backdrop-blur-xl text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
            >
              DETAILS
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Grid - Smaller, Sharper Cards */}
      <section className="px-6 md:px-12 lg:px-20 py-16 -mt-20 relative z-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <span className="w-2 h-10 bg-primary rounded-full shadow-lg shadow-primary/50" />
            TRENDING NOW
          </h2>
          <Link href="/trending" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">
            VIEW ALL
          </Link>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
          {trending.slice(1).map((anime: any) => (
            <Link 
              key={anime.id} 
              href={`/watch/${anime.id}`}
              className="group relative flex flex-col"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl md:rounded-2xl border border-white/5 bg-secondary shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-primary/30">
                <Image
                  src={anime.coverImage.extraLarge || anime.coverImage.large}
                  alt={anime.title.romaji}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                    <Play className="text-black ml-1" size={28} fill="black" />
                  </div>
                </div>
                {/* Score Tag */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star size={12} className="text-primary" fill="currentColor" />
                  <span className="text-[10px] font-bold text-white">{anime.averageScore}%</span>
                </div>
              </div>
              <h3 className="mt-4 text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {anime.title.english || anime.title.romaji}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                <span>{anime.status}</span>
                <span>•</span>
                <span>{anime.episodes} EPS</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
