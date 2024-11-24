import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import HeaderPage from './pages/HeaderPage'
import HomePage from './pages/HomePage';
import SigninPage from './pages/SigninPage';
import WishlistPage from './pages/WishlistPage';
import React from 'react';

const basename = process.env.NODE_ENV === 'development' 
  ? '/' 
  : '/wsd-assignment-02';

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

const router = createBrowserRouter([
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
  }
  ,
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/wishlist",
        element: <WishlistPage />
      }
    ]
  }
], {
  basename: basename
});

export default function App() {
  return <RouterProvider router={router} />;
}