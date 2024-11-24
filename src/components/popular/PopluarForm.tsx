import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PopularForm.css';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

interface WishlistMovie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
    genre_ids: number[];
    userId: string;
    createdAt: string;
  }

const PopularForm: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'infinite' | 'table'>('infinite');
  const [totalPages, setTotalPages] = useState(0);
  const [wishedMovies, setWishedMovies] = useState<number[]>(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const allWishlist: WishlistMovie[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // 현재 사용자의 위시리스트에서 영화 ID만 추출
    return allWishlist
        .filter(item => item.userId === currentUser.email)
        .map(item => item.id); // movieId 대신 id 사용
});

  const observer = useRef<IntersectionObserver>();
  const lastMovieRef = useRef<HTMLDivElement>(null);
  const topButtonRef = useRef<HTMLButtonElement>(null);
  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w300';
  const moviesPerPage = 10;

  const fetchMovies = async (resetMovies = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=${resetMovies ? 1 : page}`;
      const response = await axios.get(url);
      const newMovies = response.data.results;
      setTotalPages(Math.ceil(response.data.total_results / moviesPerPage));

      if (viewMode === 'table') {
        setMovies(newMovies.slice(0, moviesPerPage));
      } else {
        setMovies(prev => resetMovies ? newMovies : [...prev, ...newMovies]);
      }
      setHasMore(newMovies.length > 0);
      if (resetMovies) {
        setPage(1);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishClick = (movie: Movie) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email) {
      toast.error('로그인이 필요한 서비스입니다.');
      return;
    }
  
    const allWishlist: WishlistMovie[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isWished = allWishlist.some(
      item => item.userId === currentUser.email && item.id === movie.id
    );
  
    let newWishlist: WishlistMovie[];
    if (isWished) {
      newWishlist = allWishlist.filter(
        item => !(item.userId === currentUser.email && item.id === movie.id)
      );
    } else {
      newWishlist = [
        ...allWishlist,
        {
          ...movie,
          userId: currentUser.email,
          createdAt: new Date().toISOString()
        }
      ];
    }
  
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setWishedMovies(
      newWishlist
        .filter(item => item.userId === currentUser.email)
        .map(item => item.id)
    );
  };

  useEffect(() => {
    if (viewMode === 'infinite') {
      if (!hasMore || isLoading) return;
      const options = {
        root: null,
        rootMargin: '20px',
        threshold: 1.0
      };

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMovies();
        }
      }, options);

      if (lastMovieRef.current) {
        observer.current.observe(lastMovieRef.current);
      }

      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    }
  }, [hasMore, isLoading, viewMode]);

  useEffect(() => {
    fetchMovies(true);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'table' && page > 1) {
      fetchMovies(true);
    }
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (topButtonRef.current) {
        topButtonRef.current.style.display = window.scrollY > 300 ? 'block' : 'none';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Pagination = () => (
    <div className="pagination">
      <button
        onClick={() => setPage(1)}
        disabled={page === 1}
        className="pagination-button"
      >
        {'<<'}
      </button>
      <button
        onClick={() => setPage(prev => Math.max(1, prev - 1))}
        disabled={page === 1}
        className="pagination-button"
      >
        {'<'}
      </button>
      {[...Array(Math.min(5, totalPages))].map((_, i) => {
        const pageNum = page - 2 + i;
        if (pageNum > 0 && pageNum <= totalPages) {
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`pagination-button ${page === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          );
        }
        return null;
      })}
      <button
        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
        disabled={page === totalPages}
        className="pagination-button"
      >
        {'>'}
      </button>
      <button
        onClick={() => setPage(totalPages)}
        disabled={page === totalPages}
        className="pagination-button"
      >
        {'>>'}
      </button>
    </div>
  );

  return (
    <div className="popular-container">
      <div className="view-mode-controls">
        <button
          className={`view-mode-button ${viewMode === 'infinite' ? 'active' : ''}`}
          onClick={() => setViewMode('infinite')}
        >
          무한 스크롤
        </button>
        <button
          className={`view-mode-button ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
        >
          테이블 뷰
        </button>
      </div>

      {viewMode === 'infinite' ? (
        <div className="movies-grid">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="movie-card"
              ref={index === movies.length - 1 ? lastMovieRef : null}
            >
              <div
                className="wish-button"
                onClick={() => handleWishClick(movie)}
              >
                {wishedMovies.includes(movie.id) ? '❤️' : '🤍'}
              </div>
              <img
                src={`${BASE_IMAGE_URL}${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
              />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p className="movie-overview">{movie.overview}</p>
                <div className="movie-details">
                  <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
                  <span className="release-date">{movie.release_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="movie-table">
            <thead>
              <tr>
                <th>포스터</th>
                <th>제목</th>
                <th>개봉일</th>
                <th>평점</th>
                <th>찜하기</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.id}>
                  <td>
                    <img
                      src={`${BASE_IMAGE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      className="table-poster"
                    />
                  </td>
                  <td>{movie.title}</td>
                  <td>{movie.release_date}</td>
                  <td>⭐ {movie.vote_average.toFixed(1)}</td>
                  <td>
                    <button
                      className="wish-button-table"
                      onClick={() => handleWishClick(movie)}
                    >
                      {wishedMovies.includes(movie.id) ? '❤️' : '🤍'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination />
        </div>
      )}

      {viewMode === 'infinite' && isLoading && (
        <div className="loading">Loading...</div>
      )}

      <button ref={topButtonRef} className="top-button" onClick={scrollToTop}>
        Top
      </button>
    </div>
  );
};

export default PopularForm;