import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

export const ReferralLinkCreator = () => {
  const mockPublicKey = "BvR9z9qh4qERYfpxX5zKvX3GjQBXLbDueVmJgNVAvDRz";
  const { toast } = useToast();
  const [refLink, setRefLink] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const mockStats = {
    totalEarningsUsd: 1234.56,
    totalEarningsSol: 12.34,
    totalReferrals: 23
  };

  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/?ref=${mockPublicKey}`;
    setRefLink(link);
  }, []);

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

  return (
    <div 
      className={cn(
        "glass-card mt-4 sm:mt-6 overflow-hidden transition-all duration-300 ease-out referral-link-card",
        isExpanded ? 'max-h-[80vh]' : 'max-h-10'
      )}
    >
      <div 
        className="flex items-center justify-between p-2 cursor-pointer" 
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <Star size={16} className="text-neutral-400" />
          <span className="text-sm font-medium">Your Referral Link</span>
        </div>
        <span className="text-neutral-400 text-sm">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div className="p-2 md:p-4 space-y-4">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-contrast">
                    ${mockStats.totalEarningsUsd.toFixed(2)}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {mockStats.totalEarningsSol.toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Total Earnings
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-contrast">
                    {mockStats.totalReferrals}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Users Referred
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400 text-center">
            Earn lifetime fees by sharing your link!
          </p>
        </div>
      )}
    </div>
  );
};
