import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import {
  HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUsers,
  HiOutlineFilter, HiOutlineGlobeAlt, HiOutlineClock,
} from 'react-icons/hi';
import { eventsAPI } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const eventTypes = ['Workshop', 'Hackathon', 'Webinar', 'Networking', 'Pitch Competition', 'Conference', 'Bootcamp', 'Meetup', 'Demo Day'];

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    upcoming: searchParams.get('upcoming') || 'true',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.upcoming) params.upcoming = filters.upcoming;

      const res = await eventsAPI.getAll(params);
      setEvents(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.type) params.set('type', filters.type);
    if (filters.upcoming !== 'true') params.set('upcoming', filters.upcoming);
    if (filters.page > 1) params.set('page', filters.page);
    setSearchParams(params, { replace: true });
  }, [filters, fetchEvents, setSearchParams]);

  const typeColors = {
    Workshop: 'bg-green-100 text-green-700',
    Hackathon: 'bg-red-100 text-red-700',
    Webinar: 'bg-green-100 text-green-700',
    Networking: 'bg-green-100 text-green-700',
    'Pitch Competition': 'bg-red-100 text-red-700',
    Conference: 'bg-red-100 text-red-700',
    Bootcamp: 'bg-green-100 text-green-700',
    Meetup: 'bg-red-100 text-red-700',
    'Demo Day': 'bg-red-100 text-red-700',
  };

  return (
    <>
      <Helmet>
        <title>Events - NEST</title>
        <meta name="description" content="Join upcoming events, workshops, hackathons, and networking sessions on NEST." />
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="section-heading">Events</h1>
            <p className="section-subheading">
              Discover workshops, hackathons, webinars, and networking opportunities.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={filters.search}
                onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 1 }))}
                placeholder="Search events..."
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, page: 1 }))}
                      className="input-field"
                    >
                      <option value="">All Types</option>
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Show</label>
                    <select
                      value={filters.upcoming}
                      onChange={(e) => setFilters((f) => ({ ...f, upcoming: e.target.value, page: 1 }))}
                      className="input-field"
                    >
                      <option value="true">Upcoming Only</option>
                      <option value="">All Events</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <Loader size="lg" text="Loading events..." />
          ) : events.length === 0 ? (
            <EmptyState
              icon={HiOutlineCalendar}
              title="No events found"
              description="Check back later for upcoming events."
            />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Showing {events.length} of {pagination.total} events
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Link
                    key={event._id}
                    to={`/events/${event.slug || event._id}`}
                    className="card overflow-hidden group"
                  >
                    {/* Date ribbon */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 flex items-center justify-between">
                      <div className="text-white">
                        <p className="text-xs font-medium opacity-80">
                          {event.startDate ? format(new Date(event.startDate), 'EEEE') : 'TBD'}
                        </p>
                        <p className="text-lg font-bold">
                          {event.startDate ? format(new Date(event.startDate), 'MMM d, yyyy') : 'TBD'}
                        </p>
                      </div>
                      <span className={`badge !text-xs ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>
                        {event.type}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {event.shortDescription && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{event.shortDescription}</p>
                      )}

                      <div className="mt-4 space-y-2">
                        {event.startDate && (
                          <div className="flex items-center text-sm text-gray-500">
                            <HiOutlineClock className="w-4 h-4 mr-2 text-gray-400" />
                            {format(new Date(event.startDate), 'h:mm a')}
                            {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500">
                          {event.venue?.type === 'online' ? (
                            <>
                              <HiOutlineGlobeAlt className="w-4 h-4 mr-2 text-gray-400" />
                              Online Event
                            </>
                          ) : (
                            <>
                              <HiOutlineLocationMarker className="w-4 h-4 mr-2 text-gray-400" />
                              {event.venue?.city || event.venue?.address || 'TBA'}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-400">
                          <HiOutlineUsers className="w-3.5 h-3.5 mr-1" />
                          {event.registrations?.length || 0} registered
                          {event.capacity && ` / ${event.capacity}`}
                        </div>
                        {event.price?.isFree ? (
                          <span className="badge-success !text-xs">Free</span>
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            ₹{event.price?.amount}
                          </span>
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

export default EventsPage;
