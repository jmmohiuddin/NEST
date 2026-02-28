import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HiOutlineCalendarDays, HiOutlineMapPin, HiOutlineClock, HiOutlineXMark } from 'react-icons/hi2';
import { eventsAPI } from '../../services/api';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getMyRegistered();
      setEvents(res.data.data || []);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const cancelRegistration = async (eventId) => {
    if (!window.confirm('Cancel registration for this event?')) return;
    try {
      await eventsAPI.cancelRegistration(eventId);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success('Registration cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const upcoming = events.filter((e) => !isPast(new Date(e.startDate)));
  const past = events.filter((e) => isPast(new Date(e.startDate)));
  const displayed = tab === 'upcoming' ? upcoming : past;

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>My Events - NEST</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-display">My Events</h1>

        <div className="flex gap-2 mb-6">
          {['upcoming', 'past'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <EmptyState
            icon={HiOutlineCalendarDays}
            title={tab === 'upcoming' ? 'No Upcoming Events' : 'No Past Events'}
            description={
              tab === 'upcoming'
                ? "You haven't registered for any upcoming events yet."
                : "You don't have any past events."
            }
            actionLabel="Browse Events"
            actionLink="/events"
          />
        ) : (
          <div className="space-y-4">
            {displayed.map((event) => (
              <div key={event._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/events/${event._id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {event.title}
                  </Link>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <HiOutlineCalendarDays className="w-4 h-4" />
                      {format(new Date(event.startDate), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="w-4 h-4" />
                      {format(new Date(event.startDate), 'h:mm a')}
                    </span>
                    {event.venue?.type && (
                      <span className="flex items-center gap-1">
                        <HiOutlineMapPin className="w-4 h-4" />
                        {event.venue.type === 'online' ? 'Online' : event.venue.address || 'In Person'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      event.type === 'workshop'
                        ? 'bg-green-100 text-green-700'
                        : event.type === 'hackathon'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {event.type}
                  </span>
                </div>
                {tab === 'upcoming' && (
                  <button
                    onClick={() => cancelRegistration(event._id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors shrink-0"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyEventsPage;
