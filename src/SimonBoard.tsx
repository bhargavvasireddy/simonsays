import React, { useState, useRef } from 'react';
import './SimonBoard.css';
import { useNavigate } from 'react-router-dom';

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

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function SimonBoard() {
  const [active, setActive] = useState<string | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [round, setRound] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  // Auto-start the game when component mounts
  React.useEffect(() => {
    if (!isPlaying && !gameOver) {
      // Auto-start the game after a brief delay
      const timer = setTimeout(() => {
        handleStart();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Start the first round after 2 seconds
  React.useEffect(() => {
    if (isPlaying && round === 1 && sequence.length === 1) {
      const timer = setTimeout(() => {
        setShowingSequence(true);
        setIsUserTurn(false);
        
        let step = 0;
        const playNextStep = () => {
          if (step >= sequence.length) {
            // Sequence complete, user's turn
            setTimeout(() => {
              setShowingSequence(false);
              setIsUserTurn(true);
              setUserStep(0);
            }, 1000);
            return;
          }

          const colorName = sequence[step];
          const colorObj = colors.find(c => c.name === colorName);
          if (colorObj) {
            setActive(colorName);
            playNote(colorObj.freq);
            
            setTimeout(() => {
              setActive(null);
              step++;
              if (step < sequence.length) {
                setTimeout(playNextStep, 400);
              } else {
                playNextStep(); // Complete sequence
              }
            }, 400);
          }
        };
        
        playNextStep();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, round, sequence]);

  const startNextRound = React.useCallback(() => {
    const newColor = getRandomColor().name;
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setRound(prev => prev + 1);
    setUserStep(0);
    setIsUserTurn(false);
    
    // Wait 2 seconds, then show the updated sequence
    setTimeout(() => {
      setShowingSequence(true);
      setIsUserTurn(false);
      
      let step = 0;
      const playNextStep = () => {
        if (step >= newSequence.length) {
          // Sequence complete, user's turn
          setTimeout(() => {
            setShowingSequence(false);
            setIsUserTurn(true);
            setUserStep(0);
          }, 1000);
          return;
        }

        const colorName = newSequence[step];
        const colorObj = colors.find(c => c.name === colorName);
        if (colorObj) {
          setActive(colorName);
          playNote(colorObj.freq);
          
          setTimeout(() => {
            setActive(null);
            step++;
            if (step < newSequence.length) {
              setTimeout(playNextStep, 400);
            } else {
              playNextStep(); // Complete sequence
            }
          }, 400);
        }
      };
      
      playNextStep();
    }, 2000);
  }, [sequence]);

  function handleClick(color: typeof colors[0]) {
    if (!isUserTurn || !isPlaying || showingSequence) return;
    
    setActive(color.name);
    playNote(color.freq);
    setTimeout(() => setActive(null), 200);
    
    // Check if correct
    if (color.name === sequence[userStep]) {
      if (userStep + 1 === sequence.length) {
        // User completed the sequence correctly
        setIsUserTurn(false);
        startNextRound();
      } else {
        // Continue with next step
        setUserStep(userStep + 1);
      }
    } else {
      // Game over - wrong color
      setGameOver(true);
      setIsUserTurn(false);
      setTimeout(() => {
        navigate('/results', { state: { rounds: round } });
        // Reset game state
        setSequence([]);
        setRound(0);
        setUserStep(0);
        setIsUserTurn(false);
        setShowingSequence(false);
        setIsPlaying(false);
        setGameOver(false);
      }, 800);
    }
  }

  function handleStart() {
    // Initialize game
    const firstColor = getRandomColor().name;
    setSequence([firstColor]);
    setRound(1);
    setIsPlaying(true);
    setIsUserTurn(false);
    setUserStep(0);
    setShowingSequence(false);
    setGameOver(false);
  }

  return (
    <div className="simon-board">
      {colors.map((color) => (
        <button
          key={color.name}
          className={`simon-btn simon-btn-${color.name}`}
          style={{ background: active === color.name ? color.bright : color.hex }}
          onClick={() => handleClick(color)}
          disabled={!isUserTurn || showingSequence || gameOver}
        />
      ))}
      {(isPlaying || gameOver) && (
        <div className="game-info">
          <p>Round: {round}</p>
          <p>{gameOver ? 'Game Over!' : showingSequence ? 'Watch...' : isUserTurn ? 'Your turn!' : 'Get ready...'}</p>
        </div>
      )}
    </div>
  );
}

export default SimonBoard;
