import React, { useState, useEffect } from 'react';
import { Token, TokenSelector } from './TokenSelector';
import { Slider } from './Slider';
import { VaultDoorAnimation } from './VaultDoorAnimation';
import { useDevMode } from './DevModeToggle';
import { TokenPriceChart } from './TokenPriceChart';
import { SlippageDialog } from './SlippageDialog';
import { Button } from './ui/button';
import { Percent } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { createTakeProfitOrder, anchorWallet } from '@/lib/auto-tp-program';
import { toast } from 'sonner';

// Define interface for tokens with price data
interface TokenWithPrice extends Token {
  price?: number;
}

interface TakeProfitCardProps {
  onOrderArmed: (message: string) => void;
}

const TAKE_PROFIT_PRESETS = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "All", value: 100 },
];

export const TakeProfitCard: React.FC<TakeProfitCardProps> = ({ onOrderArmed }) => {
  const { devMode } = useDevMode();
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [targetValue, setTargetValue] = useState(2.0);
  const [isStopLossEnabled, setIsStopLossEnabled] = useState(false);
  const [stopLossValue, setStopLossValue] = useState(0.8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVaultAnimating, setIsVaultAnimating] = useState(false);

  const [takeProfitPercent, setTakeProfitPercent] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<25 | 50 | 100 | null>(100);

  const [slippage, setSlippage] = useState(0.5);
  const [isSlippageDialogOpen, setIsSlippageDialogOpen] = useState(false);

  // Get wallet and connection
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  useEffect(() => {
    if (devMode) {
      setIsConnected(true);
      setIsTokenSelectorOpen(true);
      return;
    }
    const handleWalletConnected = () => {
      setIsConnected(true);
      setIsTokenSelectorOpen(true);
    };
    window.addEventListener('wallet-connected', handleWalletConnected);
    return () => {
      window.removeEventListener('wallet-connected', handleWalletConnected);
    };
  }, [devMode]);

  // Set isConnected state based on real wallet connection in non-dev mode
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    if (!devMode) {
      setIsConnected(connected);
    }
  }, [connected, devMode]);

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setIsTokenSelectorOpen(false);
  };

  const handleTargetChange = (value: number) => {
    setTargetValue(value);
  };

  const handleStopLossChange = (value: number) => {
    setStopLossValue(value);
  };

  const toggleStopLoss = () => {
    setIsStopLossEnabled(!isStopLossEnabled);
  };

  const formatTargetValue = (value: number) => {
    return value.toFixed(1);
  };

  const formatStopLossValue = (value: number) => {
    return value.toFixed(2);
  };

  const handlePresetClick = (value: 25 | 50 | 100) => {
    setSelectedPreset(value);
    setTakeProfitPercent(value);
  };

  const handleCustomPercentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(event.target.value);
    if (val > 100) val = 100;
    if (val < 0) val = 0;
    setTakeProfitPercent(val);
    if (val === 25 || val === 50 || val === 100) {
      setSelectedPreset(val as 25 | 50 | 100);
    } else {
      setSelectedPreset(null);
    }
  };

  useEffect(() => {
    if (takeProfitPercent === 25 || takeProfitPercent === 50 || takeProfitPercent === 100) {
      if (selectedPreset !== takeProfitPercent) {
        setSelectedPreset(takeProfitPercent as 25 | 50 | 100);
      }
    } else {
      if (selectedPreset !== null) {
        setSelectedPreset(null);
      }
    }
  }, [takeProfitPercent, selectedPreset]);

  const priceForChart = selectedToken ? 
    (('price' in selectedToken) ? (selectedToken as TokenWithPrice).price || 2.15 : 2.15) 
    : undefined;

  const getButtonLabel = () => {
    if (!isConnected) return "Connect Wallet to Start";
    if (!selectedToken) return "Select Token";
    let label = `Arm ${formatTargetValue(targetValue)}×`;
    if (isStopLossEnabled) {
      label += ` / SL ${formatStopLossValue(stopLossValue)}×`;
    }
    return label;
  };

  const isButtonDisabled = !isConnected || !selectedToken || isSubmitting;

  const handleArmOrder = async () => {
    if (isButtonDisabled) return;
    setIsSubmitting(true);
    setIsVaultAnimating(true);
    
    try {
      // Check if we're in dev mode
      if (devMode) {
        // Simulate processing
        setTimeout(() => {
          setIsSubmitting(false);
          setIsVaultAnimating(false);
          const message = `Order armed 🎯 ${selectedToken?.symbol} at ${formatTargetValue(targetValue)}×${
            isStopLossEnabled ? ` / SL ${formatStopLossValue(stopLossValue)}×` : ''
          }, ${takeProfitPercent}% holding`;
          onOrderArmed(message);
        }, 800);
      } else {
        // Real order processing using Solana program
        if (!selectedToken || !selectedToken.mint || !publicKey) {
          throw new Error("Missing token or wallet information");
        }
        
        // Create the token mint public key
        const tokenMint = new PublicKey(selectedToken.mint);
        
        // Current price estimation (in a real app, fetch from an oracle)
        const currentPrice = ('price' in selectedToken) 
          ? (selectedToken as TokenWithPrice).price || 1
          : 1;
        
        // Create an Anchor compatible wallet
        // Using type assertion to handle the wallet adapter type compatibility
        // Type checking has already been done with publicKey check above
        // @ts-expect-error - WalletContextState has nullable fields that WalletAdapter requires
        const anchorCompatWallet = anchorWallet(wallet);
        
        // Call the Solana program to create the take profit order
        const txId = await createTakeProfitOrder(
          connection,
          anchorCompatWallet,
          tokenMint,
          targetValue,
          currentPrice,
          takeProfitPercent
        );
        
        setIsSubmitting(false);
        setIsVaultAnimating(false);
        
        const message = `Order armed 🎯 ${selectedToken?.symbol} at ${formatTargetValue(targetValue)}×${
          isStopLossEnabled ? ` / SL ${formatStopLossValue(stopLossValue)}×` : ''
        }, ${takeProfitPercent}% holding`;
        
        onOrderArmed(message);
        
        // Show transaction ID in toast
        toast.success(`Transaction confirmed: ${txId.slice(0, 8)}...`);
        
        // Dispatch event to update orders table
        const newOrderEvent = new CustomEvent('new-order-created');
        window.dispatchEvent(newOrderEvent);
      }
    } catch (error) {
      console.error("Error creating take profit order:", error);
      setIsSubmitting(false);
      setIsVaultAnimating(false);
      toast.error("Failed to arm take profit order. Please try again.");
    }
  };

  const calculateExpectedReturn = () => {
    if (!selectedToken) return 0;
    
    const tokenPrice = ('price' in selectedToken) 
      ? (selectedToken as TokenWithPrice).price || 2.15
      : 2.15;
    
    const tokenBalance = selectedToken.balance;
    const percentageToSell = takeProfitPercent / 100;
    const tokensToSell = tokenBalance * percentageToSell;
    const targetPrice = tokenPrice * targetValue;
    
    return tokensToSell * targetPrice;
  };

  return (
    <div className="glass-card w-full max-w-md p-6">
      <h2 className="text-xl font-semibold mb-6">Set Your Exit Plan</h2>

      <div className="mb-4">
        <div
          onClick={() => isConnected && setIsTokenSelectorOpen(true)}
          className={`flex items-center justify-between p-3 border border-neutral-700 rounded-lg cursor-pointer ${isConnected ? 'hover:border-neutral-500' : 'cursor-not-allowed'} animation-ease`}
        >
          {selectedToken ? (
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-neutral-800 rounded-full mr-3">
                  {selectedToken.icon}
                </div>
                <div>
                  <div className="font-medium text-white">{selectedToken.name}</div>
                  <div className="text-sm text-white">{selectedToken.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white">{selectedToken.balance.toLocaleString()}</div>
                <div className="text-sm text-white">{selectedToken.symbol}</div>
              </div>
            </>
          ) : (
            <div className="text-white w-full text-center">
              {isConnected ? "Select Token ▾" : "Connect wallet to start"}
            </div>
          )}
        </div>
      </div>

      {selectedToken && (
        <div className="relative w-full h-48 mb-20">
          <TokenPriceChart selectedToken={{
            symbol: selectedToken.symbol,
            name: selectedToken.name,
            price: priceForChart
          }} />
        </div>
      )}

      <div className="mb-4" style={{ minHeight: '20px' }}>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm text-neutral-400">
            Take Profit Amount
          </label>
          <label className="block text-sm text-neutral-400">
            Slippage
          </label>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 items-center">
            {TAKE_PROFIT_PRESETS.map(preset => (
              <button
                key={preset.value}
                type="button"
                className={`px-3 py-1 rounded-full border font-semibold text-xs transition focus:outline-none
                ${selectedPreset === preset.value
                  ? 'bg-contrast text-white border-contrast'
                  : 'bg-neutral-900 text-white border-neutral-700 hover:border-contrast'}
                ${!isConnected || !selectedToken ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isConnected || !selectedToken}
                onClick={() => selectedPreset !== preset.value && handlePresetClick(preset.value as 25 | 50 | 100)}
              >
                {preset.label}
              </button>
            ))}
            <div className="flex items-center">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                pattern="[0-9]*"
                inputMode="numeric"
                className={`w-14 text-center px-2 py-1 rounded border border-neutral-700 bg-neutral-900 text-white font-semibold text-xs focus:outline-none focus:border-contrast transition placeholder:text-neutral-500
                ${selectedPreset === null ? 'ring-2 ring-contrast' : ''}
                ${!isConnected || !selectedToken ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={takeProfitPercent}
                onChange={handleCustomPercentChange}
                disabled={!isConnected || !selectedToken}
                aria-label="Custom percent"
              />
              <span className="ml-1 text-xs text-neutral-400">%</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSlippageDialogOpen(true)}
            className="flex items-center gap-1 px-2 py-1 h-7 bg-neutral-900 border-neutral-700 hover:border-contrast hover:bg-neutral-800 text-neutral-400 hover:text-white text-sm font-semibold"
          >
            <span>{slippage}</span>
            <Percent className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-neutral-500">
          Specify the portion of holdings to sell when target is hit
        </div>
      </div>

      <div className="space-y-2 sliders-container">
        <Slider
          min={1.1}
          max={10}
          step={0.1}
          defaultValue={targetValue}
          onChange={handleTargetChange}
          disabled={!isConnected || !selectedToken}
          formatValue={formatTargetValue}
          label="Target Price Multiplier"
        />

        <div className="flex items-center space-x-2 -mt-1 mb-1">
          <div className="flex-1">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isStopLossEnabled}
                onChange={toggleStopLoss}
                disabled={!isConnected || !selectedToken}
                data-action="toggle-stop-loss"
                aria-label="Enable stop loss"
              />
              <div className={`relative w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isStopLossEnabled ? 'bg-sol/70' : ''} ${isConnected && selectedToken ? '' : 'opacity-50'}`}></div>
              <span className="ml-3 text-sm font-medium text-neutral-300">Stop Loss</span>
            </label>
          </div>
        </div>

        {isStopLossEnabled && (
          <Slider
            min={0.5}
            max={0.95}
            step={0.01}
            defaultValue={stopLossValue}
            onChange={handleStopLossChange}
            disabled={!isConnected || !selectedToken}
            formatValue={formatStopLossValue}
            label="Floor Price Multiplier"
          />
        )}

        <button
          onClick={handleArmOrder}
          disabled={isButtonDisabled}
          className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors duration-200 ${
            isButtonDisabled
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
              : isSubmitting
              ? 'bg-contrast text-white'
              : 'bg-white text-black hover:bg-contrast hover:text-white'
          } ${isVaultAnimating ? 'animate-[vault-door_0.8s_ease-out]' : ''}`}
        >
          {isSubmitting ? "Processing..." : getButtonLabel()}
        </button>
      </div>

      {selectedToken && !isButtonDisabled && (
        <div 
          className="mt-3 text-center font-normal text-[13px] md:text-[13px] text-contrast transition-opacity duration-300"
          style={{ fontFamily: 'Inter' }}
        >
          Expected return: ${calculateExpectedReturn().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}

      <TokenSelector
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelectToken={handleTokenSelect}
      />

      <VaultDoorAnimation
        isPlaying={isVaultAnimating}
        onComplete={() => setIsVaultAnimating(false)}
      />

      <SlippageDialog
        isOpen={isSlippageDialogOpen}
        onClose={() => setIsSlippageDialogOpen(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </div>
  );
};

export default TakeProfitCard;
