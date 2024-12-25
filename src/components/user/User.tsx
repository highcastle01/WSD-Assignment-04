import React from 'react';
import './User.css';

const User = () => {
 const userInfo = JSON.parse(localStorage.getItem('kakaoUserInfo') || '{}');
 const { id, account_email, nickname } = userInfo;

 return (
   <div className="user-profile">
     <div className="profile-item">
       <label>프로필 ID</label>
       <span>{id}</span>
     </div>
     <div className="profile-item">
       <label>이메일</label>
       <span>{account_email}</span>
     </div>
     <div className="profile-item">
       <label>닉네임</label>
       <span>{nickname}</span>
     </div>
   </div>
 );
};

export default User;