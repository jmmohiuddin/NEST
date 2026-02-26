import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    organization: '',
    skills: [],
    interests: [],
    socialLinks: { linkedin: '', twitter: '', github: '', website: '' },
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        organization: user.organization || '',
        skills: user.skills || [],
        interests: user.interests || [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          twitter: user.socialLinks?.twitter || '',
          github: user.socialLinks?.github || '',
          website: user.socialLinks?.website || '',
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  return (
    <>
      <Helmet>
        <title>Profile - NEEST</title>
      </Helmet>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-display">My Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar & info */}
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-primary-700 font-bold text-2xl">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.email}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="input-field"
                placeholder="Your company or university"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500</p>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-field flex-1"
                placeholder="Add a skill..."
              />
              <button type="button" onClick={addSkill} className="btn-secondary !py-2 !px-4">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="badge-primary flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Social Links</h3>
            <div className="space-y-3">
              {Object.entries(formData.socialLinks).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{key}</label>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, [key]: e.target.value },
                      })
                    }
                    className="input-field"
                    placeholder={`https://${key}.com/username`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfilePage;
