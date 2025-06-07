import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Use the correct program ID from the actual deployed Rust program
const AUTOTP_PROGRAM_ID = new PublicKey('7LodHGzvDyBkGPwLyraaB7vyX7thPLtWbZ3iF7WdtUsQ');

export interface ReferralStats {
  totalEarningsUsd: number;
  totalEarningsSol: number;
  totalReferrals: number;
}

/**
 * Fetches referral statistics for a given wallet address
 * This function queries the blockchain for all instances where the address is used as a referrer
 */
export async function fetchReferralStats(
  connection: Connection,
  walletAddress: string
): Promise<ReferralStats> {
  try {
    // Convert string address to PublicKey
    const pubkey = new PublicKey(walletAddress);
    
    // Get all program accounts where the referrer matches the wallet address
    // This would need to be adjusted based on your actual program account structure
    const accounts = await connection.getProgramAccounts(AUTOTP_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8 + 32 + 32 + 8, // Adjust based on your account layout
            bytes: pubkey.toBase58(),
          },
        },
      ],
    });
    
    if (!accounts || accounts.length === 0) {
      return {
        totalEarningsUsd: 0,
        totalEarningsSol: 0,
        totalReferrals: 0,
      };
    }
    
    // Count the number of referrals (each account where this wallet is the referrer)
    const totalReferrals = accounts.length;
    
    // Calculate total earnings based on the protocol fee (would need to adjust to your actual fee calculation)
    // This is a placeholder for actual blockchain calculation
    let totalLamports = new BN(0);
    
    // For each account where this wallet is the referrer, sum up the earnings
    // This would need actual implementation based on how fees are stored/calculated
    accounts.forEach(() => {
      // Example calculation - replace with actual logic
      // Let's assume 0.1% of the transaction amount goes to referrer
      // and our data structure has the amount at offset X
      // const amount = account.account.data.readBigUInt64LE(X);
      // totalLamports = totalLamports.add(new BN(amount.toString()));
      
      // For now, just use a placeholder value per referral
      totalLamports = totalLamports.add(new BN(100000000)); // 0.1 SOL per referral as placeholder
    });
    
    // Convert lamports to SOL (1 SOL = 10^9 lamports)
    const totalEarningsSol = totalLamports.toNumber() / 1_000_000_000;
    
    // Get SOL price to convert to USD
    // This would need an actual price API call
    const solPriceUsd = await fetchSolanaPrice();
    
    return {
      totalEarningsUsd: totalEarningsSol * solPriceUsd,
      totalEarningsSol,
      totalReferrals,
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return {
      totalEarningsUsd: 0,
      totalEarningsSol: 0,
      totalReferrals: 0,
    };
  }
}

/**
 * Fetches the current Solana price in USD
 * This uses CoinGecko API as an example, but you could use any price oracle
 */
async function fetchSolanaPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error('Error fetching Solana price:', error);
    // Return a fallback price if API call fails
    return 100; // Default price as fallback
  }
} 