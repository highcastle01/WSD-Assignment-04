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
  // 기존 상태
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

  // 최근 검색어 관련 상태 추가
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const { handleWishClick, isMovieWished } = useWishlist();
  const observer = useRef<IntersectionObserver>();
  const lastMovieRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w300';
  const moviesPerPage = 8;

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

  // 최근 검색어 로드
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // 최근 검색어 저장 함수
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const removeSearch = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(item => item !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // 기존 useEffect - 장르 불러오기
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

  // 영화 데이터 불러오기
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

  // 무한 스크롤 관련 useEffect
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

  // 검색 조건 변경 시 새로운 검색
  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(true);
  }, [searchQuery, selectedGenres, sortBy, yearRange, viewMode]);

  // 페이지네이션 모드에서 페이지 변경 시
  useEffect(() => {
    if (viewMode === 'pagination' && page > 1) {
      fetchMovies(true);
    }
  }, [page]);

  // 필터 초기화
  const resetFilters = () => {
    setSelectedGenres([]);
    setSortBy('popularity');
    setYearRange('');
    setSearchQuery('');
    setPage(1);
    fetchMovies(true);
  };

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const maxPages = 5;
    const halfMaxPages = Math.floor(maxPages / 2);
    let startPage = Math.max(1, page - halfMaxPages);
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

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
          onClick={() => setPage(prev => prev - 1)}
          disabled={page === 1}
        >
          {'<'}
        </button>
        {pageNumbers.map(pageNum => (
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
          onClick={() => setPage(prev => prev + 1)}
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
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="영화 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowRecentSearches(true)}
              onBlur={() => {
                setTimeout(() => setShowRecentSearches(false), 200);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  saveSearch(searchQuery);
                  fetchMovies(true);
                }
              }}
              className="search-input"
            />
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="recent-searches">
                {recentSearches.map((search, index) => (
                  <div key={index} className="recent-search-item">
                    <div 
                      className="search-text"
                      onClick={() => {
                        setSearchQuery(search);
                        saveSearch(search);
                        fetchMovies(true);
                      }}
                    >
                      <span className="search-icon">🔍</span>
                      {search}
                    </div>
                    <button 
                      className="delete-search"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(search);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <div
              className="wish-button"
              onClick={() => handleWishClick(movie)}
            >
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
      {viewMode === 'infinite' && isLoading && (
        <div className="loading">Loading...</div>
      )}
    </div>
  );
};

export default SearchForm;