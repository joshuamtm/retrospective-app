import React from 'react';
import './OnlineUsers.css';

interface OnlineUsersProps {
  count: number;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ count }) => {
  return (
    <div className="online-users">
      <div className="online-indicator"></div>
      <span>{count} {count === 1 ? 'user' : 'users'} online</span>
    </div>
  );
};

export default OnlineUsers;