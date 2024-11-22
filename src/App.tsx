import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HeaderPage from './pages/HeaderPage'
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
// import PopularPage from './pages/PopularPage';
// import SearchPage from './pages/SearchPage';
// import WishlistPage from './pages/WishlistPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <HeaderPage />
        <HomePage />
      </div>
    )
  },
  {
    path: "/signin",
    element: (
      <div>
        <HeaderPage />
        <AuthPage />
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
  basename: '/wsd-assignment-02'
});

export default function App() {
  return <RouterProvider router={router} />;
}