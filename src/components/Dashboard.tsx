import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  ChevronDown,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

// Indian States & Union Territories List
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir"
];

// Mock DB of Government Schemes & Eligibility
interface Scheme {
  id: string;
  name: string;
  category: 'Scholarship' | 'Gov Scheme' | 'Skill Program';
  description: string;
  benefitValue: number;
  minAge?: number;
  maxAge?: number;
  states?: string[];
  educationLevels?: string[];
  maxIncome?: number; // per annum
  categories?: string[];
  employmentStatus?: string[];
  documents: string[]; // Required documents list
}

const SCHEMES_DB: Scheme[] = [
  {
    id: 'sc-scholarship',
    name: 'Post-Matric Scholarship Scheme for SC Students',
    category: 'Scholarship',
    description: 'Financial assistance for SC students pursuing post-matriculation or post-secondary courses to complete their education.',
    benefitValue: 12500,
    maxIncome: 250000,
    categories: ['SC'],
    educationLevels: ['12th', 'Graduate', 'Masters'],
    documents: ['Aadhaar Card', 'SC Caste Certificate', 'Tehsildar Income Certificate', 'Previous Marksheet']
  },
  {
    id: 'pmrf',
    name: 'Prime Minister Research Fellowship (PMRF)',
    category: 'Scholarship',
    description: 'Fellowship scheme for high-quality research in science and technology at prestigious institutions (IITs, IISc, IISERs).',
    benefitValue: 70000,
    maxAge: 30,
    educationLevels: ['Masters', 'Doctorate'],
    employmentStatus: ['Student'],
    documents: ['PMRF Project Proposal', 'GATE/NET Score Card', 'Recommendation Letters', 'Masters Degree Certificate']
  },
  {
    id: 'nmmss',
    name: 'National Means-Cum-Merit Scholarship',
    category: 'Scholarship',
    description: 'Scholarship to award scholarships to meritorious students of economically weaker sections to arrest their drop out at class VIII.',
    benefitValue: 12000,
    maxIncome: 350000,
    educationLevels: ['10th'],
    documents: ['Class 9 Marksheet', 'Income Certificate', 'Aadhaar Card', 'Bonafide Student Certificate']
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    category: 'Gov Scheme',
    description: 'Providing loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises to encourage entrepreneurship.',
    benefitValue: 50000, // estimated loan assistance valuation
    employmentStatus: ['Entrepreneur'],
    minAge: 18,
    documents: ['Business Plan Proposal', 'Aadhaar & PAN Card', 'Address Proof of Enterprise', 'GST Registration']
  },
  {
    id: 'ddu-gky',
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
    category: 'Skill Program',
    description: 'Placement-linked skill training program for rural youth to build sustainable livelihoods.',
    benefitValue: 15000,
    minAge: 15,
    maxAge: 35,
    states: ['Maharashtra', 'Delhi', 'Karnataka', 'Bihar'],
    employmentStatus: ['Unemployed', 'Student'],
    documents: ['Aadhaar Card', 'Rural Domicile Proof', 'Class 10 Marksheet', 'Age Proof Certificate']
  },
  {
    id: 'startup-grant',
    name: 'Atal Innovation Mission Seed Support',
    category: 'Skill Program',
    description: 'Financial support and incubation mentoring for tech startups registered under AIM centers.',
    benefitValue: 100000,
    educationLevels: ['Graduate', 'Masters', 'Doctorate'],
    employmentStatus: ['Entrepreneur'],
    documents: ['DPIIT Recognition Certificate', 'Detailed Pitch Deck', 'Company Audit Statement', 'Founder PAN Card']
  },
  {
    id: 'state-welfare',
    name: 'State Education Welfare Assistance',
    category: 'Gov Scheme',
    description: 'Special fee reimbursement and book allowances provided to students of disadvantaged categories.',
    benefitValue: 22000,
    states: ['Maharashtra', 'Delhi'],
    categories: ['OBC', 'SC', 'ST', 'EWS'],
    educationLevels: ['12th', 'Graduate', 'Masters'],
    documents: ['Domicile Certificate', 'Aadhaar Card', 'Caste/Category Certificate', 'Current Fee Receipt']
  },
  {
    id: 'women-entrepreneurship',
    name: 'Stand-Up India Scheme',
    category: 'Gov Scheme',
    description: 'Promoting entrepreneurship among women and SC/ST communities by offering financial loans and subsidies.',
    benefitValue: 80000,
    minAge: 18,
    categories: ['SC', 'ST'],
    employmentStatus: ['Entrepreneur'],
    documents: ['SC/ST Caste Certificate', 'Project Cost Proposal', 'Business PAN Card', 'Bank Dues Clearance Cert']
  }
];

