import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, Calendar, Clock, Tv, Share2, Info } from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';

export default async function DetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: any = await client.request(GET_ANIME_DETAILS_QUERY, { id: parseInt(id) });
  const anime = data.Media;

  return (
    <main className="min-h-screen bg-[#050505]">
      {/* Cinematic Banner */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt=""
          fill
          className="object-cover opacity-20"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 -mt-64 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Side: Poster & Actions */}
          <div className="w-full lg:w-80 shrink-0 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group">
              <Image
                src={anime.coverImage.extraLarge}
                alt={anime.title.romaji}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                quality={100}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            <div className="mt-8 space-y-4">
              <Link
                href={`/watch/${anime.id}`}
                className="flex items-center justify-center gap-3 bg-primary text-black font-black py-5 rounded-2xl w-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                <Play fill="black" size={24} /> WATCH NOW
              </Link>
              
              <BookmarkButton anime={{ 
                id: anime.id, 
                title: anime.title.english || anime.title.romaji, 
                image: anime.coverImage.large 
              }} />

              <button className="flex items-center justify-center gap-2 bg-white/5 text-gray-400 font-bold py-4 rounded-xl w-full hover:bg-white/10 hover:text-white transition-all border border-white/5">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>

          {/* Main: Details */}
          <div className="flex-1 py-4">
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 text-primary text-sm font-black tracking-widest uppercase">
                <Info size={16} /> Anime Details
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                {anime.title.english || anime.title.romaji}
              </h1>
              <div className="text-xl text-gray-500 font-medium italic">
                {anime.title.native}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
                <Star size={18} fill="currentColor" />
                <span className="font-black text-lg">{anime.averageScore}%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 text-gray-300 px-4 py-2 rounded-xl border border-white/10">
                <Tv size={18} className="text-primary" />
                <span className="font-bold">{anime.status}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 text-gray-300 px-4 py-2 rounded-xl border border-white/10">
                <Calendar size={18} className="text-primary" />
                <span className="font-bold">{anime.season} {anime.seasonYear}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 text-gray-300 px-4 py-2 rounded-xl border border-white/10">
                <Clock size={18} className="text-primary" />
                <span className="font-bold">{anime.duration}m / ep</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {anime.genres.map((genre: string) => (
                <span key={genre} className="px-5 py-2 bg-secondary/50 text-white text-sm font-bold rounded-full border border-white/5 hover:border-primary/50 transition-colors cursor-default">
                  {genre}
                </span>
              ))}
            </div>

            <div className="relative group mb-12">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary rounded-full opacity-50" />
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-4xl" 
                 dangerouslySetInnerHTML={{ __html: anime.description }} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-secondary/20 rounded-[2rem] border border-white/5 backdrop-blur-sm">
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Studios</div>
                <div className="text-white font-bold text-lg">{anime.studios.nodes[0]?.name}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Season</div>
                <div className="text-white font-bold text-lg">{anime.season} {anime.seasonYear}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Episodes</div>
                <div className="text-white font-bold text-lg">{anime.episodes || '??'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Format</div>
                <div className="text-white font-bold text-lg">TV Series</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
