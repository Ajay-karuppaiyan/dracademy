import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X, Search, ChevronDown, Globe, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import logo from "../assets/logo.png";
import medicalImg from "../assets/medical.png";
import hospitalityImg from "../assets/hospitality.png";
import vocationalImg from "../assets/vocational.png";
import campusImg from "../assets/campus.png";

const menuItems = [
  { title: "Home", to: "/" },
  {
    title: "About US",
    submenu: [
      { title: "About Us", to: "/about" },
      { title: "History", to: "/history" },
      { title: "Group of Companies", to: "/group-of-companies" },
      { title: "Numbers Counter", to: "/numbers-counter" },
      { title: "Testimonials", to: "/testimonials" },
      { title: "Awards & Certificates", to: "/awards-certificates" },
    ],
  },
  {
    title: "RG Academy",
    submenu: [
      { title: "Institutions", to: "/institutions" },
      { title: "Unicarewel", to: "/unicarewel" },
      { title: "RGMTN", to: "/rgmtn" },
      { title: "BGLRGM", to: "/bglrgm" },
    ],
  },
  {
    title: "Courses & Certifications",
    mega: [
      {
        title: "Diploma Courses (1 to 2 years)",
        items: [
          "Hospitality",
          "Tourism Courses",
          "Hotel Management Courses",
          "Cruise and Aviation Courses",
          "Medical Courses",
          "Non-Medical Courses",
        ],
      },
      {
        title: "Degree Courses (3 years)",
        items: [
          "Hospitality",
          "Tourism Courses",
          "Hotel Management Courses",
          "Cruise and Aviation Courses",
          "Medical Courses",
          "Non-Medical Courses",
        ],
      },
      {
        title: "Master Degree Courses (2 years)",
        items: [
          "Hospitality",
          "Tourism Courses",
          "Hotel Management Courses",
          "Cruise and Aviation Courses",
          "Medical Courses",
          "Non-Medical Courses",
        ],
      },
      {
        title: "Vocational Trainings (6 months Courses)",
        items: ["All Courses list and details"],
      },
    ],
  },
  {
    title: "Coaching & Training",
    submenu: [
      { title: "Engineering (JEE)", to: "/coaching/jee" },
      { title: "Medical (NEET)", to: "/coaching/neet" },
      { title: "Civil services (UPSC/KPSC)", to: "/coaching/upsc" },
      { title: "Banking (IBPS/SBI)", to: "/coaching/banking" },
      { title: "Management (CAT/CET/MAT/GRE)", to: "/coaching/management" },
    ],
  },
  {
    title: "Placements",
    submenu: [
      { title: "Internships", to: "/placements/internships" },
      { title: "Permanent Jobs", to: "/placements/jobs" },
      { title: "Campus Drive", to: "/placements/campus-drive" },
      { title: "Placement Partners", to: "/placements/partners" },
      { title: "FAQs", to: "/placements/faqs" },
    ],
  },
  {
    title: "Exams",
    submenu: [
      { title: "Exams", to: "/exams" },
      { title: "Apply Now", to: "/exams/apply" },
      { title: "Results", to: "/exams/results" },
      { title: "Entry Ticket", to: "/exams/entry-ticket" },
    ],
  },
  {
    title: "Industries",
    submenu: [
      { title: "Hospitality", to: "/industries/hospitality" },
      { title: "Cruise & Aviation", to: "/industries/cruise-aviation" },
      { title: "Medical", to: "/industries/medical" },
      { title: "Others", to: "/industries/others" },
    ],
  },
  {
    title: "Partner With Us",
    submenu: [
      { title: "Franchise Partners", to: "/partner-with-us" },
    ],
  },
  {
    title: "Newsletter",
    submenu: [
      { title: "News & Media", to: "/newsletter/news-media" },
      { title: "Blogs", to: "/newsletter/blogs" },
      { title: "Posts", to: "/newsletter/posts" },
      { title: "Gallery", to: "/newsletter/gallery" },
      { title: "Subscribe", to: "/newsletter/subscribe" },
    ],
  },
  {
    title: "Contact Us",
    submenu: [
      { title: "Contact Us", to: "/contact" },
      { title: "Our Presence", to: "/presence" },
      { title: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Student Portal",
    submenu: [
      { title: "Login", to: "/login" },
      { title: "Registration", to: "/register" },
    ],
  },
];

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const validMenuItems = menuItems.filter(item => item.submenu || item.mega);

  const [activeExploreCategory, setActiveExploreCategory] = useState(validMenuItems[0]);
  const [selectedExploreItem, setSelectedExploreItem] = useState(
    validMenuItems[0]?.submenu?.[0]?.title ||
    validMenuItems[0]?.mega?.[0]?.items?.[0]
  );
  const [openMegaGroup, setOpenMegaGroup] = useState(
    menuItems.find((item) => item.mega)?.mega?.[0]?.title || ""
  );
  const exploreRef = useRef(null);

  const exploreContent = {
    // About Us Group
    "Home": "Discover the DRRG Academy home experience with quick access to our latest news, featured courses, and student success stories.",
    "About Us": "At DRRG Academy, we are dedicated to empowering students with the knowledge, skills, and confidence needed to achieve their academic and career goals. Our mission is to provide high-quality education through a structured, student-focused approach that nurtures both understanding and performance. We specialize in delivering result-oriented coaching supported by experienced faculty, well-designed study materials, and practical teaching methods. At DRRG Academy, we believe that every student has the potential to succeed, and our role is to guide them with the right strategy, mentorship, and continuous support. Our learning environment is designed to encourage curiosity, discipline, and consistency. With a focus on conceptual clarity and real-world application, we prepare students not just for exams, but for long-term success in their chosen paths. Driven by excellence and innovation, DRRG Academy continues to build a strong foundation for students, helping them transform their ambitions into achievements.",
    "History": "DRRG Academy was founded with a simple yet powerful vision—to make quality education accessible and effective for every student. What started as a small initiative with a handful of learners has grown into a trusted institution known for its commitment to academic excellence and student success. In the early days, the academy focused on building a strong foundation by understanding students’ needs and creating a supportive learning environment. With dedication, consistent results, and positive student outcomes, DRRG Academy quickly gained recognition and expanded its programs and reach. Over the years, the academy has continuously evolved by adopting modern teaching methods, integrating practical learning approaches, and enhancing its curriculum to meet changing educational demands. Our journey has been driven by passionate educators, motivated students, and a shared goal of achieving excellence. Today, DRRG Academy stands as a growing center of learning, shaping the future of students and helping them turn their aspirations into achievements. As we move forward, we remain committed to innovation, quality education, and empowering the next generation.",
    "Group of Companies": "DRRG Academy is a part of a dynamic and growing group of organizations committed to excellence across multiple sectors. Our group shares a common vision of delivering quality, innovation, and value-driven services in every field we operate in. With a strong foundation built on trust and performance, the DRRG Group has expanded its presence across education, technology, and skill development. Each organization under the group works with a focused mission while maintaining the core values of integrity, professionalism, and continuous improvement. Through collaboration and shared expertise, the group aims to create opportunities, empower individuals, and contribute positively to society. DRRG Academy plays a key role in this ecosystem by nurturing talent and preparing students for future challenges.",
    "Numbers Counter": "With 20+ years of experience, 50,000+ alumni, 100+ industry partners, and 5 specialized campuses across India.",
    "Testimonials": "Rahul Sharma – Hotel Management Graduate: “DRRG Academy provided me with the perfect platform to build my career. The practical training and expert guidance helped me gain confidence and secure a job in a reputed hotel chain.” Priya Reddy – Medical Training Program: “The faculty at DRRG Academy are highly supportive and knowledgeable. The hands-on training and real-world exposure made learning very effective.” Arjun Kumar – Aviation & Cruise Training: “Choosing DRRG Academy was one of the best decisions I’ve made. The structured curriculum and placement assistance helped me land an international opportunity.” Sneha Patel – Vocational Training Student: “The learning environment is very motivating, and the trainers focus on both technical skills and personal development.”",    
    "Awards & Certificates": "DRRG Academy is ISO 9001:2015 certified and has received multiple 'Best Vocational Trainer' awards in the last decade.",

    // RG Academy Group
    "Institutions": "Our network includes specialized campuses for Medical, Hospitality, and Business studies, each equipped with state-of-the-art labs.",
    "Unicarewel": "Unicarewel focuses on medical education consultancy, helping aspirants secure admissions in top medical universities abroad.",
    "RGMTN": "The premier Institute of Hospitality Management under DRRG, offering world-class training in hotel and tourism services.",
    "BGLRGM": "BGLRGM provides industry-standard vocational education training, ensuring students are job-ready from day one.",

    // Courses Group
    "Hospitality": "Comprehensive training in front office operations, food and beverage service, and housekeeping management.",
    "Tourism Courses": "Explore travel management, destination marketing, and global tourism operations with our expert-led modules.",
    "Hotel Management Courses": "Professional degree and diploma programs covering all aspects of modern hotel administration and leadership.",
    "Cruise and Aviation Courses": "Specialized training for on-board guest services, airport operations, and cabin crew excellence.",
    "Medical Courses": "Practical healthcare training for nursing, paramedical, and allied health sciences career paths.",
    "Non-Medical Courses": "Diverse programs in business administration, IT support, and vocational skills for various industries.",
    "All Courses list and details": "Detailed catalog of all active vocational and professional programs offered across our institution network.",

    // Sub-Categories under specific levels
    "Diploma Courses (1 to 2 years)": "1 to 2-year diploma programs designed for rapid skill acquisition and professional entry into specialized sectors.",
    "Degree Courses (3 years)": "Comprehensive 3-year undergraduate programs providing deep academic knowledge and practical industry exposure.",
    "Master Degree Courses (2 years)": "Advanced 2-year masters programs for specialization and leadership training in various professional fields.",
    "Vocational Trainings (6 months Courses)": "Short-term intensive training focused on direct technical skills and immediate employability.",

    // Coaching & Training
    "Engineering (JEE)": "Prepare for top engineering institutes with our structured coaching program for JEE Main and Advanced.",
    "Medical (NEET)": "Concept-based learning and rigorous practice sessions for medical aspirants targeting NEET qualifying scores.",
    "Civil services (UPSC/KPSC)": "Aspirants for administrative services get expert guidance, mock tests, and current affairs analysis.",
    "Banking (IBPS/SBI)": "Targeted coaching for IBPS and SBI competitive exams with focus on aptitude, reasoning, and banking awareness.",
    "Management (CAT/CET/MAT/GRE)": "Build your verbal, quantitative, and logical reasoning skills for top management entrance tests.",

    // Placements
    "Internships": "Curated 3-6 month internships providing practical industry experience and potential for pre-placement offers.",
    "Permanent Jobs": "Direct placement support connecting qualified graduates with leading global and national employers.",
    "Campus Drive": "On-campus recruitment events where students can interview directly with HR teams from top-tier organizations.",
    "Placement Partners": "A network of 100+ partners including major luxury hotel chains, international hospitals, and tech firms.",
    "FAQs": "Get answers to common queries regarding placement eligibility, documentation, and salary standards.",

    // Exams
    "Exams": "Overview of all academic and competitive certifications hosted or supported by the Academy.",
    "Apply Now": "Step-by-step guidance for exam registration, fee payment, and document submission.",
    "Results": "Secure portal to check performance updates and download digital scorecards for recent evaluations.",
    "Entry Ticket": "Instructions for downloading hall tickets and exam day protocols for all candidates.",

    // Industries
    "Hospitality": "Learn about emerging trends in global hospitality and the vast career landscape for skilled professionals.",
    "Cruise & Aviation": "Insights into the dynamic world of luxury cruises and commercial aviation services.",
    "Medical": "Overview of the healthcare support industry and the growing demand for qualified allied health staff.",
    "Others": "Explore paths in emerging service sectors and niche vocational markets.",

    // Partner With Us
    "Franchise Partners": "Collaborate with us to expand educational excellence. Low investment, high-impact partnership models available.",

    // Newsletter
    "News & Media": "Keep track of our latest campus news, press releases, and media mentions.",
    "Blogs": "Thought leadership articles, student stories, and industry advice from our expert faculty.",
    "Posts": "Engaging social highlights from campus life, cultural events, and industry visits.",
    "Gallery": "Visual showcase of our facilities, graduation ceremonies, and student workshops.",
    "Subscribe": "Stay updated on new course launches and admissions dates by joining our mailing list.",

    // Contact
    "Contact Us": "Reach out to our helpline for admissions, support, or general inquiries. We are here to help.",
    "Our Presence": "Map and location details for our central office in Bangalore and regional training hubs.",
    "Careers": "Join our faculty or administration. Browse open positions for educators and support staff.",

    // Student Portal
    "Login": "Secure access for registered students to view schedules, course content, and track academic progress.",
    "Registration": "Register here to start your application process for a new academic program at DRRG Academy.",
  };

  const getExploreContent = (key) => exploreContent[key] || "Select an item to read more about it.";

  const handleExploreItemClick = (category, itemTitle) => {
    setActiveExploreCategory(category);
    setSelectedExploreItem(itemTitle);
    if (category.mega) {
      setOpenMegaGroup("");     
      setSelectedExploreItem("");    
    } else {
      setOpenMegaGroup("");
    }
  };

  useEffect(() => {
    if (activeExploreCategory.mega) {
      setOpenMegaGroup("");
      setSelectedExploreItem("");
    } else if (activeExploreCategory.submenu) {
      setOpenMegaGroup("");
      setSelectedExploreItem(activeExploreCategory.submenu[0]?.title || "");
    }

    const handleClickOutside = (event) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        setIsExploreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeExploreCategory]);

  // Handler for forced refresh navigation
  const handleForcedNavigation = (e, to) => {
    e.preventDefault();
    window.location.href = to;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Top Corporate Strip - Single Line forced */}
      <div className="bg-slate-900 text-slate-400 text-[10px] md:text-xs py-2.5 px-4 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-6 min-w-max md:min-w-0">
          
          {/* Left: Verticals - Forces refresh via <a> */}
          <div className="flex items-center gap-3 md:gap-5 font-medium shrink-0">
            <a href="/" onClick={(e) => handleForcedNavigation(e, "/")} className="hover:text-white transition-colors">Dr R G Academy</a>
            <span className="text-slate-700">|</span>
            <a href="/unicarewel" onClick={(e) => handleForcedNavigation(e, "/unicarewel")} className="hover:text-white transition-colors">Unicarewel</a>
            <span className="text-slate-700">|</span>
            <a href="/rgmtn" onClick={(e) => handleForcedNavigation(e, "/rgmtn")} className="hover:text-white transition-colors">RGMTN</a>
            <span className="text-slate-700">|</span>
            <a href="/bglrgm" onClick={(e) => handleForcedNavigation(e, "/bglrgm")} className="hover:text-white transition-colors">BGLRGM</a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-5 font-semibold shrink-0">
            <a href="/admissions" onClick={(e) => handleForcedNavigation(e, "/admissions")} className="hover:text-white transition-colors">Admissions</a>
            <a href="/apply" onClick={(e) => handleForcedNavigation(e, "/apply")} className="hover:text-white transition-colors">Apply Now</a>
            <a href="/scholarships" onClick={(e) => handleForcedNavigation(e, "/scholarships")} className="hover:text-white transition-colors">Scholarships</a>
            <a href="/resource-supply" onClick={(e) => handleForcedNavigation(e, "/resource-supply")} className="hover:text-white transition-colors">Resource Supply</a>
            <a href="/benefits" onClick={(e) => handleForcedNavigation(e, "/benefits")} className="hover:text-white transition-colors">Benefits</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="relative border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
              <div className="p-1 rounded bg-white">
                <img src={logo} alt="DRRG Academy Logo" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                DRRG Academy
              </span>
            </Link>

            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden lg:flex items-center gap-4" ref={exploreRef}>
                <button
                  type="button"
                  onClick={() => setIsExploreOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors"
                  aria-expanded={isExploreOpen}
                >
                  Explore
                  <ChevronDown size={14} />
                </button>

                {isExploreOpen && (
                  <div className="absolute inset-x-0 top-full z-50">
                    <div className="mx-auto w-full bg-white border-t border-slate-200 shadow-xl shadow-slate-200/50">
                      <div className="border-b border-slate-200 px-4 py-4 lg:px-6">
                        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 overflow-x-auto">
                          {menuItems
                            .filter((item) => item.submenu || item.mega) 
                            .map((item) => (
                            <button
                              key={item.title}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); 
                                e.preventDefault();    
                                handleExploreItemClick(
                                  item,
                                  item.submenu?.[0]?.title ||
                                  item.mega?.[0]?.items?.[0] ||
                                  item.title
                                );
                              }}
                              className={`whitespace-nowrap text-sm font-semibold transition ${activeExploreCategory.title === item.title ? "text-slate-900 border-b-2 border-brand-600 pb-1" : "text-slate-600 hover:text-slate-900"}`}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-6 px-4 py-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6 lg:py-6 h-[70vh]">
                        <div className="overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900 mb-4">{activeExploreCategory.title}</p>
                          <div className="space-y-2">
                            {activeExploreCategory.submenu?.map((sub) => (
                              <button
                                key={sub.title}
                                type="button"
                                onClick={() => setSelectedExploreItem(sub.title)}
                                className={`block w-full text-left rounded-2xl px-4 py-3 text-sm transition ${selectedExploreItem === sub.title ? "border border-brand-200 bg-white text-brand-700 font-bold" : "text-slate-700 hover:bg-white hover:text-slate-900"}`}
                              >
                                {sub.title}
                              </button>
                            ))}

                            {activeExploreCategory.mega?.map((group) => (
                              <div key={group.title} className="rounded-3xl border border-slate-200 bg-white mb-2">
                                <button
                                  type="button"
                                  onClick={() => setOpenMegaGroup((prev) => (prev === group.title ? "" : group.title))}
                                  className="flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                                >
                                  <span>{group.title}</span>
                                  <span className="text-slate-400">{openMegaGroup === group.title ? "-" : "+"}</span>
                                </button>
                                {openMegaGroup === group.title && (
                                  <div className="space-y-2 border-t border-slate-200 px-4 pb-4 pt-3">
                                    {group.items.map((sub) => (
                                      <button
                                        key={sub}
                                        type="button"
                                        onClick={() => setSelectedExploreItem(sub)}
                                        className={`block w-full text-left rounded-2xl px-4 py-3 text-sm transition ${selectedExploreItem === sub ? "border border-brand-200 bg-white text-brand-700 font-bold" : "text-slate-700 hover:bg-slate-100"}`}
                                      >
                                        {sub}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="mt-2 text-xl font-semibold text-slate-900">{selectedExploreItem}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsExploreOpen(false)}
                              className="text-sm text-slate-500 hover:text-slate-900"
                            >
                              Close
                            </button>
                          </div>
                          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
                            <p>{getExploreContent(selectedExploreItem)}</p>
                            
                            {/* Student Portal Logic: Show only relevant button */}
                            {activeExploreCategory.title === "Student Portal" && (
                              <div className="mt-4">
                                {selectedExploreItem === "Login" && (
                                  <Link
                                    to="/login"
                                    onClick={() => setIsExploreOpen(false)}
                                    className="block max-w-[200px] rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700 transition"
                                  >
                                    Go to Login
                                  </Link>
                                )}
                                {selectedExploreItem === "Registration" && (
                                  <Link
                                    to="/register"
                                    onClick={() => setIsExploreOpen(false)}
                                    className="block max-w-[200px] rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700 transition"
                                  >
                                    Register Now
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {menuItems
                .filter((item) => item.submenu || item.mega)
                .map((item) => (
                <div key={item.title} className="border-b border-gray-100 pb-3">
                  <span className="block text-base font-semibold text-slate-700 py-2">
                    {item.title}
                  </span>
                  {item.submenu && (
                    <div className="pl-4 pt-2 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.title}
                          to={sub.to}
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-sm text-slate-600 hover:text-slate-900"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  {item.mega && (
                    <div className="pl-4 pt-2 space-y-4">
                      {item.mega.map((group) => (
                        <div key={group.title}>
                          <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                          <div className="pl-2 pt-1 space-y-1">
                            {group.items.map((sub) => (
                              <span key={sub} className="block text-sm text-slate-600">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-3 border border-slate-200 rounded font-semibold text-slate-600"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
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
          
          {/* Featured Academy Verticals Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Our Academy Verticals</h4>
                <p className="text-slate-500 mt-1">Specialized institutions under the DRRG umbrella.</p>
              </div>
              <Link to="/courses" className="text-brand-600 font-bold hover:underline">Explore All Courses →</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-200">
              {[
                { title: "Medical Education", desc: "Global MBBS & Healthcare guidance via Unicarewel.", img: medicalImg, link: "/unicarewel" },
                { title: "Hospitality Academy", desc: "World-class tourism training at RGMTN campuses.", img: hospitalityImg, link: "/rgmtn" },
                { title: "Vocational Excellence", desc: "Industry-aligned skill building by BGLRGM experts.", img: vocationalImg, link: "/bglrgm" },
                { title: "DRRG Main Campus", desc: "Core academic programs and Montessori education.", img: campusImg, link: "/about-us" },
              ].map((item, idx) => (
                <Link key={idx} to={item.link} className="group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300">
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.img} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-red-600/10 transition-colors"></div>
                  </div>
                  <div className="p-5 text-center">
                    <h5 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1 rounded bg-white shadow-sm border border-slate-100">
                  <img src={logo} alt="DRRG Academy Logo" className="h-9 w-9 object-contain" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  DRRG Academy
                </span>
              </div>
              <p className="mb-6 max-w-sm leading-relaxed text-slate-500">
                A premier group of institutions dedicated to excellence in professional education, vocational training, and global consultancy. Empowering the next generation of global leaders.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-md">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-md">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-md">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-[0.2em]">
                Quick Links
              </h4>
              <ul className="space-y-4 font-medium text-slate-500">
                <li><a href="/locate-us" onClick={(e) => handleForcedNavigation(e, "/locate-us")} className="hover:text-brand-700 transition-colors">Locate Us</a></li>
                <li><a href="/privacy-policy" onClick={(e) => handleForcedNavigation(e, "/privacy-policy")} className="hover:text-brand-700 transition-colors">Privacy Policy</a></li>
                <li><a href="/refund-policy" onClick={(e) => handleForcedNavigation(e, "/refund-policy")} className="hover:text-brand-700 transition-colors">Cancellation & Refund Policy</a></li>
                <li><a href="/terms-conditions" onClick={(e) => handleForcedNavigation(e, "/terms-conditions")} className="hover:text-brand-700 transition-colors">Terms & Condition</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-[0.2em]">
                Programs
              </h4>
              <ul className="space-y-4 font-medium text-slate-500">
                <li><a href="/courses/masters" onClick={(e) => handleForcedNavigation(e, "/courses/masters")} className="hover:text-brand-700 transition-colors">Master Degree Courses</a></li>
                <li><a href="/courses/international" onClick={(e) => handleForcedNavigation(e, "/courses/international")} className="hover:text-brand-700 transition-colors">International Courses & Degree</a></li>
                <li><a href="/opportunities/onsite" onClick={(e) => handleForcedNavigation(e, "/opportunities/onsite")} className="hover:text-brand-700 transition-colors">Onsite Opportunities</a></li>
              </ul>
            </div>

            <div className="col-span-2 space-y-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-[0.2em]">
                  Resources
                </h4>
                <ul className="grid grid-cols-1 gap-4">
                  <li>
                    <a href="/downloads" onClick={(e) => handleForcedNavigation(e, "/downloads")} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-brand-300 hover:shadow-sm transition-all group">
                      <span className="font-bold text-slate-700">Download Section</span>
                      <div className="p-2 bg-brand-50 rounded-xl text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <ChevronDown size={14} className="rotate-180" />
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/payment" onClick={(e) => handleForcedNavigation(e, "/payment")} className="flex items-center justify-between p-4 bg-brand-600 rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all group">
                      <span className="font-bold text-white">Pay Now Page</span>
                      <div className="p-2 bg-white/20 rounded-xl text-white">
                        <Globe size={14} />
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Office</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Padmanabhanagar, Bangalore, Karnataka - 560070, India.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs">
            <p className="text-slate-400">© 2024-2026 DR R G ACADEMY LLP. | ISO 9001:2015 Certified | All Rights Reserved.</p>
            <div className="flex flex-wrap gap-4 md:gap-7 justify-center text-slate-400 font-bold uppercase tracking-tighter">
              <a href="/privacy-policy" onClick={(e) => handleForcedNavigation(e, "/privacy-policy")} className="hover:text-brand-700">Privacy</a>
              <a href="/terms-conditions" onClick={(e) => handleForcedNavigation(e, "/terms-conditions")} className="hover:text-brand-700">Terms</a>
              <a href="/refund-policy" onClick={(e) => handleForcedNavigation(e, "/refund-policy")} className="hover:text-brand-700">Refund</a>
              <a href="/disclaimer" className="hover:text-brand-700">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
