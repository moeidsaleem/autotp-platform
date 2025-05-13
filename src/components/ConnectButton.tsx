import React, { useState, useEffect } from 'react';
import { useDevMode } from './DevModeToggle';
import { Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './solana/solana-provider';

export interface WalletState {
  connected: boolean;
  address?: string;
}

export const ConnectButton: React.FC = () => {
  const { devMode } = useDevMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Use the wallet adapter for real wallet connection
  const { connected, publicKey, disconnect } = useWallet();

  const devWallet = {
    connected: true,
    address: "8xgM2Q9tMZtes4uQAo8oYD7tESAEwrVwmqkx5L6X3KMU"
  };

  // Use the actual wallet state or the dev wallet
  const effectiveWallet = devMode 
    ? devWallet 
    : { 
        connected, 
        address: publicKey?.toBase58() 
      };

  useEffect(() => {
    if (connected && !devMode) {
      // Dispatch wallet connected event for other components to respond
      const event = new CustomEvent('wallet-connected');
      window.dispatchEvent(event);
    }
  }, [connected, devMode]);

  const disconnectWallet = () => {
    if (!devMode && disconnect) {
      disconnect();
    }
    setDropdownOpen(false);
  };

  const copyAddress = () => {
    if (effectiveWallet.address) {
      navigator.clipboard.writeText(effectiveWallet.address);
      setDropdownOpen(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {!effectiveWallet.connected ? (
        // Use the WalletButton for real connections in non-dev mode
        devMode ? (
          <button 
            onClick={() => {
              const event = new CustomEvent('wallet-connected');
              window.dispatchEvent(event);
            }}
            className="glass-card flex items-center space-x-2 py-2 px-4 rounded-lg hover:bg-neutral-900 transition-colors duration-200 group"
          >
            <Wallet className="w-4 h-4 text-neutral-300 group-hover:text-neutral-50 transition-colors" />
            <span className="text-neutral-300 group-hover:text-neutral-50 transition-colors">
              Connect Wallet
            </span>
          </button>
        ) : (
          <WalletButton />
        )
      ) : (
        <div>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 py-2 px-4 rounded-full bg-black hover:bg-neutral-900 transition-colors duration-200 group"
          >
            <Wallet className="w-4 h-4 text-white group-hover:text-neutral-200 transition-colors" />
            <span className="text-white group-hover:text-neutral-200">{truncateAddress(effectiveWallet.address!)}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-card z-10 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={copyAddress}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 animation-ease"
                >
                  Copy Address
                </button>
                <button
                  onClick={disconnectWallet}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 animation-ease"
                  disabled={devMode}
                  title={devMode ? "Disconnect disabled in Dev Mode" : ""}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
