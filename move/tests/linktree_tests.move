#[cfg(test)]
module linktree::linktree_profile_tests {
    use linktree::linktree_profile::{Self, LinkTreeProfile, NameRegistry};
    use sui::test_scenario::{Self, Scenario};
    use std::string;

    #[test]
    fun test_create_profile() {
        let mut scenario = test_scenario::begin(@0x1);
        {
            linktree::linktree_profile::init_for_testing(scenario.ctx());
        };
        
        scenario.next_tx(@0x1);
        {
            let mut registry = scenario.take_shared<NameRegistry>();
            let name = string::utf8(b"testuser");
            let avatar = string::utf8(b"QmExample");
            let bio = string::utf8(b"Test bio");
            let theme = string::utf8(b"dark");
            
            let profile_id = linktree::linktree_profile::create_profile(
                name,
                avatar,
                bio,
                theme,
                &mut registry,
                scenario.ctx()
            );
            
            assert!(profile_id != @0x0);
            
            test_scenario::return_shared(registry);
        };

        scenario.end();
    }

    #[test]
    fun test_add_link() {
        let mut scenario = test_scenario::begin(@0x1);
        {
            linktree::linktree_profile::init_for_testing(scenario.ctx());
        };
        
        scenario.next_tx(@0x1);
        {
            let mut registry = scenario.take_shared<NameRegistry>();
            let name = string::utf8(b"testuser");
            let avatar = string::utf8(b"QmExample");
            let bio = string::utf8(b"Test bio");
            let theme = string::utf8(b"dark");
            
            let _profile_id = linktree::linktree_profile::create_profile(
                name,
                avatar,
                bio,
                theme,
                &mut registry,
                scenario.ctx()
            );
            
            test_scenario::return_shared(registry);
        };

        scenario.next_tx(@0x1);
        {
            let mut profile = scenario.take_from_sender<LinkTreeProfile>();
            
            let label = string::utf8(b"Twitter");
            let url = string::utf8(b"https://twitter.com/testuser");
            
            linktree::linktree_profile::add_link(
                &mut profile,
                label,
                url,
                scenario.ctx()
            );
            
            let links = linktree::linktree_profile::get_links(&profile);
            assert!(std::vector::length(links) == 1);
            
            test_scenario::return_to_sender(&mut scenario, profile);
        };

        scenario.end();
    }
}
