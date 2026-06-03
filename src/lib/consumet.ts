import { ANIME } from '@consumet/extensions';

const animepahe = new ANIME.AnimePahe();
const kickassanime = new ANIME.KickAssAnime();

const providers = [
  { name: 'animepahe', instance: animepahe },
  { name: 'kickassanime', instance: kickassanime },
];

export async function fetchEpisodes(animeTitle: string) {
  for (const provider of providers) {
    try {
      console.log(`Trying provider: ${provider.name} for title: ${animeTitle}`);
      const results = await provider.instance.search(animeTitle);
      
      if (results.results && results.results.length > 0) {
        // Find the best title match - use a more flexible comparison
        const anime = results.results.find((r: any) => {
          const searchTitle = animeTitle.toLowerCase();
          const resultTitle = r.title.toLowerCase();
          return resultTitle === searchTitle || 
                 resultTitle.includes(searchTitle) || 
                 searchTitle.includes(resultTitle) ||
                 (r.alternateTitles && r.alternateTitles.some((t: string) => t.toLowerCase().includes(searchTitle)));
        }) || results.results[0];
        
        const info = await provider.instance.fetchAnimeInfo(anime.id);
        if (info?.episodes && info.episodes.length > 0) {
          info.episodes = info.episodes.map((ep: any) => ({ 
            ...ep, 
            provider: provider.name 
          }));
          return info;
        }
      }
    } catch (error) {
      console.error(`Error fetching episodes from ${provider.name}:`, error);
      continue; // Try next provider
    }
  }
  return null;
}

export async function fetchStreamLinks(episodeId: string, providerName?: string) {
  // If provider name is known, use it directly
  if (providerName) {
    const provider = providers.find(p => p.name === providerName);
    if (provider) {
      try {
        const links = await provider.instance.fetchEpisodeSources(episodeId);
        if (links?.sources?.length > 0) return links;
      } catch (error) {
        console.error(`Error fetching stream links from ${providerName}:`, error);
      }
    }
  }

  // Fallback: This is tricky because episodeId is provider-specific.
  // Usually this function is called with the ID returned by fetchEpisodes,
  // so the providerName should be passed.
  return null;
}
