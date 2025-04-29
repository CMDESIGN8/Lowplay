
import React from 'react';
import './UserProfile.css';

const getLevelClass = (level) => {
  switch (level.toLowerCase()) {
    case 'oro':
      return 'gold';
    case 'plata':
      return 'silver';
    case 'bronce':
    default:
      return 'bronze';
  }
};

const UserProfile = ({ user }) => {
  const levelClass = getLevelClass(user.level);

  return (
    <div className={`user-card ${levelClass}`}>
      <div className="card-header">
        <img src={user.avatar} alt="Avatar" className="avatar" />
        <div className="user-info">
          <h2 className="username">{user.username}</h2>
          <span className={`level-tag ${levelClass}`}>{user.level}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="lowcoins-display">
          <i className={`fas fa-coins coin-icon ${levelClass}`}></i>
          <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${user.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{user.progress}% al siguiente nivel</span>
        </div>

        <div className="edit-button-container">
          <button className="edit-button">
            <i className="fas fa-user-edit"></i> Editar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
