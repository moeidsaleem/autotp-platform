import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Clock, ChevronUp, ChevronDown } from 'lucide-react';

export const StatusLine: React.FC = () => {
  const [keeperTime, setKeeperTime] = useState(14);
  const [pythLatency, setPythLatency] = useState(130);
  const [collapsedOnMobile, setCollapsedOnMobile] = useState(true);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Simulate changing values
    const interval = setInterval(() => {
      setKeeperTime(prev => Math.max(5, Math.min(70, prev + (Math.random() > 0.5 ? 1 : -1))));
      setPythLatency(prev => Math.max(100, Math.min(200, prev + (Math.random() > 0.5 ? 5 : -5))));
    }, 5000);

    setIntervalId(interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const getKeeperStatus = () => {
    if (keeperTime > 60) return 'text-red-400';
    if (keeperTime > 30) return 'text-amber-400';
    return 'text-green-400';
  };

  return (
    <div className="status-line">
      {/* Mobile version (collapsible) */}
      <div className="md:hidden">
        <div 
          className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 backdrop-blur-md border-t border-white/5"
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
          <div className="px-4 py-3 bg-neutral-900/95 border-t border-white/5 flex flex-col space-y-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-2" />
              <span className={`text-xs ${getKeeperStatus()}`}>
                Keeper heartbeat: {keeperTime} s
              </span>
            </div>
            <div className="flex items-center">
              <Cpu className="h-3 w-3 mr-2 text-neutral-400" />
              <span className="text-xs text-neutral-400">
                Pyth latency: {pythLatency} ms
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop version (always visible) */}
      <div className="hidden md:block font-mono text-xs px-4 py-2 bg-neutral-900/80 backdrop-blur-md border-t border-white/5">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-2" />
              <span className={`${getKeeperStatus()}`}>
                Keeper heartbeat: {keeperTime} s
              </span>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center">
              <Cpu className="h-3 w-3 mr-2 text-neutral-400" />
              <span className="text-neutral-400">
                Pyth latency: {pythLatency} ms
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
