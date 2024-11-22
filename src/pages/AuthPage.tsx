import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

interface User {
  id: string;
  password: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const handleLoginSuccess = (user: User) => {
    console.log('Login successful:', user);
    // 로그인 성공 후 처리
  };

  const handleLoginFailure = () => {
    console.log('Login failed');
    // 로그인 실패 처리
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful');
    setIsLogin(true); // 회원가입 성공 후 로그인 폼으로 전환
  };

  const handleRegisterFailure = (error: Error) => {
    console.log('Registration failed:', error);
    // 회원가입 실패 처리
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setIsLogin(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLogin ? '#007bff' : '#f8f9fa',
            color: isLogin ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button 
          onClick={() => setIsLogin(false)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: !isLogin ? '#007bff' : '#f8f9fa',
            color: !isLogin ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          onFailure={handleLoginFailure}
        />
      ) : (
        <RegisterForm 
          onSuccess={handleRegisterSuccess} 
          onFailure={handleRegisterFailure}
        />
      )}
    </div>
  );
}