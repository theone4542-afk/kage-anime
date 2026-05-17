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
      timeout: 8000,
    });
    const xml: string = response.data;
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    return items
      .map((item: string) => {
        const title =
          item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
          item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
          '';
        const magnet =
          item.match(/<nyaa:magnetUri><!\[CDATA\[([\s\S]*?)\]\]><\/nyaa:magnetUri>/)?.[1] ||
          item.match(/<nyaa:magnetUri>([\s\S]*?)<\/nyaa:magnetUri>/)?.[1] ||
          '';
        const seeders = parseInt(
          item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || '0'
        );
        const size = item.match(/<nyaa:size>([\s\S]*?)<\/nyaa:size>/)?.[1] || '';
        const id = item.match(/\/view\/(\d+)/)?.[1] || '';

        return { title, magnet, seeders, size, id };
      })
      .filter((r) => r.magnet);
  } catch (error) {
    console.error('Nyaa search error:', error);
    return [];
  }
}

/**
 * Searches Nyaa specifically for CR WEB-DL releases (MP4, browser-playable).
 * These are Crunchyroll web downloads — no remuxing needed, plays natively in browser.
 * Falls back to any WEB release if no CR-specific result found.
 */
export async function findCRWebDL(
  title: string,
  episodeNum: number,
  romajiTitle?: string
): Promise<string> {
  const paddedEp = episodeNum.toString().padStart(2, '0');
  const titleVariants = [title];
  if (romajiTitle && romajiTitle !== title) titleVariants.push(romajiTitle);

  // CR WEB-DL groups that release MP4 (browser-compatible)
  // SubsPlease and Erai-raws are the most prolific CR-WEB groups
  const crGroups = ['SubsPlease', 'Erai-raws'];

  for (const t of titleVariants) {
    for (const group of crGroups) {
      const results = await searchNyaa(`${group} ${t} ${paddedEp}`);
      const match = pickBestEpisodeMatch(results, paddedEp, episodeNum);
      if (match) return match;
    }

    // Fallback: search with WEB-DL tag directly
    const webResults = await searchNyaa(`${t} ${paddedEp} WEB`);
    const webMatch = pickBestEpisodeMatch(webResults, paddedEp, episodeNum);
    if (webMatch) return webMatch;

    // Last resort: just title + episode, any result
    const anyResults = await searchNyaa(`${t} ${paddedEp}`);
    const anyMatch = pickBestEpisodeMatch(anyResults, paddedEp, episodeNum);
    if (anyMatch) return anyMatch;
  }

  return '';
}

function pickBestEpisodeMatch(
  results: NyaaResult[],
  paddedEp: string,
  episodeNum: number
): string {
  if (!results.length) return '';

  const epMatches = results.filter((r) => {
    const t = r.title;
    return (
      t.includes(`- ${paddedEp}`) ||
      t.includes(`- ${episodeNum}`) ||
      t.includes(` ${paddedEp} `) ||
      t.includes(`[${paddedEp}]`) ||
      t.endsWith(` ${paddedEp}`) ||
      t.endsWith(`-${paddedEp}`) ||
      t.includes(`E${paddedEp}`)
    );
  });

  const pool = epMatches.length > 0 ? epMatches : results;
  pool.sort((a, b) => b.seeders - a.seeders);
  return pool[0]?.magnet || '';
}
