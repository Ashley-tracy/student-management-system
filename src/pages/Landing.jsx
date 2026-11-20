import React from 'react';

const Landing = () => {
  return (
    <div className="landing-container">
      
      <div className="landing-wrapper">
        
        {/* Top label */}
        <div className="landing-label">
          Landing page
        </div>

        {/* Main Light Blue Card */}
        <div className="landing-card">
          
          {/* Login Link */}
          <div className="login-link-wrapper">
            <a href="#" className="login-link">
              Login
            </a>
          </div>

          {/* Text Content */}
          <div className="landing-content">
            <h1 className="landing-title">
              Student<br />
              Management<br />
              System
            </h1>
            
            <p className="landing-subtitle">
              Manage students, courses and training<br />
              in one place.
            </p>
          </div>

          {/* Buttons Row */}
          <div className="landing-buttons">
            
            <button className="landing-btn">
              <span className="landing-btn-text">Manage</span>
              <span className="landing-btn-text">Students</span>
            </button>

            <button className="landing-btn">
              <span className="landing-btn-text">Register</span>
              <span className="landing-btn-text">Courses</span>
            </button>

            <button className="landing-btn" style={{ justifyContent: 'center' }}>
              <span className="landing-btn-text">Track Training</span>
            </button>

            <button className="landing-btn" style={{ justifyContent: 'center' }}>
              <span className="landing-btn-text">View Reports</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;