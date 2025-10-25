# API ve Kontrat Kullanım Örnekleri

## Sui TypeScript SDK Örnekleri

### 1. Profile Oluşturma

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

// Kurulum
const client = new SuiClient({ url: getFullnodeUrl('testnet') });
const keypair = Ed25519Keypair.fromSecretKey(
  Buffer.from('YOUR_PRIVATE_KEY', 'hex')
);

// Profile oluştur
async function createProfile() {
  const tx = new Transaction();

  const name = 'myprofile';
  const avatarCid = 'QmExample123...'; // IPFS CID
  const bio = 'My on-chain LinkTree';
  const theme = 'dark';

  tx.moveCall({
    target: `${PACKAGE_ID}::linktree_profile::create_profile`,
    arguments: [
      tx.pure(name, 'string'),
      tx.pure(avatarCid, 'string'),
      tx.pure(bio, 'string'),
      tx.pure(theme, 'string'),
      tx.object(REGISTRY_OBJECT_ID), // Shared object
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  console.log('Profile created:', result.digest);
  return result.effects.created[0]?.reference.objectId;
}
```

### 2. Profile'a Link Ekleme

```typescript
async function addLink(
  profileId: string,
  label: string,
  url: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::linktree_profile::add_link`,
    arguments: [
      tx.object(profileId),
      tx.pure(label, 'string'),
      tx.pure(url, 'string'),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  console.log('Link added:', result.digest);
  return result;
}

// Kullanım
await addLink(profileId, 'Twitter', 'https://twitter.com/username');
await addLink(profileId, 'GitHub', 'https://github.com/username');
```

### 3. Profile Bilgilerini Okuma

```typescript
async function getProfile(profileId: string) {
  const profile = await client.getObject({
    id: profileId,
    options: {
      showContent: true,
      showDisplay: true,
    },
  });

  if (profile.data?.content?.dataType === 'moveObject') {
    const fields = profile.data.content.fields as Record<string, any>;
    return {
      name: fields.name,
      bio: fields.bio,
      avatarCid: fields.avatar_cid,
      theme: fields.theme,
      links: fields.links,
      updatedAt: fields.updated_at,
    };
  }

  return null;
}

// Kullanım
const profile = await getProfile('0x...');
console.log(profile);
```

### 4. Username'den Profile ID'sini Çöz

```typescript
async function resolveUsername(name: string) {
  // Registry objesini sorgula
  const registry = await client.getObject({
    id: REGISTRY_OBJECT_ID,
    options: {
      showContent: true,
    },
  });

  // TableVec'i parse et ve isim ara
  if (registry.data?.content?.dataType === 'moveObject') {
    const fields = registry.data.content.fields as Record<string, any>;
    // name_to_id table içinde ara
    // Not: Tablo verileri dinamik olduğu için tam sorgu daha karmaşıktır
    // RPC'nin dinamik sorgulama API'sini kullanmanız gerekebilir
  }

  return null;
}
```

### 5. Profile'ı Güncelleme

```typescript
async function updateProfile(
  profileId: string,
  newBio: string,
  newAvatarCid: string,
  newTheme: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::linktree_profile::update_profile`,
    arguments: [
      tx.object(profileId),
      tx.pure(newBio, 'string'),
      tx.pure(newAvatarCid, 'string'),
      tx.pure(newTheme, 'string'),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  console.log('Profile updated:', result.digest);
  return result;
}
```

### 6. Link Silme

```typescript
async function removeLink(profileId: string, label: string) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::linktree_profile::remove_link`,
    arguments: [
      tx.object(profileId),
      tx.pure(label, 'string'),
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  console.log('Link removed:', result.digest);
  return result;
}
```

## React dApp Kit Entegrasyonu

### Setup

```typescript
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider>
        <WalletProvider>
          <YourComponent />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

### Cüzdan Bağlantısı

```typescript
import { useWallet, useConnectWallet } from '@mysten/dapp-kit';

function ConnectButton() {
  const { currentAccount } = useWallet();
  const { mutate: connect } = useConnectWallet();

  if (currentAccount) {
    return <div>Connected: {currentAccount.address}</div>;
  }

  return <button onClick={() => connect()}>Connect Wallet</button>;
}
```

### İşlem Gönderme

```typescript
import { useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';

function CreateProfileComponent() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data: txData } = useSuiClientQuery('getObject', {
    id: profileId,
  });

  const handleCreateProfile = () => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::linktree_profile::create_profile`,
      arguments: [
        tx.pure('myname'),
        tx.pure('QmExample'),
        tx.pure('My bio'),
        tx.pure('dark'),
        tx.object(REGISTRY_ID),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log('Success!', result);
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      }
    );
  };

  return <button onClick={handleCreateProfile}>Create Profile</button>;
}
```

## Event Dinleme

```typescript
import { filter } from 'rxjs';

async function listenToProfileEvents() {
  // RPC aboneliği ile event'leri dinle
  const unsubscribe = await client.subscribeEvent({
    filter: {
      MoveModule: {
        module: 'linktree_profile',
        package: PACKAGE_ID,
      },
    },
    onMessage: (event) => {
      console.log('Event received:', event);

      if (event.type.includes('ProfileCreated')) {
        console.log('New profile created!');
      } else if (event.type.includes('LinkAdded')) {
        console.log('New link added!');
      }
    },
  });

  // Dinlemeyi durdur
  // unsubscribe();
}
```

## IPFS Upload (Avatar için)

```typescript
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

async function uploadAvatarToIPFS(imagePath: string) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));

  const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
    headers: {
      ...form.getHeaders(),
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
    },
  });

  return response.data.IpfsHash; // QmXxxx...
}

// Kullanım
const imageCid = await uploadAvatarToIPFS('./avatar.png');
```

## SuiNS İntegrasyonu

```typescript
import { SuiNSClient } from '@mysten/sui.js/suins';

async function bindToSuiNS(name: string, siteObjectId: string) {
  const suinsClient = new SuiNSClient({ client });

  const tx = new Transaction();

  // SuiNS'e site bağla
  tx.moveCall({
    target: `${SUINS_PACKAGE}::registry::bind_site`,
    arguments: [
      tx.pure(name), // 'mylinktree'
      tx.object(siteObjectId), // Walrus site object
    ],
  });

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  console.log('SuiNS binding complete:', result.digest);
  // Şimdi erişebilirsiniz: https://mylinktree.trwal.app/
}
```

## Hata Yönetimi

```typescript
async function safeProfileOperation() {
  try {
    const profile = await getProfile(profileId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENotOwner')) {
        console.error('You are not the owner of this profile');
      } else if (error.message.includes('ENameAlreadyTaken')) {
        console.error('This name is already taken');
      } else {
        console.error('Error:', error.message);
      }
    }
  }
}
```

## Ortam Değişkenleri

```bash
# .env
VITE_PACKAGE_ID=0x...
VITE_REGISTRY_ID=0x...
VITE_RPC_URL=https://fullnode.testnet.sui.io:443
VITE_NETWORK=testnet
VITE_PINATA_API_KEY=...
VITE_SUINS_PACKAGE=0x...
```

Kullanım:
```typescript
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID;
```
