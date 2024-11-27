import { createHashRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import HeaderPage from './pages/HeaderPage'
import HomePage from './pages/HomePage';
import SigninPage from './pages/SigninPage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';
import PopluarPage from './pages/PopularPage';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import NotFoundPage from './pages/NotFoundPage';

// 보호된 레이아웃 컴포넌트
const ProtectedLayout = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <>
      <HeaderPage />
      <div className="content-wrapper">
        <Outlet />
      </div>
    </>
  );
};

// 인증 레이아웃 컴포넌트 (로그인 페이지용)
const AuthLayout = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <HeaderPage />
      <div className="content-wrapper">
        <Outlet />
      </div>
    </>
  );
};

const router = createHashRouter([
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      }
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/signin",
        element: <SigninPage />
      }
    ]
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/wishlist",
        element: <WishlistPage />
      },
      {
        path: "/search",
        element: <SearchPage />
      },
      {
        path: "/popular",
        element: <PopluarPage />
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

// 루트 컴포넌트
const Root = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default Root;