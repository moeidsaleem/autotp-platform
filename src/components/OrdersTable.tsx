import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getActiveTakeProfitOrders, cancelTakeProfitOrder, anchorWallet } from '@/lib/auto-tp-program';
import { useDevMode } from './DevModeToggle';
import { PublicKey } from '@solana/web3.js';
import { getTokenMetadata } from '@/lib/token-metadata';

interface Order {
  id: string;
  token: string;
  icon: string;
  takeProfit: number;
  stopLoss: number | null;
  size: number;
  status: 'armed' | 'filled' | 'cancelled';
  timestamp: number;
  txId?: string;
  pl?: number;
  tokenMint?: string;
}

function getPL(order: Order) {
  if (order.status !== 'filled') return null;
  // Demo fallback: use pl if already set, otherwise randomize per id (for deterministic demo numbers)
  if (order.pl !== undefined) return order.pl;
  let hash = 0;
  for (let i = 0; i < order.id.length; ++i) hash += order.id.charCodeAt(i) * (i+1);
  // Between -15% and +25% of size
  const sign = hash % 2 === 0 ? 1 : -1;
  const abs = 3 + (hash % 12); // 3..14 percent
  const percent = sign * abs / 100;
  return Math.round(order.size * percent * 100) / 100;
}

export const OrdersTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'armed' | 'filled' | 'cancelled'>('armed');
  const [isExpanded, setIsExpanded] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { devMode } = useDevMode();

  useEffect(() => {
    // Add mock orders in dev mode
    if (devMode) {
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          token: 'SOL',
          icon: '◎',
          takeProfit: 2.5,
          stopLoss: 0.8,
          size: 10.5,
          status: 'armed',
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'order-2',
          token: 'USDC',
          icon: '$',
          takeProfit: 1.5,
          stopLoss: null,
          size: 500,
          status: 'filled',
          timestamp: Date.now() - 86400000,
          txId: 'GKot5hBsd81kMepLGHQrWGbbs3MHxAP3JvXZtpLp2ab',
        },
        {
          id: 'order-3',
          token: 'SOL',
          icon: '◎',
          takeProfit: 3.0,
          stopLoss: 0.75,
          size: 5.2,
          status: 'cancelled',
          timestamp: Date.now() - 172800000,
        },
      ];
      setOrders(mockOrders);
      setIsLoading(false);
      return;
    }

    // Fetch real orders if wallet is connected
    const fetchOrders = async () => {
      if (!publicKey) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get active TP orders
        const vaults = await getActiveTakeProfitOrders(connection, publicKey);
        
        // Transform vault data into UI orders
        const orderPromises = vaults.map(async (vault) => {
          try {
            // Get token symbol from mint using our metadata service
            const tokenMint = vault.tokenMint.toString();
            const metadata = await getTokenMetadata(connection, tokenMint, 'devnet');
            
            // Calculate multiplier from target price (assumes 6 decimal precision in program)
            const targetMultiplier = vault.targetPrice.toNumber() / 1_000_000;
            
            return {
              id: vault.owner.toString().substring(0, 8),
              token: metadata.symbol,
              icon: metadata.icon,
              takeProfit: targetMultiplier,
              stopLoss: null, // Stop loss not implemented in current program version
              size: 0, // Size would need to be fetched from token account
              status: 'armed' as const,
              timestamp: Date.now(), // Timestamp not stored in program
              tokenMint: tokenMint
            };
          } catch (error) {
            console.error(`Error getting metadata for token ${vault.tokenMint.toString()}:`, error);
            // Provide fallback with basic information
            return {
              id: vault.owner.toString().substring(0, 8),
              token: 'Unknown',
              icon: '?',
              takeProfit: vault.targetPrice.toNumber() / 1_000_000,
              stopLoss: null,
              size: 0,
              status: 'armed' as const,
              timestamp: Date.now(),
              tokenMint: vault.tokenMint.toString()
            };
          }
        });
        
        const fetchedOrders = await Promise.all(orderPromises);
        
        // Use functional state update to safely access current orders
        setOrders(currentOrders => {
          // Combine with existing filled/cancelled orders from current state
          const existingNonActive = currentOrders.filter(order => order.status !== 'armed');
          return [...fetchedOrders, ...existingNonActive];
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Failed to load orders",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    
    // Set up interval to refresh active orders
    const intervalId = setInterval(() => {
      if (publicKey && !devMode) {
        fetchOrders();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [connection, publicKey, devMode, toast]);

  // Add an event listener for new orders
  useEffect(() => {
    const handleNewOrder = () => {
      // Refresh orders on new order event
      if (!devMode && publicKey) {
        getActiveTakeProfitOrders(connection, publicKey)
          .then(async (vaultAccounts) => {
            if (vaultAccounts.length > 0) {
              // Transform vault data using token metadata service
              const orderPromises = vaultAccounts.map(async (vault) => {
                try {
                  const tokenMint = vault.tokenMint.toString();
                  const metadata = await getTokenMetadata(connection, tokenMint, 'devnet');
                  const targetMultiplier = vault.targetPrice.toNumber() / 1_000_000;
                  
                  return {
                    id: vault.owner.toString().substring(0, 8),
                    token: metadata.symbol,
                    icon: metadata.icon,
                    takeProfit: targetMultiplier,
                    stopLoss: null,
                    size: 0,
                    status: 'armed' as const,
                    timestamp: Date.now(),
                    tokenMint: tokenMint
                  };
                } catch (error) {
                  console.error(`Error getting metadata for token ${vault.tokenMint.toString()}:`, error);
                  // Provide fallback with basic information
                  return {
                    id: vault.owner.toString().substring(0, 8),
                    token: 'Unknown',
                    icon: '?',
                    takeProfit: vault.targetPrice.toNumber() / 1_000_000,
                    stopLoss: null,
                    size: 0,
                    status: 'armed' as const,
                    timestamp: Date.now(),
                    tokenMint: vault.tokenMint.toString()
                  };
                }
              });
              
              const fetchedOrders = await Promise.all(orderPromises);
              
              // Use functional state update to safely access current orders
              setOrders(currentOrders => {
                // Combine with existing filled/cancelled orders from current state
                const existingNonActive = currentOrders.filter(order => order.status !== 'armed');
                return [...fetchedOrders, ...existingNonActive];
              });
            }
          })
          .catch(console.error);
      }
    };
    
    window.addEventListener('new-order-created', handleNewOrder);
    return () => window.removeEventListener('new-order-created', handleNewOrder);
  }, [connection, publicKey, devMode]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const cancelOrder = async (orderId: string, tokenMint?: string) => {
    if (devMode) {
      // Mock cancellation in dev mode
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      return;
    }
    
    if (!tokenMint || !publicKey) {
      toast({
        title: "Cannot cancel order",
        description: "Missing order information or wallet not connected",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Convert string to PublicKey
      const mintPublicKey = new PublicKey(tokenMint);
      
      // Using type assertion to handle the wallet adapter type compatibility
      // We've already checked publicKey is not null
      // @ts-expect-error - WalletContextState has nullable fields that WalletAdapter requires
      const anchorCompatWallet = anchorWallet(wallet);
      
      // Call program to cancel order
      await cancelTakeProfitOrder(
        connection,
        anchorCompatWallet,
        mintPublicKey
      );
      
      // Update UI
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      toast({
        title: "Order cancelled successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Failed to cancel order",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredOrders = orders.filter(order => order.status === activeTab);

  const getStatusColor = (status: 'armed' | 'filled' | 'cancelled') => {
    switch (status) {
      case 'armed': return 'bg-neutral-700';
      case 'filled': return 'bg-sol/20 text-sol';
      case 'cancelled': return 'bg-neutral-800';
      default: return 'bg-neutral-700';
    }
  };

  return (
    <div className={cn(
      "glass-card mt-4 sm:mt-6 overflow-hidden transition-all duration-300 ease-out orders-table",
      isExpanded ? 'max-h-[80vh]' : 'max-h-10'
    )}>
      <div 
        className="flex items-center justify-between p-2 px-3 sm:px-4 cursor-pointer" 
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <History size={16} className="text-neutral-400" />
          <span className="text-sm font-medium">Transaction History</span>
        </div>
        <div className="flex space-x-1 sm:space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
          <span 
            className={cn(
              "px-1.5 sm:px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap cursor-pointer",
              activeTab === 'armed' ? 'bg-neutral-700' : 'bg-transparent'
            )} 
            onClick={(e) => { e.stopPropagation(); setActiveTab('armed'); }}
          >
            Armed
          </span>
          <span 
            className={cn(
              "px-1.5 sm:px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap cursor-pointer",
              activeTab === 'filled' ? 'bg-neutral-700' : 'bg-transparent'
            )} 
            onClick={(e) => { e.stopPropagation(); setActiveTab('filled'); }}
          >
            Filled
          </span>
          <span 
            className={cn(
              "px-1.5 sm:px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap cursor-pointer",
              activeTab === 'cancelled' ? 'bg-neutral-700' : 'bg-transparent'
            )} 
            onClick={(e) => { e.stopPropagation(); setActiveTab('cancelled'); }}
          >
            Cancelled
          </span>
        </div>
        <span className="text-neutral-400 text-sm">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && isLoading && (
        <div className="p-4 sm:p-8 text-center text-neutral-400">
          Loading orders...
        </div>
      )}

      {isExpanded && !isLoading && filteredOrders.length > 0 && (
        <div className="p-3 sm:p-4 orders-table-content">
          <div className="space-y-2 sm:space-y-3">
            {filteredOrders.map(order => {
              const pl = getPL(order);
              let plDisplay = '--';
              let plClass = "text-neutral-500";
              if (order.status === "filled" && typeof pl === "number") {
                plDisplay = (pl > 0 ? "+" : "") + pl + " " + order.token;
                plClass = pl > 0 ? "text-contrast" : "text-red-500";
              }
              
              return (
                <div key={order.id} className="bg-neutral-900/60 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-neutral-800 rounded-full text-sm font-medium">
                        {order.icon}
                      </div>
                      <div>
                        <span className="font-medium text-sm sm:text-base">{order.token}</span>
                        <div className="text-[10px] sm:text-xs text-neutral-400">{formatDate(order.timestamp)} • {formatTime(order.timestamp)}</div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs",
                      getStatusColor(order.status)
                    )}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 mt-2 sm:mt-3 text-[10px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Size:</span>
                      <span className="font-medium">{order.size} {order.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Take Profit:</span>
                      <span className="font-medium">{order.takeProfit}×</span>
                    </div>
                    {order.stopLoss && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Stop Loss:</span>
                        <span className="font-medium">{order.stopLoss}×</span>
                      </div>
                    )}
                    {order.status === 'filled' && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">P/L:</span>
                        <span className={`font-medium ${plClass}`}>{plDisplay}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    {order.status === 'armed' ? (
                      <button 
                        onClick={() => cancelOrder(order.id, order.tokenMint)} 
                        className="text-xs px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-200"
                      >
                        Cancel
                      </button>
                    ) : order.txId ? (
                      <a 
                        href={`https://explorer.solana.com/tx/${order.txId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-200 flex items-center gap-1"
                      >
                        View Transaction <span className="text-xs">↗</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isExpanded && !isLoading && filteredOrders.length === 0 && (
        <div className="p-4 sm:p-8 text-center text-neutral-400">
          {!publicKey && !devMode ? "Connect wallet to view orders" : `No ${activeTab} orders found`}
        </div>
      )}
    </div>
  );
};
