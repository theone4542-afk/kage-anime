import axios from 'axios';

export interface NyaaResult {
  title: string;
  magnet: string;
  seeders: number;
  size: string;
  id: string;
}

export async function searchNyaa(query: string): Promise<NyaaResult[]> {
  try {
    const rssUrl = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query)}&c=1_2&f=0`;
    const response = await axios.get(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    });
    const xml: string = response.data;

    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    return items
      .map((item: string) => {
        const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
          || '';
        // <link> is the page URL; magnet is in <nyaa:magnetUri>
        const magnet = item.match(/<nyaa:magnetUri><!\[CDATA\[([\s\S]*?)\]\]><\/nyaa:magnetUri>/)?.[1]
          || item.match(/<nyaa:magnetUri>([\s\S]*?)<\/nyaa:magnetUri>/)?.[1]
          || '';
        const seeders = parseInt(
          item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || '0'
        );
        const size = item.match(/<nyaa:size>([\s\S]*?)<\/nyaa:size>/)?.[1] || '';
        const idMatch = item.match(/\/view\/(\d+)/);
        const id = idMatch?.[1] || '';

        return { title, magnet, seeders, size, id };
      })
      .filter((r) => r.magnet && r.seeders > 0); // only return results with a valid magnet and at least 1 seeder
  } catch (error) {
    console.error('Error searching Nyaa:', error);
    return [];
  }
}

/**
 * Finds the best matching Nyaa result for a specific episode.
 * Tries multiple query strategies and returns the most-seeded match.
 */
export async function findEpisodeMagnet(
  group: string,
  title: string,
  episodeNum: number
): Promise<string> {
  const paddedEp = episodeNum.toString().padStart(2, '0');

  const queries = [
    `${group} ${title} - ${paddedEp}`,
    `${group} ${title} ${paddedEp}`,
    `${group} ${title} - ${episodeNum}`,
    `${title} ${paddedEp}`,
  ];

  for (const query of queries) {
    const results = await searchNyaa(query);
    if (results.length === 0) continue;

    // Find results that mention the episode number
    const epMatches = results.filter((r) => {
      const t = r.title;
      return (
        t.includes(`- ${paddedEp}`) ||
        t.includes(`- ${episodeNum}`) ||
        t.includes(` ${paddedEp} `) ||
        t.includes(`[${paddedEp}]`) ||
        t.endsWith(` ${paddedEp}`) ||
        t.endsWith(`-${paddedEp}`)
      );
    });

    const pool = epMatches.length > 0 ? epMatches : results;
    // Sort by seeders descending, pick the best
    pool.sort((a, b) => b.seeders - a.seeders);
    if (pool[0]?.magnet) return pool[0].magnet;
  }

  return '';
}
