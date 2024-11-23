import React from 'react';
import { AccountBox, Lock } from '@mui/icons-material';

const SigninForm: React.FC = () => {
  return (
    <div className="container">
      <div className="page">
        <div className="input">
          <div className="title">
            <AccountBox /> USERNAME
          </div>
          <input className="text" type="text" placeholder="" />
        </div>
        <div className="input">
          <div className="title">
            <Lock /> PASSWORD
          </div>
          <input className="text" type="password" placeholder="" />
        </div>
        <div className="input">
          <input type="submit" value="SIGN IN" />
        </div>
      </div>
    </div>
  );
};

export default SigninForm;