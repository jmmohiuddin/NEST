const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Startup = require('../models/Startup');
const Mentor = require('../models/Mentor');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neest';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Startup.deleteMany({});
    await Mentor.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // ─── Create Users ───
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@neest.in',
      password: 'Admin@123',
      role: 'admin',
      bio: 'Platform administrator for NEEST.',
    });

    const founder1 = await User.create({
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav@startup.com',
      password: 'Founder@123',
      role: 'startup_founder',
      bio: 'Building the future of sustainable agriculture through technology.',
      skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
    });

    const founder2 = await User.create({
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya@startup.com',
      password: 'Founder@123',
      role: 'startup_founder',
      bio: 'Passionate about EdTech and making education accessible.',
      skills: ['Flutter', 'Firebase', 'UX Design'],
    });

    const mentorUser1 = await User.create({
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh@mentor.com',
      password: 'Mentor@123',
      role: 'mentor',
      bio: 'Serial entrepreneur with 15+ years in tech and strategy.',
      skills: ['Business Strategy', 'Product Management', 'Fundraising'],
    });

    const mentorUser2 = await User.create({
      firstName: 'Sneha',
      lastName: 'Gupta',
      email: 'sneha@mentor.com',
      password: 'Mentor@123',
      role: 'mentor',
      bio: 'Marketing expert helping startups scale from 0 to 1.',
      skills: ['Digital Marketing', 'Growth Hacking', 'Brand Strategy'],
    });

    const student = await User.create({
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram@student.com',
      password: 'Student@123',
      role: 'student',
      bio: 'Computer Science student interested in startups and AI.',
      skills: ['Python', 'TensorFlow', 'Data Analysis'],
      interests: ['AI', 'HealthTech', 'FinTech'],
    });

    console.log('✅ Users created');

    // ─── Create Startups ───
    const startup1 = await Startup.create({
      name: 'AgroTech Solutions',
      founder: founder1._id,
      tagline: 'AI-powered crop management for Indian farmers',
      description:
        'AgroTech Solutions leverages satellite imagery and machine learning to provide real-time crop health monitoring, weather predictions, and personalized farming recommendations. Our platform has helped 10,000+ farmers increase yield by 25% on average.',
      industry: 'Agriculture',
      stage: 'Early Traction',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      tags: ['AI', 'AgriTech', 'Sustainability', 'IoT'],
      lookingFor: ['CTO', 'Funding', 'Mentorship'],
      status: 'approved',
      featured: true,
      views: 342,
      metrics: { revenue: 500000, users: 10000, growth: 25 },
    });

    const startup2 = await Startup.create({
      name: 'LearnBridge',
      founder: founder2._id,
      tagline: 'Bridging the gap in rural education through mobile learning',
      description:
        'LearnBridge is a mobile-first educational platform designed for students in tier-2 and tier-3 cities. We offer vernacular language support, offline-first content, and gamified learning paths aligned with state board curricula.',
      industry: 'Education',
      stage: 'MVP',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      tags: ['EdTech', 'Mobile', 'Social Impact', 'Vernacular'],
      lookingFor: ['Co-founder', 'Content Partners', 'Seed Funding'],
      status: 'approved',
      featured: true,
      views: 218,
    });

    console.log('✅ Startups created');

    // ─── Create Mentors ───
    const mentor1 = await Mentor.create({
      user: mentorUser1._id,
      title: 'Chief Strategy Officer',
      company: 'TechVentures India',
      experience: 15,
      expertise: ['Business Strategy', 'Fundraising', 'Go-to-Market', 'Team Building'],
      specializations: ['Business Strategy', 'Finance', 'Product Development'],
      industries: ['Technology', 'Finance', 'E-commerce'],
      availability: {
        status: 'available',
        hoursPerWeek: 10,
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        timezone: 'Asia/Kolkata',
      },
      ratings: { average: 4.8, count: 12 },
      status: 'approved',
      featured: true,
    });

    const mentor2 = await Mentor.create({
      user: mentorUser2._id,
      title: 'VP of Marketing',
      company: 'GrowthLab',
      experience: 10,
      expertise: ['Digital Marketing', 'Growth Hacking', 'Brand Strategy', 'Content Marketing'],
      specializations: ['Marketing', 'Sales', 'Design'],
      industries: ['E-commerce', 'Education', 'Healthcare'],
      availability: {
        status: 'available',
        hoursPerWeek: 8,
        preferredDays: ['Tuesday', 'Thursday'],
        timezone: 'Asia/Kolkata',
      },
      ratings: { average: 4.6, count: 8 },
      status: 'approved',
      featured: true,
    });

    console.log('✅ Mentors created');

    // ─── Create Events ───
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Event.create([
      {
        title: 'Startup India Bootcamp 2025',
        organizer: admin._id,
        description:
          'A 3-day intensive bootcamp for early-stage founders covering ideation, MVP development, pitch preparation, and fundraising strategies. Features workshops, mentor 1-on-1s, and a pitch competition.',
        type: 'bootcamp',
        category: 'Entrepreneurship',
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(nextWeek.getTime() - 2 * 24 * 60 * 60 * 1000),
        venue: { type: 'hybrid', address: 'IIT Delhi Innovation Hub, New Delhi', meetingLink: 'https://meet.example.com/bootcamp' },
        capacity: 200,
        tags: ['bootcamp', 'founders', 'pitching'],
        status: 'published',
        featured: true,
        views: 560,
      },
      {
        title: 'AI in Agriculture: Opportunities & Challenges',
        organizer: mentorUser1._id,
        description:
          'An expert panel discussion on how AI and IoT are transforming Indian agriculture. Learn about real-world applications, data challenges, and investment trends in AgriTech.',
        type: 'seminar',
        category: 'Technology',
        startDate: nextMonth,
        endDate: nextMonth,
        registrationDeadline: new Date(nextMonth.getTime() - 5 * 24 * 60 * 60 * 1000),
        venue: { type: 'online', meetingLink: 'https://meet.example.com/agri-ai' },
        capacity: 500,
        tags: ['AI', 'Agriculture', 'Panel'],
        status: 'published',
        featured: false,
        views: 128,
      },
      {
        title: 'NEEST Hackathon: Build for Bharat',
        organizer: admin._id,
        description:
          'A 48-hour hackathon focused on building solutions for Tier-2 and Tier-3 India. Themes: education access, healthcare delivery, financial inclusion, and sustainable farming. Top 3 teams win seed funding.',
        type: 'hackathon',
        category: 'Innovation',
        startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        venue: { type: 'offline', address: 'NEEST Campus, Hyderabad' },
        capacity: 100,
        tags: ['hackathon', 'innovation', 'social-impact'],
        status: 'published',
        featured: true,
        views: 890,
      },
    ]);

    console.log('✅ Events created');

    console.log('\n══════════════════════════════════════');
    console.log('  🌱 Seed data loaded successfully!');
    console.log('══════════════════════════════════════');
    console.log('\nTest Accounts:');
    console.log('  Admin:   admin@neest.in / Admin@123');
    console.log('  Founder: aarav@startup.com / Founder@123');
    console.log('  Founder: priya@startup.com / Founder@123');
    console.log('  Mentor:  rajesh@mentor.com / Mentor@123');
    console.log('  Mentor:  sneha@mentor.com / Mentor@123');
    console.log('  Student: vikram@student.com / Student@123');
    console.log('══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
