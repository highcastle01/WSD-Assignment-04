import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
/* eslint-disable no-unused-vars */
import type { RootState } from '../store';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
/* eslint-disable no-unused-vars */
import type { Movie } from '../types/movie';
import { toast } from 'react-toastify';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlistMovies = useSelector((state: RootState) => state.wishlist.movies);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const handleWishClick = useCallback((movie: Movie) => {
    if (!currentUser.email) {
      toast.error('로그인이 필요한 서비스입니다.');
      return;
    }

    const isWished = wishlistMovies.some(
      item => item.userId === currentUser.email && item.id === movie.id
    );

    if (isWished) {
      dispatch(removeFromWishlist({ 
        movieId: movie.id, 
        userId: currentUser.email 
      }));
    } else {
      dispatch(addToWishlist({
        ...movie,
        userId: currentUser.email,
        createdAt: new Date().toISOString()
      }));
    }
  }, [dispatch, wishlistMovies, currentUser.email]);

  const isMovieWished = useCallback((movieId: number) => {
    return wishlistMovies.some(
      movie => movie.id === movieId && movie.userId === currentUser.email
    );
  }, [wishlistMovies, currentUser.email]);

  return { handleWishClick, isMovieWished };
};