import { client, GET_ANIME_DETAILS_QUERY } from '@/lib/anilist';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, Calendar, Clock, Tv } from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';

export default async function DetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: any = await client.request(GET_ANIME_DETAILS_QUERY, { id: parseInt(id) });
  const anime = data.Media;

  return (
    <main className="min-h-screen">
      {/* Banner */}
      <div className="relative h-[40vh] w-full">
        <Image
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-64 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={anime.coverImage.extraLarge}
                alt={anime.title.romaji}
                fill
                className="object-cover"
              />
            </div>
            <Link
              href={`/watch/${anime.id}`}
              className="mt-6 flex items-center justify-center gap-2 bg-primary text-black font-bold py-4 rounded-xl w-full hover:scale-105 transition-transform"
            >
              <Play fill="black" size={20} /> Watch Now
            </Link>
            <BookmarkButton anime={{ 
              id: anime.id, 
              title: anime.title.english || anime.title.romaji, 
              image: anime.coverImage.large 
            }} />
          </div>

          {/* Info */}
          <div className="flex-1 py-4">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {anime.title.english || anime.title.romaji}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Star className="text-yellow-400" size={16} fill="currentColor" />
                <span className="font-bold">{anime.averageScore}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Tv className="text-primary" size={16} />
                <span className="font-medium">{anime.status}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="text-primary" size={16} />
                <span className="font-medium">{anime.season} {anime.seasonYear}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {anime.genres.map((genre: string) => (
                <span key={genre} className="px-4 py-1.5 bg-secondary text-sm font-medium rounded-full border border-white/5">
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8" 
               dangerouslySetInnerHTML={{ __html: anime.description }} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-secondary/30 rounded-2xl border border-white/5">
              <div>
                <div className="text-gray-500 text-sm mb-1">Studios</div>
                <div className="font-bold">{anime.studios.nodes[0]?.name}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Duration</div>
                <div className="font-bold">{anime.duration} min</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Episodes</div>
                <div className="font-bold">{anime.episodes || '??'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Native</div>
                <div className="font-bold line-clamp-1">{anime.title.native}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
