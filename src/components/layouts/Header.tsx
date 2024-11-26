import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // 로그인 상태 체크
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    const users = localStorage.getItem('users');
    const wishlist = localStorage.getItem('wishlist');
    
    // 로컬 스토리지 전체 삭제
    localStorage.clear();
    
    // 보존할 데이터 다시 저장
    if (users) localStorage.setItem('users', users);
    if (wishlist) localStorage.setItem('wishlist', wishlist);
    window.location.reload(); // 로그아웃 시 새로고침
  };

  return (
    <header className={`header ${isScrolled ? 'black-bg' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <Link to="/">
            {/* <img 
              src="/netflix-logo.png" 
              alt="Logo" 
              className="header-logo"
            /> */}
            Castle Movie
          </Link>
          <nav className="header-nav">
            <Link to="/">홈</Link>
            <Link to="/popular">대세 콘텐츠</Link>
            <Link to="/search">찾아보기</Link>
            {isLoggedIn && ( // 로그인 상태일 때만 보이는 메뉴
              <Link to="/wishlist">내가 찜한 리스트</Link>
            )}
          </nav>
        </div>
        <div className="header-right">
          <Link to="/search" className="icon-button search-icon">🔍</Link>
          {isLoggedIn && (
            <Link to="/notifications" className="icon-button notification-icon">🔔</Link>
          )}
          {isLoggedIn ? (
            <div onClick={handleLogout} className="icon-button profile-icon">
              로그아웃
            </div>
          ) : (
            <Link to="/signin" className="icon-button profile-icon">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;