import React, { useState } from 'react';
import './SimonBoard.css';

const colors = [
  { name: 'red', hex: '#e53935', bright: '#ff7961', freq: 261.63 },   // C4
  { name: 'blue', hex: '#1e88e5', bright: '#6ab7ff', freq: 329.63 },  // E4
  { name: 'green', hex: '#43a047', bright: '#76d275', freq: 392.00 }, // G4
  { name: 'yellow', hex: '#fbc02d', bright: '#fff263', freq: 523.25 } // C5
];

function playNote(frequency: number) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.2;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.3);
  oscillator.onended = () => ctx.close();
}

function SimonBoard() {
  const [active, setActive] = useState<string | null>(null);

  function handleClick(color: typeof colors[0]) {
    setActive(color.name);
    playNote(color.freq);
    setTimeout(() => setActive(null), 200);
  }

  return (
    <div className="simon-board">
      {colors.map((color) => (
        <button
          key={color.name}
          className={`simon-btn simon-btn-${color.name}`}
          style={{ background: active === color.name ? color.bright : color.hex }}
          onClick={() => handleClick(color)}
        />
      ))} 
    </div>
  );
}

export default SimonBoard;
