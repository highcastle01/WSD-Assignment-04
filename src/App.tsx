import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HeaderPage from './pages/HeaderPage'
import HomePage from './pages/HomePage';
import SigninPage from './pages/SigninPage';
// import PopularPage from './pages/PopularPage';
// import SearchPage from './pages/SearchPage';
// import WishlistPage from './pages/WishlistPage';
import React from 'react';

const basename = process.env.NODE_ENV === 'development' 
  ? '/' 
  : '/wsd-assignment-02';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="page-container">
        <HeaderPage />
        <div className="content-wrapper">
          <div className="main-content">
            <HomePage />
          </div>
        </div>
      </div>
    )
  },
  {
    path: "/signin",
    element: (
      <div className="page-container">
        <HeaderPage />
        <div className="content-wrapper">
          <div className="main-content">
            <SigninPage />
          </div>
        </div>
      </div>
    )
  },
  // {
  //   path: "/popular",
  //   element: (
  //     <div>
  //       <HeaderPage />
  //       <PopularPage />
  //     </div>
  //   )
  // },
  // {
  //   path: "/search",
  //   element: (
  //     <div>
  //       <HeaderPage />
  //       <SearchPage />
  //     </div>
  //   )
  // },
  // {
  //   path: "/wishlist",
  //   element: (
  //     <div>
  //       <HeaderPage />
  //       <WishlistPage />
  //     </div>
  //   )
  // }
], {
  basename: basename
});

export default function App() {
  return <RouterProvider router={router} />;
}