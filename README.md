# 🚀 AutoTP - Automated Take Profit for Solana

A DeFi application enabling automatic take profit orders for Solana tokens. This project allows users to set "set and forget" exit strategies for their token positions, automatically executing sells when price targets are reached.

<p align="center">
  <img src="https://img.shields.io/badge/Solana-black?style=for-the-badge&logo=solana" alt="Solana">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Anchor-black?style=for-the-badge&logo=anchor" alt="Anchor">
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS">
</p>

## ✨ Features

- **Automated Take Profit Orders**: Set price targets for your tokens and have them automatically sell when targets are reached
- **Customizable Exit Strategies**: Configure how much of your position to sell
- **Target Multipliers**: Set targets using price multipliers (e.g., 2x, 3x from current price)
- **Referral System**: Built-in referral system that rewards users for bringing in new traders
- **Real-time Status**: Monitor the status of your orders and view execution history
- **Multi-wallet Support**: Compatible with popular Solana wallets including Phantom, Solflare, and Backpack

## 🔧 Project Status

- **Frontend**: Complete and ready for production
- **Smart Contract**: Ready for deployment to mainnet (currently on devnet)
- **Testing**: Comprehensive test suite in place

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn or npm
- Solana CLI (for smart contract deployment)
- A Solana wallet (Phantom, Solflare, Backpack)

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/autotp.git
cd autotp

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The application will be available at `http://localhost:3000`.

### Smart Contract Development

For Anchor program development:

```bash
# Navigate to the Anchor directory
cd anchor

# Build the program
yarn anchor-build

# Deploy to localnet for testing
yarn anchor-localnet

# Run tests
yarn anchor-test
```

## 📂 Project Structure

```
autotp/
├── src/                  # Frontend application
│   ├── app/              # Next.js 14 app router
│   ├── components/       # UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # Utility libraries and Solana helpers
│   └── idl/              # Anchor IDL definitions
├── anchor/               # Solana program (smart contract)
│   ├── programs/         # Rust program code
│   ├── tests/            # Program tests
│   └── migrations/       # Deployment scripts
└── public/               # Static assets
```

## 🔐 Security Considerations

The AutoTP program uses the following security measures:

- **PDA Verification**: Ensures only authorized accounts can modify orders
- **Clean State Management**: Proper cleanup of accounts after order execution
- **Custom Owner Verification**: Enhanced wallet verification beyond Anchor's owner check
- **Rate Limiting**: Protection against transaction flooding

## 📊 How It Works

1. **Set Up**: User connects wallet and selects a token
2. **Configure**: User sets target price multiplier and percentage to sell
3. **Order Creation**: System creates a vault to hold the order information
4. **Monitoring**: Keepers monitor on-chain prices against target prices
5. **Execution**: When price targets are met, orders are automatically executed
6. **Settlement**: Funds are sent to the user, with portions to protocol and optional referrer

## 🌐 Network Configuration

The application is currently configured to operate on:

- **Default Network**: Solana Devnet
- **Mainnet Launch**: Coming soon

You can modify the network in `src/lib/solana.ts`.

## 🛣️ Roadmap

- [x] Initial UI implementation
- [x] Smart contract development
- [x] Devnet deployment and testing
- [ ] Stop-loss functionality
- [ ] Advanced order types (trailing stop, scaled exits)
- [ ] Mainnet deployment
- [ ] Mobile app version

## 🤝 Contributing

We welcome contributions to AutoTP! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📧 Contact

For questions or support, please reach out to [team@example.com](mailto:team@example.com).

