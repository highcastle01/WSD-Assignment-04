import React from 'react';
import './User.css';

const User = () => {
 const userInfo = JSON.parse(localStorage.getItem('kakaoUserInfo') || '{}');
 const { id, email, name } = userInfo;

 return (
   <div className="user-profile">
     <div className="profile-item">
       <label>프로필 ID</label>
       <span>{id}</span>
     </div>
     <div className="profile-item">
       <label>이름</label>
       <span>{name}</span>
     </div>
     <div className="profile-item">
       <label>이메일</label>
       <span>{email}</span>
     </div>
   </div>
 );
};

export default User;