import { useState, useEffect } from 'react'
import './ViewProfile.css'
import { useSuiClient } from '@mysten/dapp-kit'

interface ViewProfileProps {
  profileId: string
}

interface Link {
  label: string
  url: string
}

interface ProfileData {
  name: string
  avatar_cid: string
  bio: string
  theme: string
  updated_at: number
  links: Link[]
}

export function ViewProfile({ profileId }: ViewProfileProps) {
  const suiClient = useSuiClient()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching profile:', profileId)
        
        // Fetch object from Sui
        const object = await suiClient.getObject({
          id: profileId,
          options: {
            showContent: true,
            showOwner: true,
          },
        })

        console.log('Raw object response:', object)

        if (!object.data) {
          throw new Error('Profile not found')
        }

        const content = object.data.content as any
        console.log('Content:', content)
        
        if (content?.dataType !== 'moveObject') {
          throw new Error('Invalid object type')
        }

        const fields = content.fields
        console.log('Fields:', fields)
        console.log('Raw links data:', fields.links)
        
        // Parse links - Sui returns vector as array of objects
        let parsedLinks: Link[] = []
        if (fields.links && Array.isArray(fields.links)) {
          parsedLinks = fields.links.map((link: any) => ({
            label: link.label || link.fields?.label || '',
            url: link.url || link.fields?.url || '',
          }))
        }
        
        console.log('Parsed links:', parsedLinks)
        
        setProfile({
          name: fields.name,
          avatar_cid: fields.avatar_cid,
          bio: fields.bio,
          theme: fields.theme,
          updated_at: parseInt(fields.updated_at),
          links: parsedLinks,
        })
        
        console.log('Profile set successfully')
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (profileId) {
      fetchProfile()
    }
  }, [profileId, suiClient])

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="profile-empty">Profile not found</div>;
  }

  return (
    <div className="view-profile-container">
      <div className="profile-header">
        {profile.avatar_cid && (
          <div className="profile-avatar">
            <img src={`https://ipfs.io/ipfs/${profile.avatar_cid}`} alt={profile.name} />
          </div>
        )}
        <h1>{profile.name}</h1>
        <p className="profile-bio">{profile.bio}</p>
        <p className="profile-meta">Theme: {profile.theme}</p>
      </div>

      <div className="links-container">
        {profile.links && profile.links.length > 0 ? (
          <>
            <h2>Links</h2>
            <div className="links-grid">
              {profile.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <span className="link-label">{link.label}</span>
                  <span className="link-arrow">→</span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <p className="no-links">No links added yet</p>
        )}
      </div>

      <div className="profile-info">
        <p>Profile ID: <code>{profileId}</code></p>
        <p>Last Updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
