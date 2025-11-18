import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PaperGrid from '../components/explore/PaperGrid';
import { PaperResponse } from '../types/explore';
import { UserProfile } from '../types/userProfile';
import { userProfileService } from '../services/userProfileService';
import './UserProfilePage.css';

const PAGE_SIZE = 12;

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [papers, setPapers] = useState<PaperResponse[]>([]);
  const [papersLoading, setPapersLoading] = useState(false);
  const [papersError, setPapersError] = useState<string | null>(null);
  const [hasMorePapers, setHasMorePapers] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfileError('Profile not found');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await userProfileService.getProfile(userId);
      setProfile(data);
    } catch (error: any) {
      const message =
        error?.response?.status === 404
          ? 'Profile not found'
          : error?.response?.data?.message || 'Unable to load profile. Please try again.';
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  }, [userId]);

  const loadPapers = useCallback(
    async (pageToLoad = 0, replace = false) => {
      if (!userId) {
        return;
      }

      setPapersLoading(true);
      setPapersError(null);

      try {
        const response = await userProfileService.getUserPapers(userId, pageToLoad, PAGE_SIZE);
        const nextContent = response.content ?? [];
        setPapers((prev) => (replace ? nextContent : [...prev, ...nextContent]));
        setHasMorePapers(!response.last);
        setCurrentPage(response.pageable?.pageNumber ?? pageToLoad);
      } catch (error: any) {
        const message =
          error?.response?.status === 404
            ? 'Profile not found'
            : error?.response?.data?.message ||
              'Unable to load this author’s publications. Please try again.';
        setPapersError(message);
      } finally {
        setPapersLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    setPapers([]);
    setHasMorePapers(false);
    setCurrentPage(0);
    loadPapers(0, true);
  }, [userId, loadPapers]);

  const handleLoadMore = () => {
    if (papersLoading || !hasMorePapers) {
      return;
    }
    const nextPage = currentPage + 1;
    loadPapers(nextPage, false);
  };

  if (profileLoading) {
    return (
      <div className="user-profile-page loading">
        <div className="loading-spinner large"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="user-profile-page">
        <div className="profile-error-card">
          <h2>{profileError || 'Profile not found'}</h2>
          <p>The profile you’re looking for doesn’t exist or is no longer available.</p>
          <button className="primary" onClick={() => navigate('/explore')}>
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span aria-hidden="true">&larr;</span> Back
        </button>
        <div className="profile-header-content">
          <div className="profile-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName || 'Researcher avatar'} />
            ) : (
              <span>{profile.fullName?.charAt(0).toUpperCase() || 'R'}</span>
            )}
          </div>
          <div className="profile-header-text">
            <h1>{profile.fullName || 'Researcher'}</h1>
            <p className="profile-affiliation">{profile.affiliation || 'Independent Researcher'}</p>
            {profile.maskedEmail && (
              <p className="profile-contact">�Y"� {profile.maskedEmail}</p>
            )}
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{profile.totalPapers}</span>
                <span className="stat-label">Papers Published</span>
              </div>
              <div className="stat">
                <span className="stat-value">{profile.totalViews.toLocaleString()}</span>
                <span className="stat-label">Total Views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-body">
        {profile.bio && (
          <div className="profile-section">
            <h3>About</h3>
            <p>{profile.bio}</p>
          </div>
        )}

        <div className="profile-section">
          <h3>Research Interests</h3>
          {profile.interests && profile.interests.length > 0 ? (
            <div className="interest-chips">
              {profile.interests.map((interest) => (
                <span key={interest.id} className="interest-chip">
                  {interest.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="empty-text">This researcher hasn’t shared any interests yet.</p>
          )}
        </div>

        {profile.website && (
          <div className="profile-section">
            <h3>Website</h3>
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              {profile.website}
            </a>
          </div>
        )}
      </div>

      <div className="profile-papers-section">
        <PaperGrid
          papers={papers}
          loading={papersLoading}
          error={papersError}
          hasMore={hasMorePapers}
          onLoadMore={handleLoadMore}
          isSearching={false}
          title="Published Papers"
          emptyTitle="No publications yet"
          emptyMessage="This author hasn't published any papers yet."
        />
      </div>
    </div>
  );
};

export default UserProfilePage;
