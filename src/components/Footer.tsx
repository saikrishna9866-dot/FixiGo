import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f5f5f5] text-[#1a1a1a] pt-16 pb-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-yellow-500 text-black w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xl shadow-[0_0_15px_rgba(234,179,8,0.3)]">F</div>
            <span className="text-2xl font-bold tracking-tight text-black">
              Fixi<span className="text-yellow-500">Go</span>
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-xl mb-6">Company</h3>
            <ul className="space-y-4 text-[15px] text-gray-600">
              <li><Link to="/about" className="hover:text-black transition-colors">About us</Link></li>
              <li><Link to="/terms" className="hover:text-black transition-colors">Terms & conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy policy</Link></li>
            </ul>
          </div>

          {/* For customers */}
          <div>
            <h3 className="font-semibold text-xl mb-6">For customers</h3>
            <ul className="space-y-4 text-[15px] text-gray-600">
              <li><a href="/#reviews" className="hover:text-black transition-colors">FG reviews</a></li>
              <li><Link to="/contact" className="hover:text-black transition-colors">Contact us</Link></li>
            </ul>
          </div>

          {/* For professionals */}
          <div>
            <h3 className="font-semibold text-xl mb-6">For professionals</h3>
            <ul className="space-y-4 text-[15px] text-gray-600">
              <li><Link to="/register-professional" className="hover:text-black transition-colors">Register as a professional</Link></li>
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h3 className="font-semibold text-xl mb-6">Social links</h3>
            <div className="flex space-x-4 mb-8">
              {[
                { icon: Twitter, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-black"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
            <div className="flex flex-col space-y-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10 w-fit cursor-pointer hover:opacity-80 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10 w-fit cursor-pointer hover:opacity-80 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
