import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineStar, HiOutlineFilter, HiOutlineAcademicCap, HiOutlineClock } from 'react-icons/hi';
import { mentorsAPI } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const specializations = [
  'Business Strategy', 'Product Development', 'Marketing', 'Sales',
  'Fundraising', 'Technology', 'Operations', 'Legal', 'Finance', 'HR', 'Design', 'Growth Hacking',
];

const MentorDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specialization: searchParams.get('specialization') || '',
    availability: searchParams.get('availability') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.availability) params.availability = filters.availability;

      const res = await mentorsAPI.getAll(params);
      setMentors(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMentors();
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.specialization) params.set('specialization', filters.specialization);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.page > 1) params.set('page', filters.page);
    setSearchParams(params, { replace: true });
  }, [filters, fetchMentors, setSearchParams]);

  const availabilityColors = {
    available: 'bg-green-100 text-green-700',
    busy: 'bg-red-100 text-red-700',
    unavailable: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <Helmet>
        <title>Mentor Directory - NEST</title>
        <meta name="description" content="Find expert mentors to guide your entrepreneurial journey on NEST." />
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="section-heading">Mentor Directory</h1>
            <p className="section-subheading">
              Connect with experienced professionals who can guide your startup journey.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={filters.search}
                onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 1 }))}
                placeholder="Search mentors by name, expertise..."
                className="flex-1"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary !py-2.5 ${showFilters ? '!bg-primary-50 !text-primary-700' : ''}`}
              >
                <HiOutlineFilter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 animate-slide-down">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <select
                      value={filters.specialization}
                      onChange={(e) => setFilters((f) => ({ ...f, specialization: e.target.value, page: 1 }))}
                      className="input-field"
                    >
                      <option value="">All Specializations</option>
                      {specializations.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value, page: 1 }))}
                      className="input-field"
                    >
                      <option value="">All</option>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setFilters({ search: '', specialization: '', availability: '', page: 1 })}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <Loader size="lg" text="Loading mentors..." />
          ) : mentors.length === 0 ? (
            <EmptyState
              icon={HiOutlineAcademicCap}
              title="No mentors found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Showing {mentors.length} of {pagination.total} mentors
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <Link
                    key={mentor._id}
                    to={`/mentors/${mentor._id}`}
                    className="card p-6 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-bold text-lg">
                          {mentor.user?.firstName?.[0]}{mentor.user?.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {mentor.user?.firstName} {mentor.user?.lastName}
                        </h3>
                        {mentor.title && (
                          <p className="text-sm text-gray-500 truncate">{mentor.title}</p>
                        )}
                        {mentor.company?.name && (
                          <p className="text-xs text-gray-400">{mentor.company.position} at {mentor.company.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <HiOutlineStar className="w-4 h-4 text-green-500 fill-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {mentor.ratings?.average?.toFixed(1) || 'New'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        ({mentor.ratings?.count || 0} reviews)
                      </span>
                      <span
                        className={`ml-auto badge ${
                          availabilityColors[mentor.availability?.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {mentor.availability?.status || 'N/A'}
                      </span>
                    </div>

                    {/* Specializations */}
                    {mentor.specializations?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {mentor.specializations.slice(0, 3).map((spec) => (
                          <span key={spec} className="badge bg-gray-100 text-gray-600 !text-xs">
                            {spec}
                          </span>
                        ))}
                        {mentor.specializations.length > 3 && (
                          <span className="badge bg-gray-100 text-gray-600 !text-xs">
                            +{mentor.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs text-gray-400">
                      <HiOutlineClock className="w-3.5 h-3.5 mr-1" />
                      {mentor.experience?.years || 0}+ years experience
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MentorDirectory;
