import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import HeaderPage from './pages/HeaderPage'
import HomePage from './pages/HomePage';
import SigninPage from './pages/SigninPage';
import React from 'react';

const basename = process.env.NODE_ENV === 'development' 
  ? '/' 
  : '/wsd-assignment-02';

// 레이아웃 컴포넌트 생성
const Layout = () => {
  return (
    <div className="page-container">
      <HeaderPage />
      <div className="content-wrapper">
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/signin",
        element: <SigninPage />
      },
      // 나머지 라우트들도 동일한 방식으로 추가
    ]
  }
], {
  basename: basename
});

export default function App() {
  return <RouterProvider router={router} />;
}