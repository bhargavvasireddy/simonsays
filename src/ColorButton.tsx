import React from 'react';

type Color = {
  name: string;
  hex: string;
  bright: string;
  freq: number;
};

interface ColorButtonProps {
  color: Color;
  isActive: boolean;
  disabled: boolean;
  onClick: (color: Color) => void;
}

function ColorButton({ color, isActive, disabled, onClick }: ColorButtonProps) {
  return (
    <button
      className={`simon-btn simon-btn-${color.name}`}
      style={{ background: isActive ? color.bright : color.hex }}
      onClick={() => onClick(color)}
      disabled={disabled}
    />
  );
}

export default ColorButton;
