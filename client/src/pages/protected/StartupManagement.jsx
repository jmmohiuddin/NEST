import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { startupsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const industries = [
  'Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture',
  'E-commerce', 'Social Impact', 'Manufacturing', 'Energy', 'Real Estate',
  'Transportation', 'Food & Beverage', 'Other',
];

const stages = ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'];

const StartupManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    industry: 'Technology',
    stage: 'Idea',
    location: { city: '', state: '', country: 'India' },
    website: '',
    lookingFor: [],
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');

  useEffect(() => {
    fetchMyStartup();
  }, []);

  const fetchMyStartup = async () => {
    try {
      const res = await startupsAPI.getMine();
      if (res.data.data) {
        const s = res.data.data;
        setExisting(s);
        setFormData({
          name: s.name || '',
          tagline: s.tagline || '',
          description: s.description || '',
          industry: s.industry || 'Technology',
          stage: s.stage || 'Idea',
          location: { city: s.location?.city || '', state: s.location?.state || '', country: s.location?.country || 'India' },
          website: s.website || '',
          lookingFor: s.lookingFor || [],
          tags: s.tags || [],
        });
      }
    } catch {
      // No existing startup — that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing) {
        await startupsAPI.update(existing._id, formData);
        toast.success('Startup updated!');
      } else {
        await startupsAPI.create(formData);
        toast.success('Startup created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const addLookingFor = () => {
    if (lookingForInput.trim() && !formData.lookingFor.includes(lookingForInput.trim())) {
      setFormData((prev) => ({ ...prev, lookingFor: [...prev.lookingFor, lookingForInput.trim()] }));
      setLookingForInput('');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>{existing ? 'Edit Startup' : 'Register Startup'} - NEST</title>
      </Helmet>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-display">
          {existing ? 'Edit Your Startup' : 'Register Your Startup'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
                placeholder="e.g., AgroTech Solutions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="input-field"
                required
                maxLength={120}
                placeholder="One line about what you do"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={5}
                required
                placeholder="Describe your startup's vision, product, and target market..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                >
                  {industries.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="input-field"
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="input-field"
                placeholder="https://yourstartup.com"
              />
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Location</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input-field flex-1"
                placeholder="e.g., AI, SaaS..."
              />
              <button type="button" onClick={addTag} className="btn-secondary !py-2 !px-4">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((t) => (
                <span key={t} className="badge-primary flex items-center gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, tags: prev.tags.filter((x) => x !== t) }))}
                    className="text-primary-500 hover:text-primary-700"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Looking For</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={lookingForInput}
                onChange={(e) => setLookingForInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLookingFor())}
                className="input-field flex-1"
                placeholder="e.g., Co-founder, Funding..."
              />
              <button type="button" onClick={addLookingFor} className="btn-secondary !py-2 !px-4">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.lookingFor.map((l) => (
                <span key={l} className="badge-accent flex items-center gap-1">
                  {l}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, lookingFor: prev.lookingFor.filter((x) => x !== l) }))
                    }
                    className="text-accent-500 hover:text-accent-700"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : existing ? 'Update Startup' : 'Register Startup'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default StartupManagement;
