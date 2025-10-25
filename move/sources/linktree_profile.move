module linktree::linktree_profile {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use std::string::String;
    use std::vector;
    use std::option::{Self, Option};

    // ===== Structs =====
    
    /// Tek bir link (label + URL)
    public struct Link has store, drop {
        label: String,
        url: String,
    }

    /// Ana profil objesi
    public struct LinkTreeProfile has key {
        id: UID,
        owner: address,
        name: String,
        avatar_cid: String,      // IPFS CID
        bio: String,
        links: vector<Link>,
        theme: String,           // ör. "dark", "light", "custom"
        created_at: u64,
        updated_at: u64,
    }

    /// Registry: kullanıcı adı -> obje ID eşlemesi (Dynamic Fields için)
    public struct NameRegistry has key {
        id: UID,
        name_to_id: Table<String, address>,  // name -> object_id
    }

    // ===== Events =====
    
    public struct ProfileCreated has copy, drop {
        profile_id: address,
        owner: address,
        name: String,
    }

    public struct ProfileUpdated has copy, drop {
        profile_id: address,
        updated_at: u64,
    }

    public struct LinkAdded has copy, drop {
        profile_id: address,
        label: String,
    }

    public struct LinkRemoved has copy, drop {
        profile_id: address,
        label: String,
    }

    // ===== Errors =====
    
    const ENotOwner: u64 = 1;
    const EProfileNotFound: u64 = 2;
    const EInvalidInput: u64 = 3;
    const ENameAlreadyTaken: u64 = 4;

    // ===== Init Fonksiyonları =====
    
    /// Module ilk kez publish edildiğinde çağrılır
    fun init(ctx: &mut TxContext) {
        let registry = NameRegistry {
            id: object::new(ctx),
            name_to_id: table::new(ctx),
        };
        sui::transfer::share_object(registry);
    }

    #[test_only]
    /// Test helper: init'i test içinden çağırmak için
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    // ===== Public Fonksiyonları =====

    /// Yeni bir LinkTree profili oluştur
    public fun create_profile(
        name: String,
        avatar_cid: String,
        bio: String,
        theme: String,
        registry: &mut NameRegistry,
        ctx: &mut TxContext,
    ): address {
        let sender = tx_context::sender(ctx);
        let ts = tx_context::epoch(ctx);

        // Ad zaten alındı mı kontrol et
        assert!(!table::contains(&registry.name_to_id, name), ENameAlreadyTaken);

        let profile = LinkTreeProfile {
            id: object::new(ctx),
            owner: sender,
            name,
            avatar_cid,
            bio,
            links: vector::empty(),
            theme,
            created_at: ts,
            updated_at: ts,
        };

        let profile_id = object::uid_to_address(&profile.id);
        
        // Ad registry'sine ekle
        table::add(&mut registry.name_to_id, name, profile_id);

        // Event emit et
        sui::event::emit(ProfileCreated {
            profile_id,
            owner: sender,
            name,
        });

        // Profili kullanıcıya transfer et
        sui::transfer::transfer(profile, sender);
        
        profile_id
    }

    /// Profili güncelle (sadece owner)
    public fun update_profile(
        profile: &mut LinkTreeProfile,
        new_bio: String,
        new_avatar_cid: String,
        new_theme: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);
        
        profile.bio = new_bio;
        profile.avatar_cid = new_avatar_cid;
        profile.theme = new_theme;
        profile.updated_at = tx_context::epoch(ctx);

        sui::event::emit(ProfileUpdated {
            profile_id: object::uid_to_address(&profile.id),
            updated_at: profile.updated_at,
        });
    }

    /// Profil'e yeni link ekle
    public fun add_link(
        profile: &mut LinkTreeProfile,
        label: String,
        url: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);
        assert!(std::string::length(&label) > 0 && std::string::length(&url) > 0, EInvalidInput);

        let link = Link { label, url };
        vector::push_back(&mut profile.links, link);
        profile.updated_at = tx_context::epoch(ctx);

        sui::event::emit(LinkAdded {
            profile_id: object::uid_to_address(&profile.id),
            label,
        });
    }

    /// Profil'den link sil (label ile)
    public fun remove_link(
        profile: &mut LinkTreeProfile,
        label: String,
        ctx: &mut TxContext,
    ) {
        assert!(profile.owner == tx_context::sender(ctx), ENotOwner);

        let (found, idx) = find_link(&profile.links, label);
        assert!(found, EProfileNotFound);

        let _ = vector::remove(&mut profile.links, idx);
        profile.updated_at = tx_context::epoch(ctx);

        sui::event::emit(LinkRemoved {
            profile_id: object::uid_to_address(&profile.id),
            label,
        });
    }

    // ===== Getter Fonksiyonları (View Functions) =====

    /// Profil bilgilerini oku
    public fun get_profile_info(profile: &LinkTreeProfile): (String, String, String, String, u64) {
        (
            profile.name,
            profile.avatar_cid,
            profile.bio,
            profile.theme,
            profile.updated_at,
        )
    }

    /// Profil'deki tüm linkları oku
    /// Not: Move'da tuple vector döndürmek desteklenmez, bu yüzden Link struct referansları döndürülür
    public fun get_links(profile: &LinkTreeProfile): &vector<Link> {
        &profile.links
    }

    /// Ad'dan profil ID'sini çöz (registry sorgusu)
    public fun resolve_name(registry: &NameRegistry, name: String): Option<address> {
        if (table::contains(&registry.name_to_id, name)) {
            option::some(*table::borrow(&registry.name_to_id, name))
        } else {
            option::none()
        }
    }

    /// Registry'de kaç ad kayıtlı
    public fun registry_size(registry: &NameRegistry): u64 {
        table::length(&registry.name_to_id)
    }

    // ===== Private Fonksiyonları =====

    /// Verilen label ile linki bul (index ve found flag döndür)
    fun find_link(links: &vector<Link>, label: String): (bool, u64) {
        let mut i = 0;
        let mut found = false;
        let mut idx = 0;
        while (i < vector::length(links)) {
            let link = vector::borrow(links, i);
            if (link.label == label) {
                found = true;
                idx = i;
                break
            };
            i = i + 1;
        };
        (found, idx)
    }

    // ===== Test Fonksiyonları (test amaçlı) =====

    #[test_only]
    public fun test_create_profile() {
        // Test kodları buraya yazılabilir
    }
}
