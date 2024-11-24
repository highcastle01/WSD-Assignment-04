import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './HomeForm.css';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  isWished?: boolean;
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

const HomeForm: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [wishedMovies, setWishedMovies] = useState<number[]>(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const allWishlist: WishlistMovie[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    // 현재 사용자의 위시리스트에서 영화 ID만 추출
    return allWishlist
        .filter(item => item.userId === currentUser.email)
        .map(item => item.id); // movieId 대신 id 사용
});
  const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  //스크롤
  const trendingRowRef = useRef<HTMLDivElement>(null);
  const popularRowRef = useRef<HTMLDivElement>(null);
  const topRatedRowRef = useRef<HTMLDivElement>(null);

  const TMDB_API_KEY = localStorage.getItem('TMDb-Key');
  const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/original';

  //찜목록
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

  const scrollRow = (direction: 'left' | 'right', rowRef: React.RefObject<HTMLDivElement>) => {
    if (rowRef.current) {
      const containerWidth = rowRef.current.clientWidth;
      const scrollAmount = containerWidth * 0.8; // 화면 너비의 80%만큼 스크롤
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
        try {
            // 여러 페이지의 데이터를 가져오기
            const pages = 3; // 가져올 페이지 수
            const requests = [];
            
            for(let i = 1; i <= pages; i++) {
            requests.push(
                axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=ko-KR&page=${i}`),
                axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=${i}`),
                axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=ko-KR&page=${i}`)
            );
            }
    
            const responses = await Promise.all(requests);
            
            // 결과 병합
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

  // 영화 섹션 컴포넌트
  const MovieSection = ({ title, movies, rowRef }: { 
    title: string, 
    movies: Movie[], 
    rowRef: React.RefObject<HTMLDivElement> 
  }) => {
    const handleWheelEvent = (e: React.WheelEvent) => {
        if (rowRef.current) {
            e.preventDefault(); // 이벤트 전파 중지
            e.stopPropagation();
            const scrollSpeed = 100; // 스크롤 속도 조절
            
            rowRef.current.scrollBy({
              left: e.deltaY > 0 ? scrollSpeed : -scrollSpeed,
              behavior: 'smooth'
            });
          }
    };
  
    return (
      <section className="movie-section">
        <h2>{title}</h2>
        <div className="movie-row-container">
          <button 
            className="scroll-button left"
            onClick={() => scrollRow('left', rowRef)}
          >
            <span className="arrow">‹</span>
          </button>
          <div 
            className="movie-row" 
            ref={rowRef}
            onWheel={handleWheelEvent}
          >
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
          <button 
            className="scroll-button right"
            onClick={() => scrollRow('right', rowRef)}
          >
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
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url(${BASE_IMAGE_URL}${bannerMovie.poster_path})`
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
                <button className="play-button">재생</button>
                <button className="info-button" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? '간략히' : '상세 정보'}
                </button>
            </div>
            </div>
        </section>
        )}

      <MovieSection title="트렌딩 영화" movies={trendingMovies} rowRef={trendingRowRef} />
      <MovieSection title="인기 영화" movies={popularMovies} rowRef={popularRowRef} />
      <MovieSection title="최고 평점 영화" movies={topRatedMovies} rowRef={topRatedRowRef} />
    </div>
    );
};

export default HomeForm;