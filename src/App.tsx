import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HeaderPage from './pages/HeaderPage'
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

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
    path: "/auth",
    element: (
      <div>
        <HeaderPage />
        <AuthPage />
      </div>
    )
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}