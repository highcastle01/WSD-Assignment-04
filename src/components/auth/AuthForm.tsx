import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountBox } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuthForm.css';

declare global {
  interface Window {
    Kakao: any;
  }
}

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
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  useEffect(() => {
    //카카오 SDK 로드 여부 체크
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => {
      //카카오 SDK 로드 완료 후 초기화
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.REACT_APP_KAKAO_API_KEY);
        console.log('Kakao SDK initialized');
      }
    };
    document.head.appendChild(script);

    //로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      navigate('/');
    }

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [navigate]);

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      toast.error('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    window.Kakao.Auth.login({
      scope: 'profile_nickname, account_email',
      success: function(authObj: any) {
        console.log('인증성공:', authObj);
        localStorage.setItem('kakaoAccessToken', authObj.access_token);
        
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function(response: any) {
            console.log('카카오 사용자 정보 응답 : ', response);

            //데이터 추출. 아이디랑 닉네임만. 이외에는 비즈앱 등록을 해야만 해서 수집불가.
            const userInfo = {
              id: response.id,
              nickname: response.kakao_account?.profile?.nickname || '사용자',
              account_email: response.kakao_account?.email || '이메일이 없습니다.'
            };

            //카카오 로그인 사용자 정보 저장
            localStorage.setItem('kakaoUserInfo', JSON.stringify(userInfo));
            localStorage.setItem('TMDb-Key', process.env.REACT_APP_TMDB_API_KEY || '');
            localStorage.setItem('isLoggedIn', 'true');
            
            //카카로 로그인 후 회원 정보 조회 및 콘솔에 출력
            console.log('로그인한 카카오 사용자 정보:', userInfo);

            toast.success(`환영합니다, ${userInfo.nickname}님!`);
            navigate('/', { replace: true });
          },
          fail: function(error: any) {
            console.error('사용자 정보 요청 실패:', error);
            
            //네트워크 에러 메세지
            if (error.code === -401) {
              toast.error('인증이 만료되었습니다. 다시 로그인해주세요.');
            } else if (error.code === -502) {
              toast.error('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            } else if (error.code === -504) {
              toast.error('서버 응답 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
            } else {
              toast.error(`카카오 로그인 중 오류가 발생했습니다: ${error.msg}`);
            }
  
            //재시도 알림
            toast.info('다시 시도하려면 새로고침 해주세요.', {
              autoClose: false,
              closeButton: true
            });
          }
        });
      },
      fail: function(error: any) {
        console.error('카카오 로그인 실패:', error);
        
        //로그인 에러 메세지
        if (error.code === 'CANCELED') {
          toast.error('로그인이 취소되었습니다 .');
        } else if (error.code === 'NETWORK') {
          toast.error('네트워크 연결이 불안정합니다. 인터넷 연결을 확인해주세요.');
        } else {
          toast.error('카카오 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    });
  };

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
          <div className="button-container">
            <button type="button" onClick={handleKakaoLogin} className="kakao-login-btn">
              카카오 로그인
            </button>
          </div>
          <div className="divider">
            <span onClick={() => setShowEmailLogin(!showEmailLogin)} className="toggle-email-login">
              {showEmailLogin ? "← 카카오 로그인으로 돌아가기" : "다른 이메일 계정으로 로그인 →"}
            </span>
          </div>
          {showEmailLogin && (
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
                  <span>이메일 로그인</span>
                </button>
              </div>
            </form>
          )}
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