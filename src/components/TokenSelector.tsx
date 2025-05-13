import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useDevMode } from './DevModeToggle';
import { getWalletTokensWithMetadata } from '@/lib/token-metadata';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: React.ReactNode;
  balance: number;
  mint?: string;
  price?: number;
}

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({ isOpen, onClose, onSelectToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { devMode } = useDevMode();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!publicKey && !devMode) return;

      if (devMode) {
        // Mock tokens for dev mode
        const mockTokens: Token[] = [
          { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', balance: 12.456, price: 170.54 },
          { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '$', balance: 1250.75, price: 1.00 },
          { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', balance: 1.32, price: 3200.25 },
          { id: 'bonk', name: 'Bonk', symbol: 'BONK', icon: '🐕', balance: 1250000, price: 0.00002 },
          { id: 'matic', name: 'Polygon', symbol: 'MATIC', icon: '⬡', balance: 85.2, price: 0.68 },
        ];
        setTokens(mockTokens);
        return;
      }

      try {
        setIsLoading(true);
        // Use the new getWalletTokensWithMetadata function
        const walletTokens = await getWalletTokensWithMetadata(
          connection, 
          publicKey!, 
          'devnet' // Specify devnet for proper token detection
        );
        
        setTokens(walletTokens);
      } catch (error) {
        console.error('Error fetching token accounts:', error);
        setTokens([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [connection, publicKey, devMode]);

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      {/* Update the overlay to have rounded corners and a consistent background */}
      <div
        className="absolute inset-0 bg-black/80 rounded-2xl"
        style={{
          WebkitBackdropFilter: 'blur(18px)',
          backdropFilter: 'blur(18px)'
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md p-6 overflow-hidden bg-neutral-950 bg-opacity-90 border border-white/20 rounded-2xl shadow-2xl shadow-black/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Select Token</h2>
          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-contrast focus:text-contrast transition-colors"
            aria-label="Close token selector"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tokens..."
            className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-contrast text-neutral-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            aria-label="Search tokens"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-neutral-400">
              Loading tokens...
            </div>
          ) : filteredTokens.length > 0 ? (
            filteredTokens.map(token => (
              <div
                key={token.id}
                onClick={() => onSelectToken(token)}
                className="
                  flex items-center justify-between p-3 rounded-lg cursor-pointer
                  transition-all duration-150
                  hover:shadow-green-glow hover:bg-contrast/10
                  focus:shadow-green-glow focus:bg-contrast/10
                  select-none
                "
                role="button"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectToken(token);
                  }
                }}
                aria-label={`Select ${token.name} token`}
                style={{
                  // Make sure the green glow doesn't overflow the corners
                  boxShadow: 'none',
                  outline: 'none'
                }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-neutral-800 rounded-full mr-3 border-2 border-contrast shadow"
                    style={{ boxShadow: '0 0 6px 1px #44e1af44' /* subtle border glow */ }}>
                    {token.icon}
                  </div>
                  <div>
                    <div className="font-medium text-white">{token.name}</div>
                    <div className="text-sm text-neutral-400">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white">{token.balance.toLocaleString()}</div>
                  <div className="text-sm text-neutral-400">{token.symbol}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-neutral-400">
              {publicKey || devMode ? "No tokens found" : "Connect wallet to view tokens"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

