import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountBox } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuthForm.css';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false
  });

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
      
    if (!validateEmail(formData.email)) {
      toast.error('유효한 이메일 주소를 입력해주세요.');
      return;
    }
  
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => 
        u.email === formData.email && u.password === formData.password
      );
  
      if (user) {
        if (formData.rememberMe) {
          localStorage.setItem('userEmail', formData.email);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('TMDb-Key', user.password);
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success('로그인에 성공하였습니다.');
        // window.location.reload() 대신 navigate 사용
        navigate('/', { replace: true });
      } else {
        toast.error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      toast.error('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateEmail(formData.email)) {
      toast.error('유효한 이메일 주소를 입력해주세요.');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    if (!formData.agreeToTerms) {
      toast.error('필수 약관에 동의해주세요.');
      return;
    }
  
    try {
      // 기존 사용자 목록 가져오기
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 이미 존재하는 이메일인지 확인
      if (existingUsers.some((user: any) => user.email === formData.email)) {
        toast.error('이미 존재하는 이메일입니다.');
        return;
      }
  
      // 새 사용자 추가
      const newUser = {
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString()
      };
  
      existingUsers.push(newUser);
      
      // 업데이트된 사용자 목록 저장
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      toast.success('회원가입에 성공하였습니다.');
      setIsActive(false);
    } catch (error) {
      toast.error('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <div className="background-container">
          <img src={process.env.PUBLIC_URL + '/image1.jpg'} alt="" className="floating-poster" />
          <img src="/movie-poster2.jpg" alt="" className="floating-poster" />
          <img src="/movie-poster3.jpg" alt="" className="floating-poster" />
          <img src="/movie-poster4.jpg" alt="" className="floating-poster" />
          <img src="/movie-poster5.jpg" alt="" className="floating-poster" />
      </div>
      <div className={`container ${isActive ? 'active' : ''}`}>
        <div className="card">
          <div className="title">
            <AccountBox />
            <span>로그인</span>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label>이메일</label>
            </div>
            <div className="input-container">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label>비밀번호</label>
            </div>
            <div className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <label>로그인 정보 저장하기</label>
            </div>
            <div className="signup-hint">회원가입이 필요하면 + 버튼을 눌러주세요</div> 
            <div className="button-container">
                <button>
                    <span>로그인</span>
                </button>
            </div>
          </form>
        </div>

        <div className="card alt">
          <div className="toggle" onClick={() => setIsActive(!isActive)}></div>
          <div className="title">
            회원가입
            <div className="close" onClick={() => setIsActive(false)}></div>
          </div>
          <form onSubmit={handleRegister}>
            <div className="input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label>이메일</label>
            </div>
            <div className="input-container">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label>비밀번호</label>
            </div>
            <div className="input-container">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <label>비밀번호 확인</label>
            </div>
            <div className="checkbox-container">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
              />
              <label>필수 약관에 동의합니다</label>
            </div>
            <div className="button-container">
                <button>
                    <span>회원가입</span>
                </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AuthForm;