export const Dashboard: React.FC = () => {
  // 1. Local Form State (inputs edit status)
  const [formAge, setFormAge] = useState<number>(20);
  const [formState, setFormState] = useState<string>('Maharashtra');
  const [formEducation, setFormEducation] = useState<string>('Graduate');
  const [formIncome, setFormIncome] = useState<number>(180000);
  const [formCategory, setFormCategory] = useState<string>('SC');
  const [formEmployment, setFormEmployment] = useState<string>('Student');

  // Custom Dropdown Open States
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [isEmploymentDropdownOpen, setIsEmploymentDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Committed Matching State (updates ONLY on form submit click)
  const [age, setAge] = useState<number>(20);
  const [state, setState] = useState<string>('Maharashtra');
  const [education, setEducation] = useState<string>('Graduate');
  const [income, setIncome] = useState<number>(180000);
  const [category, setCategory] = useState<string>('SC');
  const [employment, setEmployment] = useState<string>('Student');

  // State to track if the dashboard has been activated by user submit click
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Accordion state for Matched Opportunity Cards
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleCardExpanded = (id: string) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  // Dynamic Filtering Logic based on COMMITTED state
  const matchedSchemes = useMemo(() => {
    return SCHEMES_DB.filter(scheme => {
      // Age check
      if (scheme.minAge && age < scheme.minAge) return false;
      if (scheme.maxAge && age > scheme.maxAge) return false;

      // State check
      if (scheme.states && !scheme.states.includes(state)) return false;

      // Education level check
      if (scheme.educationLevels && !scheme.educationLevels.includes(education)) return false;

      // Family income check
      if (scheme.maxIncome && income > scheme.maxIncome) return false;

      // Category check
      if (scheme.categories && !scheme.categories.includes(category)) return false;

      // Employment check
      if (scheme.employmentStatus && !scheme.employmentStatus.includes(employment)) return false;

      return true;
    });
  }, [age, state, education, income, category, employment]);

  // Dynamic calculations based on committed settings
  const totalBenefitValue = useMemo(() => {
    return matchedSchemes.reduce((sum, scheme) => sum + scheme.benefitValue, 0);
  }, [matchedSchemes]);

  // Eligibility score logic
  const eligibilityScore = useMemo(() => {
    const totalSchemes = SCHEMES_DB.length;
    const matchesCount = matchedSchemes.length;
    if (matchesCount === 0) return 15;
    return Math.min(Math.round((matchesCount / totalSchemes) * 100) + 15, 100);
  }, [matchedSchemes]);

  // Category distributions
  const categorySplit = useMemo(() => {
    const scholarshipVal = matchedSchemes
      .filter(s => s.category === 'Scholarship')
      .reduce((sum, s) => sum + s.benefitValue, 0);
    const govSchemeVal = matchedSchemes
      .filter(s => s.category === 'Gov Scheme')
      .reduce((sum, s) => sum + s.benefitValue, 0);
    const skillVal = matchedSchemes
      .filter(s => s.category === 'Skill Program')
      .reduce((sum, s) => sum + s.benefitValue, 0);

    const total = totalBenefitValue || 1;
    return {
      scholarship: (scholarshipVal / total) * 100,
      govScheme: (govSchemeVal / total) * 100,
      skill: (skillVal / total) * 100,
      scholarshipVal,
      govSchemeVal,
      skillVal
    };
  }, [matchedSchemes, totalBenefitValue]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAge(formAge);
    setState(formState);
    setEducation(formEducation);
    setIncome(formIncome);
    setCategory(formCategory);
    setEmployment(formEmployment);
    setHasSubmitted(true);
  };

  const filteredStates = useMemo(() => {
    return INDIAN_STATES.filter(st => st.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  // Dynamic values based on activation flag
  const displayBenefitValue = hasSubmitted ? totalBenefitValue : 0;
  const displayEligibilityScore = hasSubmitted ? eligibilityScore : 0;
  const displayMatchedCount = hasSubmitted ? matchedSchemes.length : 0;
  
  const displayScholarshipPercent = hasSubmitted ? categorySplit.scholarship : 0;
  const displayScholarshipVal = hasSubmitted ? categorySplit.scholarshipVal : 0;
  
  const displayGovSchemePercent = hasSubmitted ? categorySplit.govScheme : 0;
  const displayGovSchemeVal = hasSubmitted ? categorySplit.govSchemeVal : 0;
  
  const displaySkillPercent = hasSubmitted ? categorySplit.skill : 0;
  const displaySkillVal = hasSubmitted ? categorySplit.skillVal : 0;

  // Funnel heights and values configuration
  const funnelBars = useMemo(() => {
    if (!hasSubmitted) {
      return [
        { label: "Initiated", value: "0", height: "h-2", grad: "from-blue-600 to-sky-400" },
        { label: "Profile", value: "0", height: "h-2", grad: "from-blue-500 to-blue-400" },
        { label: "Recommended", value: "0", height: "h-2", grad: "from-indigo-600 to-blue-500" },
        { label: "Applying", value: "0", height: "h-2", grad: "from-sky-600 to-sky-400" },
        { label: "Verified", value: "0", height: "h-2", grad: "from-indigo-500 to-sky-400" },
      ];
    }
    return [
      { label: "Initiated Matches", value: "65.2k", height: "h-full", grad: "from-blue-600 to-sky-400" },
      { label: "Profile Matched", value: "54.8k", height: "h-[80%]", grad: "from-blue-500 to-blue-400" },
      { label: "Recommended", value: "48.6k", height: "h-[62%]", grad: "from-indigo-600 to-blue-500" },
      { label: "Applying", value: "38.3k", height: "h-[45%]", grad: "from-sky-600 to-sky-400" },
      { label: "Verified", value: "32.9k", height: "h-[30%]", grad: "from-indigo-500 to-sky-400" },
    ];
  }, [hasSubmitted]);

  // Active dots height map
  const activeDots = useMemo(() => {
    if (!hasSubmitted || matchedSchemes.length === 0) {
      return Array(11).fill(0);
    }
    return Array.from({ length: 11 }).map((_, i) => {
      const scheme = matchedSchemes[i % matchedSchemes.length];
      return Math.min(((scheme.benefitValue + i) % 5) + 2, 6);
    });
  }, [hasSubmitted, matchedSchemes]);

  return (
    <div className="w-full bg-[#F5F5F7]/70 py-12 px-6 sm:px-10 lg:px-12 font-sans text-slate-800 relative z-10 pt-28">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* HEADER SUMMARY - Dashboard only */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Verify your eligibility, check matched schemes, and track your potential benefits in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Profile Sync Active
            </span>
          </div>
        </div>

        {/* TWO COLUMN INTERACTIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: PROFILE DATA INPUT CARD (4/12 cols) */}
          <form 
            onSubmit={handleProfileSubmit}
            className="lg:col-span-4 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                  Profile Settings
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Matching Filters
              </span>
            </div>

            {/* Input fields */}
            <div className="flex flex-col gap-4">
              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="flex-1 accent-[#2563EB] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 text-sm w-8 text-right">{formAge} yrs</span>
                </div>
              </div>

              {/* State - WITH CUSTOM SEARCH DROPDOWN OVERLAY */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State of Residence</label>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsStateDropdownOpen(!isStateDropdownOpen);
                    setIsEducationDropdownOpen(false);
                    setIsEmploymentDropdownOpen(false);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 hover:border-slate-350 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <span>{formState}</span>
                  <ChevronDown className="w-4 h-4 text-slate-455 shrink-0" />
                </button>

                {isStateDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setIsStateDropdownOpen(false)} 
                    />
                    
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-xl shadow-xl p-2.5 flex flex-col gap-2 max-h-60 overflow-hidden">
                      <input
                        type="text"
                        placeholder="Search state..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-medium"
                      />
                      <div className="flex flex-col overflow-y-auto max-h-40 divide-y divide-slate-50">
                        {filteredStates.length > 0 ? (
                          filteredStates.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setFormState(st);
                                setIsStateDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none active:scale-98",
                                formState === st 
                                  ? "text-[#2563EB] bg-blue-50/50" 
                                  : "text-slate-655 hover:bg-slate-50"
                              )}
                            >
                              {st}
                            </button>
                          ))
                        ) : (
                          <div className="text-[11px] text-slate-400 text-center py-3">
                            No states found
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Education Level - FULLY CUSTOM BEAUTIFUL DROPDOWN */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Education</label>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsEducationDropdownOpen(!isEducationDropdownOpen);
                    setIsStateDropdownOpen(false);
                    setIsEmploymentDropdownOpen(false);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 hover:border-slate-355 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <span>
                    {formEducation === '10th' && "10th Standard"}
                    {formEducation === '12th' && "12th Standard"}
                    {formEducation === 'Graduate' && "Graduate (Bachelor's)"}
                    {formEducation === 'Masters' && "Masters (Master's Degree)"}
                    {formEducation === 'Doctorate' && "Doctorate (Ph.D.)"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-450 shrink-0" />
                </button>

                {isEducationDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsEducationDropdownOpen(false)} />
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
                      {[
                        { value: '10th', label: "10th Standard" },
                        { value: '12th', label: "12th Standard" },
                        { value: 'Graduate', label: "Graduate (Bachelor's)" },
                        { value: 'Masters', label: "Masters (Master's Degree)" },
                        { value: 'Doctorate', label: "Doctorate (Ph.D.)" }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFormEducation(opt.value);
                            setIsEducationDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none active:scale-98",
                            formEducation === opt.value
                              ? "text-[#2563EB] bg-blue-50/50"
                              : "text-slate-650 hover:bg-slate-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Family Income - STARTS FROM 0 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Family Income</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="25000"
                    value={formIncome}
                    onChange={(e) => setFormIncome(Number(e.target.value))}
                    className="flex-1 accent-[#2563EB] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 text-sm min-w-[70px] text-right">
                    ₹{(formIncome / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Social Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {['General', 'OBC', 'SC', 'ST', 'EWS'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95",
                        formCategory === cat
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Status - FULLY CUSTOM BEAUTIFUL DROPDOWN */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Status</label>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsEmploymentDropdownOpen(!isEmploymentDropdownOpen);
                    setIsStateDropdownOpen(false);
                    setIsEducationDropdownOpen(false);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 hover:border-slate-355 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <span>
                    {formEmployment === 'Student' && "Student"}
                    {formEmployment === 'Unemployed' && "Unemployed"}
                    {formEmployment === 'Entrepreneur' && "Entrepreneur (Startup / Business)"}
                    {formEmployment === 'Employed' && "Employed (Salaried)"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-455 shrink-0" />
                </button>

                {isEmploymentDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsEmploymentDropdownOpen(false)} />
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
                      {[
                        { value: 'Student', label: "Student" },
                        { value: 'Unemployed', label: "Unemployed" },
                        { value: 'Entrepreneur', label: "Entrepreneur (Startup / Business)" },
                        { value: 'Employed', label: "Employed (Salaried)" }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFormEmployment(opt.value);
                            setIsEmploymentDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none active:scale-98",
                            formEmployment === opt.value
                              ? "text-[#2563EB] bg-blue-50/50"
                              : "text-slate-655 hover:bg-slate-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Match CTA button below the Profile Settings */}
              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all cursor-pointer select-none text-sm text-center active:scale-98 shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                <span>Match Schemes</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

            </div>
          </form>

          {/* RIGHT SIDE: DASHBOARD CHARTS (8/12 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* TOP ROW: ELIGIBILITY FUNNEL & TOTAL VALUE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Funnel Chart Card (Span 2) - SHOWING CONNECTING GRAPH */}
              <div className="md:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[360px] relative overflow-hidden">
                <div className="flex items-center justify-between pb-4">
                  <span className="font-bold text-base text-slate-900 tracking-tight">Eligibility Funnel</span>
                  <div className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100">
                    <span className="text-[14px] font-bold text-slate-400">···</span>
                  </div>
                </div>

                {/* Grid backdrop lines for analytical graph */}
                <div className="absolute inset-x-0 top-16 bottom-20 flex flex-col justify-between pointer-events-none opacity-[0.06] z-0 px-4">
                  <div className="border-b border-slate-900 w-full" />
                  <div className="border-b border-slate-900 w-full" />
                  <div className="border-b border-slate-900 w-full" />
                  <div className="border-b border-slate-900 w-full" />
                </div>

                {/* SVG Connecting Flow Trendline Graph */}
                {hasSubmitted && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 px-10 pt-24 pb-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path
                      d="M 5 15 Q 27.5 28, 50 45 T 95 82"
                      fill="none"
                      stroke="url(#funnel-glow-grad)"
                      strokeWidth="3.5"
                      strokeDasharray="5 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="funnel-glow-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}

                {/* Vertical Step Funnel Bars */}
                <div className="flex items-end justify-between h-56 px-2 relative z-10">
                  {funnelBars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group/bar relative">
                      <span className="text-[9px] font-medium text-slate-400 text-center uppercase tracking-wider leading-none">
                        {bar.label.split(" ")[0]}
                      </span>
                      <span className="text-base font-bold text-slate-800 leading-none">
                        {bar.value}
                      </span>
                      
                      {/* Bar with Diagonal Stripe Mask */}
                      <div 
                        className={cn(
                          "w-10 sm:w-12 rounded-lg bg-gradient-to-t relative transition-all duration-300 group-hover/bar:scale-[1.03] overflow-hidden",
                          bar.height,
                          bar.grad
                        )}
                      >
                        {/* Diagonal Stripe overlay */}
                        <div 
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.8), rgba(255,255,255,0.8) 5px, transparent 5px, transparent 12px)'
                          }}
                        />
                        {/* Soft ambient lighting overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="absolute -top-10 bg-[#0F172A] text-white px-2.5 py-1.5 rounded-lg text-[9px] font-bold shadow-lg whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {bar.value} matches | Conversion: <span className="text-blue-400">89%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-455 relative z-10">
                  <span>Welfare Funnel Tracking</span>
                  <span className="text-slate-700">Real-time stats</span>
                </div>
              </div>

              {/* Total Benefit Card (Span 1) */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[360px]">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-base text-slate-900 tracking-tight">Total Benefit Value</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Annual Savings</span>
                </div>

                <div className="my-6">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                    ₹{displayBenefitValue.toLocaleString()}
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Eligible for {displayMatchedCount} schemes</span>
                  </p>
                </div>

                {/* Subcategory distribution bars */}
                <div className="flex flex-col gap-4">
                  
                  {/* Scholarships */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Scholarships</span>
                      <span className="text-slate-800">₹{displayScholarshipVal.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${displayScholarshipPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full relative"
                      >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 3px, transparent 3px, transparent 7px)' }} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Gov Schemes */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Welfare Schemes</span>
                      <span className="text-slate-800">₹{displayGovSchemeVal.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${displayGovSchemePercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full relative"
                      >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 3px, transparent 3px, transparent 7px)' }} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Skill Programs */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Skill Program Subsidies</span>
                      <span className="text-slate-800">₹{displaySkillVal.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${displaySkillPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full relative"
                      >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 3px, transparent 3px, transparent 7px)' }} />
                      </motion.div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* BOTTOM ROW: STAIR CHART & TRANSACTIONS GRID & INSIGHTS (RESTORED TO 3-COLS, INCOME CARD REMOVED) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Retention Stair Chart Card - DYNAMIC BASED ON USER DATA */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[280px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900 tracking-tight">Application Progress</span>
                  <div className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100">
                    <span className="text-[14px] font-bold text-slate-400">···</span>
                  </div>
                </div>

                {/* Stair line SVG */}
                <div className="h-28 w-full relative mt-4 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <path
                      d="M 0 100 L 0 80 L 40 80 L 40 60 L 90 60 L 90 40 L 140 40 L 140 10 L 200 10 L 200 100 Z"
                      fill="rgba(244,107,132,0.06)"
                    />
                    <path 
                      d="M 0 80 L 40 80 L 40 60 L 90 60 L 90 40 L 140 40 L 140 10 L 200 10" 
                      fill="none" 
                      stroke="#F46B84" 
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Glowing peak dot */}
                  {hasSubmitted && (
                    <div className="absolute right-[50px] top-[8px] flex flex-col items-center">
                      <span className="bg-[#FEF2F4] border border-[#FDE2E4] text-[#F46B84] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm mb-1 leading-none">
                        42% peak
                      </span>
                      <span className="h-3.5 w-3.5 rounded-full bg-[#F46B84] border-2 border-white shadow-[0_0_8px_rgba(244,107,132,0.6)] animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Success Rate</span>
                  <span className="text-slate-800 font-bold">{hasSubmitted ? "42% Peak" : "0% Peak"}</span>
                </div>
              </div>

              {/* Transactions Activity Card - DYNAMIC BASED ON USER DATA */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[280px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900 tracking-tight">Active Opportunities</span>
                  <div className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100">
                    <span className="text-[14px] font-bold text-slate-400">···</span>
                  </div>
                </div>

                <div className="my-2 flex flex-col gap-2">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {hasSubmitted ? (displayMatchedCount * 14 + 8) : 0}k
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total open postings
                  </p>
                </div>

                {/* Vertical dot-bar grid - light up based on user matches */}
                <div className="flex items-end justify-between gap-1.5 h-16 mt-2 px-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1 items-center flex-1">
                      {Array.from({ length: 6 }).map((_, dotIdx) => {
                        const reverseIdx = 6 - dotIdx;
                        const isActive = reverseIdx <= activeDots[colIdx];
                        return (
                          <div 
                            key={dotIdx} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-300",
                              isActive 
                                ? colIdx === 4 ? "bg-emerald-600 scale-125" : "bg-emerald-500/80" 
                                : "bg-slate-100"
                            )} 
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>vs last period</span>
                  <span className="text-emerald-500 font-bold">{hasSubmitted ? "+12% new matches" : "0 matches yet"}</span>
                </div>
              </div>

              {/* Insights Gradient Card - REMOVED OPTIMIZE BUTTON */}
              <div 
                className="rounded-[24px] p-6 flex flex-col justify-between min-h-[280px] text-white relative overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                style={{
                  background: 'linear-gradient(135deg, #FF9C7D 0%, #F46B84 50%, #7EA8FF 100%)'
                }}
              >
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Eligibility Score
                  </span>
                  <Sparkles className="w-5 h-5 text-white/80" />
                </div>

                <div className="my-2 relative z-10">
                  <h2 className="text-5xl font-black tracking-tight leading-none">
                    {displayEligibilityScore}%
                  </h2>
                  <p className="text-xs text-white/95 font-medium mt-2 leading-relaxed">
                    {hasSubmitted 
                      ? "Excellent match profile. You qualify for high-priority government sponsorships." 
                      : "Please submit your Profile Settings to calculate your eligibility score."}
                  </p>
                </div>
                
                {/* Optimize profile button removed - leaving clean spacing */}
                <div className="h-6" />
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: SCHEMES LIST (ONLY SHOWS AFTER SUBMIT) */}
        {hasSubmitted ? (
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Matched Opportunities ({matchedSchemes.length})
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Schemes and benefits matching your specific settings.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  Auto Filtered
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {matchedSchemes.length > 0 ? (
                matchedSchemes.map((scheme) => {
                  const isExpanded = expandedCardId === scheme.id;

                  return (
                    <div
                      key={scheme.id}
                      className="border border-slate-100 bg-white rounded-[20px] p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:border-blue-500/20 hover:-translate-y-0.5 group"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            scheme.category === 'Scholarship' 
                              ? "bg-blue-50 text-[#2563EB] border-blue-200/50" 
                              : scheme.category === 'Gov Scheme'
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/50"
                              : "bg-rose-50 text-rose-600 border-rose-200/50"
                          )}>
                            {scheme.category}
                          </span>
                          <span className="font-extrabold text-base text-slate-900">
                            ₹{scheme.benefitValue.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug group-hover:text-[#2563EB] transition-colors">
                          {scheme.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1">
                          {scheme.description}
                        </p>
                      </div>

                      {/* Animated expandable panel for documents */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-3">
                              <h5 className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>Required Verification Documents</span>
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {scheme.documents.map((doc, docIdx) => (
                                  <div 
                                    key={docIdx} 
                                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] shrink-0" />
                                    <span>{doc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-semibold uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Eligibility Met</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toggleCardExpanded(scheme.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer select-none active:scale-95 border",
                            isExpanded
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-blue-50 text-[#2563EB] border-blue-200/50 hover:bg-blue-100/60"
                          )}
                        >
                          <span>Required Documents</span>
                          <ChevronDown 
                            className={cn(
                              "w-3.5 h-3.5 transition-transform duration-300",
                              isExpanded && "rotate-180"
                            )} 
                          />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="md:col-span-2 py-16 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <Layers className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">No matching opportunities found</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                      Try widening your eligibility settings (e.g., lower income, student/entrepreneur employment) to find matching welfare schemes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Locked State Placeholder Card */
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[220px]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Discover Matched Opportunities</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Please fill in your profile parameters on the left and click <b>Match Schemes</b> to instantly search and verify matching government sponsorships.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
