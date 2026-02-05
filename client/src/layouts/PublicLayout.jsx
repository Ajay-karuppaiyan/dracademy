import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X, Search, ChevronDown, Globe, BookOpen } from "lucide-react";

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Top Corporate Strip */}
      <div className="bg-slate-900 text-slate-400 text-xs py-2 px-4 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <Link
              to="/enterprise"
              className="hover:text-white transition-colors"
            >
              For Enterprise
            </Link>
            <Link
              to="/universities"
              className="hover:text-white transition-colors"
            >
              For Universities
            </Link>
            <Link
              to="/government"
              className="hover:text-white transition-colors"
            >
              For Government
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-white flex items-center gap-1">
              <Globe size={12} /> EN
            </span>
            <Link to="/login" className="hover:text-white transition-colors">
              Student Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
              <div className="bg-brand-700 text-white p-1.5 rounded shadow-sm">
                <BookOpen size={24} strokeWidth={2} />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                DRRJ Academy
              </span>
            </Link>

            {/* Explore & Search */}
            <div className="hidden md:flex flex-1 items-center gap-6 max-w-2xl">
              <button className="flex items-center gap-1 bg-brand-600 text-white px-4 py-2.5 rounded text-sm font-semibold hover:bg-brand-700 transition-colors">
                Explore <ChevronDown size={14} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  className="w-full bg-white border border-gray-300 text-slate-900 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <Link
                to="/degrees"
                className="hover:text-brand-700 transition-colors"
              >
                Online Degrees
              </Link>
              <Link
                to="/careers"
                className="hover:text-brand-700 transition-colors"
              >
                Careers
              </Link>
              <Link
                to="/find-new-career"
                className="hover:text-brand-700 transition-colors"
              >
                Find a New Career
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-brand-700 font-bold hover:bg-brand-50 px-4 py-2 rounded transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-white border border-brand-700 text-brand-700 px-5 py-2 rounded font-bold hover:bg-brand-50 transition-colors text-sm shadow-sm"
              >
                Join for Free
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded text-sm"
              />
              <Link
                to="/degrees"
                className="block text-base font-semibold text-slate-700 py-2 border-b border-gray-100"
              >
                Online Degrees
              </Link>
              <Link
                to="/careers"
                className="block text-base font-semibold text-slate-700 py-2 border-b border-gray-100"
              >
                Find a New Career
              </Link>
              <Link
                to="/enterprise"
                className="block text-base font-semibold text-slate-700 py-2 border-b border-gray-100"
              >
                For Enterprise
              </Link>
              <div className="pt-4 grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  className="text-center py-3 border border-slate-200 rounded font-semibold text-slate-600"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-3 bg-brand-700 text-white rounded font-semibold shadow-sm"
                >
                  Join Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 mt-20 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-brand-700 text-white p-1 rounded">
                  <BookOpen size={16} />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  DRRJ Academy
                </span>
              </div>
              <p className="mb-6 max-w-xs leading-relaxed">
                DRRJ Academy provides universal access to the world's best
                education, collaborating with top universities and
                organizations.
              </p>
              <div className="flex gap-4">
                {/* Social Placeholders */}
                <div className="w-8 h-8 bg-slate-200 rounded-full hover:bg-brand-600 hover:text-white transition-colors cursor-pointer"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full hover:bg-brand-600 hover:text-white transition-colors cursor-pointer"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full hover:bg-brand-600 hover:text-white transition-colors cursor-pointer"></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">
                Learn
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    New Courses
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Degree Programs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">
                Community
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Learners
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Partners
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Developers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">
                More
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Press
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Investors
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-brand-700 hover:underline">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 DRRJ Academy Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-brand-700">
                Privacy Policy
              </Link>
              <Link to="#" className="hover:text-brand-700">
                Cookie Policy
              </Link>
              <Link to="#" className="hover:text-brand-700">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
