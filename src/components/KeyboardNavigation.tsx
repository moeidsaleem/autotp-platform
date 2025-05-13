
import React, { useEffect } from 'react';

interface KeyboardNavigationProps {
  onTokenSelect: () => void;
  onArm: () => void;
  onToggleStopLoss: () => void;
  isConnected: boolean;
  hasSelectedToken: boolean;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  onTokenSelect,
  onArm,
  onToggleStopLoss,
  isConnected,
  hasSelectedToken
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab navigation is handled by browser
      
      // Enter for arming order when button is focused
      if (e.key === 'Enter' && document.activeElement?.getAttribute('data-action') === 'arm') {
        if (isConnected && hasSelectedToken) {
          onArm();
        }
      }
      
      // Space to toggle stop loss
      if (e.key === ' ' && document.activeElement?.getAttribute('data-action') === 'toggle-stop-loss') {
        e.preventDefault(); // Prevent page scroll
        onToggleStopLoss();
      }
      
      // T key to open token selector
      if (e.key === 't' && isConnected) {
        // Only if user is not typing in an input field
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
          onTokenSelect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTokenSelect, onArm, onToggleStopLoss, isConnected, hasSelectedToken]);

  return null; // This is just a keyboard handler, no UI
};
