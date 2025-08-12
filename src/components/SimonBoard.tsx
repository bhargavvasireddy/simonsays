import React from "react";
import "../styles/simonBoard.css";
import ColorButton from "./ColorButton";

// ...existing code...

type Color = {
  name: string;
  hex: string;
  bright: string;
  freq: number;
};

interface SimonBoardProps {
  colors: Color[];
  active: string | null;
  sequence: string[];
  userStep: number;
  round: number;
  isUserTurn: boolean;
  isPlaying: boolean;
  showingSequence: boolean;
  gameOver: boolean;
  onColorClick: (color: Color) => void;
  onStart: () => void;
}

function SimonBoard({
  colors,
  active,
  sequence,
  userStep,
  round,
  isUserTurn,
  isPlaying,
  showingSequence,
  gameOver,
  onColorClick,
  onStart,
}: SimonBoardProps) {
  return (
    <div className="simon-board">
      {colors.map((color) => (
        <ColorButton
          key={color.name}
          color={color}
          isActive={active === color.name}
          disabled={!isUserTurn || showingSequence || gameOver}
          onClick={onColorClick}
        />
      ))}
      {(isPlaying || gameOver) && (
        <div className="game-info">
          <p>Round: {round}</p>
          <p>
            {gameOver
              ? "Game Over!"
              : showingSequence
              ? "Watch..."
              : isUserTurn
              ? "Your turn!"
              : "Get ready..."}
          </p>
        </div>
      )}
    </div>
  );
}

export default SimonBoard;
