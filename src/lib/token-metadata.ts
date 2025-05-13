import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Interface for token metadata
export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  icon: string;
  price?: number;
  decimals?: number;
}

// Cache for token metadata to avoid repeated fetches
const tokenMetadataCache = new Map<string, TokenMetadata>();

// Known tokens for devnet and mainnet
const KNOWN_TOKENS: Record<string, TokenMetadata> = {
  // SOL - Native token
  'So11111111111111111111111111111111111111112': { 
    mint: 'So11111111111111111111111111111111111111112',
    name: 'Solana', 
    symbol: 'SOL', 
    icon: '◎',
    price: 170.54,
    decimals: 9
  },
  // USDC - Both mainnet and devnet
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { 
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin', 
    symbol: 'USDC', 
    icon: '$',
    price: 1.00,
    decimals: 6
  },
  // USDT
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { 
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    name: 'USDT', 
    symbol: 'USDT', 
    icon: '$',
    price: 1.00,
    decimals: 6
  },
  // mSOL
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { 
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    name: 'Marinade SOL', 
    symbol: 'mSOL', 
    icon: '◎',
    price: 190.25,
    decimals: 9
  },
  // BONK
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { 
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk', 
    symbol: 'BONK', 
    icon: '🐕',
    price: 0.00002,
    decimals: 5
  },
  
  // Add DevNet specific tokens here
  // Devnet USDC
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': {
    mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    name: 'USD Coin (Devnet)',
    symbol: 'USDC',
    icon: '$',
    price: 1.00,
    decimals: 6
  },
  // Devnet BTC
  '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU': {
    mint: '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU',
    name: 'Bitcoin (Devnet)',
    symbol: 'BTC',
    icon: '₿',
    price: 63450.00,
    decimals: 6
  },
  // Devnet ETH
  'Cu84KB3tDL6SbFgToHMLYVDJJXdJjenNzSKikeAvzmkA': {
    mint: 'Cu84KB3tDL6SbFgToHMLYVDJJXdJjenNzSKikeAvzmkA',
    name: 'Ethereum (Devnet)',
    symbol: 'ETH',
    icon: 'Ξ',
    price: 3485.75,
    decimals: 8
  }
};

/**
 * Attempts to fetch token metadata from multiple sources
 * 1. Checks local cache first
 * 2. Looks up in known tokens list
 * 3. Attempts to fetch from Solana token list API (for mainnet tokens)
 * 4. Falls back to creating a placeholder with mint address
 */
export async function getTokenMetadata(
  connection: Connection,
  mintAddress: string,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'
): Promise<TokenMetadata> {
  // Check cache first
  if (tokenMetadataCache.has(mintAddress)) {
    return tokenMetadataCache.get(mintAddress)!;
  }

  // Check known tokens list
  if (KNOWN_TOKENS[mintAddress]) {
    tokenMetadataCache.set(mintAddress, KNOWN_TOKENS[mintAddress]);
    return KNOWN_TOKENS[mintAddress];
  }

  try {
    // For mainnet, attempt to fetch from Jupiter token list
    if (cluster === 'mainnet-beta') {
      const response = await fetch('https://token.jup.ag/all');
      if (response.ok) {
        const tokenList = await response.json();
        const token = tokenList.find((t: { address: string; name: string; symbol: string; decimals: number }) => 
          t.address === mintAddress
        );
        
        if (token) {
          const metadata: TokenMetadata = {
            mint: mintAddress,
            name: token.name,
            symbol: token.symbol,
            icon: getIconForSymbol(token.symbol), // Use a helper to determine icon
            decimals: token.decimals
          };
          
          tokenMetadataCache.set(mintAddress, metadata);
          return metadata;
        }
      }
    }
    
    // Get token account info to at least get decimals
    try {
      const info = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
      if (info.value && 'parsed' in info.value.data) {
        const parsedData = info.value.data.parsed;
        if (parsedData.type === 'mint') {
          const decimals = parsedData.info.decimals;
          
          // Extract symbol from mint address (simple heuristic)
          const shortAddr = mintAddress.slice(0, 4);
          const metadata: TokenMetadata = {
            mint: mintAddress,
            name: `Token ${shortAddr}...`,
            symbol: shortAddr,
            icon: '?',
            decimals
          };
          
          tokenMetadataCache.set(mintAddress, metadata);
          return metadata;
        }
      }
    } catch (e) {
      console.warn(`Failed to get account info for token ${mintAddress}`, e);
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error);
  }

  // Fall back to a placeholder
  const fallbackMetadata: TokenMetadata = {
    mint: mintAddress,
    name: `Token ${mintAddress.slice(0, 6)}...`,
    symbol: mintAddress.slice(0, 4).toUpperCase(),
    icon: '?'
  };
  
  tokenMetadataCache.set(mintAddress, fallbackMetadata);
  return fallbackMetadata;
}

/**
 * Get a token icon based on its symbol
 */
function getIconForSymbol(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'SOL': '◎',
    'WSOL': '◎',
    'BTC': '₿',
    'ETH': 'Ξ',
    'USDC': '$',
    'USDT': '$',
    'BONK': '🐕',
    'MATIC': '⬡',
    'RAY': 'ℝ',
    'SRM': 'S',
    'ATOM': '⚛',
    'DOT': '●',
    'AVAX': 'A',
    'ADA': '₳',
    'LINK': '⬡',
    'DOGE': 'Ð',
  };
  
  return symbolMap[symbol] || '?';
}

/**
 * Fetch token accounts and balances for a wallet with proper metadata
 */
export async function getWalletTokensWithMetadata(
  connection: Connection, 
  walletAddress: PublicKey,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'
) {
  // Fetch all token accounts for the wallet
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletAddress,
    { programId: TOKEN_PROGRAM_ID }
  );
  
  // Fetch SOL balance
  const solBalance = await connection.getBalance(walletAddress) / 1e9;
  
  // Get SOL metadata
  const solMetadata = await getTokenMetadata(
    connection, 
    'So11111111111111111111111111111111111111112',
    cluster
  );
  
  // Create tokens array starting with SOL
  const tokens = [{
    id: 'sol',
    mint: 'So11111111111111111111111111111111111111112',
    name: solMetadata.name,
    symbol: solMetadata.symbol,
    icon: solMetadata.icon,
    balance: solBalance,
    price: solMetadata.price
  }];
  
  // Process each token account
  const tokenPromises = tokenAccounts.value.map(async account => {
    const parsedInfo = account.account.data.parsed.info;
    const mintAddress = parsedInfo.mint;
    const balance = parsedInfo.tokenAmount.uiAmount;
    
    // Skip tokens with zero balance
    if (balance === 0) return null;
    
    // Get metadata for this token
    const metadata = await getTokenMetadata(connection, mintAddress, cluster);
    
    return {
      id: mintAddress,
      mint: mintAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      icon: metadata.icon,
      balance,
      price: metadata.price,
      decimals: metadata.decimals
    };
  });
  
  // Wait for all token metadata to be fetched
  const tokenResults = await Promise.all(tokenPromises);
  
  // Filter out null results (zero balance tokens) and add to tokens array
  tokens.push(...tokenResults.filter(t => t !== null));
  
  return tokens;
} 