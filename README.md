# Walrus On-Chain LinkTree

An on-chain LinkTree application built on Sui blockchain using Move smart contracts and Walrus decentralized storage.

## 🚀 Live Deployment (Testnet)

- **Package ID**: `0xf4b4f4df0c4692935d43a58836539969e61dad73db64f7640915ca90b0e27193`
- **Registry ID**: `0x1d4b4822a5d8f059d06af85d263543006fe946d88f04f5fef9aa164b10390f4d`
- **Network**: Sui Testnet
- **Explorer**: [View on SuiScan](https://suiscan.xyz/testnet/object/0xf4b4f4df0c4692935d43a58836539969e61dad73db64f7640915ca90b0e27193)
- **Status**: ✅ Fully functional with wallet integration, profile creation, and link management

## Project Structure

```
walrus-linktree/
├── move/
│   ├── Move.toml              # Sui Move project configuration
│   ├── sources/
│   │   └── linktree_profile.move   # Main smart contract
│   └── tests/
│       └── linktree_tests.move     # Unit tests
├── frontend/                  # React + dApp Kit (coming soon)
├── ws-resources.json          # Walrus site configuration
├── sites-config.yaml          # Walrus CLI configuration
└── README.md
```

## Smart Contract Overview

### Main Structures

- **LinkTreeProfile**: On-chain user profile containing name, avatar CID, bio, links, and theme
- **Link**: Individual link with label and URL
- **NameRegistry**: Maps usernames to profile object IDs using dynamic fields

### Key Functions

- `create_profile()`: Create a new LinkTree profile
- `update_profile()`: Update bio, avatar, and theme
- `add_link()`: Add a new link to the profile
- `remove_link()`: Remove a link by label
- `get_links()`: Retrieve all links from a profile
- `resolve_name()`: Resolve username to profile ID

## Getting Started

### Prerequisites

1. Install Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install
2. Install Walrus CLI: https://docs.wal.app/usage/started.html
3. Install Move Analyzer VS Code extension

### Build and Test

```bash
# Navigate to move directory
cd move

# Build the project
sui move build

# Run tests
sui move test
```

### Deploy to Testnet

```bash
# Publish smart contract
sui client publish --gas-budget 100000000

# Copy the Package ID from the output
```

## Contract Interactions

### Create Profile (TypeScript example using Sui SDK)

```typescript
import { Transaction } from '@mysten/sui.js/transactions';

const tx = new Transaction();

const [profile] = tx.moveCall({
  target: `${packageId}::linktree_profile::create_profile`,
  arguments: [
    tx.pure(name),
    tx.pure(avatarCid),
    tx.pure(bio),
    tx.pure(theme),
    tx.object(registryId), // Get from contract
  ],
});

await client.signAndExecuteTransaction({ transaction: tx, signer: keypair });
```

### Add Link to Profile

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${packageId}::linktree_profile::add_link`,
  arguments: [
    tx.object(profileId),
    tx.pure(label),
    tx.pure(url),
  ],
});

await client.signAndExecuteTransaction({ transaction: tx, signer: keypair });
```

## Events Emitted

- **ProfileCreated**: When a new profile is created
- **ProfileUpdated**: When profile info is updated
- **LinkAdded**: When a link is added
- **LinkRemoved**: When a link is removed

## Testing

Run the test suite:

```bash
cd move
sui move test
```

Tests cover:
- Profile creation
- Adding links to profiles
- Link retrieval

## Future Features

- [x] React frontend with dApp Kit ✅
- [x] Wallet integration ✅
- [x] Profile creation & management ✅
- [x] Link system ✅
- [ ] Walrus Sites hosting (build ready, awaiting deployment)
- [ ] SuiNS domain binding
- [ ] Theme customization
- [ ] Link analytics

## Resources

- [Sui Move Documentation](https://move-book.com/)
- [Mysten dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Walrus Documentation](https://docs.wal.app/)
- [SuiNS Documentation](https://docs.suins.io/)

## License

MIT

## Contributors

- Built for Sui Hackathon 2025
