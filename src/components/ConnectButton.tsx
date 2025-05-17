import React, { useState, useEffect } from 'react';
import { useDevMode } from './DevModeToggle';
import { Wallet, Check, Copy, LogOut, ChevronDown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './solana/solana-provider';

export interface WalletState {
  connected: boolean;
  address?: string;
}

export const ConnectButton: React.FC = () => {
  const { devMode } = useDevMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.wallet-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const disconnectWallet = () => {
    if (!devMode && disconnect) {
      disconnect();
    }
    setDropdownOpen(false);
  };

  const copyAddress = () => {
    if (effectiveWallet.address) {
      navigator.clipboard.writeText(effectiveWallet.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative wallet-dropdown-container">
      {!effectiveWallet.connected ? (
        // Use the WalletButton for real connections in non-dev mode
        devMode ? (
          <button 
            onClick={() => {
              const event = new CustomEvent('wallet-connected');
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 py-2 px-4 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        ) : (
          <WalletButton />
        )
      ) : (
        <div>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 py-2 px-4 rounded-md border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-medium transition-all duration-300"
          >
            <Wallet className="w-4 h-4 text-indigo-400" />
            <span>{truncateAddress(effectiveWallet.address!)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-md rounded-md border border-neutral-800 shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
              <div className="p-3 border-b border-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">Connected wallet</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white">{effectiveWallet.address}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    title="Copy address"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={disconnectWallet}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                  disabled={devMode}
                  title={devMode ? "Disconnect disabled in Dev Mode" : ""}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
