import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  return isLoggedIn ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;