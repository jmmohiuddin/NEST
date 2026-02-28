import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineRocketLaunch, HiOutlineAcademicCap } from 'react-icons/hi2';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const AdminApprovals = () => {
  const [pendingStartups, setPendingStartups] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('startups');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await adminAPI.getPendingApprovals();
      const data = res.data.data;
      setPendingStartups(data.startups || []);
      setPendingMentors(data.mentors || []);
    } catch {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleStartupAction = async (id, status) => {
    try {
      await adminAPI.updateStartupStatus(id, { status });
      setPendingStartups((prev) => prev.filter((s) => s._id !== id));
      toast.success(`Startup ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleMentorAction = async (id, status) => {
    try {
      await adminAPI.updateMentorStatus(id, { status });
      setPendingMentors((prev) => prev.filter((m) => m._id !== id));
      toast.success(`Mentor ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Pending Approvals - NEST Admin</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-display">Pending Approvals</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('startups')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'startups' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HiOutlineRocketLaunch className="w-4 h-4" />
            Startups ({pendingStartups.length})
          </button>
          <button
            onClick={() => setTab('mentors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'mentors' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HiOutlineAcademicCap className="w-4 h-4" />
            Mentors ({pendingMentors.length})
          </button>
        </div>

        {tab === 'startups' && (
          <>
            {pendingStartups.length === 0 ? (
              <EmptyState
                icon={HiOutlineRocketLaunch}
                title="No Pending Startups"
                description="All startup applications have been reviewed."
              />
            ) : (
              <div className="space-y-4">
                {pendingStartups.map((startup) => (
                  <div key={startup._id} className="card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg">{startup.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{startup.tagline}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="badge-primary">{startup.industry}</span>
                          <span className="badge-accent">{startup.stage}</span>
                        </div>
                        {startup.founder && (
                          <p className="text-xs text-gray-400 mt-3">
                            Founded by {startup.founder.firstName} {startup.founder.lastName} ·{' '}
                            {startup.createdAt && format(new Date(startup.createdAt), 'MMM dd, yyyy')}
                          </p>
                        )}
                        {startup.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-3">{startup.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleStartupAction(startup._id, 'approved')}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStartupAction(startup._id, 'rejected')}
                          className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          <HiOutlineXCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'mentors' && (
          <>
            {pendingMentors.length === 0 ? (
              <EmptyState
                icon={HiOutlineAcademicCap}
                title="No Pending Mentors"
                description="All mentor applications have been reviewed."
              />
            ) : (
              <div className="space-y-4">
                {pendingMentors.map((mentor) => (
                  <div key={mentor._id} className="card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {mentor.user?.firstName} {mentor.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {mentor.title} {mentor.company ? `at ${mentor.company}` : ''}
                        </p>
                        <p className="text-sm text-gray-500">{mentor.experience} years of experience</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {mentor.specializations?.slice(0, 4).map((s) => (
                            <span key={s} className="badge-primary">{s}</span>
                          ))}
                        </div>
                        {mentor.expertise && mentor.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mentor.expertise.slice(0, 5).map((e) => (
                              <span key={e} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleMentorAction(mentor._id, 'approved')}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleMentorAction(mentor._id, 'rejected')}
                          className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          <HiOutlineXCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AdminApprovals;
