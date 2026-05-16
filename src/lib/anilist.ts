import { GraphQLClient } from 'graphql-request';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

export const client = new GraphQLClient(ANILIST_ENDPOINT);

export const TRENDING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
        description
        averageScore
        genres
        status
        episodes
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        status
        episodes
      }
    }
  }
`;

export const GET_ANIME_DETAILS_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        color
      }
      bannerImage
      description
      averageScore
      genres
      status
      episodes
      duration
      season
      seasonYear
      studios(isMain: true) {
        nodes {
          name
        }
      }
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      recommendations {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

export const RANDOM_ANIME_QUERY = `
  query ($page: Int) {
    Page(page: $page, perPage: 1) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
      }
    }
  }
`;

export async function getRandomAnimeId() {
  const randomPage = Math.floor(Math.random() * 50) + 1;
  try {
    const data: any = await client.request(RANDOM_ANIME_QUERY, { page: randomPage });
    return data.Page.media[0]?.id;
  } catch {
    const data: any = await client.request(RANDOM_ANIME_QUERY, { page: 1 });
    return data.Page.media[0]?.id;
  }
}
