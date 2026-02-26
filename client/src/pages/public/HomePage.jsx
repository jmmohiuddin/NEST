import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [startupRes, mentorRes, eventRes] = await Promise.allSettled([
          startupsAPI.getAll({ limit: 4, featured: 'true' }),
          mentorsAPI.getAll({ limit: 4, featured: 'true' }),
          eventsAPI.getAll({ limit: 3, upcoming: 'true' }),
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
      } catch (err) {
        // Silent fail - show defaults
      }
    };
    loadData();
  }, []);

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
        <title>NEEST - Empowering India's Startup Ecosystem</title>
        <meta name="description" content="NEEST connects students, startups, mentors, and investors to build India's next generation of entrepreneurs." />
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
                Join thousands of entrepreneurs, mentors, and students who are building the future together on NEEST.
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
