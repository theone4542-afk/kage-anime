import axios from 'axios';

export interface NyaaResult {
  title: string;
  magnet: string;
  seeders: number;
  size: string;
}

export async function searchNyaa(query: string): Promise<NyaaResult[]> {
  try {
    const rssUrl = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query)}&c=1_2&f=0`;
    const response = await axios.get(rssUrl);
    const xml = response.data;
    
    // Simple regex-based XML parsing for items
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    return items.map((item: string) => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
      const magnet = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const seeders = parseInt(item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || '0');
      const size = item.match(/<nyaa:size>([\s\S]*?)<\/nyaa:size>/)?.[1] || '';
      
      return { title, magnet, seeders, size };
    });
  } catch (error) {
    console.error('Error searching Nyaa:', error);
    return [];
  }
}
