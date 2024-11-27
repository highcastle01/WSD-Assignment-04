// HomeForm.tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './HomeForm.css';
import { Movie } from '../../types/movie';
import { useWishlist } from '../../hooks/useWishlist';
import { useLocation } from 'react-router-dom';

const HomeForm: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();

  useEffect(() => {
      // 페이지 진입 시 한 번만 실행
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        window.location.reload();
      }
    }, [location.pathname]);

  const trendingRowRef = useRef<HTMLDivElement>(null);
  const popularRowRef = useRef<HTMLDivElement>(null);
  const topRatedRowRef = useRef<HTMLDivElement>(null);

  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/original';

  const { handleWishClick, isMovieWished } = useWishlist();

  const handlePlayClick = (movieTitle: string) => {
    const searchQuery = encodeURIComponent(`${movieTitle} 공식 예고편`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    window.open(youtubeSearchUrl, '_blank');
  };  

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const pages = 3;
        const requests = [];
        
        for(let i = 1; i <= pages; i++) {
          requests.push(
            axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=ko-KR&page=${i}`),
            axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=${i}`),
            axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=ko-KR&page=${i}`)
          );
        }

        const responses = await Promise.all(requests);
        
        const trending = responses.filter((_, i) => i % 3 === 0).flatMap(res => res.data.results);
        const popular = responses.filter((_, i) => i % 3 === 1).flatMap(res => res.data.results);
        const topRated = responses.filter((_, i) => i % 3 === 2).flatMap(res => res.data.results);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);

        const randomIndex = Math.floor(Math.random() * trending.length);
        setBannerMovie(trending[randomIndex]);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [TMDB_API_KEY]);

  const MovieSection = ({ title, movies, rowRef }: { title: string, movies: Movie[], rowRef: React.RefObject<HTMLDivElement> }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const autoScrollInterval = useRef<NodeJS.Timeout>();
    const isUserScrolling = useRef(false);

    const scrollCards = (direction: 'left' | 'right') => {
      if (rowRef.current) {
        const cardWidth = 200;
        const gap = 15;
        const scrollAmount = (cardWidth + gap) * 3;
        let newPosition;
        
        if (direction === 'left') {
          newPosition = Math.max(0, scrollPosition - scrollAmount);
        } else {
          newPosition = Math.min(
            scrollPosition + scrollAmount,
            rowRef.current.scrollWidth - rowRef.current.clientWidth
          );
        }
        
        rowRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
        setScrollPosition(newPosition);
      }
    };

    const handleWheelEvent = (e: React.WheelEvent) => {
      if (rowRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isUserScrolling.current = true;

        const cardWidth = 200;
        const gap = 15;
        const scrollAmount = (cardWidth + gap) * 3;
        const newPosition = scrollPosition + (e.deltaY > 0 ? scrollAmount : -scrollAmount);
        const maxScroll = rowRef.current.scrollWidth - rowRef.current.clientWidth;
        const boundedPosition = Math.max(0, Math.min(newPosition, maxScroll));

        rowRef.current.scrollTo({ left: boundedPosition, behavior: 'smooth' });
        setScrollPosition(boundedPosition);

        if (autoScrollInterval.current) {
          clearInterval(autoScrollInterval.current);
        }
        
        setTimeout(() => {
          isUserScrolling.current = false;
        }, 150);
      }
    };

    useEffect(() => {
      const startAutoScroll = () => {
        if (rowRef.current) {
          autoScrollInterval.current = setInterval(() => {
            if (!isUserScrolling.current && rowRef.current) {
              const cardWidth = 200;
              const gap = 15;
              const scrollAmount = (cardWidth + gap) * 3;
              let newPosition = scrollPosition + scrollAmount;
              
              if (newPosition >= rowRef.current.scrollWidth - rowRef.current.clientWidth) {
                newPosition = 0;
              }
              
              rowRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
              setScrollPosition(newPosition);
            }
          }, 3000);
        }
      };

      startAutoScroll();
      return () => {
        if (autoScrollInterval.current) {
          clearInterval(autoScrollInterval.current);
        }
      };
    }, [scrollPosition]);

    useEffect(() => {
      if (rowRef.current) {
        rowRef.current.scrollLeft = scrollPosition;
      }
    }, [movies]);

    return (
      <section className="movie-section">
        <h2>{title}</h2>
        <div className="movie-row-container">
          <button className="scroll-button left" onClick={() => scrollCards('left')}>
            <span className="arrow">‹</span>
          </button>
          <div className="movie-row" ref={rowRef} onWheel={handleWheelEvent}>
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div 
                  className="wish-button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishClick(movie);
                  }}
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
          <button className="scroll-button right" onClick={() => scrollCards('right')}>
            <span className="arrow">›</span>
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="home-container">
      {bannerMovie && (
        <section 
          className={`banner-section ${showDetails ? 'show-details' : ''}`}
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), 
                             url(${BASE_IMAGE_URL}${bannerMovie.poster_path})`
          }}
        >
          <div className="banner-content">
            <h1 className="banner-title">{bannerMovie.title}</h1>
            <p className="banner-overview">{bannerMovie.overview}</p>
            {showDetails && (
              <div className="banner-details">
                <div className="metadata">
                  <span className="rating">⭐ {bannerMovie.vote_average.toFixed(1)}</span>
                  <span className="release-date">개봉일: {bannerMovie.release_date}</span>
                </div>
              </div>
            )}
            <div className="banner-buttons">
            <button 
              className="play-button" 
              onClick={() => bannerMovie && handlePlayClick(bannerMovie.title)}
            >
              재생
            </button>
              <button className="info-button" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? '간략히' : '상세 정보'}
              </button>
            </div>
          </div>
        </section>
      )}
      <MovieSection title="지금 대세 영화" movies={trendingMovies} rowRef={trendingRowRef} />
      <MovieSection title="인기 영화" movies={popularMovies} rowRef={popularRowRef} />
      <MovieSection title="최고 평점 영화" movies={topRatedMovies} rowRef={topRatedRowRef} />
    </div>
  );
};

export default HomeForm;