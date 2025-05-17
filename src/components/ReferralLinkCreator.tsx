import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useDevMode } from './DevModeToggle';
import { fetchReferralStats, ReferralStats } from '@/lib/referral-service';

export const ReferralLinkCreator = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { devMode } = useDevMode();
  const { toast } = useToast();
  const [refLink, setRefLink] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalEarningsUsd: 0,
    totalEarningsSol: 0,
    totalReferrals: 0
  });

  // Dev wallet for testing when in dev mode
  const devWalletKey = "BvR9z9qh4qERYfpxX5zKvX3GjQBXLbDueVmJgNVAvDRz";
  
  // Use either the connected wallet or the dev wallet
  const effectiveWalletKey = devMode ? devWalletKey : publicKey?.toBase58();

  // Fetch referral stats from blockchain
  useEffect(() => {
    async function fetchStats() {
      if (!effectiveWalletKey) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // If in dev mode, we can choose to use mock data or real blockchain data
        if (devMode && !process.env.NEXT_PUBLIC_USE_REAL_DATA_IN_DEV) {
          // Use mock data in dev mode for faster development
          setTimeout(() => {
            setReferralStats({
              totalEarningsUsd: 1234.56,
              totalEarningsSol: 12.34,
              totalReferrals: 23
            });
            setIsLoading(false);
          }, 500);
        } else {
          // Fetch real referral stats from blockchain
          const stats = await fetchReferralStats(connection, effectiveWalletKey);
          setReferralStats(stats);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch referral stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch referral stats. Please try again later.",
        });
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [effectiveWalletKey, devMode, connection, toast]);

  // Generate referral link
  useEffect(() => {
    if (!effectiveWalletKey) return;
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/?ref=${effectiveWalletKey}`;
    setRefLink(link);
  }, [effectiveWalletKey]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if wallet is connected
  const walletConnected = devMode || connected;

  return (
    <div 
      className={cn(
        "glass-card mt-4 sm:mt-6 overflow-hidden transition-all duration-300 ease-out referral-link-card",
        isExpanded ? 'max-h-[80vh]' : 'max-h-10'
      )}
    >
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer" 
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2.5">
          <Star size={18} className="text-neutral-400" />
          <span className="text-sm font-medium">Your Referral Link</span>
        </div>
        <span className="text-neutral-400 text-sm">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-4">
          {!walletConnected ? (
            <div className="text-center text-neutral-400 py-2">
              Connect your wallet to generate a referral link
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input
                  type="text"
                  value={refLink}
                  readOnly
                  className="flex-1 bg-neutral-900/60 border-neutral-800 text-sm text-neutral-50 w-full"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  className="bg-contrast text-black font-semibold hover:bg-contrast/90 w-full sm:w-auto mt-2 sm:mt-0"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>

              <div className="bg-neutral-900/60 rounded-lg p-3 shadow-sm">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Referral Earnings</h3>
                  
                  {isLoading ? (
                    <div className="py-4 text-center text-neutral-400">
                      Loading stats...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-contrast">
                          ${referralStats.totalEarningsUsd.toFixed(2)}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {referralStats.totalEarningsSol.toFixed(2)} SOL
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          Total Earnings
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold text-contrast">
                          {referralStats.totalReferrals}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          Users Referred
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-400 text-center">
                Earn lifetime fees by sharing your link!
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
