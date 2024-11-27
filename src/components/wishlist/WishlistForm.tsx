import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './WishlistForm.css';
import { WishlistMovie } from '../../types/movie';
import { useLocation } from 'react-router-dom';

type ViewType = 'card' | 'list';
type SortType = 'rating' | 'release' | 'wished';

const WishlistForm: React.FC = () => {
    const [movies, setMovies] = useState<WishlistMovie[]>([]);
    const [viewType, setViewType] = useState<ViewType>('card');
    const [sortType, setSortType] = useState<SortType>('wished');
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 5;
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

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const wishlist: WishlistMovie[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const userWishlist = wishlist.filter(movie => movie.userId === currentUser.email);
        setMovies(userWishlist);
    }, []);

    const handleUnwish = (movieId: number) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const allWishlist: WishlistMovie[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        const newWishlist = allWishlist.filter(
            item => !(item.userId === currentUser.email && item.id === movieId)
        );
        
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setMovies(prev => prev.filter(movie => movie.id !== movieId));
        toast.success('위시리스트에서 제거되었습니다.');
    };

    const sortMovies = (type: SortType) => {
        setSortType(type);
        const sorted = [...movies];
        switch(type) {
            case 'rating':
                sorted.sort((a, b) => b.vote_average - a.vote_average);
                break;
            case 'release':
                sorted.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
                break;
            case 'wished':
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        setMovies(sorted);
    };

    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
    const totalPages = Math.ceil(movies.length / moviesPerPage);

    const CardView = () => (
        <div className="card-grid">
            {movies.map(movie => (
                <div key={movie.id} className="movie-card">
                    <div className="wish-button" onClick={() => handleUnwish(movie.id)}>
                        ❤️
                    </div>
                    <img 
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="movie-poster"
                    />
                    <div className="movie-info">
                        <h3>{movie.title}</h3>
                        <p className="movie-overview">{movie.overview}</p>
                        <div className="movie-details">
                            <span className="rating">⭐ {(movie?.vote_average ?? 0).toFixed(1)}</span>
                            <span className="release-date">{movie.release_date}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const ListView = () => (
        <div className="list-view-container">
            <Pagination />
            <table className="movie-table">
                <thead>
                    <tr>
                        <th>포스터</th>
                        <th>제목</th>
                        <th>개봉일</th>
                        <th>평점</th>
                        <th>찜한 날짜</th>
                        <th>찜 해제</th>
                    </tr>
                </thead>
                <tbody>
                    {currentMovies.map(movie => (
                        <tr key={movie.id}>
                            <td>
                                <img 
                                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                    alt={movie.title}
                                    className="table-poster"
                                />
                            </td>
                            <td>{movie.title}</td>
                            <td>{movie.release_date}</td>
                            <td>⭐ {(movie?.vote_average ?? 0).toFixed(1)}</td>
                            <td>{new Date(movie.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button 
                                    className="unwish-button"
                                    onClick={() => handleUnwish(movie.id)}
                                >
                                    ❌ 찜 해제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const Pagination = () => {
        const maxPages = 5;
        const halfMaxPages = Math.floor(maxPages / 2);
        let startPage = Math.max(1, currentPage - halfMaxPages);
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
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                >
                    {'<<'}
                </button>
                <button 
                    className="pagination-button"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                >
                    {'<'}
                </button>
                
                {pageNumbers.map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                    >
                        {pageNum}
                    </button>
                ))}
                
                <button 
                    className="pagination-button"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                >
                    {'>'}
                </button>
                <button 
                    className="pagination-button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    {'>>'}
                </button>
            </div>
        );
    };

    return (
        <div className="wishlist-container">
            <div className="controls">
                <div className="view-controls">
                    <button 
                        className={viewType === 'card' ? 'active' : ''}
                        onClick={() => setViewType('card')}
                    >
                        카드형
                    </button>
                    <button 
                        className={viewType === 'list' ? 'active' : ''}
                        onClick={() => setViewType('list')}
                    >
                        목록형
                    </button>
                </div>
                <div className="sort-controls">
                    <button 
                        className={sortType === 'rating' ? 'active' : ''}
                        onClick={() => sortMovies('rating')}
                    >
                        평점순
                    </button>
                    <button 
                        className={sortType === 'release' ? 'active' : ''}
                        onClick={() => sortMovies('release')}
                    >
                        개봉일자순
                    </button>
                    <button 
                        className={sortType === 'wished' ? 'active' : ''}
                        onClick={() => sortMovies('wished')}
                    >
                        찜한 날짜순
                    </button>
                </div>
            </div>
            <div className="content">
                {viewType === 'card' ? <CardView /> : <ListView />}
            </div>
        </div>
    );
};

export default WishlistForm;