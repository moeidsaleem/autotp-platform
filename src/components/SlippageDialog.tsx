'use client';

import React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Percent } from 'lucide-react';

interface SlippageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
}

const PRESET_VALUES = [0.1, 0.5, 1.0];

export function SlippageDialog({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
}: SlippageDialogProps) {
  const [customValue, setCustomValue] = React.useState<string>('');

  React.useEffect(() => {
    if (!PRESET_VALUES.includes(slippage)) {
      setCustomValue(slippage.toString());
    }
  }, [slippage]);

  const handlePresetClick = (value: number) => {
    onSlippageChange(value);
    setCustomValue('');
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
      onSlippageChange(numValue);
    }
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            Swap slippage tolerance <Percent className="h-5 w-5" />
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            {PRESET_VALUES.map((value) => (
              <Button
                key={value}
                onClick={() => handlePresetClick(value)}
                variant={slippage === value ? "default" : "outline"}
                className={`rounded-full px-6 ${
                  slippage === value
                    ? "bg-contrast text-white border-contrast"
                    : "bg-neutral-800 text-white border-neutral-700 hover:border-contrast hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {value}
              </Button>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-neutral-400">Custom</span>
              <div className="relative">
                <input
                  type="number"
                  value={customValue}
                  onChange={handleCustomChange}
                  className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-contrast"
                  placeholder="0.0"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="w-full bg-contrast hover:bg-contrast/90 text-white hover:text-white"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
