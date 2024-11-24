import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SearchForm.css';

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
    genre_ids: number[];
}

interface Genre {
    id: number;
    name: string;
}

const SearchForm: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
    const [yearFilter, setYearFilter] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const observer = useRef<IntersectionObserver>();
    const lastMovieRef = useRef<HTMLDivElement>(null);

    const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
    const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w300';

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=ko-KR`
                );
                setGenres(response.data.genres);
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };
        fetchGenres();
    }, [TMDB_API_KEY]);

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
            if (minRating > 0) {
                url += `&vote_average.gte=${minRating}`;
            }
            if (yearFilter) {
                url += `&primary_release_year=${yearFilter}`;
            }

            switch (sortBy) {
                case 'popularity':
                    url += '&sort_by=popularity.desc';
                    break;
                case 'rating':
                    url += '&sort_by=vote_average.desc';
                    break;
                case 'date':
                    url += '&sort_by=release_date.desc';
                    break;
            }

            const response = await axios.get(url);
            const newMovies = response.data.results;

            setMovies(prev => resetMovies ? newMovies : [...prev, ...newMovies]);
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
        fetchMovies(true);
    }, [searchQuery, selectedGenres, minRating, sortBy, yearFilter]);

    useEffect(() => {
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
    }, [hasMore, isLoading]);

    const resetFilters = () => {
        setSelectedGenres([]);
        setMinRating(0);
        setSortBy('popularity');
        setYearFilter('');
        setSearchQuery('');
    };

    return (
        <div className="search-container">
            <div className="search-header">
                <div className="search-filters">
                    <input
                        type="text"
                        placeholder="영화 검색..."
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
                    <input
                        type="number"
                        placeholder="최소 평점"
                        min="0"
                        max="10"
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="rating-input"
                    />
                    <input
                        type="number"
                        placeholder="개봉년도"
                        min="1900"
                        max="2024"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="year-input"
                    />
                    <button onClick={resetFilters} className="reset-button">
                        필터 초기화
                    </button>
                </div>
                <div className="genre-filters">
                    {genres.map(genre => (
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
                        ref={index === movies.length - 1 ? lastMovieRef : null}
                    >
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
            {isLoading && <div className="loading">Loading...</div>}
        </div>
    );
};

export default SearchForm;