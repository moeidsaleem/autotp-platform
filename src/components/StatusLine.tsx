import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Clock, ChevronUp, ChevronDown, Wifi, AlertTriangle } from 'lucide-react';
import { SOLANA_NETWORK } from '@/lib/solana';
import { useConnection } from '@solana/wallet-adapter-react';

export const StatusLine: React.FC = () => {
  const [keeperTime, setKeeperTime] = useState(14);
  const [pythLatency, setPythLatency] = useState(130);
  const [collapsedOnMobile, setCollapsedOnMobile] = useState(true);
  const [netPing, setNetPing] = useState<number | null>(null);
  const [netStatus, setNetStatus] = useState<'online' | 'slow' | 'offline'>('online');
  
  // Using a ref instead of state to avoid re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { connection } = useConnection();

  // Time formatter - "14s" or "130ms"
  const formatTime = (time: number, unit: 'ms' | 's') => {
    return `${time}${unit}`;
  };

  useEffect(() => {
    // Check network status
    const checkNetwork = async () => {
      try {
        const start = performance.now();
        await connection.getRecentBlockhash();
        const end = performance.now();
        const pingTime = Math.round(end - start);
        setNetPing(pingTime);
        
        if (pingTime > 1500) {
          setNetStatus('slow');
        } else {
          setNetStatus('online');
        }
      } catch (error) {
        console.error('Network check error:', error);
        setNetStatus('offline');
        setNetPing(null);
      }
    };

    // Initial check
    checkNetwork();

    // Simulate changing values and check network periodically
    const interval = setInterval(() => {
      // Simulate keeper and Pyth values
      setKeeperTime(prev => Math.max(5, Math.min(70, prev + (Math.random() > 0.5 ? 1 : -1))));
      setPythLatency(prev => Math.max(100, Math.min(200, prev + (Math.random() > 0.5 ? 5 : -5))));
      
      // Check network every 15 seconds
      if (Math.random() > 0.7) {
        checkNetwork();
      }
    }, 5000);

    // Store the interval in the ref
    intervalRef.current = interval;

    return () => {
      // Clear the interval using the ref
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [connection]); // Only connection as dependency

  const getKeeperStatus = () => {
    if (keeperTime > 60) return 'text-red-400';
    if (keeperTime > 30) return 'text-amber-400';
    return 'text-green-400';
  };
  
  const getNetworkStatus = () => {
    switch (netStatus) {
      case 'offline':
        return { 
          color: 'text-red-400',
          icon: <AlertTriangle className="h-3 w-3 mr-1.5" />,
          text: 'Offline'
        };
      case 'slow':
        return { 
          color: 'text-amber-400',
          icon: <Wifi className="h-3 w-3 mr-1.5" />,
          text: 'Slow'
        };
      default:
        return { 
          color: 'text-green-400',
          icon: <Wifi className="h-3 w-3 mr-1.5" />,
          text: 'Connected'
        };
    }
  };
  
  const networkInfo = getNetworkStatus();
  const networkName = SOLANA_NETWORK.charAt(0).toUpperCase() + SOLANA_NETWORK.slice(1);

  return (
    <div className="status-line">
      {/* Mobile version (collapsible) */}
      <div className="md:hidden">
        <div 
          className="flex items-center justify-between px-4 py-2 bg-black/90 backdrop-blur-md border-t border-white/10"
          onClick={() => setCollapsedOnMobile(!collapsedOnMobile)}
        >
          <div className="flex items-center">
            <Activity className="h-3 w-3 mr-2 text-green-400" />
            <span className="text-xs font-medium text-neutral-200">System Status</span>
          </div>
          {collapsedOnMobile ? (
            <ChevronUp className="h-3 w-3 text-neutral-400" />
          ) : (
            <ChevronDown className="h-3 w-3 text-neutral-400" />
          )}
        </div>
        
        {!collapsedOnMobile && (
          <div className="px-4 py-3 bg-black/95 border-t border-white/10 flex flex-col space-y-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-2" />
              <span className={`text-xs ${getKeeperStatus()}`}>
                Keeper heartbeat: {formatTime(keeperTime, 's')}
              </span>
            </div>
            <div className="flex items-center">
              <Cpu className="h-3 w-3 mr-2 text-neutral-400" />
              <span className="text-xs text-neutral-400">
                Pyth latency: {formatTime(pythLatency, 'ms')}
              </span>
            </div>
            <div className="flex items-center">
              {networkInfo.icon}
              <span className={`text-xs ${networkInfo.color}`}>
                {networkName}: {networkInfo.text} {netPing ? `(${formatTime(netPing, 'ms')})` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop version (always visible) */}
      <div className="hidden md:block font-mono text-xs px-4 py-2 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1.5" />
              <span className={`${getKeeperStatus()}`}>
                Keeper: {formatTime(keeperTime, 's')}
              </span>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center">
              <Cpu className="h-3 w-3 mr-1.5 text-neutral-400" />
              <span className="text-neutral-400">
                Pyth: {formatTime(pythLatency, 'ms')}
              </span>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center">
              {networkInfo.icon}
              <span className={`${networkInfo.color}`}>
                {networkName}: {networkInfo.text} {netPing ? `(${formatTime(netPing, 'ms')})` : ''}
              </span>
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            <Activity className="h-3 w-3 inline mr-1" />
            System operational
          </div>
        </div>
      </div>
    </div>
  );
};
