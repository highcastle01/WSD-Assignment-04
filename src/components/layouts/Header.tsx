import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    const users = localStorage.getItem('users');
    const wishlist = localStorage.getItem('wishlist');
    localStorage.clear();
    if (users) localStorage.setItem('users', users);
    if (wishlist) localStorage.setItem('wishlist', wishlist);
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  return (
    <header className={`header ${isScrolled ? 'black-bg' : ''}`}>
      <div className="header-content">
        <div className="header-left">
        <Link to="/" className="logo-text">
          <img src={process.env.PUBLIC_URL + '/castle.png'} alt="성" className="castle-icon" />
          Castle Movie
        </Link>
          <div className="hamburger-menu" onClick={toggleMobileMenu}>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
          </div>

          <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <Link to="/popular" onClick={() => setIsMobileMenuOpen(false)}>대세 콘텐츠</Link>
            <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>찾아보기</Link>
            {isLoggedIn && (
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>내가 찜한 리스트</Link>
            )}
          </nav>
        </div>
        
        <div className="header-right">
          <Link to="/search" className="icon-button search-icon">🔍</Link>
          {isLoggedIn ? (
            <div onClick={handleLogout} className="icon-button profile-icon">
              <img src={process.env.PUBLIC_URL + '/logout.png'} alt="로그아웃" className="auth-icon" />
            </div>
          ) : (
            <Link to="/signin" className="icon-button profile-icon">
              <img src={process.env.PUBLIC_URL + '/login.png'} alt="로그인" className="auth-icon" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;