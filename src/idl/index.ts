import type { AutotpIdl, Vault, AutotpProgram } from './types';

// Create a simplified IDL that minimizes type issues
const minimalIdl = {
  version: "0.1.0",
  name: "autotp",
  programId: "7LodHGzvDyBkGPwLyraaB7vyX7thPLtWbZ3iF7WdtUsQ",
  metadata: {
    address: "7LodHGzvDyBkGPwLyraaB7vyX7thPLtWbZ3iF7WdtUsQ"
  },
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "targetPrice", type: "u64" },
        { name: "referrer", type: "publicKey" }
      ]
    },
    {
      name: "cancelTp",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "vaultTokens", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "executeTp",
      accounts: [
        { name: "vault", isMut: true, isSigner: false },
        { name: "vaultTokens", isMut: true, isSigner: false },
        { name: "destinationUser", isMut: true, isSigner: false },
        { name: "destinationProtocol", isMut: true, isSigner: false },
        { name: "destinationReferrer", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "currentPrice", type: "u64" }
      ]
    }
  ],
  accounts: [
    {
      name: "vault",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "tokenMint", type: "publicKey" },
          { name: "targetPrice", type: "u64" },
          { name: "referrer", type: "publicKey" },
          { name: "currentPrice", type: "u64" },
          { name: "readyForExecution", type: "bool" }
        ]
      }
    }
  ],
  errors: [
    { code: 6000, name: "TargetNotReached", msg: "Target price not reached." },
    { code: 6001, name: "Unauthorized", msg: "Unauthorized action." }
  ]
};

// Export the minimal IDL
export const typedAutotpIdl = minimalIdl;
export type { AutotpIdl, Vault, AutotpProgram }; 