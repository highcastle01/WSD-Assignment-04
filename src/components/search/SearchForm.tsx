import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SearchForm.css';
import { Movie } from '../../types/movie';
import { useWishlist } from '../../hooks/useWishlist';

interface Genre {
  id: number;
  name: string;
}

const SearchForm: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const [yearRange, setYearRange] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'infinite' | 'pagination'>('infinite');
  const [totalPages, setTotalPages] = useState(0);

  const { handleWishClick, isMovieWished } = useWishlist();

  const observer = useRef<IntersectionObserver>();
  const lastMovieRef = useRef<HTMLDivElement>(null);
  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w300';
  const moviesPerPage = 5;

  const yearOptions = [
    { value: '-1950', label: '1950년 이전' },
    { value: '1950-1960', label: '1950-1960년' },
    { value: '1960-1970', label: '1960-1970년' },
    { value: '1970-1980', label: '1970-1980년' },
    { value: '1980-1990', label: '1980-1990년' },
    { value: '1990-2000', label: '1990-2000년' },
    { value: '2000-2005', label: '2000-2005년' },
    { value: '2005-2010', label: '2005-2010년' },
    { value: '2010-2015', label: '2010-2015년' },
    { value: '2015-2020', label: '2015-2020년' },
    { value: '2020-', label: '2020년 이후' }
  ];

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=ko-KR`
        );
        setGenres(response.data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
        toast.error('장르 정보를 불러오는데 실패했습니다.');
      }
    };
    fetchGenres();
  }, []);

  const fetchMovies = async (resetMovies = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let url = searchQuery
        ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=ko-KR&query=${searchQuery}&page=${resetMovies ? 1 : page}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=ko-KR&page=${resetMovies ? 1 : page}`;

      if (selectedGenres.length > 0) {
        url += `&with_genres=${selectedGenres.join(',')}`;
      }

      if (yearRange) {
        const [startYear, endYear] = yearRange.split('-');
        if (startYear === '') {
          url += `&primary_release_date.gte=2020-01-01`;
        } else if (endYear === '') {
          url += `&primary_release_date.lte=${startYear}-12-31`;
        } else {
          url += `&primary_release_date.gte=${startYear}-01-01`;
          url += `&primary_release_date.lte=${endYear}-12-31`;
        }
      }

      switch (sortBy) {
        case 'popularity':
          url += '&sort_by=popularity.desc';
          break;
        case 'rating':
          url += '&sort_by=vote_average.desc&vote_count.gte=100';
          break;
        case 'date':
          url += '&sort_by=release_date.desc';
          break;
      }

      const response = await axios.get(url);
      const newMovies = response.data.results;
      setTotalPages(Math.ceil(response.data.total_results / moviesPerPage));

      if (viewMode === 'pagination') {
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

  useEffect(() => {
    if (viewMode === 'infinite') {
      if (!hasMore || isLoading) return;

      const options = {
        root: null,
        rootMargin: '20px',
        threshold: 0.1
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
  }, [hasMore, isLoading, viewMode, page]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(true);
  }, [searchQuery, selectedGenres, sortBy, yearRange, viewMode]);

  useEffect(() => {
    if (viewMode === 'pagination' && page > 1) {
      fetchMovies(true);
    }
  }, [page]);

  const resetFilters = () => {
    setSelectedGenres([]);
    setSortBy('popularity');
    setYearRange('');
    setSearchQuery('');
    setPage(1);
    fetchMovies(true);
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
    <div className="search-container">
      <div className="search-header">
        <div className="view-mode-controls">
          <button
            className={`view-mode-button ${viewMode === 'infinite' ? 'active' : ''}`}
            onClick={() => setViewMode('infinite')}
          >
            무한 스크롤
          </button>
          <button
            className={`view-mode-button ${viewMode === 'pagination' ? 'active' : ''}`}
            onClick={() => setViewMode('pagination')}
          >
            페이지네이션
          </button>
        </div>
        <div className="search-filters">
          <input
            type="text"
            placeholder="영화 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popularity' | 'rating' | 'date')}
            className="filter-select"
          >
            <option value="popularity">인기순</option>
            <option value="rating">평점순</option>
            <option value="date">최신순</option>
          </select>
          <select
            value={yearRange}
            onChange={(e) => setYearRange(e.target.value)}
            className="filter-select"
          >
            <option value="">개봉년도 선택</option>
            {yearOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={resetFilters} className="reset-button">
            필터 초기화
          </button>
        </div>
        <div className="genre-filters">
          {genres.map((genre: Genre) => (
            <button
              key={genre.id}
              className={`genre-button ${selectedGenres.includes(genre.id) ? 'active' : ''}`}
              onClick={() => {
                setSelectedGenres(prev =>
                  prev.includes(genre.id)
                    ? prev.filter(id => id !== genre.id)
                    : [...prev, genre.id]
                );
              }}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      <div className="movies-grid">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="movie-card"
            ref={viewMode === 'infinite' && index === movies.length - 1 ? lastMovieRef : null}
          >
            <div className="wish-button" onClick={() => handleWishClick(movie)}>
                {isMovieWished(movie.id) ? '❤️' : '🤍'}
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
      {viewMode === 'pagination' && <Pagination />}
      {viewMode === 'infinite' && isLoading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default SearchForm;