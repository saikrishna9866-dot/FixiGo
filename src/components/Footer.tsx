import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ShieldCheck, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] text-gray-400 pt-20 pb-10 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-yellow-500 text-black p-2 rounded-lg font-bold text-xl group-hover:bg-white transition-colors duration-300">FG</div>
              <span className="text-2xl font-bold text-white tracking-tight">Fixi<span className="text-yellow-500">Go</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              FixiGo is India's leading home services marketplace, connecting you with verified professionals for all your home needs. Quality service, guaranteed.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all duration-300 group"
                >
                  <social.icon size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <span className="w-8 h-px bg-yellow-500 mr-3"></span>
              Company
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Anti-discrimination', path: '/anti-discrimination' },
                { name: 'Careers', path: '/careers' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-yellow-500 transition-colors flex items-center group">
                    <span className="w-0 h-px bg-yellow-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center">
              <span className="w-8 h-px bg-yellow-500 mr-3"></span>
              Services
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { name: 'Home Cleaning', path: '/category/cleaning' },
                { name: 'Appliance Repair', path: '/category/appliances' },
                { name: 'Electrician', path: '/category/electrician' },
                { name: 'Plumbing', path: '/category/plumbing' },
                { name: 'Painting', path: '/category/painting' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-yellow-500 transition-colors flex items-center group">
                    <span className="w-0 h-px bg-yellow-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Apps */}
          <div className="space-y-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-6 flex items-center">
                <span className="w-8 h-px bg-yellow-500 mr-3"></span>
                Contact Us
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start space-x-3">
                  <MapPin size={18} className="text-yellow-500 shrink-0" />
                  <span>123, Service Lane, Tech Park, Bangalore, India</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone size={18} className="text-yellow-500 shrink-0" />
                  <span>+91 800 123 4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail size={18} className="text-yellow-500 shrink-0" />
                  <span>support@fixigo.com</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10 w-fit cursor-pointer hover:opacity-80 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10 w-fit cursor-pointer hover:opacity-80 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-white/5 mb-10">
          {[
            { icon: ShieldCheck, title: 'Secure Payments', desc: '100% safe transactions' },
            { icon: Award, title: 'Verified Pros', desc: 'Background checked' },
            { icon: Clock, title: 'On-time Service', desc: 'Punctuality guaranteed' },
            { icon: Award, title: 'Quality Assured', desc: 'Best in class service' }
          ].map((badge, index) => (
            <div key={index} className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-white/5 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                <badge.icon size={20} />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">{badge.title}</h4>
                <p className="text-[10px] text-gray-500">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {currentYear} FixiGo Services Pvt Ltd. All rights reserved.
          </p>
          <div className="flex space-x-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <Link to="/admin/login" className="hover:text-yellow-500 transition-colors">Admin Panel</Link>
            <Link to="/privacy" className="hover:text-yellow-500 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-yellow-500 transition-colors">Terms</Link>
            <Link to="/sitemap" className="hover:text-yellow-500 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
