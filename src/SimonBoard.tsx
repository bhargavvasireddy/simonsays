import React from 'react';
import './SimonBoard.css';

const colors = [
  { name: 'red', hex: '#e53935' },
  { name: 'blue', hex: '#1e88e5' },
  { name: 'green', hex: '#43a047' },
  { name: 'yellow', hex: '#fbc02d' },
];

function SimonBoard() {
  return (
    <div className="simon-board">
      {colors.map((color) => (
        <button
          key={color.name}
          className={`simon-btn simon-btn-${color.name}`}
          style={{ background: color.hex }}
        />
      ))}
    </div>
  );
}

export default SimonBoard;
