import { client, TRENDING_ANIME_QUERY } from '@/lib/anilist';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

async function getTrending() {
  const data: any = await client.request(TRENDING_ANIME_QUERY, { page: 1, perPage: 10 });
  return data.Page.media;
}

export default async function Home() {
  const trending = await getTrending();
  const hero = trending[0];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <Image
          src={hero.bannerImage || hero.coverImage.extraLarge}
          alt={hero.title.romaji}
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            {hero.title.english || hero.title.romaji}
          </h1>
          <p className="text-gray-300 text-lg mb-6 line-clamp-3 md:line-clamp-4" 
             dangerouslySetInnerHTML={{ __html: hero.description }} />
          
          <div className="flex gap-4">
            <Link 
              href={`/watch/${hero.id}`}
              className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              <Play fill="black" size={20} /> Watch Now
            </Link>
            <Link 
              href={`/details/${hero.id}`}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Grid */}
      <section className="p-8 md:p-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full" />
          Trending Now
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {trending.slice(1).map((anime: any) => (
            <Link 
              key={anime.id} 
              href={`/details/${anime.id}`}
              className="group relative"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-secondary">
                <Image
                  src={anime.coverImage.large}
                  alt={anime.title.romaji}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="text-primary" size={48} fill="#caff33" />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {anime.title.english || anime.title.romaji}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
