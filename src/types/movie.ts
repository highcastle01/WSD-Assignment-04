export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface WishlistMovie extends Movie {
  userId: string;
  createdAt: string;
}