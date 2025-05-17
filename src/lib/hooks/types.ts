import React from 'react';

// Token interface used in the application
export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: React.ReactNode;
  balance: number;
  mint?: string;
  price?: number;
}

// Extended token interface that includes price data
export interface TokenWithPrice extends Token {
  price: number;
} 