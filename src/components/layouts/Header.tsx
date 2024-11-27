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
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  return (
    <header className={`header ${isScrolled ? 'black-bg' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo-text">Castle Movie</Link>
          
          <div className="hamburger-menu" onClick={toggleMobileMenu}>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
          </div>

          <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>홈</Link>
            <Link to="/popular" onClick={() => setIsMobileMenuOpen(false)}>대세 콘텐츠</Link>
            <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>찾아보기</Link>
            {isLoggedIn && (
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>내가 찜한 리스트</Link>
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