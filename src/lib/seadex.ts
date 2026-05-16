import axios from 'axios';

const SEADEX_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1emW2Zsb0gEtEHiub_YHpazvBd4lL4saxCwyPhbtxXYM/gviz/tq?tqx=out:json';

export interface SeaDexEntry {
  title: string;
  bestRelease: string;
  altRelease: string;
  notes: string;
}

export async function fetchBestRelease(animeTitle: string): Promise<SeaDexEntry | null> {
  try {
    const response = await axios.get(SEADEX_SHEET_URL);
    const text = response.data;
    const jsonStr = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/)?.[1];
    
    if (!jsonStr) return null;
    
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows;
    
    // Simple fuzzy match for title
    const match = rows.find((row: any) => {
      const title = row.c[0]?.v?.toLowerCase() || '';
      const altTitle = row.c[1]?.v?.toLowerCase() || '';
      const searchTitle = animeTitle.toLowerCase();
      return title.includes(searchTitle) || searchTitle.includes(title) || 
             altTitle.includes(searchTitle) || searchTitle.includes(altTitle);
    });

    if (match) {
      return {
        title: match.c[0]?.v,
        bestRelease: match.c[2]?.v,
        altRelease: match.c[3]?.v,
        notes: match.c[5]?.v,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching SeaDex data:', error);
    return null;
  }
}
