import React, { useState, useCallback, useRef } from "react";
import "./App.css";
import SimonBoard from "./SimonBoard";
import ResultsPage from "./ResultsPage";
import { GameStats } from "./GameProgressChart";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

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

// GameContainer component - holds all game logic and state
function GameContainer() {
  const [active, setActive] = useState<string | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [round, setRound] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats[]>(() => {
    // Load game stats from localStorage
    const saved = localStorage.getItem('simonGameStats');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();
  
  // useRef for timing intervals as specified in requirements
  const autoStartTimer = useRef<NodeJS.Timeout | null>(null);
  const sequenceTimer = useRef<NodeJS.Timeout | null>(null);
  const gameOverTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-start the game when component mounts
  React.useEffect(() => {
    if (!isPlaying && !gameOver) {
      // Auto-start the game after a brief delay
      autoStartTimer.current = setTimeout(() => {
        handleStart();
      }, 500);
    }
    return () => {
      if (autoStartTimer.current) clearTimeout(autoStartTimer.current);
    };
  }, []);

  // Start the first round after 2 seconds
  React.useEffect(() => {
    if (isPlaying && round === 1 && sequence.length === 1) {
      sequenceTimer.current = setTimeout(() => {
        showSequence(sequence);
      }, 2000);
    }
    return () => {
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
    };
  }, [isPlaying, round, sequence]);

  const showSequence = useCallback((sequenceToShow: string[]) => {
    setShowingSequence(true);
    setIsUserTurn(false);
    
    let step = 0;
    const playNextStep = () => {
      if (step >= sequenceToShow.length) {
        // Sequence complete, user's turn
        setTimeout(() => {
          setShowingSequence(false);
          setIsUserTurn(true);
          setUserStep(0);
        }, 1000);
        return;
      }

      const colorName = sequenceToShow[step];
      const colorObj = colors.find(c => c.name === colorName);
      if (colorObj) {
        setActive(colorName);
        playNote(colorObj.freq);
        
        setTimeout(() => {
          setActive(null);
          step++;
          if (step < sequenceToShow.length) {
            setTimeout(playNextStep, 400);
          } else {
            playNextStep(); // Complete sequence
          }
        }, 400);
      }
    };
    
    playNextStep();
  }, []);

  const startNextRound = useCallback(() => {
    const newColor = getRandomColor().name;
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setRound(prev => prev + 1);
    setUserStep(0);
    setIsUserTurn(false);
    
    // Wait 2 seconds, then show the updated sequence
    setTimeout(() => {
      showSequence(newSequence);
    }, 2000);
  }, [sequence, showSequence]);

  const handleClick = useCallback((color: typeof colors[0]) => {
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
      
      // Record game stats
      const newGameStats = [...gameStats];
      const currentAttempt = newGameStats.length + 1;
      const newStat: GameStats = {
        attempt: currentAttempt,
        roundsReached: round,
        timestamp: new Date()
      };
      newGameStats.push(newStat);
      setGameStats(newGameStats);
      
      // Save to localStorage
      localStorage.setItem('simonGameStats', JSON.stringify(newGameStats));
      
      gameOverTimer.current = setTimeout(() => {
        navigate('/results', { state: { rounds: round, gameStats: newGameStats } });
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
  }, [isUserTurn, isPlaying, showingSequence, sequence, userStep, round, navigate, startNextRound, gameStats]);

  const handleStart = useCallback(() => {
    // Initialize game
    const firstColor = getRandomColor().name;
    setSequence([firstColor]);
    setRound(1);
    setIsPlaying(true);
    setIsUserTurn(false);
    setUserStep(0);
    setShowingSequence(false);
    setGameOver(false);
  }, []);

  return (
    <SimonBoard
      colors={colors}
      active={active}
      sequence={sequence}
      userStep={userStep}
      round={round}
      isUserTurn={isUserTurn}
      isPlaying={isPlaying}
      showingSequence={showingSequence}
      gameOver={gameOver}
      onColorClick={handleClick}
      onStart={handleStart}
    />
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Simon Says</h1>
        </header>
        <main className="App-main">
          <Routes>
            <Route
              path="/"
              element={
                <Link to="/board">
                  <button className="start-btn">Start Game</button>
                </Link>
              }
            />
            <Route path="/board" element={<GameContainer />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
