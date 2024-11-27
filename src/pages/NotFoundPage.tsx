import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1>404 - 페이지를 찾을 수 없습니다</h1>
      <p>요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <button onClick={() => navigate('/')}>
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default NotFoundPage;