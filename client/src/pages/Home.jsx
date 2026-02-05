import React from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  Users,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="relative z-10">
              <h1 className="text-5xl lg:text-7xl font-sans font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Learn without <br />
                <span className="text-brand-700">limits.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-lg">
                Build skills with courses, certificates, and degrees online from
                world-class universities and companies.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-brand-700 text-white rounded font-bold text-lg hover:bg-brand-800 transition-colors shadow-lg shadow-brand-900/10"
                >
                  Join for Free
                </Link>
                <Link
                  to="/enterprise"
                  className="px-8 py-4 bg-white border border-brand-700 text-brand-700 rounded font-bold text-lg hover:bg-brand-50 transition-colors"
                >
                  Try DRRJ for Business
                </Link>
              </div>
            </div>

            <div className="relative lg:h-[500px]">
              {/* Composition of images */}
              <div className="absolute top-0 right-0 w-4/5 h-4/5 bg-slate-100 rounded-tr-[4rem] rounded-bl-[4rem] -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
                alt="Students collaborating"
                className="rounded-lg shadow-2xl w-[90%] relative z-10"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded shadow-xl border border-slate-100 max-w-xs z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Success Rate
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      94% Employed
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  within 6 months of graduation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Strip */}
      <section className="bg-slate-50 py-10 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
            Collaborating with 275+ leading universities and companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl font-serif font-bold text-slate-800">
              Illinois
            </span>
            <span className="text-2xl font-sans font-extrabold text-slate-800">
              Duke
            </span>
            <span className="text-2xl font-serif font-bold text-slate-800">
              Google
            </span>
            <span className="text-2xl font-mono font-bold text-slate-800">
              IBM
            </span>
            <span className="text-2xl font-sans font-bold text-slate-800">
              Stanford
            </span>
            <span className="text-2xl font-serif font-bold text-slate-800">
              Penn
            </span>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              The World's Learning Platform
            </h2>
            <p className="text-slate-600 text-lg">
              We offer a range of learning opportunities—from hands-on projects
              and courses to job-ready certificates and degree programs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Top Quality Content
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Learn from top universities and industry leaders. Earn
                recognized credentials.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Career Goals
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Build job-ready skills for high-demand fields like Data Science,
                AI, and Business.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Flexible Learning
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Study at your own pace. Balance your learning with work and
                life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Degree Programs Highlight */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Earn Your Degree
              </h2>
              <p className="text-slate-600">
                Breakthrough pricing on 100% online degrees from top
                universities.
              </p>
            </div>
            <Link
              to="/degrees"
              className="hidden md:flex items-center gap-1 font-bold text-brand-700 hover:text-brand-800"
            >
              View all degrees <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Degree Card 1 */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-40 bg-gray-200 mb-4 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="CS"
                />
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Master's
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">
                Computer Science
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                University of Illinois
              </p>
              <p className="text-xs text-slate-400">
                100% Online • 18-24 Months
              </p>
            </div>

            {/* Degree Card 2 */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-40 bg-gray-200 mb-4 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1630&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="MBA"
                />
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  MBA
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">
                Master of Business Admin
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Macquarie University
              </p>
              <p className="text-xs text-slate-400">100% Online • 1-2 Years</p>
            </div>

            {/* Degree Card 3 */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-40 bg-gray-200 mb-4 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Data"
                />
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Master's
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Data Science</h3>
              <p className="text-sm text-slate-500 mb-4">
                University of Colorado Boulder
              </p>
              <p className="text-xs text-slate-400">
                100% Online • Performance Based
              </p>
            </div>

            {/* Degree Card 4 */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-40 bg-gray-200 mb-4 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Health"
                />
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                  Bachelor's
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Public Health</h3>
              <p className="text-sm text-slate-500 mb-4">
                Imperial College London
              </p>
              <p className="text-xs text-slate-400">
                100% Online • Global Health Focus
              </p>
            </div>
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/degrees"
              className="inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-800"
            >
              View all degrees <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Outcome Stats */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Learner Outcomes</h2>
            <p className="text-slate-300 text-lg mb-8">
              87% of people learning for professional development report career
              benefits like getting a promotion, a raise, or starting a new
              career.
            </p>
            <Link
              to="/register"
              className="bg-white text-slate-900 px-8 py-3 rounded font-bold hover:bg-slate-100 transition-colors"
            >
              Join for Free
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/10 p-6 rounded backdrop-blur-sm">
              <h3 className="text-4xl font-bold text-brand-400 mb-2">35%</h3>
              <p className="text-sm font-medium">Average Salary Increase</p>
            </div>
            <div className="bg-white/10 p-6 rounded backdrop-blur-sm">
              <Users size={32} className="text-brand-400 mb-4" />
              <p className="text-sm font-medium">
                Network with peers from 190+ countries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Take the next step toward your personal and professional goals with
            DRRJ Academy.
          </h2>
          <p className="text-slate-500 mb-10 text-lg">
            Join now to receive personalized recommendations from the full
            Coursera catalog.
          </p>
          <Link
            to="/register"
            className="px-12 py-4 bg-brand-700 text-white rounded font-bold text-xl hover:bg-brand-800 transition-colors shadow-xl shadow-brand-900/10"
          >
            Join for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
