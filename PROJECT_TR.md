# Walrus On-Chain LinkTree - Sui Hackathon

🌳 **On-chain LinkTree** — Sui blockchain üzerine inşa edilmiş, Walrus'ta barındırılan, SuiNS ile markalaştırılan merkezi olmayan link yönetim platformu.

## 🎯 Proje Özeti

Linktree'nin on-chain versiyonunu Sui blockchain üzerinde oluşturan tam bir proje:

- ✅ **Sui Move** akıllı sözleşmesi: LinkTreeProfile yönetimi
- ✅ **React + Vite** frontend: Profil oluşturma ve görüntüleme
- ✅ **Walrus Sites** entegrasyonu: Merkezi olmayan barındırma
- ✅ **SuiNS** entegrasyonu: `.sui` domain desteği
- ✅ **dApp Kit** entegrasyonu: Cüzdan bağlantısı ve işlem yönetimi

## 🚀 Hızlı Başlangıç

### 1. Move Sözleşmesini Deploy Et

```bash
cd move
sui move build
sui client publish --gas-budget 100000000
```

Package ID'sini not alın.

### 2. Frontend'i Çalıştır

```bash
cd frontend
npm install
npm run dev
```

### 3. Walrus'a Yayınla

```bash
cd frontend
npm run build
site-builder deploy ./dist --epochs 1
```

Ayrıntılı kurulum talimatları için [SETUP.md](./SETUP.md) dosyasını okuyun.

## 📁 Proje Yapısı

```
walrus-linktree/
├── move/
│   ├── Move.toml
│   ├── sources/
│   │   └── linktree_profile.move    # Ana sözleşme
│   └── tests/
│       └── linktree_tests.move      # Testler
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── CreateProfile.tsx
│   │   │   └── ViewProfile.tsx
│   │   └── styles/
│   ├── index.html
│   └── package.json
├── SETUP.md                         # Kurulum rehberi
└── README.md                        # Bu dosya
```

## 🎨 Özellikler

### Move Sözleşmesi

- **LinkTreeProfile**: İsim, avatar, bio, linkler, tema
- **NameRegistry**: Username → Object ID eşlemesi (dynamic fields)
- **Fonksiyonlar**:
  - `create_profile()`: Yeni profil oluştur
  - `update_profile()`: Profil bilgilerini güncelle
  - `add_link()`: Link ekle
  - `remove_link()`: Link sil
  - `resolve_name()`: Username'den profile ID'sini çöz

### React Frontend

- Cüzdan bağlantısı (dApp Kit)
- Profil oluşturma formu
- Dinamik profil görüntüleme
- Link yönetimi
- Responsive tasarım

### Walrus Sites

- Merkezi olmayan barındırma
- B36 hash ID'si ile erişim
- SuiNS entegrasyonu

## 📊 Akıllı Sözleşme Özellikleri

### Veri Yapıları

```move
// Profil yapısı
public struct LinkTreeProfile has key {
    id: UID,
    owner: address,
    name: String,
    avatar_cid: String,     // IPFS CID
    bio: String,
    links: vector<Link>,
    theme: String,
    created_at: u64,
    updated_at: u64,
}

// Link yapısı
public struct Link has store, drop {
    label: String,
    url: String,
}
```

### Olaylar (Events)

- `ProfileCreated`: Profil oluşturulduğunda
- `ProfileUpdated`: Profil güncellendiğinde
- `LinkAdded`: Link eklendiğinde
- `LinkRemoved`: Link silindiğinde

## 🔌 Entegrasyon Noktaları

### Sui Move SDK

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::linktree_profile::create_profile`,
  arguments: [name, avatarCid, bio, theme, registryId],
});

await client.signAndExecuteTransaction({ transaction: tx });
```

### RPC Sorguları

```typescript
const profile = await client.getObject({
  id: profileObjectId,
  options: { showContent: true },
});
```

## 🧪 Testler

```bash
cd move
sui move test
```

Test kapsamı:
- ✅ Profil oluşturma
- ✅ Link ekleme
- ✅ Link silme
- ✅ Profil güncelleme

## 🌐 Dağıtım

### Testnet'e Dağıt

```bash
# Move sözleşmesini yayınla
sui client publish --network testnet --gas-budget 100000000

# Frontend'i build et
npm run build

# Walrus'a deploy et
site-builder deploy ./dist --epochs 1 --context testnet
```

### SuiNS Domainini Bağla

1. https://testnet.suins.io adresine git
2. `.sui` adı kaydettir
3. Site object ID'sini bağla
4. Şu adreste erişebilirsiniz: `https://yourname.trwal.app/`

## 📱 Canlı Demo

- **Walrus Site**: `https://<b36-hash>.trwal.app/`
- **SuiNS Domain**: `https://<yourname>.trwal.app/`
- **Explorer**: 
  - [Suiscan](https://suiscan.xyz/testnet)
  - [Walruscan](https://walruscan.com/testnet)

## 🔗 Kaynaklar

- [Sui Move Dokümantasyonu](https://move-book.com/)
- [Mysten dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Walrus Dokümantasyonu](https://docs.wal.app/)
- [SuiNS Dokümantasyonu](https://docs.suins.io/)
- [Sui Testnet RPC](https://fullnode.testnet.sui.io:443)

## 📝 Katkıda Bulunma

Pull request'ler ve issue'lar açmaktan çekinmeyin!

## 📄 Lisans

MIT

## 👨‍💻 Geliştirici

Built for **Sui Hackathon 2025**

---

**Soru mu var?** Sui Discord'a katılın ve `#walrus` kanalında sorular sorun!
