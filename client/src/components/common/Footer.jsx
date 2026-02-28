import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedinIn,
} from 'react-icons/fa';
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative">
      {/* ── Wavy SVG Top Border ── */}
      <div className="relative w-full overflow-hidden leading-[0] -mb-px">
        <svg
          className="relative block w-full h-[80px] md:h-[120px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1200,100 1320,40 1440,80 L1440,120 L0,120 Z"
            className="fill-teal-600"
          />
          <path
            d="M0,80 C200,30 400,110 600,60 C800,10 1000,100 1200,50 C1320,20 1380,70 1440,60 L1440,120 L0,120 Z"
            className="fill-teal-500"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* ── Main Footer Content ── */}
      <div className="bg-gradient-to-b from-teal-500 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Heading */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Get in Touch</h2>
            <div className="mt-3 w-16 h-1 bg-blue-800 mx-auto rounded-full" />
          </div>

          {/* Two-column layout: Info + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left — Contact Info */}
            <div className="space-y-6">
              <p className="text-white/90 leading-relaxed text-sm md:text-base">
                AIC-SMUTBI is committed to exceeding your needs. Questions, comments or special
                requests? We'd love to hear from you, so don't hesitate to reach out today.
              </p>

              {/* Contact Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HiOutlineLocationMarker className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">SMIT, Rangpo, Sikkim</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiOutlineMail className="w-5 h-5 flex-shrink-0" />
                  <a href="mailto:contact@smutbi.com" className="text-sm md:text-base hover:underline">
                    contact@smutbi.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <HiOutlinePhone className="w-5 h-5 flex-shrink-0" />
                  <a href="tel:03592246622" className="text-sm md:text-base hover:underline">
                    03592246622
                  </a>
                </div>
              </div>

              {/* Follow Us */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Follow Us</h3>
                <div className="flex items-center gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="w-9 h-9 rounded-md bg-white/20 hover:bg-white hover:text-teal-700 flex items-center justify-center transition-all duration-300"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Footer Links */}
              <div className="flex items-center gap-4 pt-2">
                <Link to="/privacy" className="text-sm hover:underline font-semibold">
                  Privacy Policy
                </Link>
                <Link to="/grievance" className="text-sm hover:underline font-semibold">
                  Grievance
                </Link>
              </div>
            </div>

            {/* Right — Google Map */}
            <div className="w-full h-64 md:h-80 lg:h-full min-h-[260px] rounded-2xl overflow-hidden shadow-xl border-4 border-white/20">
              <iframe
                title="AIC-SMUTBI Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.0!2d88.5312!3d27.1776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a50b25f0f17d%3A0x3fc7e3c9c5046db5!2sAIC-SMUTBI!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
            <p className="text-xs md:text-sm text-white/70 text-center">
              © {currentYear} All Rights reserved by AIC-SMUTBI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
