import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
    genre_ids: number[];
}

interface UseMovieDataProps {
    viewMode: 'infinite' | 'pagination';
    page: number;
    moviesPerPage: number;
}

export const useMovieData = ({ viewMode, page, moviesPerPage }: UseMovieDataProps) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const TMDB_API_KEY = localStorage.getItem('TMDb-Key');

    const fetchMovies = async (resetMovies = false) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=${resetMovies ? 1 : page}`;
            const response = await axios.get(url);
            const newMovies = response.data.results;

            setTotalPages(Math.ceil(response.data.total_results / moviesPerPage));

            if (viewMode === 'pagination') {
                setMovies(newMovies.slice(0, moviesPerPage));
            } else {
                setMovies(prev => resetMovies ? newMovies : [...prev, ...newMovies]);
            }
            
            setHasMore(newMovies.length > 0);
        } catch (error) {
            console.error('Error fetching movies:', error);
            toast.error('영화 데이터를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return { movies, isLoading, hasMore, totalPages, fetchMovies };
};