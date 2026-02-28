import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineLightBulb,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlineTrendingUp,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineBriefcase,
  HiOutlineColorSwatch,
  HiOutlineOfficeBuilding,
  HiOutlineChatAlt2,
  HiOutlineCash,
  HiOutlineSparkles,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { startupsAPI, mentorsAPI, eventsAPI } from '../../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const HomePage = () => {
  const [stats, setStats] = useState({ startups: 0, mentors: 0, events: 0 });
  const [featuredStartups, setFeaturedStartups] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const autoplayRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [startupRes, mentorRes, eventRes, connectedRes] = await Promise.allSettled([
          startupsAPI.getAll({ limit: 4, featured: 'true' }),
          mentorsAPI.getAll({ limit: 4, featured: 'true' }),
          eventsAPI.getAll({ limit: 3, upcoming: 'true' }),
          startupsAPI.getAll({ limit: 20 }),
        ]);

        if (startupRes.status === 'fulfilled') {
          setFeaturedStartups(startupRes.value.data.data);
          setStats((s) => ({ ...s, startups: startupRes.value.data.pagination?.total || 0 }));
        }
        if (mentorRes.status === 'fulfilled') {
          setFeaturedMentors(mentorRes.value.data.data);
          setStats((s) => ({ ...s, mentors: mentorRes.value.data.pagination?.total || 0 }));
        }
        if (eventRes.status === 'fulfilled') {
          setStats((s) => ({ ...s, events: eventRes.value.data.pagination?.total || 0 }));
        }
        if (connectedRes.status === 'fulfilled') {
          setConnectedStartups(connectedRes.value.data.data || []);
        }
      } catch (err) {
        // Silent fail - show defaults
      }
    };
    loadData();
  }, []);

  // Carousel: items per page based on screen (we'll use 4 for lg, handled via CSS)
  const itemsPerPage = 4;
  const totalPages = Math.ceil(connectedStartups.length / itemsPerPage);

  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % (totalPages || 1));
  }, [totalPages]);

  const prevSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev - 1 + (totalPages || 1)) % (totalPages || 1));
  }, [totalPages]);

  // Autoplay
  useEffect(() => {
    if (connectedStartups.length <= itemsPerPage || isPaused) return;
    autoplayRef.current = setInterval(nextSlide, 4000);
    return () => clearInterval(autoplayRef.current);
  }, [connectedStartups.length, isPaused, nextSlide]);

  const features = [
    {
      icon: HiOutlineLightBulb,
      title: 'Startup Directory',
      description: 'Discover innovative startups across industries. Connect, collaborate, and grow together.',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      icon: HiOutlineAcademicCap,
      title: 'Expert Mentorship',
      description: 'Connect with experienced mentors who guide you through every stage of your journey.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: HiOutlineCalendar,
      title: 'Events & Workshops',
      description: 'Join hackathons, pitch competitions, webinars, and networking events.',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      icon: HiOutlineUserGroup,
      title: 'Community Network',
      description: 'Build meaningful connections with students, founders, and industry experts.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: HiOutlineTrendingUp,
      title: 'Funding Access',
      description: 'Apply for grants, seed funding, and connect with investors for your venture.',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      icon: HiOutlineGlobe,
      title: 'Resource Booking',
      description: 'Book meeting rooms, labs, workspaces, and equipment for your team.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <>
      <Helmet>
        <title>NEST - Empowering India's Startup Ecosystem</title>
        <meta name="description" content="NEST connects students, startups, mentors, and investors to build India's next generation of entrepreneurs." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20">
                <HiOutlineShieldCheck className="w-4 h-4 mr-2" />
                India's Premier Startup Ecosystem Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight text-white drop-shadow-lg"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              North Eastern{' '}
              <span className="text-yellow-400">Science and Technology</span>{' '}
              (NEST) Cluster
            </motion.h1>

            <motion.p
              className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed drop-shadow"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Empowering research, innovation, and entrepreneurship across the North Eastern region.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Link to="/register" className="btn-primary text-lg !px-8 !py-4 shadow-lg">
                Get Started Free
                <HiOutlineArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/startups" className="text-lg !px-8 !py-4 inline-flex items-center justify-center font-semibold rounded-xl border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200">
                Explore Startups
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
            >
              {[
                { label: 'Startups', value: stats.startups || '500+' },
                { label: 'Mentors', value: stats.mentors || '200+' },
                { label: 'Events', value: stats.events || '100+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl md:text-4xl font-bold font-display text-white drop-shadow-lg">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() + '+' : stat.value}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display text-gray-900">
              What We Offer
            </h2>
            <div className="mt-4 w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full" />
          </motion.div>

          {/* Circular layout for desktop, grid for mobile */}
          <div className="hidden lg:block relative" style={{ height: '650px' }}>
            {/* Center Japi image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-red-100">
              <img
                src="/what%20we%20offer%20section%20image.jpeg"
                alt="Japi - Traditional Assamese Hat"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Subtle ring around center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-2 border-red-100/50" />
            {/* Outer orbit ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-dashed border-gray-200" />

            {/* Offer items positioned in a circle */}
            {[
              { icon: HiOutlineCurrencyDollar, title: 'VC Network', desc: 'Access to VCs and angel investors for scaled funding.', angle: 270 },
              { icon: HiOutlineBriefcase, title: 'Internships / Jobs', desc: 'Startups pursue innovative ideas while ensuring job and wealth creation.', angle: 315 },
              { icon: HiOutlineAcademicCap, title: 'Mentorship', desc: 'One-on-one mentorship by world class mentors from India, Silicon Valley and Singapore.', angle: 0 },
              { icon: HiOutlineUserGroup, title: 'Partnered Services', desc: 'Avail discounts from a host of partners for accounting, legal etc.', angle: 45 },
              { icon: HiOutlineCash, title: 'Funding', desc: 'Upto INR 25 Lakhs per startup. We encourage giving the jump start to any idea we believe in.', angle: 90 },
              { icon: HiOutlineChatAlt2, title: 'Consulting', desc: 'Partnered with many corporate houses to help in pilots by the startups.', angle: 135 },
              { icon: HiOutlineOfficeBuilding, title: 'Co-working', desc: 'Incubation & co-working space with state of the art labs and environment to innovate.', angle: 180 },
              { icon: HiOutlineColorSwatch, title: 'Branding', desc: 'We support every startup we believe in, to make the most out of our resources.', angle: 225 },
            ].map((item, index) => {
              const radius = 280;
              const rad = (item.angle * Math.PI) / 180;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="absolute w-52 text-center group"
                  style={{
                    top: `calc(50% + ${y}px - 55px)`,
                    left: `calc(50% + ${x}px - 104px)`,
                  }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={index}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-3 group-hover:bg-red-100 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <Icon className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile/Tablet grid layout */}
          <div className="lg:hidden">
            {/* Japi image centered on mobile */}
            <div className="w-40 h-40 mx-auto mb-10 rounded-full overflow-hidden shadow-xl border-4 border-red-100">
              <img
                src="/what%20we%20offer%20section%20image.jpeg"
                alt="Japi - Traditional Assamese Hat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: HiOutlineCurrencyDollar, title: 'VC Network', desc: 'Access to VCs and angel investors for scaled funding.' },
                { icon: HiOutlineBriefcase, title: 'Internships / Jobs', desc: 'Startups pursue innovative ideas while ensuring job and wealth creation.' },
                { icon: HiOutlineAcademicCap, title: 'Mentorship', desc: 'One-on-one mentorship by world class mentors from India, Silicon Valley and Singapore.' },
                { icon: HiOutlineUserGroup, title: 'Partnered Services', desc: 'Avail discounts from a host of partners for accounting, legal etc.' },
                { icon: HiOutlineCash, title: 'Funding', desc: 'Upto INR 25 Lakhs per startup. We encourage giving the jump start to any idea we believe in.' },
                { icon: HiOutlineChatAlt2, title: 'Consulting', desc: 'Partnered with many corporate houses to help in pilots by the startups.' },
                { icon: HiOutlineOfficeBuilding, title: 'Co-working', desc: 'Incubation & co-working space with state of the art labs and environment to innovate.' },
                { icon: HiOutlineColorSwatch, title: 'Branding', desc: 'We support every startup we believe in, to make the most out of our resources.' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md hover:border-red-100 transition-all"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={index}
                  >
                    <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Connected Startups Carousel Section */}
      {connectedStartups.length > 0 && (
        <section className="py-20 md:py-28 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-3xl md:text-5xl font-bold font-display text-gray-900">
                Our Connected Startups
              </h2>
              <div className="mt-4 w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full" />
              <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
                Startups thriving within our ecosystem — innovating, growing, and making an impact.
              </p>
            </motion.div>

            {/* Carousel */}
            <div
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Navigation Arrows */}
              {totalPages > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-200 hover:shadow-xl transition-all duration-200"
                    aria-label="Previous"
                  >
                    <HiOutlineChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-200 hover:shadow-xl transition-all duration-200"
                    aria-label="Next"
                  >
                    <HiOutlineChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              )}

              {/* Cards Container */}
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: `-${carouselIndex * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* Group startups into pages */}
                  {Array.from({ length: totalPages }).map((_, pageIdx) => (
                    <div
                      key={pageIdx}
                      className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 w-full flex-shrink-0 px-1"
                    >
                      {connectedStartups
                        .slice(pageIdx * itemsPerPage, pageIdx * itemsPerPage + itemsPerPage)
                        .map((startup) => (
                          <Link
                            key={startup._id}
                            to={`/startups/${startup.slug || startup._id}`}
                            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-300 flex flex-col items-center p-5 md:p-6"
                          >
                            {/* Logo */}
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                              {startup.logo ? (
                                <img
                                  src={startup.logo}
                                  alt={startup.name}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full bg-gradient-to-br from-red-100 to-red-200 items-center justify-center ${
                                  startup.logo ? 'hidden' : 'flex'
                                }`}
                              >
                                <span className="text-red-600 font-bold text-3xl">
                                  {startup.name?.[0]?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            {/* Name */}
                            <h3 className="text-sm md:text-base font-semibold text-gray-800 text-center leading-tight mb-2 line-clamp-2 uppercase tracking-wide">
                              {startup.name}
                            </h3>
                            {/* Read More */}
                            <span className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors">
                              Read More
                            </span>
                          </Link>
                        ))}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Dots */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        idx === carouselIndex
                          ? 'w-8 bg-red-500'
                          : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* View All link */}
            <motion.div
              className="text-center mt-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Link
                to="/startups"
                className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors text-lg"
              >
                View All Startups
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════ Collaboration Section ══════ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Gradient background matching the reference */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-400" />
        {/* Subtle diagonal pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white">
              Collaboration
            </h2>
            <div className="mt-4 w-20 h-1 bg-white/60 mx-auto rounded-full" />
          </motion.div>

          {/* Collaboration Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto">
            {[
              { name: 'MeitY Startup Hub', logo: 'https://logo.clearbit.com/meity.gov.in', initials: 'MSH', color: '#1a73e8' },
              { name: 'Atal Innovation Mission', logo: 'https://logo.clearbit.com/aim.gov.in', initials: 'AIM', color: '#f59e0b' },
              { name: 'NITI Aayog', logo: 'https://logo.clearbit.com/niti.gov.in', initials: 'NA', color: '#1e40af' },
              { name: 'Startup India', logo: 'https://logo.clearbit.com/startupindia.gov.in', initials: 'SI', color: '#16a34a' },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                className="flex flex-col items-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full flex items-center justify-center p-4 md:p-5">
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full"><span style="color: ${item.color}" class="font-bold text-3xl md:text-4xl">${item.initials}</span></div>`; }}
                    />
                  </div>
                </div>
                <p className="mt-4 text-white font-semibold text-sm md:text-base text-center">
                  {item.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Eco-System Partners Section ══════ */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display text-gray-900">
              Eco-System Partners
            </h2>
            <div className="mt-4 w-20 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 mx-auto rounded-full" />
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Our trusted partners empowering the startup ecosystem together.
            </p>
          </motion.div>

          {/* Auto-scrolling marquee */}
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="overflow-hidden">
              <motion.div
                className="flex gap-8"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } }}
              >
                {/* Duplicate the array for seamless loop */}
                {[
                  { name: 'Startup Réseau', logo: 'https://logo.clearbit.com/startupreseau.com', initials: 'SR', color: '#6366f1' },
                  { name: 'Adamas University', logo: 'https://logo.clearbit.com/adamasuniversity.ac.in', initials: 'AU', color: '#1e40af' },
                  { name: 'MSG91', logo: 'https://logo.clearbit.com/msg91.com', initials: 'M91', color: '#2563eb' },
                  { name: 'IIT Guwahati', logo: 'https://logo.clearbit.com/iitg.ac.in', initials: 'IITG', color: '#dc2626' },
                  { name: 'NIT Silchar', logo: 'https://logo.clearbit.com/nits.ac.in', initials: 'NITS', color: '#0d9488' },
                  { name: 'IIM Bangalore', logo: 'https://logo.clearbit.com/iimb.ac.in', initials: 'IIMB', color: '#7c3aed' },
                  { name: 'Startup Réseau', logo: 'https://logo.clearbit.com/startupreseau.com', initials: 'SR', color: '#6366f1' },
                  { name: 'Adamas University', logo: 'https://logo.clearbit.com/adamasuniversity.ac.in', initials: 'AU', color: '#1e40af' },
                  { name: 'MSG91', logo: 'https://logo.clearbit.com/msg91.com', initials: 'M91', color: '#2563eb' },
                  { name: 'IIT Guwahati', logo: 'https://logo.clearbit.com/iitg.ac.in', initials: 'IITG', color: '#dc2626' },
                  { name: 'NIT Silchar', logo: 'https://logo.clearbit.com/nits.ac.in', initials: 'NITS', color: '#0d9488' },
                  { name: 'IIM Bangalore', logo: 'https://logo.clearbit.com/iimb.ac.in', initials: 'IIMB', color: '#7c3aed' },
                ].map((partner, index) => (
                  <div
                    key={`${partner.name}-${index}`}
                    className="flex-shrink-0 w-56 md:w-64 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col items-center justify-center p-6 md:p-8"
                  >
                    <div className="w-28 h-20 md:w-36 md:h-24 flex items-center justify-center">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = `<div class=\"flex items-center justify-center w-full h-full\"><span style=\"color: ${partner.color}\" class=\"font-bold text-2xl\">${partner.initials}</span></div>`; }}
                      />
                    </div>
                    <p className="mt-3 text-gray-700 font-semibold text-sm text-center">{partner.name}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="section-subheading mx-auto">
              A comprehensive platform designed to support every aspect of the entrepreneurial journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="card p-6 hover:border-primary-100 group"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={index}
                >
                  <div
                    className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Startups */}
      {featuredStartups.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-heading">Featured Startups</h2>
                <p className="section-subheading">Discover the most promising ventures in our ecosystem.</p>
              </div>
              <Link to="/startups" className="btn-secondary hidden md:inline-flex">
                View All <HiOutlineArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStartups.map((startup) => (
                <Link
                  key={startup._id}
                  to={`/startups/${startup.slug || startup._id}`}
                  className="card p-5 hover:border-primary-200 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-primary-700 font-bold text-xl">
                      {startup.name?.[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {startup.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{startup.industry}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="badge-primary">{startup.stage}</span>
                  </div>
                </Link>
              ))}
            </div>

            <Link to="/startups" className="btn-secondary mt-8 md:hidden w-full">
              View All Startups
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl overflow-hidden p-10 md:p-16">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
                Ready to Start Your Entrepreneurial Journey?
              </h2>
              <p className="mt-4 text-primary-100 text-lg leading-relaxed">
                Join thousands of entrepreneurs, mentors, and students who are building the future together on NEST.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/mentors"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-500/30 text-white font-semibold rounded-xl hover:bg-primary-500/40 transition-all border border-white/20"
                >
                  Find a Mentor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
