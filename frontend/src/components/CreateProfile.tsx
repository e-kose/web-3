import React, { useState } from 'react'
import './CreateProfile.css'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID
const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID

interface CreateProfileProps {
  onProfileCreated?: (profileId: string) => void
}

export function CreateProfile({ onProfileCreated }: CreateProfileProps) {
  const account = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const suiClient = useSuiClient()
  
  const [formData, setFormData] = useState({
    name: '',
    avatarCid: '',
    bio: '',
    theme: 'dark',
  })
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([])
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLink = () => {
    if (newLink.label && newLink.url) {
      console.log('Adding link:', newLink)
      setLinks(prev => {
        const updated = [...prev, newLink]
        console.log('Updated links:', updated)
        return updated
      })
      setNewLink({ label: '', url: '' })
      setError(null)
    } else {
      setError('Please fill in both label and URL')
    }
  }

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!account) {
        throw new Error('Please connect your wallet first')
      }

      if (!formData.name || !formData.bio) {
        throw new Error('Please fill in all required fields')
      }

      if (!PACKAGE_ID || !REGISTRY_ID) {
        throw new Error('Contract not configured. Check .env file')
      }

      console.log('=== CREATING PROFILE ===')
      console.log('Form data:', formData)
      console.log('Links to add:', links)
      console.log('Links count:', links.length)

      // Create transaction
      const tx = new Transaction()
      
      // Call create_profile (arguments must match Move function signature)
      tx.moveCall({
        target: `${PACKAGE_ID}::linktree_profile::create_profile`,
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.string(formData.avatarCid || ''),
          tx.pure.string(formData.bio),
          tx.pure.string(formData.theme),
          tx.object(REGISTRY_ID),
        ],
      })

      // Execute transaction
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result: any) => {
            console.log('=== TRANSACTION SUCCESS ===')
            console.log('Full result:', result)
            console.log('Result digest:', result.digest)
            
            // Get transaction details with parsed effects
            const txResult = await suiClient.waitForTransaction({
              digest: result.digest,
              options: {
                showEffects: true,
                showObjectChanges: true,
              },
            })
            
            console.log('Transaction details:', txResult)
            console.log('Object changes:', txResult.objectChanges)
            
            // Find the created profile object
            const createdObjects = txResult.objectChanges?.filter(
              (change: any) => change.type === 'created'
            ) || []
            
            console.log('Created objects:', createdObjects)
            
            const profileObject = createdObjects.find(
              (obj: any) => obj.objectType?.includes('LinkTreeProfile')
            )
            
            console.log('Profile object found:', profileObject)
            
            if (profileObject && 'objectId' in profileObject) {
              const profileId = (profileObject as any).objectId
              console.log('Profile ID extracted:', profileId)
              setSuccess(`✅ Profile created successfully!\n\n📋 Profile ID:\n${profileId}\n\nYou can now view your profile!`)
              
              // Add links if any
              if (links.length > 0) {
                await addLinksToProfile(profileId)
              }
              
              if (onProfileCreated) {
                setTimeout(() => onProfileCreated(profileId), 2000)
              }

              // Reset form
              setFormData({ name: '', avatarCid: '', bio: '', theme: 'dark' })
              setLinks([])
            } else {
              setSuccess('Profile created successfully!')
            }
          },
          onError: (error) => {
            console.error('Transaction failed:', error)
            setError(`Failed to create profile: ${error.message}`)
          },
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const addLinksToProfile = async (profileId: string) => {
    for (const link of links) {
      try {
        const tx = new Transaction()
        tx.moveCall({
          target: `${PACKAGE_ID}::linktree_profile::add_link`,
          arguments: [
            tx.object(profileId),
            tx.pure.string(link.label),
            tx.pure.string(link.url),
          ],
        })
        
        await new Promise<void>((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          )
        })
      } catch (err) {
        console.error('Failed to add link:', link, err)
      }
    }
  }

  return (
    <div className="create-profile-container">
      <h2>Create Your LinkTree Profile</h2>
      
      <form onSubmit={handleSubmit} className="profile-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="name">Profile Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="avatarCid">Avatar CID (IPFS)</label>
          <input
            type="text"
            id="avatarCid"
            name="avatarCid"
            value={formData.avatarCid}
            onChange={handleInputChange}
            placeholder="QmExample..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio *</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleInputChange}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="links-section">
          <h3>Add Links</h3>
          
          <div className="add-link-form">
            <input
              type="text"
              placeholder="Label (e.g., Twitter)"
              value={newLink.label}
              onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
            />
            <input
              type="url"
              placeholder="URL (e.g., https://twitter.com/...)"
              value={newLink.url}
              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
            />
            <button type="button" onClick={handleAddLink} className="add-btn">
              Add Link
            </button>
          </div>

          {links.length > 0 && (
            <div className="links-list">
              <h4>Added Links ({links.length})</h4>
              {links.map((link, index) => (
                <div key={index} className="link-item">
                  <div className="link-info">
                    <strong>{link.label}</strong>
                    <p>{link.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
