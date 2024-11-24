import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './WishlistForm.css';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

interface WishlistItem {
  userId: string;
  movieId: number;
  createdAt: string;
}

const WishlistForm: React.FC = () => {
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [sortBy, setSortBy] = useState<'date' | 'release' | 'rating' | 'title'>('date');
  const [movies, setMovies] = useState<(Movie & { createdAt: string })[]>([]);

  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    const fetchWishlistMovies = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const wishlist: WishlistItem[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const userWishlist = wishlist.filter(item => item.userId === currentUser.email);
  
        // 중복 제거를 위해 Set 사용
        const uniqueMovieIds = Array.from(new Set(userWishlist.map(item => item.movieId)));
        
        const moviePromises = uniqueMovieIds.map(async (movieId) => {
          const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR`
          );
          const wishItem = userWishlist.find(item => item.movieId === movieId);
          return {
            ...response.data,
            createdAt: wishItem?.createdAt
          };
        });
  
        const fetchedMovies = await Promise.all(moviePromises);
        setMovies(fetchedMovies);
      } catch (error) {
        toast.error('위시리스트를 불러오는데 실패했습니다.');
      }
    };
  
    fetchWishlistMovies();
  }, [TMDB_API_KEY]);

  const getSortedMovies = () => {
    const sorted = [...movies];
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'release':
        return sorted.sort((a, b) => 
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
      case 'rating':
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div className="left-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
            >
              카드형
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              목록형
            </button>
          </div>
        </div>
        <div className="right-controls">
          <select 
            className="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="date">찜한 순서</option>
            <option value="release">개봉일 순</option>
            <option value="rating">평점 순</option>
            <option value="title">제목 순</option>
          </select>
        </div>
      </div>

      <div className={`wishlist-content ${viewMode}`}>
        {getSortedMovies().map(movie => (
          <div key={movie.id} className={`movie-item ${viewMode}`}>
            <img 
              src={`${BASE_IMAGE_URL}${movie.poster_path}`} 
              alt={movie.title} 
              className="movie-poster"
            />
            <div className="movie-info">
              <h3>{movie.title}</h3>
              {viewMode === 'list' && (
                <p className="movie-overview">{movie.overview}</p>
              )}
              <div className="movie-metadata">
                <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
                <span className="release-date">
                  {new Date(movie.release_date).toLocaleDateString()}
                </span>
                <span className="wish-date">
                  찜한 날짜: {new Date(movie.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistForm;