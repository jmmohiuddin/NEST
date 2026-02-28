import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineLocationMarker, HiOutlineEye, HiOutlineFilter, HiOutlineBriefcase } from 'react-icons/hi';
import { startupsAPI } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const industries = ['Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture', 'E-Commerce', 'SaaS', 'AI/ML', 'IoT', 'CleanTech', 'FoodTech', 'Social Impact'];
const stages = ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'];

const StartupDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    industry: searchParams.get('industry') || '',
    stage: searchParams.get('stage') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchStartups = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.industry) params.industry = filters.industry;
      if (filters.stage) params.stage = filters.stage;
      params.page = filters.page;
      params.limit = 12;

      const res = await startupsAPI.getAll(params);
      setStartups(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching startups:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStartups();
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.page > 1) params.set('page', filters.page);
    setSearchParams(params, { replace: true });
  }, [filters, fetchStartups, setSearchParams]);

  const stageColors = {
    Idea: 'bg-green-100 text-green-700',
    MVP: 'bg-red-100 text-red-700',
    'Early Traction': 'bg-green-100 text-green-700',
    Growth: 'bg-red-100 text-red-700',
    Scale: 'bg-green-100 text-green-700',
  };

  return (
    <>
      <Helmet>
        <title>Startup Directory - NEST</title>
        <meta name="description" content="Discover innovative startups across industries on NEST." />
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="section-heading">Startup Directory</h1>
            <p className="section-subheading">
              Explore innovative startups and connect with founders building the future.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={filters.search}
                onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 1 }))}
                placeholder="Search startups by name, industry, or tags..."
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value, page: 1 }))}
                      className="input-field"
                    >
                      <option value="">All Industries</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                    <select
                      value={filters.stage}
                      onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value, page: 1 }))}
                      className="input-field"
                    >
                      <option value="">All Stages</option>
                      {stages.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setFilters({ search: '', industry: '', stage: '', page: 1 })}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <Loader size="lg" text="Loading startups..." />
          ) : startups.length === 0 ? (
            <EmptyState
              icon={HiOutlineBriefcase}
              title="No startups found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Showing {startups.length} of {pagination.total} startups
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map((startup) => (
                  <Link
                    key={startup._id}
                    to={`/startups/${startup.slug || startup._id}`}
                    className="card overflow-hidden group"
                  >
                    {/* Card header gradient */}
                    <div className="h-2 bg-gradient-to-r from-primary-500 to-accent-500" />

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-bold text-lg">
                            {startup.name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                            {startup.name}
                          </h3>
                          <p className="text-sm text-gray-500">{startup.industry}</p>
                        </div>
                      </div>

                      {startup.tagline && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{startup.tagline}</p>
                      )}

                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className={`badge ${stageColors[startup.stage] || 'bg-gray-100 text-gray-700'}`}>
                          {startup.stage}
                        </span>
                        {startup.location?.city && (
                          <span className="badge bg-gray-100 text-gray-600">
                            <HiOutlineLocationMarker className="w-3 h-3 mr-1" />
                            {startup.location.city}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          {startup.views || 0} views
                        </span>
                        {startup.teamSize && (
                          <span>{startup.teamSize} team member{startup.teamSize > 1 ? 's' : ''}</span>
                        )}
                      </div>
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

export default StartupDirectory;
