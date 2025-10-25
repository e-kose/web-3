# Kurulum ve Başlangıç Rehberi

## Gereklilikler

1. **Sui CLI** kurulumu
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
   sui --version
   ```

2. **Walrus CLI** kurulumu
   ```bash
   # macOS
   brew tap walrus-xyz/homebrew-tap
   brew install walrus
   
   # Linux / Ubuntu
   sudo snap install walrus
   
   # Docker
   docker run -it walrusxyz/cli:latest
   ```

3. **Node.js 18+** kurulumu
   ```bash
   node --version
   ```

4. **npm/yarn/pnpm** paket yöneticisi

## Proje Yapısı

```
walrus-linktree/
├── move/                          # Sui Move akıllı sözleşmesi
│   ├── Move.toml                 # Move konfigürasyonu
│   ├── sources/
│   │   └── linktree_profile.move # Ana sözleşme modülü
│   └── tests/
│       └── linktree_tests.move   # Unit testler
├── frontend/                      # React + Vite web uygulaması
│   ├── src/
│   │   ├── App.tsx               # Ana uygulama
│   │   ├── components/
│   │   │   ├── CreateProfile.tsx
│   │   │   └── ViewProfile.tsx
│   │   └── styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── ws-resources.json              # Walrus site konfigürasyonu
├── sites-config.yaml              # Walrus CLI konfigürasyonu
└── README.md
```

## Adım 1: Move Sözleşmesini Derle ve Yayınla

```bash
# Move klasörüne gir
cd move

# Sözleşmeyi derle
sui move build

# Testleri çalıştır
sui move test

# Testnet'e yayınla (gas-budget gerekli)
sui client publish --gas-budget 100000000
```

**Çıktıdan Package ID'sini not et.** Bu, sözleşmede `${PACKAGE_ID}` olarak kullanılacak.

## Adım 2: Frontend'i Kur ve Çalıştır

```bash
# Frontend klasörüne gir
cd frontend

# Bağımlılıkları kur
npm install
# veya
yarn install

# Geliştirme sunucusunu başlat
npm run dev

# Browser'da açın:
# http://localhost:5173
```

## Adım 3: Walrus Site'ini Deploy Et

### 3.1 Walrus CLI'yi Yapılandır

```bash
# Walrus kontekstini testnet olarak ayarla
mkdir -p ~/.walrus/
cat > ~/.walrus/client_config.yaml << EOF
context: testnet
contexts:
  testnet:
    rpc_url: https://walrus-testnet-rpc.allthatnode.com:8545
    wallet_address: 0xYourAddress
EOF
```

### 3.2 Frontend'i İnşa Et

```bash
cd frontend
npm run build
# Çıktı: dist/ klasöründe
```

### 3.3 Walrus'a Deploy Et

```bash
# Proje kök dizininden
site-builder deploy ./frontend/dist --epochs 1

# Çıktıda şuna benzer bir URL alacaksınız:
# https://<b36-hash>.trwal.app/
```

## Adım 4: SuiNS Entegrasyonu (Opsiyonel)

1. **testnet.suins.io** adresine git
2. `.sui` alan adı al (örn: `mylinktree.sui`)
3. SuiNS SDK ile site objesine yönlendir:

```typescript
import { SuiNSClient } from '@mysten/sui.js/suins';

const suinsClient = new SuiNSClient({ client });
await suinsClient.registerDomain({
  name: 'mylinktree',
  site_object_id: '0xYourSiteObjectId',
});
```

4. Şimdi şu adreste erişebilirsiniz:
   ```
   https://mylinktree.trwal.app/
   ```

## Fonksiyon Çağrı Örnekleri

### Profile Oluştur

```typescript
import { Transaction } from '@mysten/sui.js/transactions';

const tx = new Transaction();

const name = 'myprofile';
const avatar_cid = 'QmExample...';
const bio = 'My on-chain LinkTree profile';
const theme = 'dark';

tx.moveCall({
  target: `${PACKAGE_ID}::linktree_profile::create_profile`,
  arguments: [
    tx.pure(name),
    tx.pure(avatar_cid),
    tx.pure(bio),
    tx.pure(theme),
    tx.object(REGISTRY_OBJECT_ID),
  ],
});

const result = await client.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
});

console.log('Profile ID:', result.effects.created[0].reference.objectId);
```

### Link Ekle

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::linktree_profile::add_link`,
  arguments: [
    tx.object(profileId),
    tx.pure('Twitter'),
    tx.pure('https://twitter.com/username'),
  ],
});

await client.signAndExecuteTransaction({
  transaction: tx,
  signer: keypair,
});
```

## Testler

```bash
cd move

# Tüm testleri çalıştır
sui move test

# Spesifik test çalıştır
sui move test test_create_profile
```

## Troubleshooting

### Sui CLI bulunamadı
```bash
# Sui'yi PATH'e ekle
export PATH="$HOME/.cargo/bin:$PATH"
```

### Walrus CLI kurulum hatası
```bash
# Docker ile çalıştır
docker run --rm -it walrusxyz/cli:latest walrus --help
```

### Gas hataları
Gas budget'i artır:
```bash
sui client publish --gas-budget 500000000
```

### Frontend bağlantı hatası
Env dosyası oluştur:
```bash
# frontend/.env.local
VITE_PACKAGE_ID=0xYourPackageId
VITE_REGISTRY_ID=0xYourRegistryId
VITE_RPC_URL=https://fullnode.testnet.sui.io:443
```

## Kaynaklar

- [Sui Move Docs](https://move-book.com/)
- [Walrus Docs](https://docs.wal.app/)
- [dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [SuiNS Docs](https://docs.suins.io/)

## Yardım

Sorunlarla karşılaştıysanız:
1. [Sui Discord](https://discord.gg/sui) kanalını ziyaret edin
2. GitHub issues'ı kontrol edin
3. Walrus topluluk forumlarını inceleyin
