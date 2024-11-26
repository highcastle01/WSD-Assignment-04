import { createSlice } from '@reduxjs/toolkit';
/* eslint-disable no-unused-vars */
import type { PayloadAction } from '@reduxjs/toolkit';
/* eslint-disable no-unused-vars */
import type { WishlistMovie } from '../../types/movie';

interface WishlistState {
  movies: WishlistMovie[];
}

const initialState: WishlistState = {
  movies: JSON.parse(localStorage.getItem('wishlist') || '[]')
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistMovie>) => {
      state.movies.push(action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.movies));
    },
    removeFromWishlist: (state, action: PayloadAction<{movieId: number, userId: string}>) => {
      state.movies = state.movies.filter(
        movie => !(movie.id === action.payload.movieId && 
                  movie.userId === action.payload.userId)
      );
      localStorage.setItem('wishlist', JSON.stringify(state.movies));
    }
  }
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;