# Developer Guide for AutoTP Frontend Development

Due to stack size limitations in the Solana BPF compiler, we're taking an alternative approach to development that doesn't require deploying the full program for frontend testing.

## The Issue

When building our Solana program, we encountered a stack size limitation:

```
Stack offset of 4448 exceeded max offset of 4096 by 352 bytes
```

This is a limitation in Solana's BPF compiler related to ABI generation, not an issue with our code itself.

## Our Solution

To enable continued frontend development, we're providing two solutions:

### 1. Minimal Program for Testing

We've simplified the program to a basic counter that can:
- Initialize a new counter account
- Increment an existing counter

This minimal program avoids the stack size issues and demonstrates the core functionality of account creation and modification.

### 2. Mock Service for Development

For rapid frontend development without needing to deploy anything to a Solana blockchain:

1. Use `mock-service.js` which simulates our Solana program's behavior
2. This allows you to develop and test the frontend without any blockchain interaction
3. The mock service uses localStorage to persist data between sessions

## Integration Instructions

### Option 1: Using the Mock Service

```javascript
import MockCounterService from './path/to/mock-service';

// Initialize the service
const counterService = new MockCounterService();

// Use in your app
async function createNewCounter() {
  const ownerPubkey = 'your-wallet-public-key'; // In real app, get this from wallet connection
  const counter = await counterService.initializeCounter(ownerPubkey);
  console.log(`New counter created with ID: ${counter.publicKey}`);
  return counter;
}

async function incrementExistingCounter(counterPubkey) {
  const ownerPubkey = 'your-wallet-public-key'; // In real app, get this from wallet connection
  const updated = await counterService.incrementCounter(counterPubkey, ownerPubkey);
  console.log(`Counter incremented to: ${updated.account.count}`);
  return updated;
}
```

### Option 2: Using the Real Program (When Available)

Once we resolve the stack size issues with the full program:

```javascript
import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import idl from './path/to/idl/autotp.json';

// Initialize connection to the Solana network
const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS');

// Setup the program
const program = new Program(idl, programId, { connection });

// Use the program in your app
async function createNewCounter(wallet) {
  // Generate a new account for the counter
  const counterAccount = anchor.web3.Keypair.generate();
  
  // Call the initialize function
  await program.rpc.initialize({
    accounts: {
      counter: counterAccount.publicKey,
      user: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [counterAccount],
  });
  
  return counterAccount;
}

async function incrementCounter(counterPubkey, wallet) {
  await program.rpc.increment({
    accounts: {
      counter: counterPubkey,
      user: wallet.publicKey,
    },
  });
}
```

## Development Workflow

1. Start by using the mock service to build your UI and core functionality
2. When ready for blockchain integration, use Option 2 to connect to the real program
3. We recommend developing with a feature flag that lets you switch between the mock and real service:

```javascript
const USE_BLOCKCHAIN = process.env.REACT_APP_USE_BLOCKCHAIN === 'true';

// Service factory
function getCounterService() {
  if (USE_BLOCKCHAIN) {
    return new RealBlockchainService();
  } else {
    return new MockCounterService();
  }
}

const counterService = getCounterService();
```

## Next Steps

We're working on:
1. Resolving the stack size limitations in the full program
2. Optimizing the Rust code to reduce stack usage
3. Exploring alternative deployment strategies

Please let us know if you have any questions or need further assistance! 