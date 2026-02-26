import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { mentorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const specializations = [
  'Business Strategy', 'Product Development', 'Marketing', 'Finance',
  'Technology', 'Legal', 'HR', 'Operations', 'Sales', 'Design',
  'Data Science', 'Sustainability',
];

const MentorProfileManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    experience: 0,
    expertise: [],
    specializations: [],
    industries: [],
    availability: {
      status: 'available',
      hoursPerWeek: 5,
      preferredDays: [],
      timezone: 'Asia/Kolkata',
    },
    bio: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      const res = await mentorsAPI.getMyProfile();
      if (res.data.data) {
        const m = res.data.data;
        setExisting(m);
        setFormData({
          title: m.title || '',
          company: m.company || '',
          experience: m.experience || 0,
          expertise: m.expertise || [],
          specializations: m.specializations || [],
          industries: m.industries || [],
          availability: {
            status: m.availability?.status || 'available',
            hoursPerWeek: m.availability?.hoursPerWeek || 5,
            preferredDays: m.availability?.preferredDays || [],
            timezone: m.availability?.timezone || 'Asia/Kolkata',
          },
          bio: m.bio || '',
        });
      }
    } catch {
      // No profile yet
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing) {
        await mentorsAPI.updateProfile(formData);
        toast.success('Mentor profile updated!');
      } else {
        await mentorsAPI.createProfile(formData);
        toast.success('Mentor profile created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialization = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        preferredDays: prev.availability.preferredDays.includes(day)
          ? prev.availability.preferredDays.filter((d) => d !== day)
          : [...prev.availability.preferredDays, day],
      },
    }));
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData((prev) => ({ ...prev, expertise: [...prev.expertise, expertiseInput.trim()] }));
      setExpertiseInput('');
    }
  };

  const addIndustry = () => {
    if (industryInput.trim() && !formData.industries.includes(industryInput.trim())) {
      setFormData((prev) => ({ ...prev, industries: [...prev.industries, industryInput.trim()] }));
      setIndustryInput('');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>{existing ? 'Edit Mentor Profile' : 'Create Mentor Profile'} - NEEST</title>
      </Helmet>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-display">
          {existing ? 'Edit Mentor Profile' : 'Create Mentor Profile'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
                placeholder="e.g., Senior Product Manager"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field"
                  placeholder="Your company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
                <input
                  type="number"
                  min={0}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                rows={4}
                maxLength={500}
                placeholder="Tell startups about your mentoring approach..."
              />
            </div>
          </div>

          {/* Specializations */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.specializations.includes(spec)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Expertise (custom skills)</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                className="input-field flex-1"
                placeholder="e.g., React, Machine Learning..."
              />
              <button type="button" onClick={addExpertise} className="btn-secondary !py-2 !px-4">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.expertise.map((item) => (
                <span key={item} className="badge-primary flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, expertise: p.expertise.filter((x) => x !== item) }))}
                    className="text-primary-500 hover:text-primary-700"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Industries</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                className="input-field flex-1"
                placeholder="e.g., EdTech, HealthTech..."
              />
              <button type="button" onClick={addIndustry} className="btn-secondary !py-2 !px-4">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.industries.map((item) => (
                <span key={item} className="badge-accent flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, industries: p.industries.filter((x) => x !== item) }))}
                    className="text-accent-500 hover:text-accent-700"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Availability</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={formData.availability.status}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: { ...formData.availability, status: e.target.value } })
                  }
                  className="input-field"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hours per week</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={formData.availability.hoursPerWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availability: { ...formData.availability, hoursPerWeek: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Preferred Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.availability.preferredDays.includes(day)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : existing ? 'Update Profile' : 'Create Profile'}
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

export default MentorProfileManagement;
