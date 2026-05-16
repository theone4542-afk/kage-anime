import axios from 'axios';

export interface SeaDexEntry {
  title: string;
  bestRelease: string;
  altRelease: string;
  notes: string;
  nyaaIds: string[]; // direct Nyaa torrent IDs if available
}

const SEADEX_API = 'https://releases.moe/api/collections/entries/records';

/**
 * Fetches the best release info from SeaDex for a given anime title.
 * Uses the releases.moe PocketBase API.
 */
export async function fetchBestRelease(animeTitle: string): Promise<SeaDexEntry | null> {
  try {
    const response = await axios.get(SEADEX_API, {
      params: {
        filter: `title~"${animeTitle}"`,
        perPage: 5,
        expand: 'trs',
      },
      timeout: 10000,
    });

    const items = response.data?.items;
    if (!items || items.length === 0) return null;

    // Pick the closest title match
    const match = items.find((item: any) => {
      const t = (item.title || '').toLowerCase();
      const s = animeTitle.toLowerCase();
      return t.includes(s) || s.includes(t);
    }) || items[0];

    if (!match) return null;

    // Collect torrent records
    const trs: any[] = match.expand?.trs || [];

    // Best = marked as best, alt = not marked as best
    const bestTrs = trs.filter((t: any) => t.isBest);
    const altTrs = trs.filter((t: any) => !t.isBest);

    const bestRelease = bestTrs.map((t: any) => t.releaseGroup).filter(Boolean).join(', ')
      || match.bestRelease
      || '';
    const altRelease = altTrs.map((t: any) => t.releaseGroup).filter(Boolean).join(', ')
      || match.altRelease
      || '';

    // Collect Nyaa IDs from torrent records for direct linking
    const nyaaIds: string[] = trs
      .map((t: any) => {
        const url: string = t.url || '';
        const m = url.match(/nyaa\.si\/view\/(\d+)/);
        return m?.[1] || '';
      })
      .filter(Boolean);

    return {
      title: match.title,
      bestRelease,
      altRelease,
      notes: match.notes || '',
      nyaaIds,
    };
  } catch (error) {
    console.error('Error fetching SeaDex data:', error);
    return null;
  }
}

/**
 * Extracts the release group name from a SeaDex bestRelease string.
 * e.g. "SubsPlease" from "SubsPlease (CR)" → "SubsPlease"
 */
export function extractGroupName(bestRelease: string): string {
  return bestRelease.split(/[\s(]/)[0].trim();
}
