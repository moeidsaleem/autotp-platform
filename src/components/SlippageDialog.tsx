'use client';

import React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Percent, AlertCircle } from 'lucide-react';

interface SlippageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
}

const PRESET_VALUES = [0.1, 0.5, 1.0, 2.0];

export function SlippageDialog({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
}: SlippageDialogProps) {
  const [customValue, setCustomValue] = React.useState<string>('');
  const [inputWarning, setInputWarning] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!PRESET_VALUES.includes(slippage)) {
      setCustomValue(slippage.toString());
    } else {
      setCustomValue('');
    }
  }, [slippage]);

  const handlePresetClick = (value: number) => {
    onSlippageChange(value);
    setCustomValue('');
    setInputWarning(null);
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomValue(value);
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      if (numValue <= 0) {
        setInputWarning('Slippage must be greater than 0');
      } else if (numValue > 5) {
        setInputWarning('High slippage increases risk of frontrunning');
      } else if (numValue > 100) {
        setInputWarning('Invalid slippage value');
      } else {
        setInputWarning(null);
        onSlippageChange(numValue);
      }
    } else if (value === '') {
      setInputWarning('Enter a valid slippage value');
    }
  };

  const handleSave = () => {
    onClose();
  };

  const getInputBorderColor = () => {
    if (customValue === '') return 'border-neutral-700';
    const numValue = parseFloat(customValue);
    if (isNaN(numValue) || numValue <= 0 || numValue > 100) return 'border-red-500';
    if (numValue > 5) return 'border-yellow-500';
    return 'border-contrast';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-700 rounded-xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Percent className="h-5 w-5 text-contrast" />
            Slippage Tolerance
          </DialogTitle>
          <DialogDescription className="text-neutral-400 mt-1 text-sm">
            Your transaction will revert if the price changes unfavorably by more than this percentage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-neutral-300">Preset values</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_VALUES.map((value) => (
                <Button
                  key={value}
                  onClick={() => handlePresetClick(value)}
                  variant="outline"
                  className={`rounded-lg py-5 ${
                    slippage === value
                      ? "bg-contrast/10 text-white border-contrast ring-1 ring-contrast"
                      : "bg-neutral-800 text-white border-neutral-700 hover:border-contrast hover:bg-neutral-800/70"
                  }`}
                >
                  {value}%
                </Button>
              ))}
            </div>
            
            <div className="mt-4 space-y-2">
              <label htmlFor="custom-slippage" className="text-sm font-medium text-neutral-300">
                Custom value
              </label>
              <div className="relative">
                <input
                  id="custom-slippage"
                  type="number"
                  value={customValue}
                  onChange={handleCustomChange}
                  className={`w-full px-4 py-3 bg-neutral-800 border ${getInputBorderColor()} rounded-lg text-white text-base focus:outline-none focus:ring-1 focus:ring-contrast transition-colors`}
                  placeholder="Custom percentage"
                  min="0.1"
                  max="100"
                  step="0.1"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-neutral-400">%</span>
                </div>
              </div>
              
              {inputWarning && (
                <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                  <AlertCircle size={12} />
                  <span>{inputWarning}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            className="w-full py-6 bg-contrast hover:bg-contrast/90 text-white hover:text-white font-medium text-base rounded-lg"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
