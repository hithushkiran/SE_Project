import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { categoryService } from '../services/categoryService';
import { UpdateProfileRequest, Category } from '../types/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: '',
    affiliation: '',
    bio: '',
    website: '',
    avatarUrl: '',
    categoryIds: []
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || '',
        affiliation: user.affiliation || '',
        bio: user.bio || '',
        website: user.website || '',
        avatarUrl: user.avatarUrl || '',
        categoryIds: []
      });

      // Fetch categories and user interests
      const fetchData = async () => {
        try {
          const [categoriesData, interestsData] = await Promise.all([
            categoryService.getAllCategories(),
            authService.getInterests()
          ]);
          setCategories(categoriesData);
          const interestIds = interestsData.map(interest => interest.id);
          setUserInterests(interestIds);
          setFormData(prev => ({ ...prev, categoryIds: interestIds }));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update profile information (without categoryIds)
      const profileData = {
        fullName: formData.fullName,
        affiliation: formData.affiliation,
        bio: formData.bio,
        website: formData.website,
        avatarUrl: formData.avatarUrl
      };
      await authService.updateProfile(profileData);
      
      // Update interests separately
      if (formData.categoryIds) {
        await authService.updateInterests(formData.categoryIds);
      }
      
      // Update user context with new data
      if (user) {
        updateUser({ ...user, ...profileData });
      }
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const categoryIds = prev.categoryIds || [];
      const newCategoryIds = categoryIds.includes(categoryId)
        ? categoryIds.filter(id => id !== categoryId)
        : [...categoryIds, categoryId];
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="input-row">
            <label htmlFor="affiliation">Affiliation</label>
            <input
              id="affiliation"
              name="affiliation"
              type="text"
              value={formData.affiliation}
              onChange={handleChange}
              placeholder="University or Company"
            />
          </div>

          <div className="input-row">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className="input-row">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="input-row">
            <label htmlFor="avatarUrl">Avatar URL</label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="input-row">
            <label>Research Interests</label>
            <div className="category-selection">
              {categories.length === 0 ? (
                <p className="no-categories">Loading categories...</p>
              ) : (
                <div className="category-chips">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`category-chip ${(formData.categoryIds || []).includes(category.id) ? 'selected' : ''}`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}>
              Select your research interests to get personalized recommendations
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="modal-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;