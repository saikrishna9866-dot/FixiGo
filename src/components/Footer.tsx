import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider') || location.pathname === '/dashboard';

  if (isDashboard) return null;

  return (
    <footer className="bg-[#f5f5f5] text-[#1a1a1a] pt-10 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-yellow-500 text-black w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg shadow-[0_0_10px_rgba(234,179,8,0.2)]">F</div>
            <span className="text-xl font-bold tracking-tight text-black">
              Fixi<span className="text-yellow-500">Go</span>
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-[14px] text-gray-600">
              <li><Link to="/about" className="hover:text-black transition-colors">About us</Link></li>
              <li><Link to="/terms" className="hover:text-black transition-colors">Terms & conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy policy</Link></li>
            </ul>
          </div>

          {/* For customers */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For customers</h3>
            <ul className="space-y-2 text-[14px] text-gray-600">
              <li><a href="/#reviews" className="hover:text-black transition-colors">FG reviews</a></li>
              <li><Link to="/contact" className="hover:text-black transition-colors">Contact us</Link></li>
            </ul>
          </div>

          {/* For professionals */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For professionals</h3>
            <ul className="space-y-2 text-[14px] text-gray-600">
              <li><Link to="/register-professional" className="hover:text-black transition-colors">Register as a professional</Link></li>
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Social links</h3>
            <div className="flex space-x-3 mb-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            <div className="flex flex-col space-y-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8 w-fit cursor-pointer hover:opacity-80 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8 w-fit cursor-pointer hover:opacity-80 transition-opacity" />
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
          <div className="mb-6 group">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1 group-hover:text-yellow-600 transition-colors duration-500">
              Designed and Developed By
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-black tracking-tighter hover:scale-105 transition-all duration-500 cursor-default">
              Sakrishna <span className="text-yellow-500">Tadi</span>
            </h3>
          </div>
          
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-50">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} FixiGo. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">
                Crafting Digital Excellence
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
