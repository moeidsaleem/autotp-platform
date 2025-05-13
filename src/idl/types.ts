import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

// Instead of extending Idl which has strict typings, define our own interface
// that matches the structure of our IDL but doesn't need to strictly follow
// the Anchor Idl interface requirements
export interface AutotpIdl {
  version: string;
  name: string;
  instructions: AutotpInstruction[];
  accounts: AutotpAccount[];
  errors: AutotpError[];
}

interface AutotpInstruction {
  name: string;
  accounts: { name: string; isMut: boolean; isSigner: boolean }[];
  args: { name: string; type: string }[];
}

interface AutotpAccount {
  name: string;
  type: {
    kind: string;
    fields: { name: string; type: string }[];
  };
}

interface AutotpError {
  code: number;
  name: string;
  msg: string;
}

// Define program accounts and their types for TypeScript
export interface Vault {
  owner: PublicKey;
  tokenMint: PublicKey;
  targetPrice: BN;
  referrer: PublicKey;
  currentPrice: BN;
  readyForExecution: boolean;
}

// Define account parameter type 
export interface AccountParams {
  [key: string]: PublicKey | BN | boolean | string | number | AccountParams;
}

// Define program method signatures
export interface AutotpProgram {
  methods: {
    initialize(targetPrice: BN, referrer: PublicKey): {
      accounts: (accounts: AccountParams) => { rpc: () => Promise<string> };
    };
    cancelTp(): {
      accounts: (accounts: AccountParams) => { rpc: () => Promise<string> };
    };
    executeTp(currentPrice: BN): {
      accounts: (accounts: AccountParams) => { rpc: () => Promise<string> };
    };
  };
  account: {
    vault: {
      fetch: (address: PublicKey) => Promise<Vault>;
    };
  };
} 