import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PopularForm.css';
import { Movie } from '../../types/movie';
import { useWishlist } from '../../hooks/useWishlist';
import { useLocation } from 'react-router-dom';

const PopularForm: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'infinite' | 'table'>('infinite');
  const [totalPages, setTotalPages] = useState(0);
  const [loadingNewCards, setLoadingNewCards] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      const hasRefreshed = sessionStorage.getItem('hasRefreshed');
      
      if (!hasRefreshed) {
        sessionStorage.setItem('hasRefreshed', 'true');
        window.location.reload();
      }
    }
  }, [location.pathname]);

  const { handleWishClick, isMovieWished } = useWishlist();
  const observer = useRef<IntersectionObserver>();
  const lastMovieRef = useRef<HTMLDivElement>(null);
  const topButtonRef = useRef<HTMLButtonElement>(null);
  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w300';
  const moviesPerPage = 5;

  const fetchPaginatedMovies = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=${pageNum}`;
      const response = await axios.get(url);
      const newMovies = response.data.results;
      setTotalPages(Math.ceil(response.data.total_results / moviesPerPage));
      setMovies(newMovies.slice(0, moviesPerPage));
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInfiniteMovies = async (resetMovies = false) => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingNewCards(true);
    
    try {
      const currentPage = resetMovies ? 1 : page;
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=${currentPage}`;
      const response = await axios.get(url);
      const newMovies = response.data.results;
      
      setMovies(prev => resetMovies ? newMovies : [...prev, ...newMovies]);
      setHasMore(newMovies.length > 0);
      setPage(prev => resetMovies ? 1 : prev + 1);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingNewCards(false);
    }
  };

  const handleViewModeChange = (mode: 'infinite' | 'table') => {
    setViewMode(mode);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    if (mode === 'table') {
      fetchPaginatedMovies(1);
    } else {
      fetchInfiniteMovies(true);
    }
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
          fetchInfiniteMovies();
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
    if (viewMode === 'table') {
      fetchPaginatedMovies(page);
    }
  }, [page]);

  useEffect(() => {
    if (viewMode === 'infinite') {
      fetchInfiniteMovies(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (topButtonRef.current) {
        topButtonRef.current.style.display = 
          viewMode === 'infinite' && window.scrollY > 300 ? 'block' : 'none';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Pagination = () => {
    const pageRange = 5;
    const start = Math.max(1, page - Math.floor(pageRange / 2));
    const end = Math.min(totalPages, start + pageRange - 1);
    
    return (
      <div className="pagination">
        <button 
          className="pagination-button"
          onClick={() => setPage(1)} 
          disabled={page === 1}
        >
          {'<<'}
        </button>
        <button 
          className="pagination-button"
          onClick={() => setPage(prev => Math.max(1, prev - 1))} 
          disabled={page === 1}
        >
          {'<'}
        </button>
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`pagination-button ${page === pageNum ? 'active' : ''}`}
          >
            {pageNum}
          </button>
        ))}
        <button 
          className="pagination-button"
          onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} 
          disabled={page === totalPages}
        >
          {'>'}
        </button>
        <button 
          className="pagination-button"
          onClick={() => setPage(totalPages)} 
          disabled={page === totalPages}
        >
          {'>>'}
        </button>
      </div>
    );
  };

  return (
    <div className="popular-container">
      <div className="view-mode-controls">
        <button
          className={`view-mode-button ${viewMode === 'infinite' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('infinite')}
        >
          무한 스크롤
        </button>
        <button
          className={`view-mode-button ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('table')}
        >
          테이블 뷰
        </button>
      </div>

      {viewMode === 'infinite' ? (
        <div className="movies-grid">
          {movies.length === 0 && isLoading ? (
            <div className="initial-loading">Loading...</div>
          ) : (
            <>
              {/* 기존 영화 카드들 */}
              {movies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  ref={index === movies.length - 1 ? lastMovieRef : null}
                >
                  <div className="wish-button" onClick={() => handleWishClick(movie)}>
                    {isMovieWished(movie.id) ? '❤️' : '🤍'}
                  </div>
                  <img 
                    src={movie.poster_path 
                      ? `${BASE_IMAGE_URL}${movie.poster_path}` 
                      : `${process.env.PUBLIC_URL}/bean.png`
                    } 
                    alt={movie.title}
                    className="movie-poster"
                    onError={(e) => {
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/bean.png`;
                    }}
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

              {/* 2. 새로운 영화 로딩을 위한 더미 카드들 */}
              {loadingNewCards && (
                [...Array(moviesPerPage)].map((_, index) => (
                  <div key={`loading-${index}`} className="movie-card loading-placeholder">
                    <div className="loading-card">Loading...</div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      ) : (
        <div className="table-container">
          {isLoading ? (
            <div className="loading-overlay">Loading...</div>
          ) : (
            <>
              <Pagination />
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
                        src={movie.poster_path 
                          ? `${BASE_IMAGE_URL}${movie.poster_path}` 
                          : '/bean.png'
                        } 
                        alt={movie.title}
                        className="table-poster"
                        onError={(e) => {
                          e.currentTarget.src = '/public/bean.png';
                        }}
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
                          {isMovieWished(movie.id) ? '❤️' : '🤍'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      <button ref={topButtonRef} className="top-button" onClick={scrollToTop}>
        Top
      </button>
    </div>
  );
};

export default PopularForm;