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
  X,
  Globe,
  Settings,
  Info
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const infoKey = searchParams.get("info");

  const industrialInsights = {
    "Locate Us": "DRRG Academy’s physical footprint is strategically distributed to align with India’s most critical industrial hubs. Our main corporate headquarters in Bangalore, the Silicon Valley of India, serves as the central nerve center for our technology and management programs. Our Mangalore and Hubli campuses are specialized training arenas for hospitality and paramedical sciences, featuring dedicated simulation wings that replicate actual 5-star hotel lobbies and surgical wards. Internationally, our network extends through accredited consultancy partners in Southeast Asia and Europe, facilitating a seamless pipeline for students pursuing international internships and global job placements. Every one of our centers is equipped with Tier-1 infrastructure, high-speed campus-wide fiber networks, and multi-functional collaboration spaces that encourage peer-to-peer learning and industry interaction. We continue to expand our reachable 'Knowledge Nodes' to ensure that every student, regardless of geography, has access to the most advanced vocational tools and professional mentorship available in the current academic landscape.",
    "Privacy Policy": "In an era of digital-first education, DRRG Academy adheres to the most stringent global data sovereignty standards, including the General Data Protection Regulation (GDPR) and the Payment Card Industry Data Security Standard (PCI-DSS). Our data architecture is built on advanced end-to-end encryption protocols (AES-256), ensuring that all student records—from academic transcripts to financial transactions—are immunized against unauthorized access. We operate on a 'Privacy by Design' philosophy, meaning data protection is integrated into every software module we deploy, including our student portal and e-learning platforms. Our internal policies strictly prohibit the monetization or third-party sharing of student behavioral data. We maintain localized data residency to comply with national digital policies while providing students with a transparent interface to audit, export, or permanently redact their personal information. Regular third-party security audits and real-time threat monitoring are conducted to maintain a zero-vulnerability environment, ensuring that your focus remains entirely on your professional growth in a safe digital ecosystem.",
    "Cancellation & Refund Policy": "DRRG Academy’s financial protocols are designed with absolute clarity and student-centric transparency. Our refund framework is structured to protect the interests of both the applicant and the institution. (1) Pre-Session Withdrawal: Candidates withdrawing their application at least 15 days prior to the commencement of the official academic term are eligible for a 100% tuition refund, processed within a standard 14-day window. (2) Mid-term Transition: For students needing to withdraw due to unforeseen circumstances, we offer a phased pro-rata credit system that can be applied to future course enrollments or converted to a partial refund based on the audited duration of resource utilization. (3) Documentation: All refund requests are tracked through our centralized ERP system to ensure accountability and speed. We believe that financial integrity is the cornerstone of educational trust, which is why we provide a line-itemized 'Transparency Document' at the time of admission, detailing every component of the fee structure—from laboratory insurance to library maintenance—leaving zero room for hidden charges or administrative ambiguity.",
    "Terms & Condition": "The DRRG Academic Excellence Framework (AEF) is a comprehensive set of terms designed to uphold the highest standards of professional conduct and academic rigor. Enrollment in any of our specialized programs implies a mutual commitment to excellence. These terms include a mandatory 80% attendance threshold for all technical and practical laboratory sessions, ensuring that students gain necessary hands-on competency. Our code of conduct is modeled after international corporate workplace policies, preparing students for professional environments in the hospitality, aviation, and medical sectors. Proprietary learning materials provided by the Academy are protected under intellectual property laws and are intended for the exclusive use of registered students. We also outline clear guidelines for the use of simulation equipment and digital assets, ensuring longevity and safety for the entire learning community. These terms are revisited annually by our Board of Governors, incorporating feedback from our 100+ hiring partners to ensure that our students’ behavioral and academic prerequisites are aligned with the evolving expectations of global recruiters.",
    "Master Degree Courses": "Our Postgraduate Management Programs (PGMP) represent the absolute zenith of vocational leadership training. Specifically engineered for graduates with high-management ambitions, these 2st-tier programs focus on 'Strategic Industrial Intelligence.' The curriculum is delivered through a high-intensity module-based system involving over 500 hours of live industry immersion and 200 hours of executive-led workshop sessions. Students are exposed to advanced modules in Revenue Management, Global Supply Chain Optimization, Crisis Communication, and Organizational Psychology. Our partnership with international MBA-standard universities allows for a dual-degree certification path, significantly enhancing the global mobility of our graduates. The capstone project—a 6-month 'Industrial Impact' thesis—requires students to implement a real-world solution within a partner organization, often serving as the final evaluation for senior management placement. This program is not just a degree; it is a rapid-acceleration leadership incubator for the next generation of global industry captains.",
    "International Degrees": "The DRRG Global Mobility Program (GMP) is an elite academic pathway specifically designed to provide students with a cross-continental educational experience. Through our unique 'Hybrid Residency' model, students spend the initial phases of their degree at our state-of-the-art Indian campuses, mastering foundational theories and technical skills, before transitioning to our partner universities in regions like Switzerland, the UK, Germany, or Southeast Asia for their final specialization years. This model reduces the total financial burden by up to 50% compared to traditional international-only degrees, while providing the same level of global academic accreditation. We provide a dedicated 'Global Desk' that assists students with international credit transfers, visa documentation (including post-study work permits), and cultural bridge-building workshops. By the time of graduation, students possess dual-cultural perspectives and a portfolio of international work experience, making them uniquely qualified for roles in multinational corporations and global service sectors.",
    "Onsite Training": "Our 'Real-World Immersion' (RWI) philosophy dictates that classrooms are secondary to actual industry environments. From the very first semester, students are integrated into the operations of our flagship partner institutions—from top tier luxury hotels to multi-specialty acute care hospitals. This is a structured technical apprenticeship where students are assigned to industry mentors who evaluate their performance on real-world professional metrics. This onsite exposure covers every operational facet: from back-end technical management and quality control to front-end guest/patient relationship management. We utilize a 'Competency-Based Evaluation' (CBE) system that translates onsite performance directly into academic credits. With over 2,000 hours of mandatory onsite training for degree students, our graduates emerge not as 'fresher' candidates, but as seasoned professionals who have already navigated the pressures and complexities of their chosen sectors, often resulting in a 95% pre-placement success rate.",
    "Vocational Excellence": "The DRRG 'Elite Skills' Vocational Framework is built on the pillars of 'Precision, Speed, and Technical Mastery.' Recognized under national and international skill development standards (NSDC), our vocational tracks are designed for individuals who demand high-velocity career entry. We focus on 'Zero-Theory Redundancy,' meaning every hour spent in the academy is focused on active technical production—whether it’s advanced molecular gastronomy in our culinary labs, emergency life-support protocols in our medical wings, or high-level technical maintenance in our engineering workshops. Our training equipment is sourced from the same global manufacturers that supply the industries themselves, ensuring students train on the exact tools they will use in the workforce. Upon completion, students receive a 'Professional Capability Passport,' a comprehensive document that verifies their specific technical competencies to global recruiters, ensuring they are positioned at the top of the talent pool for high-growth service and technical sectors.",
    "Download Section": "Our Digital Institutional Dossier is a comprehensive guide that provides a microscopic view into the educational ecosystem of DRRG Academy. This is not just a brochure; it is a repository of technical data, including: (1) Curriculum Blueprints: A week-by-week breakdown of every learning module for all 45+ courses. (2) Infrastructure Audits: Detailed specifications of our specialized laboratories, simulation centers, and IT hubs. (3) Faculty Matrix: Bios and industry achievements of our permanent and visiting educators. (4) Placement Analytics: A 5-year statistical breakdown of hiring trends, salary quartiles, and international placement success. (5) Scholarship Pathways: Detailed criteria for our merit-based and financial-need scholarship programs. This dossier is the essential first point of reference for serious students and parents who wish to conduct a rigorous analysis of the ROI (Return on Investment) provided by a DRRG education.",
    "Industry Intelligence": "The DRRG 'Career Command Center' (CCC) provides a transparent, real-time interface for tracking the professional trajectory of our alumni network. This tracker aggregates data from our 100+ global hiring partners across the aviation, hospitality, healthcare, and corporate sectors. Stakeholders can view a live map of placements, categorized by industry vertical and geographic region. (1) Hiring Metrics: Real-time updates on which of our partners are currently conducting recruitment drives. (2) Salary Benchmarks: Anonymous data on average starting CTCs across different programs. (3) Alumni Profiles: Success stories and current roles of our top performers in organizations like Emirates, Taj Hotels, Fortis Healthcare, and Google. (4) Partner Feedback: A live feed of testimonials from HR managers regarding the performance of DRRG graduates in their organizations.",
    "Secure Fee Management": "Our 'Institutional Finance Portal' (IFP) is a high-security, fintech-integrated environment specifically designed to handle all student financial interactions with zero latency and maximum protection. Built on a PCI-DSS Level 1 compliant architecture, it employs multi-factor authentication and tokenized transaction security to ensure that your financial data is never exposed. Key features include: (1) Flexible Billing: Options for full-term, annual, or modular installment payments tailored to your financial planning. (2) International Support: seamless processing for multi-currency transfers, including international wire and credit card facilities for our global students. (3) Instant Reconciliation: Real-time updates to your student ledger and immediate digital receipt generation. (4) Scholarship management: Automated adjustment of fees based on approved scholarship grants.",
  };

  return (
    <div className="bg-white">
      {/* Dynamic Info Section (Triggered by Footer) */}
      {infoKey && industrialInsights[infoKey] && (
        <section className="bg-brand-50/50 border-b border-brand-100 py-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-brand-900/10 overflow-hidden border border-brand-100">
              <div className="p-8 md:p-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4">
                      <Info size={12} /> Institutional Intelligence
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                      {infoKey}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSearchParams({})}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <X size={18} /> Close Section
                  </button>
                </div>

                <div className="grid lg:grid-cols-1 gap-12">
                  <div className="prose prose-slate max-w-none">
                    {industrialInsights[infoKey].split('\n').map((para, i) => (
                      <p key={i} className="text-lg md:text-xl text-slate-600 leading-[1.8] mb-6 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-16 grid md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 italic">Technical Compliance</p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      All educational frameworks and institutional protocols outlined above are validated under the DRRG Academic Excellence standard and global industrial benchmarks.
                    </p>
                  </div>
                  <div className="p-8 bg-brand-600 rounded-[2rem] text-white">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Academic Roadmap</p>
                    <p className="text-sm text-white/90 leading-relaxed mb-4">
                      Interested in integrating this knowledge into your career? Connect with our global academic desk for a personalized roadmap.
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-2 font-bold text-sm bg-white text-brand-700 px-6 py-2 rounded-xl hover:bg-brand-50 transition-colors">
                      Consult Counselor <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
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
                  Try DRRG for Business
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
            DRRG Academy.
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
