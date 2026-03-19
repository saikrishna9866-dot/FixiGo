import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-black text-white p-2 rounded font-bold text-xl">FG</div>
            <span className="text-2xl font-bold text-black">FixiGo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black">About us</a></li>
              <li><a href="#" className="hover:text-black">Terms & conditions</a></li>
              <li><a href="#" className="hover:text-black">Privacy policy</a></li>
              <li><a href="#" className="hover:text-black">Anti-discrimination policy</a></li>
              <li><a href="#" className="hover:text-black">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">For customers</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black">FG reviews</a></li>
              <li><a href="#" className="hover:text-black">Contact us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">For professionals</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black">Register as a professional</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Social links</h3>
            <div className="flex space-x-4 mb-8">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
            <div className="space-y-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10 cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10 cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} FixiGo Services Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
