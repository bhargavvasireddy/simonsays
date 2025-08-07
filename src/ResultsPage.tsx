import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function ResultsPage() {
  const location = useLocation();
  const { rounds = 0 } = location.state || {};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Game Over!</h2>
      <p style={{ fontSize: '1.5rem', marginBottom: '32px' }}>You made it to round <strong>{rounds}</strong>.</p>
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link to="/board"><button className="start-btn">Replay</button></Link>
        <Link to="/"><button className="start-btn">Home</button></Link>
      </div>
    </div>
  );
}

export default ResultsPage;
