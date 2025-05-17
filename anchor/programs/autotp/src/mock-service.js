/**
 * Mock service to simulate Solana counter program functionality
 * This can be used for frontend development when deploying the actual 
 * program is challenging.
 */

// Create a class to simulate our Solana counter program
class MockCounterService {
  constructor() {
    // Use localStorage to persist counter data between sessions
    this.storage = typeof localStorage !== 'undefined' ? localStorage : {
      getItem: () => null,
      setItem: () => {},
    };
    
    // Simulate counters
    this.counters = JSON.parse(this.storage.getItem('mockCounters') || '{}');
  }

  // Save counters to storage
  _saveCounters() {
    this.storage.setItem('mockCounters', JSON.stringify(this.counters));
  }

  // Generate a random pubkey for new counters
  _generateRandomPubkey() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
      .map(n => n.toString(16).padStart(2, '0'))
      .join('');
  }

  // Initialize a new counter
  async initializeCounter(ownerPubkey) {
    const counterPubkey = this._generateRandomPubkey();
    this.counters[counterPubkey] = {
      count: 0,
      owner: ownerPubkey,
      createdAt: Date.now(),
    };
    this._saveCounters();
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      publicKey: counterPubkey,
      account: this.counters[counterPubkey]
    };
  }

  // Increment an existing counter
  async incrementCounter(counterPubkey, ownerPubkey) {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if the counter exists
    if (!this.counters[counterPubkey]) {
      throw new Error(`Counter with pubkey ${counterPubkey} not found`);
    }
    
    // Check if the owner matches
    if (this.counters[counterPubkey].owner !== ownerPubkey) {
      throw new Error('Unauthorized: Owner mismatch');
    }
    
    // Increment the counter
    this.counters[counterPubkey].count += 1;
    this._saveCounters();
    
    return {
      publicKey: counterPubkey,
      account: this.counters[counterPubkey]
    };
  }

  // Get all counters
  async getAllCounters() {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return Object.entries(this.counters).map(([pubkey, account]) => ({
      publicKey: pubkey,
      account
    }));
  }

  // Get counter by pubkey
  async getCounter(counterPubkey) {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!this.counters[counterPubkey]) {
      return null;
    }
    
    return {
      publicKey: counterPubkey,
      account: this.counters[counterPubkey]
    };
  }
}

// Export the service for use in frontend apps
export default MockCounterService; 