const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Startup = require('../models/Startup');
const Mentor = require('../models/Mentor');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nest';

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
      email: 'admin@nest.in',
      password: 'Admin@123',
      role: 'admin',
      bio: 'Platform administrator for NEST.',
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
      logo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
      industry: 'Agriculture',
      stage: 'Early Traction',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      tags: ['AI', 'AgriTech', 'Sustainability', 'IoT'],
      lookingFor: ['Co-Founder', 'Funding', 'Mentor'],
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
      logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop',
      industry: 'Education',
      stage: 'MVP',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      tags: ['EdTech', 'Mobile', 'Social Impact', 'Vernacular'],
      lookingFor: ['Co-Founder', 'Partnerships', 'Funding'],
      status: 'approved',
      featured: true,
      views: 218,
    });

    // ─── Additional Connected Startups ───
    const extraFounders = [];
    const founderData = [
      { firstName: 'Ankit', lastName: 'Borah', email: 'ankit@startup.com' },
      { firstName: 'Meghna', lastName: 'Das', email: 'meghna@startup.com' },
      { firstName: 'Rohit', lastName: 'Chetri', email: 'rohit@startup.com' },
      { firstName: 'Nilima', lastName: 'Hazarika', email: 'nilima@startup.com' },
      { firstName: 'Deepak', lastName: 'Kalita', email: 'deepak@startup.com' },
      { firstName: 'Jyoti', lastName: 'Baruah', email: 'jyoti@startup.com' },
      { firstName: 'Sanjay', lastName: 'Nath', email: 'sanjay@startup.com' },
      { firstName: 'Ritu', lastName: 'Devi', email: 'ritu@startup.com' },
      { firstName: 'Manash', lastName: 'Gogoi', email: 'manash@startup.com' },
      { firstName: 'Pallavi', lastName: 'Medhi', email: 'pallavi@startup.com' },
    ];

    for (const fd of founderData) {
      const user = await User.create({
        firstName: fd.firstName,
        lastName: fd.lastName,
        email: fd.email,
        password: 'Founder@123',
        role: 'startup_founder',
        bio: `Entrepreneur and founder based in Northeast India.`,
        skills: ['Leadership', 'Innovation'],
      });
      extraFounders.push(user);
    }

    const connectedStartups = [
      {
        name: 'NorthEast Organic Farms',
        founder: extraFounders[0]._id,
        tagline: 'Farm to table organic produce from the NE hills',
        description: 'NorthEast Organic Farms connects organic farmers in Meghalaya and Nagaland directly with consumers across India. We ensure fair pricing, sustainable practices, and fresh delivery within 48 hours.',
        logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=400&fit=crop',
        industry: 'Agriculture',
        stage: 'Early Traction',
        location: { city: 'Shillong', state: 'Meghalaya', country: 'India' },
        tags: ['Organic', 'Agriculture', 'Supply Chain'],
        lookingFor: ['Funding', 'Partnerships'],
        status: 'approved',
        featured: false,
        views: 187,
        metrics: { revenue: 300000, users: 2000, growth: 18 },
      },
      {
        name: 'BambooCraft Innovations',
        founder: extraFounders[1]._id,
        tagline: 'Sustainable bamboo products for modern living',
        description: 'BambooCraft Innovations designs and manufactures eco-friendly bamboo-based furniture, kitchenware, and lifestyle products. Our artisans from Assam and Tripura create world-class sustainable goods.',
        logo: 'https://images.unsplash.com/photo-1567225591450-06036b3392a6?w=400&h=400&fit=crop',
        industry: 'E-Commerce',
        stage: 'Growth',
        location: { city: 'Guwahati', state: 'Assam', country: 'India' },
        tags: ['Sustainability', 'E-Commerce', 'Bamboo', 'Handicrafts'],
        lookingFor: ['Customers', 'Partnerships'],
        status: 'approved',
        featured: false,
        views: 312,
        metrics: { revenue: 1200000, users: 8500, growth: 35 },
      },
      {
        name: 'TeaLeaf Analytics',
        founder: extraFounders[2]._id,
        tagline: 'AI-powered quality control for tea estates',
        description: 'TeaLeaf Analytics uses computer vision and IoT sensors to monitor tea leaf quality in real-time across Assam\'s tea gardens. Our system reduces waste by 30% and improves grading accuracy.',
        logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
        industry: 'AI/ML',
        stage: 'MVP',
        location: { city: 'Jorhat', state: 'Assam', country: 'India' },
        tags: ['AI', 'Tea', 'IoT', 'Quality Control'],
        lookingFor: ['Mentor', 'Funding'],
        status: 'approved',
        featured: false,
        views: 145,
      },
      {
        name: 'MedReach Health',
        founder: extraFounders[3]._id,
        tagline: 'Telemedicine for remote NE communities',
        description: 'MedReach Health provides affordable telemedicine consultations and medicine delivery to remote villages in Arunachal Pradesh and Manipur. Our app works on low-bandwidth networks.',
        logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
        industry: 'Healthcare',
        stage: 'Early Traction',
        location: { city: 'Imphal', state: 'Manipur', country: 'India' },
        tags: ['HealthTech', 'Telemedicine', 'Rural', 'Social Impact'],
        lookingFor: ['Talent', 'Funding', 'Partnerships'],
        status: 'approved',
        featured: false,
        views: 256,
        metrics: { revenue: 150000, users: 5000, growth: 40 },
      },
      {
        name: 'EduNest Academy',
        founder: extraFounders[4]._id,
        tagline: 'Vernacular online learning for NE students',
        description: 'EduNest Academy offers competitive exam preparation courses in Assamese, Manipuri, and other NE languages. We make quality education accessible to students who struggle with English-medium content.',
        logo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop',
        industry: 'Education',
        stage: 'Growth',
        location: { city: 'Guwahati', state: 'Assam', country: 'India' },
        tags: ['EdTech', 'Vernacular', 'Competitive Exams'],
        lookingFor: ['Talent', 'Customers'],
        status: 'approved',
        featured: false,
        views: 420,
        metrics: { revenue: 800000, users: 15000, growth: 50 },
      },
      {
        name: 'PayNE Wallet',
        founder: extraFounders[5]._id,
        tagline: 'Digital payments simplified for NE merchants',
        description: 'PayNE Wallet is a UPI-based digital payment solution tailored for small merchants in Northeast India. Features include offline payments, multi-language support, and micro-lending for small businesses.',
        logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop',
        industry: 'Finance',
        stage: 'Early Traction',
        location: { city: 'Dimapur', state: 'Nagaland', country: 'India' },
        tags: ['FinTech', 'UPI', 'Payments', 'SME'],
        lookingFor: ['Funding', 'Partnerships'],
        status: 'approved',
        featured: false,
        views: 198,
        metrics: { revenue: 200000, users: 3500, growth: 28 },
      },
      {
        name: 'GreenHills CleanTech',
        founder: extraFounders[6]._id,
        tagline: 'Solar micro-grids for off-grid NE villages',
        description: 'GreenHills CleanTech designs and installs affordable solar micro-grids for villages without reliable electricity in Mizoram and Meghalaya. We have powered 50+ villages so far.',
        logo: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop',
        industry: 'CleanTech',
        stage: 'Scale',
        location: { city: 'Aizawl', state: 'Mizoram', country: 'India' },
        tags: ['Solar', 'CleanTech', 'Rural', 'Sustainability'],
        lookingFor: ['Funding', 'Partnerships'],
        status: 'approved',
        featured: false,
        views: 380,
        metrics: { revenue: 2500000, users: 12000, growth: 22 },
      },
      {
        name: 'TravelNE Adventures',
        founder: extraFounders[7]._id,
        tagline: 'Curated adventure tourism in Northeast India',
        description: 'TravelNE Adventures is a tourism platform offering curated trekking, cultural immersion, and adventure packages across all 8 NE states. We partner with local communities for authentic experiences.',
        logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        industry: 'Other',
        stage: 'Growth',
        location: { city: 'Gangtok', state: 'Sikkim', country: 'India' },
        tags: ['Tourism', 'Adventure', 'Cultural', 'Travel'],
        lookingFor: ['Customers', 'Partnerships'],
        status: 'approved',
        featured: false,
        views: 510,
        metrics: { revenue: 1800000, users: 6000, growth: 30 },
      },
      {
        name: 'SilkRoute SaaS',
        founder: extraFounders[8]._id,
        tagline: 'Inventory management for NE textile weavers',
        description: 'SilkRoute SaaS provides a simple cloud-based inventory and order management system for traditional silk and handloom weavers in Assam and Manipur. We help artisans go digital and reach global markets.',
        logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
        industry: 'SaaS',
        stage: 'MVP',
        location: { city: 'Sualkuchi', state: 'Assam', country: 'India' },
        tags: ['SaaS', 'Handloom', 'Inventory', 'Artisans'],
        lookingFor: ['Mentor', 'Funding', 'Talent'],
        status: 'approved',
        featured: false,
        views: 95,
      },
      {
        name: 'FoodBridge NE',
        founder: extraFounders[9]._id,
        tagline: 'Cloud kitchens serving authentic NE cuisine nationwide',
        description: 'FoodBridge NE operates cloud kitchens in major Indian cities serving authentic Northeast Indian cuisine. We source ingredients directly from NE farms and employ chefs from the region.',
        logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
        industry: 'FoodTech',
        stage: 'Early Traction',
        location: { city: 'Delhi', state: 'Delhi', country: 'India' },
        tags: ['FoodTech', 'Cloud Kitchen', 'NE Cuisine', 'D2C'],
        lookingFor: ['Funding', 'Talent', 'Customers'],
        status: 'approved',
        featured: false,
        views: 275,
        metrics: { revenue: 600000, users: 4200, growth: 45 },
      },
    ];

    for (const s of connectedStartups) {
      await Startup.create(s);
    }

    console.log('✅ Startups created (12 total)');

    // ─── Create Mentors ───
    const mentor1 = await Mentor.create({
      user: mentorUser1._id,
      title: 'Chief Strategy Officer',
      company: { name: 'TechVentures India', position: 'CSO' },
      experience: { years: 15, description: '15+ years in tech and strategy' },
      expertise: ['Business Strategy', 'Fundraising', 'Go-to-Market', 'Team Building'],
      specializations: ['Business Strategy', 'Finance', 'Product Development'],
      industries: ['Technology', 'Finance', 'E-Commerce'],
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
      company: { name: 'GrowthLab', position: 'VP Marketing' },
      experience: { years: 10, description: '10+ years in digital marketing' },
      expertise: ['Digital Marketing', 'Growth Hacking', 'Brand Strategy', 'Content Marketing'],
      specializations: ['Marketing', 'Sales', 'Design'],
      industries: ['E-Commerce', 'Education', 'Healthcare'],
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
        type: 'Bootcamp',
        category: 'Business',
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
        type: 'Webinar',
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
        title: 'NEST Hackathon: Build for Bharat',
        organizer: admin._id,
        description:
          'A 48-hour hackathon focused on building solutions for Tier-2 and Tier-3 India. Themes: education access, healthcare delivery, financial inclusion, and sustainable farming. Top 3 teams win seed funding.',
        type: 'Hackathon',
        category: 'Technology',
        startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        venue: { type: 'offline', address: 'NEST Campus, Hyderabad' },
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
    console.log('  Admin:   admin@nest.in / Admin@123');
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
