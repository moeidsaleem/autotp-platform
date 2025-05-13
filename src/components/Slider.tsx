
import React, { useState, useRef, useEffect } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  label: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step,
  defaultValue,
  onChange,
  disabled = false,
  formatValue = (value) => value.toString(),
  label
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const calculatePercentage = () => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={`mb-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-neutral-400">{label}</label>
        <div className="text-sm font-medium">{formatValue(value)}×</div>
      </div>
      <div className="relative" ref={sliderRef}>
        <div className="h-1 bg-neutral-800 rounded-full">
          <div
            className="absolute h-1 bg-neutral-400 rounded-full"
            style={{ width: `${calculatePercentage()}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className={`absolute top-0 -mt-2.5 w-6 h-6 rounded-full bg-neutral-50 shadow transform -translate-x-1/2 ${
            isDragging ? 'bg-sol scale-110' : ''
          } ${disabled ? '' : 'hover:bg-neutral-200'} animation-ease`}
          style={{ left: `${calculatePercentage()}%` }}
        />
        {isDragging && (
          <div 
            className="absolute -top-10 left-0 bg-neutral-800 rounded px-2 py-1 text-sm font-semibold transform -translate-x-1/2 opacity-90"
            style={{ left: `${calculatePercentage()}%` }}
          >
            {formatValue(value)}×
          </div>
        )}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-neutral-500">{formatValue(min)}×</span>
        <span className="text-xs text-neutral-500">{formatValue(max)}×</span>
      </div>
    </div>
  );
};
