import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import GameProgressChart, { GameStats } from './GameProgressChart';
import AccuracyChart from './AccuracyChart';

function ResultsPage() {
  const location = useLocation();
  const { rounds = 0, gameStats = [] } = location.state || {};

  // Get stats from localStorage if not passed via state
  const stats: GameStats[] = gameStats.length > 0 ? gameStats : 
    JSON.parse(localStorage.getItem('simonGameStats') || '[]');

  const currentAttempt = stats.length;
  const bestScore = stats.length > 0 ? Math.max(...stats.map(s => s.roundsReached)) : rounds;
  const averageScore = stats.length > 0 ? 
    Math.round(stats.reduce((sum, s) => sum + s.roundsReached, 0) / stats.length) : rounds;

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Game Over!</h2>
        
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '16px' }}>
            You made it to round <strong>{rounds}</strong>.
          </p>
          
          {stats.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>Games Played</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>{currentAttempt}</p>
              </div>
              <div>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>Best Score</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>{bestScore}</p>
              </div>
              <div>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>Average Score</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>{averageScore}</p>
              </div>
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <GameProgressChart data={stats} />
            {stats.length > 1 && <AccuracyChart data={stats} />}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <Link to="/board"><button className="start-btn">Play Again</button></Link>
          <Link to="/"><button className="start-btn">Home</button></Link>
          {stats.length > 0 && (
            <button 
              className="start-btn" 
              style={{ background: '#f44336' }}
              onClick={() => {
                localStorage.removeItem('simonGameStats');
                window.location.reload();
              }}
            >
              Reset Stats
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
