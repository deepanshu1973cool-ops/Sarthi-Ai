import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  ChevronDown,
  FileText,
  Calendar,
  Loader2,
  ExternalLink,
  ArrowUpRight,
  X,
  Search,
  Clock,
  MapPin,
  AlertCircle,
  GraduationCap,
  Target,
  Building2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { UserProfile } from '../services/profileService';
import { UserProgress } from '../services/progressService';
import { useRecommendations } from '../hooks/useRecommendations';
import { useTranslation } from 'react-i18next';
import { Modal } from '../components/ui/Modal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

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
  benefitAmount?: string;
  minAge?: number;
  maxAge?: number;
  states?: string[];
  educationLevels?: string[];
  maxIncome?: number; // per annum
  categories?: string[];
  employmentStatus?: string[];
  documents: string[]; // Required documents list
  deadline?: string | null; // Application deadline
  required_documents?: string[] | null; // Required documents list from Supabase JSONB
  portalUrl?: string; // Web URL to official portal
}



const getSchemeKey = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('aicte pragati')) return 'aictePragati';
  if (t.includes('barti free')) return 'bartiFreeCoaching';
  if (t.includes('swadhar yojana')) return 'ambedkarSwadhar';
  if (t.includes('free coaching scheme')) return 'freeCoachingCentral';
  if (t.includes('post-matric scholarship for sc')) return 'postMatricMahaDBT';
  if (t.includes('yuva karya prashikshan')) return 'yuvaPrashikshan';
  if (t.includes('national fellowship for higher education of st')) return 'nationalFellowshipST';
  if (t.includes('national overseas scholarship')) return 'overseasScholarshipST';
  if (t.includes('pm-usp central sector')) return 'pmUspCentral';
  if (t.includes('post matric scholarship for st')) return 'postMatricArunachal';
  return '';
};

const getTranslatedDocument = (doc: string, t: any): string => {
  const d = doc.toLowerCase();
  if (d.includes('aadhaar')) return t('documents.aadhaar', 'Aadhaar Card');
  if (d.includes('income certificate')) return t('documents.income', 'Income Certificate');
  if (d.includes('caste certificate')) return t('documents.caste', 'Caste Certificate');
  if (d.includes('domicile certificate') || d.includes('resident certificate') || d.includes('prc')) return t('documents.domicile', 'Domicile Certificate');
  if (d.includes('marksheet') || d.includes('passing certificate') || d.includes('degree certificate') || d.includes('graduation degree')) return t('documents.educationProof', 'Educational Certificate / Marksheet');
  if (d.includes('admission proof') || d.includes('admission letter') || d.includes('bonafide')) return t('documents.admissionProof', 'Admission / Bonafide Proof');
  if (d.includes('bank account') || d.includes('bank passbook')) return t('documents.bankPassbook', 'Bank Passbook Details');
  if (d.includes('passport')) return t('documents.passport', 'Valid Passport');
  if (d.includes('tuition fee') || d.includes('receipt')) return t('documents.feeReceipt', 'Fee Receipt');
  return doc;
};

interface DashboardProps {
  userId: string;
  profile: UserProfile;
  onProfileUpdate: (data: UserProfile) => Promise<void>;
  progress: UserProgress | null;
  onProgressUpdate: (updates: Partial<UserProgress>) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, profile, onProfileUpdate, progress, onProgressUpdate }) => {
  const { t, i18n } = useTranslation();

  const getTranslatedScheme = useCallback((scheme: Scheme) => {
    const key = getSchemeKey(scheme.name);
    if (!key) {
      return {
        name: scheme.name,
        benefitAmount: scheme.benefitAmount || `₹${scheme.benefitValue.toLocaleString()}`,
        description: getCleanDescription(scheme.description, profile?.fullName),
        documents: scheme.documents || []
      };
    }

    const translatedName = t(`schemes.${key}.title`, scheme.name);
    const translatedBenefit = t(`schemes.${key}.benefitAmount`, scheme.benefitAmount || `₹${scheme.benefitValue.toLocaleString()}`);
    const rawReason = t(`schemes.${key}.reason`, scheme.description);
    const translatedDescription = getCleanDescription(rawReason, profile?.fullName);

    const translatedDocs = (scheme.documents || []).map((doc: string) => {
      return getTranslatedDocument(doc, t);
    });

    return {
      name: translatedName,
      benefitAmount: translatedBenefit,
      description: translatedDescription,
      documents: translatedDocs
    };
  }, [profile?.fullName, t]);
  // Local state to track start/submit status of application per scheme ID
  const [applicationStates, setApplicationStates] = useState<Record<string, 'started' | 'submitted'>>({});
  const [isDeadlinesModalOpen, setIsDeadlinesModalOpen] = useState<boolean>(false);
  const [deadlinesSearchQuery, setDeadlinesSearchQuery] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // recommendations hook for n8n webhook API
  const { 
    recommendations: n8nRecommendations, 
    isLoading: isN8nLoading, 
    error: n8nError, 
    fetchRecommendations 
  } = useRecommendations();

  // Local state for dynamic recommendations from Supabase
  const [dbRecommendations, setDbRecommendations] = useState<Scheme[]>([]);
  const [recsLoading, setRecsLoading] = useState<boolean>(true);

  const parseBenefitValue = useCallback((val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Find all matches of numbers with optional commas/dots
      const matches = val.match(/(?:₹|Rs\.?|USD|GBP)?\s*?\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/gi);
      if (matches) {
        const numbers = matches.map(m => {
          const numOnly = m.replace(/[^\d.]/g, '');
          return parseFloat(numOnly);
        }).filter(n => !isNaN(n));
        
        if (numbers.length > 0) {
          const filtered = numbers.filter(n => n > 100 && n !== 2026 && n !== 2025 && n !== 2024);
          if (filtered.length > 0) {
            return Math.max(...filtered);
          }
          return Math.max(...numbers);
        }
      }
      
      const sanitized = val.replace(/[^\d.]/g, '');
      const parsed = parseFloat(sanitized);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, []);

  const fetchDbRecommendations = useCallback(async () => {
    if (!userId) return;
    setRecsLoading(true);
    try {
      // 1. Fetch recommendations
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error fetching recommendations from Supabase:", error);
      } else {
        const formatted = (data || []).map((item: any) => {
          // Dynamically map category based on title/reason content
          let category: 'Scholarship' | 'Gov Scheme' | 'Skill Program' = 'Gov Scheme';
          const lowerTitle = (item.title || '').toLowerCase();
          const lowerReason = (item.reason || '').toLowerCase();
          if (lowerTitle.includes('scholarship') || lowerReason.includes('scholarship') || lowerTitle.includes('matric') || (lowerTitle.includes('yojana') && (lowerTitle.includes('shikshan') || lowerTitle.includes('swadhar') || lowerTitle.includes('scholar')))) {
            category = 'Scholarship';
          } else if (lowerTitle.includes('coaching') || lowerTitle.includes('training') || lowerTitle.includes('prashikshan') || lowerTitle.includes('skill') || lowerTitle.includes('karya') || lowerTitle.includes('internship') || lowerTitle.includes('yojna') && lowerTitle.includes('prashikshan')) {
            category = 'Skill Program';
          }

          return {
            id: item.id ? String(item.id) : String(Math.random()),
            name: item.title || item.scheme_name || item.name || 'Government Scheme',
            category: category,
            description: item.reason || item.description || '',
            benefitValue: parseBenefitValue(item.benefit_amount || item.benefit_value || item.benefitValue || 0),
            benefitAmount: item.benefit_amount || '',
            documents: Array.isArray(item.required_documents)
              ? item.required_documents
              : (item.required_documents && typeof item.required_documents === 'string'
                  ? (() => {
                      try {
                        const parsed = JSON.parse(item.required_documents);
                        return Array.isArray(parsed) ? parsed : [item.required_documents];
                      } catch {
                        return [item.required_documents];
                      }
                    })()
                  : []),
            deadline: item.deadline || null,
            required_documents: Array.isArray(item.required_documents) ? item.required_documents : null,
            portalUrl: item.official_link || item.portalUrl || item.url || 'https://www.india.gov.in/my-government/schemes'
          };
        });
        setDbRecommendations(formatted);
      }
    } catch (err) {
      console.error("Exception fetching recommendations from Supabase:", err);
    } finally {
      setRecsLoading(false);
    }
  }, [userId, parseBenefitValue]);

  const recsCount = dbRecommendations.length;

  // Fetch count on mount or userId change
  useEffect(() => {
    fetchDbRecommendations();
  }, [userId, fetchDbRecommendations]);

  // Fetch count when live n8n recommendations finish loading
  useEffect(() => {
    fetchDbRecommendations();
  }, [n8nRecommendations, fetchDbRecommendations]);

  // Subscribe to realtime supabase changes on recommendations table for this user
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel(`recommendations-count-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendations',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchDbRecommendations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchDbRecommendations]);



  // Load existing recommendations from Supabase on mount
  useEffect(() => {
    if (userId) {
      fetchDbRecommendations().catch(err => {
        console.error("Error loading initial recommendations from Supabase:", err);
      });
    }
  }, [userId, fetchDbRecommendations]);

  const handleStartApplication = async (schemeId: string) => {
    try {
      const currentStarted = progress?.applicationsStarted || 0;
      await onProgressUpdate({
        applicationsStarted: currentStarted + 1
      });
      setApplicationStates(prev => ({ ...prev, [schemeId]: 'started' }));
    } catch (err) {
      console.error("Failed to start application:", err);
    }
  };

  const handleSaveSubmitApplication = async (schemeId: string) => {
    try {
      const currentSubmitted = progress?.applicationsSubmitted || 0;
      await onProgressUpdate({
        applicationsSubmitted: currentSubmitted + 1
      });
      setApplicationStates(prev => ({ ...prev, [schemeId]: 'submitted' }));
    } catch (err) {
      console.error("Failed to submit application:", err);
    }
  };

  // 1. Local Form State (inputs edit status)
  const [formFullName, setFormFullName] = useState<string>(profile.fullName || '');
  const [formAge, setFormAge] = useState<number>(profile.age || 0);
  const [formState, setFormState] = useState<string>(profile.state || '');
  const [formGender, setFormGender] = useState<string>(profile.gender || '');
  const [formEducation, setFormEducation] = useState<string>(profile.education || '');
  const [formIncome, setFormIncome] = useState<number>(profile.income || 0);
  const [formCategory, setFormCategory] = useState<string>(profile.category || '');
  const [formEmployment, setFormEmployment] = useState<string>(profile.employment || '');
  const [formInterests, setFormInterests] = useState<string[]>(['Startup', 'Scholarships']);

  // Custom Dropdown Open States
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [isEmploymentDropdownOpen, setIsEmploymentDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Committed Matching State (updates ONLY on form submit click)
  const [fullName, setFullName] = useState<string>(profile.fullName || '');
  const [age, setAge] = useState<number>(profile.age || 0);
  const [state, setState] = useState<string>(profile.state || '');
  const [gender, setGender] = useState<string>(profile.gender || '');
  const [education, setEducation] = useState<string>(profile.education || '');
  const [income, setIncome] = useState<number>(profile.income || 0);
  const [category, setCategory] = useState<string>(profile.category || '');
  const [employment, setEmployment] = useState<string>(profile.employment || '');
  const [interests, setInterests] = useState<string[]>(['Startup', 'Scholarships']);

  // State to track if the dashboard has been activated by user submit click
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(true);

  useEffect(() => {
    if (profile) {
      setFormFullName(profile.fullName || '');
      setFormAge(profile.age || 0);
      setFormState(profile.state || '');
      setFormGender(profile.gender || '');
      setFormEducation(profile.education || '');
      setFormIncome(profile.income || 0);
      setFormCategory(profile.category || '');
      setFormEmployment(profile.employment || '');

      setFullName(profile.fullName || '');
      setAge(profile.age || 0);
      setState(profile.state || '');
      setGender(profile.gender || '');
      setEducation(profile.education || '');
      setIncome(profile.income || 0);
      setCategory(profile.category || '');
      setEmployment(profile.employment || '');
      setHasSubmitted(true);
    }
  }, [profile]);

  // Watch form inputs and automatically sync changes to Supabase in real-time
  useEffect(() => {
    if (!profile) return;
    
    // Check if the current form values differ from the committed values
    const hasChanges = 
      formFullName !== fullName ||
      formAge !== age ||
      formState !== state ||
      formGender !== gender ||
      formEducation !== education ||
      formIncome !== income ||
      formCategory !== category ||
      formEmployment !== employment;
      
    if (!hasChanges) return;

    // Update committed states instantly for real-time graph updates
    setFullName(formFullName);
    setAge(formAge);
    setState(formState);
    setGender(formGender);
    setEducation(formEducation);
    setIncome(formIncome);
    setCategory(formCategory);
    setEmployment(formEmployment);
    setHasSubmitted(true);

    // Debounce the Supabase database write
    const timer = setTimeout(() => {
      const profilePayload = {
        fullName: formFullName,
        age: formAge,
        state: formState,
        gender: formGender,
        education: formEducation,
        income: formIncome,
        category: formCategory,
        employment: formEmployment
      };

      onProfileUpdate(profilePayload).catch(err => {
        console.error("Error auto-saving profile to Supabase:", err);
      });
    }, 400); // 400ms debounce to prevent database spamming during typing/sliding

    return () => clearTimeout(timer);
  }, [
    formFullName,
    formAge,
    formState,
    formGender,
    formEducation,
    formIncome,
    formCategory,
    formEmployment,
    onProfileUpdate,
    profile,
    fullName,
    age,
    state,
    gender,
    education,
    income,
    category,
    employment
  ]);

  // Premium Modal states
  const [activeScheme, setActiveScheme] = useState<Scheme | null>(null);
  const [copiedSchemeId, setCopiedSchemeId] = useState<string | null>(null);

  const handleCopyLink = useCallback((scheme: Scheme) => {
    const url = scheme.portalUrl || 'https://www.india.gov.in/my-government/schemes';
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSchemeId(scheme.id);
      setTimeout(() => setCopiedSchemeId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  }, []);
  // Scroll Lock when deadlines modal is open
  useBodyScrollLock(isDeadlinesModalOpen);

  // Toggle deadlines-open class on html when modal is open to hide navbar
  useEffect(() => {
    if (isDeadlinesModalOpen) {
      document.documentElement.classList.add('deadlines-open');
    } else {
      document.documentElement.classList.remove('deadlines-open');
    }
    return () => {
      document.documentElement.classList.remove('deadlines-open');
    };
  }, [isDeadlinesModalOpen]);

  // Escape key close listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDeadlinesModalOpen(false);
      }
    };
    if (isDeadlinesModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeadlinesModalOpen]);

  const handleViewDetails = (schemeId: string) => {
    setIsDeadlinesModalOpen(false);
    const found = liveSchemes.find(s => s.id === schemeId);
    if (found) {
      setActiveScheme(found);
    }
    setTimeout(() => {
      const element = document.getElementById(`scheme-card-${schemeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // Dynamic Filtering Logic based on COMMITTED state (mapped exclusively to backend recommendations)
  const liveSchemes = useMemo(() => {
    return dbRecommendations || [];
  }, [dbRecommendations]);

  // Trigger eligibility checked & recommendations generated updates when matching finishes
  useEffect(() => {
    if (!profile) return;
    
    // Determine if we need to sync with backend progress
    const needsCheckedUpdate = !progress?.eligibilityChecked;
    const needsCountUpdate = progress?.recommendationsGenerated !== liveSchemes.length;
    
    if (needsCheckedUpdate || needsCountUpdate) {
      onProgressUpdate({
        eligibilityChecked: true,
        recommendationsGenerated: liveSchemes.length
      }).catch(err => {
        console.error("Error updating progress after matching:", err);
      });
    }
  }, [liveSchemes.length, progress?.eligibilityChecked, progress?.recommendationsGenerated, profile, onProgressUpdate]);

  // Dynamic calculations based on committed settings
  const totalBenefitValue = useMemo(() => {
    return liveSchemes.reduce((sum, scheme) => sum + scheme.benefitValue, 0);
  }, [liveSchemes]);

  // Category distributions
  const categorySplit = useMemo(() => {
    const scholarshipVal = liveSchemes
      .filter(s => s.category === 'Scholarship')
      .reduce((sum, s) => sum + s.benefitValue, 0);
    const govSchemeVal = liveSchemes
      .filter(s => s.category === 'Gov Scheme')
      .reduce((sum, s) => sum + s.benefitValue, 0);
    const skillVal = liveSchemes
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
  }, [liveSchemes, totalBenefitValue]);

  const parseAndFormatDeadline = useCallback((deadlineStr: string | null | undefined) => {
    if (!deadlineStr) return { short: 'Open', extra: '' };
    
    const trimmed = deadlineStr.trim();
    
    // Regex for: 31st December 2024 or 31 Dec 2024
    const textDateRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/i;
    const match1 = trimmed.match(textDateRegex);
    
    const monthMap: Record<string, string> = {
      jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
      jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
      january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr', june: 'Jun',
      july: 'Jul', august: 'Aug', september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec'
    };
    
    if (match1) {
      const day = parseInt(match1[1], 10);
      const monthLower = match1[2].toLowerCase();
      const monthAbbr = monthMap[monthLower] || match1[2];
      const year = match1[3];
      const short = `${day} ${monthAbbr} ${year}`;
      
      const extra = trimmed.replace(match1[0], '').replace(/[()]/g, '').trim();
      return { short, extra };
    }
    
    // Regex for ISO: YYYY-MM-DD
    const isoRegex = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/;
    const match2 = trimmed.match(isoRegex);
    if (match2) {
      const year = match2[1];
      const monthNum = parseInt(match2[2], 10);
      const day = parseInt(match2[3], 10);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthAbbr = monthNames[monthNum - 1] || match2[2];
      const short = `${day} ${monthAbbr} ${year}`;
      
      const extra = trimmed.replace(match2[0], '').replace(/[()]/g, '').trim();
      return { short, extra };
    }
    
    if (trimmed.length > 20) {
      return { short: trimmed.substring(0, 15) + '...', extra: trimmed };
    }
    
    return { short: trimmed, extra: '' };
  }, []);

  const getCleanDescription = useCallback((description: string | null | undefined, fullName: string | undefined | null) => {
    if (!description) return '';
    let clean = description;
    if (fullName && fullName.trim()) {
      const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 2);
      const searchTerms = [fullName.trim(), ...nameParts];
      
      searchTerms.sort((a, b) => b.length - a.length);
      
      for (const term of searchTerms) {
        const escaped = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        clean = clean.replace(regex, 'You');
      }
    }
    
    clean = clean
      .replace(/\bYou\s+is\b/gi, 'You are')
      .replace(/\bYou\s+has\b/gi, 'You have')
      .replace(/\bYou\s+was\b/gi, 'You were');
      
    return clean;
  }, []);

  const parseDeadlineDate = useCallback((dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return new Date(parsed);
    
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1].toLowerCase().substring(0, 3);
      const year = parseInt(parts[2], 10);
      
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      
      if (months[monthStr] !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, months[monthStr], day);
      }
    }
    return null;
  }, []);

  const getDeadlineCategory = useCallback((deadlineStr: string | null | undefined): {
    type: 'upcoming' | 'open' | 'batch' | 'awaiting' | 'unknown';
    badgeText: string;
    badgeStyle: string;
    secondaryText?: string;
    shortDate?: string;
    isCritical: boolean;
  } => {
    if (!deadlineStr || deadlineStr.trim() === '') {
      return {
        type: 'awaiting',
        badgeText: 'Awaiting Date',
        badgeStyle: 'bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none',
        secondaryText: 'Next application date has not been announced.',
        isCritical: false
      };
    }

    const normalized = deadlineStr.toLowerCase().trim();

    // 1. Open Year-Round
    if (
      normalized.includes('open throughout the year') || 
      normalized.includes('year-round') || 
      normalized.includes('always open') || 
      normalized.includes('open year-round')
    ) {
      return {
        type: 'open',
        badgeText: 'Open Year-Round',
        badgeStyle: 'bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none',
        secondaryText: 'Applications are accepted throughout the year.',
        isCritical: false
      };
    }

    // 2. Batch Based
    if (
      normalized.includes('varies by batch') || 
      normalized.includes('batch based') || 
      normalized.includes('batch notification') || 
      normalized.includes('batch')
    ) {
      return {
        type: 'batch',
        badgeText: 'Batch Based',
        badgeStyle: 'bg-blue-50 border border-blue-100 text-[#2563EB] text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none',
        secondaryText: 'Applications open in batches.',
        isCritical: false
      };
    }

    // 3. Awaiting Date
    if (
      normalized.includes('not announced') || 
      normalized.includes('awaiting date') || 
      normalized.includes('announced yet') ||
      normalized.includes('next deadline') ||
      normalized.includes('not yet')
    ) {
      return {
        type: 'awaiting',
        badgeText: 'Awaiting Date',
        badgeStyle: 'bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none',
        secondaryText: 'Next application date has not been announced.',
        isCritical: false
      };
    }

    // 4. Actual Date (try to parse it)
    const { short, extra } = parseAndFormatDeadline(deadlineStr);
    const parsedDate = parseDeadlineDate(short);
    
    if (parsedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = parsedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          type: 'awaiting',
          badgeText: 'Awaiting Date',
          badgeStyle: 'bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none',
          secondaryText: 'Next application date has not been announced.',
          isCritical: false
        };
      }

      let badgeStyle = 'bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none';
      let isCritical = false;

      if (diffDays >= 0 && diffDays <= 7) {
        badgeStyle = 'bg-red-50 border border-red-200 text-red-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none animate-pulse';
        isCritical = true;
      } else if (diffDays > 7 && diffDays <= 15) {
        badgeStyle = 'bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none';
        isCritical = true;
      }

      // Split short date for a clean 2-line rendering
      const dateParts = short.split(' ');
      let badgeText = short;
      if (dateParts.length === 3) {
        badgeText = `${dateParts[0]} ${dateParts[1]}\n${dateParts[2]}`;
      }

      return {
        type: 'upcoming',
        badgeText,
        badgeStyle,
        secondaryText: extra || undefined,
        shortDate: short,
        isCritical
      };
    }

    // Fallback
    return {
      type: 'awaiting',
      badgeText: 'Awaiting Date',
      badgeStyle: 'bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap select-none',
      secondaryText: 'Next application date has not been announced.',
      isCritical: false
    };
  }, [parseDeadlineDate, parseAndFormatDeadline]);

  const getCleanDeadlineDisplay = useCallback((scheme: Scheme) => {
    if (!scheme.deadline) return t('deadlines.awaitingAnnouncement', 'Awaiting announcement');
    
    const raw = scheme.deadline.trim();
    if (raw.includes('Varies by batch notification') || raw.toLowerCase().includes('varies by batch')) {
      return t('deadlines.variesByBatch', 'Varies by batch notification');
    }
    if (raw.includes('Next deadline not announced yet') || raw.toLowerCase().includes('not announced')) {
      return t('deadlines.awaitingAnnouncement', 'Awaiting announcement');
    }
    if (raw.includes('Open throughout the year') || raw.toLowerCase().includes('throughout the year') || raw.toLowerCase().includes('open throughout')) {
      return t('deadlines.openThroughoutYear', 'Open throughout the year');
    }

    const category = getDeadlineCategory(scheme.deadline);
    if (category.type === 'open') {
      return t('deadlines.openThroughoutYear', 'Open throughout the year');
    }
    if (category.type === 'batch') {
      return t('deadlines.variesByBatch', 'Varies by batch notification');
    }
    if (category.type === 'awaiting') {
      return t('deadlines.awaitingAnnouncement', 'Awaiting announcement');
    }
    
    let dateStr = category.shortDate || scheme.deadline;
    const months: { [key: string]: string } = {
      'Jan': i18n.language === 'hi' ? 'जनवरी' : i18n.language === 'mr' ? 'जानेवारी' : 'Jan',
      'Feb': i18n.language === 'hi' ? 'फरवरी' : i18n.language === 'mr' ? 'फेब्रुवारी' : 'Feb',
      'Mar': i18n.language === 'hi' ? 'मार्च' : i18n.language === 'mr' ? 'मार्च' : 'Mar',
      'Apr': i18n.language === 'hi' ? 'अप्रैल' : i18n.language === 'mr' ? 'एप्रिल' : 'Apr',
      'May': i18n.language === 'hi' ? 'मई' : i18n.language === 'mr' ? 'मे' : 'May',
      'Jun': i18n.language === 'hi' ? 'जून' : i18n.language === 'mr' ? 'जून' : 'Jun',
      'Jul': i18n.language === 'hi' ? 'जुलाई' : i18n.language === 'mr' ? 'जुलै' : 'Jul',
      'Aug': i18n.language === 'hi' ? 'अगस्त' : i18n.language === 'mr' ? 'ऑगस्ट' : 'Aug',
      'Sep': i18n.language === 'hi' ? 'सितंबर' : i18n.language === 'mr' ? 'सप्टेंबर' : 'Sep',
      'Oct': i18n.language === 'hi' ? 'अक्टूबर' : i18n.language === 'mr' ? 'ऑक्टोबर' : 'Oct',
      'Nov': i18n.language === 'hi' ? 'नवंबर' : i18n.language === 'mr' ? 'नोव्हेंबर' : 'Nov',
      'Dec': i18n.language === 'hi' ? 'दिसंबर' : i18n.language === 'mr' ? 'डिसेंबर' : 'Dec'
    };
    
    Object.keys(months).forEach(enMonth => {
      if (dateStr.includes(enMonth)) {
        dateStr = dateStr.replace(enMonth, months[enMonth]);
      }
    });

    if (i18n.language === 'mr') {
      const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      dateStr = dateStr.split('').map(char => {
        const num = parseInt(char, 10);
        return isNaN(num) ? char : devanagariDigits[num];
      }).join('');
    }

    return dateStr;
  }, [getDeadlineCategory, t, i18n.language]);

  const criticalCount = useMemo(() => {
    return liveSchemes.filter(scheme => {
      if (!scheme.deadline) return false;
      const category = getDeadlineCategory(scheme.deadline);
      return category.isCritical;
    }).length;
  }, [liveSchemes, getDeadlineCategory]);

  const sortedDashboardDeadlines = useMemo(() => {
    const classified = liveSchemes.map(scheme => {
      const category = getDeadlineCategory(scheme.deadline);
      return { scheme, category };
    });

    const priorityMap = {
      upcoming: 1,
      open: 2,
      batch: 2,
      awaiting: 3,
      unknown: 4
    };

    return classified.sort((a, b) => {
      const pA = priorityMap[a.category.type] || 4;
      const pB = priorityMap[b.category.type] || 4;
      
      if (pA !== pB) {
        return pA - pB;
      }
      
      if (a.category.type === 'upcoming' && b.category.type === 'upcoming') {
        const dateA = parseDeadlineDate(a.category.shortDate);
        const dateB = parseDeadlineDate(b.category.shortDate);
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      }
      
      return 0;
    });
  }, [liveSchemes, getDeadlineCategory, parseDeadlineDate]);

  const filteredModalDeadlines = useMemo(() => {
    const query = deadlinesSearchQuery.toLowerCase().trim();
    return sortedDashboardDeadlines.filter(item => {
      const translatedName = getTranslatedScheme(item.scheme).name.toLowerCase();
      const rawName = item.scheme.name.toLowerCase();
      return rawName.includes(query) || translatedName.includes(query);
    });
  }, [sortedDashboardDeadlines, deadlinesSearchQuery, getTranslatedScheme]);

  const renderModalItem = (item: { scheme: Scheme; category: any }) => {
    const { scheme } = item;
    const translated = getTranslatedScheme(scheme);

    return (
      <div
        key={scheme.id}
        onClick={() => handleViewDetails(scheme.id)}
        className="py-4 flex items-center justify-between gap-6 last:border-b-0 cursor-pointer hover:bg-slate-50/70 -mx-5 px-5 rounded-lg transition-colors group/row"
      >
        <span className="font-bold text-[13.5px] sm:text-[14.5px] text-slate-900 tracking-tight leading-snug group-hover/row:text-[#2563EB] transition-colors flex-1 min-w-0">
          {translated.name}
        </span>
        
        <span className="text-[13px] text-slate-600 font-medium shrink-0 group-hover/row:text-slate-800 transition-colors flex items-center gap-1.5 pl-4">
          <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span>{getCleanDeadlineDisplay(scheme)}</span>
        </span>
      </div>
    );
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    // Validate that the profile is complete (completionPercentage === 100)
    if (completionPercentage < 100) {
      const missingFields = [];
      if (!formFullName.trim()) missingFields.push("Full Name");
      if (!formAge || formAge <= 0) missingFields.push("Age");
      if (!formGender.trim()) missingFields.push("Gender");
      if (!formState.trim()) missingFields.push("State");
      if (!formEducation.trim()) missingFields.push("Education");
      if (!formEmployment.trim()) missingFields.push("Occupation");
      if (!formIncome || formIncome < 1000) missingFields.push("Annual Income (min ₹1,000)");
      if (!formCategory.trim()) missingFields.push("Social Category");

      setFormError(`Please complete all required profile fields before matching. Missing: ${missingFields.join(", ")}`);
      return;
    }

    setFullName(formFullName);
    setAge(formAge);
    setState(formState);
    setGender(formGender);
    setEducation(formEducation);
    setIncome(formIncome);
    setCategory(formCategory);
    setEmployment(formEmployment);
    setInterests(formInterests);
    setHasSubmitted(true);

    const profilePayload = {
      fullName: formFullName,
      age: formAge,
      state: formState,
      gender: formGender,
      education: formEducation,
      income: formIncome,
      category: formCategory,
      employment: formEmployment
    };
    
    console.log("Submitting Profile Settings update to Supabase:", profilePayload);
    try {
      await onProfileUpdate(profilePayload);
      
      // Fetch live recommendations from n8n webhook
      await fetchRecommendations(userId);
      
      // Refresh the dashboard after recommendations are generated
      await fetchDbRecommendations();
    } catch (error: any) {
      console.error("Failed to sync profile settings to Supabase or fetch recommendations:", error);
      setFormError(error.message || "Failed to find schemes. Please verify your connection and try again.");
    }
  };

  const filteredStates = useMemo(() => {
    return INDIAN_STATES.filter(st => st.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  // Calculate profile completion percentage based on required fields
  const completionPercentage = useMemo(() => {
    let completedFieldsCount = 0;
    
    if (fullName && fullName.trim() !== "") completedFieldsCount++;
    if (typeof age === 'number' && age > 0) completedFieldsCount++;
    if (gender && gender.trim() !== "") completedFieldsCount++;
    if (state && state.trim() !== "") completedFieldsCount++;
    if (education && education.trim() !== "") completedFieldsCount++;
    if (employment && employment.trim() !== "") completedFieldsCount++;
    if (typeof income === 'number' && !isNaN(income) && income >= 0) completedFieldsCount++;
    if (category && category.trim() !== "") completedFieldsCount++;

    return Math.round((completedFieldsCount / 8) * 100);
  }, [fullName, age, gender, state, education, employment, income, category]);

  const incomePercentage = useMemo(() => {
    const min = 1000;
    const max = 1000000;
    if (formIncome <= min) return 0;
    if (formIncome >= max) return 100;
    return ((formIncome - min) / (max - min)) * 100;
  }, [formIncome]);

  const agePercentage = useMemo(() => {
    const min = 10;
    const max = 100;
    if (formAge <= min) return 0;
    if (formAge >= max) return 100;
    return ((formAge - min) / (max - min)) * 100;
  }, [formAge]);

  // Dynamic values based on activation flag
  const displayBenefitValue = totalBenefitValue;
  const displayEligibilityScore = completionPercentage;

  const eligibilityMessage = useMemo(() => {
    if (completionPercentage >= 90) return "Excellent Match";
    if (completionPercentage >= 70) return "Strong Match";
    if (completionPercentage >= 40) return "Good Progress";
    return "Complete Your Profile";
  }, [completionPercentage]);
  const displayMatchedCount = liveSchemes.length;
  
  const displayScholarshipPercent = categorySplit.scholarship;
  const displayScholarshipVal = categorySplit.scholarshipVal;
  
  const displayGovSchemePercent = categorySplit.govScheme;
  const displayGovSchemeVal = categorySplit.govSchemeVal;
  
  const displaySkillPercent = categorySplit.skill;
  const displaySkillVal = categorySplit.skillVal;

  // Funnel heights and values configuration
  const funnelBars = useMemo(() => {
    const isCompleted = progress?.profileCompleted || false;
    const isChecked = progress?.eligibilityChecked || false;
    const recsCount = liveSchemes.length || progress?.recommendationsGenerated || 0;
    const startedCount = progress?.applicationsStarted || 0;
    const submittedCount = progress?.applicationsSubmitted || 0;

    return [
      { 
        label: t('dashboard.funnelBars.initiated'), 
        value: progress ? "1" : "0", 
        height: progress ? "h-full" : "h-2", 
        grad: "from-blue-600 to-sky-400",
        tooltip: t('dashboard.funnelBars.initiatedTooltip')
      },
      { 
        label: t('dashboard.funnelBars.matched'), 
        value: isCompleted ? (t('whySaarthi.visual.left') === 'शिल्लक' ? 'होय' : t('whySaarthi.visual.left') === 'शेष' ? 'हाँ' : 'Yes') : (t('whySaarthi.visual.left') === 'शिल्लक' ? 'नाही' : t('whySaarthi.visual.left') === 'शेष' ? 'नहीं' : 'No'), 
        height: isCompleted ? "h-[85%]" : "h-2", 
        grad: "from-blue-500 to-blue-400",
        tooltip: isCompleted ? t('dashboard.funnelBars.matchedTooltip') : t('dashboard.funnelBars.matchedPendingTooltip')
      },
      { 
        label: t('dashboard.funnelBars.recommended'), 
        value: isChecked ? `${recsCount}` : (t('whySaarthi.visual.left') === 'शिल्लक' ? 'प्रलंबित' : t('whySaarthi.visual.left') === 'शेष' ? 'लंबित' : 'Pending'), 
        height: isChecked && recsCount > 0 ? "h-[70%]" : "h-2", 
        grad: "from-indigo-600 to-blue-500",
        tooltip: isChecked ? t('dashboard.funnelBars.recsTooltip', { count: recsCount }) : t('dashboard.funnelBars.recsPendingTooltip')
      },
      { 
        label: t('dashboard.funnelBars.applying'), 
        value: `${startedCount}`, 
        height: startedCount > 0 ? "h-[55%]" : "h-2", 
        grad: "from-sky-600 to-sky-400",
        tooltip: t('dashboard.funnelBars.applyingTooltip', { count: startedCount })
      },
      { 
        label: t('dashboard.funnelBars.verified'), 
        value: `${submittedCount}`, 
        height: submittedCount > 0 ? "h-[40%]" : "h-2", 
        grad: "from-indigo-500 to-sky-400",
        tooltip: t('dashboard.funnelBars.verifiedTooltip', { count: submittedCount })
      },
    ];
  }, [progress, t, liveSchemes]);

  // Active dots height map
  const activeDots = useMemo(() => {
    if (!hasSubmitted || liveSchemes.length === 0) {
      return Array(11).fill(0);
    }
    return Array.from({ length: 11 }).map((_, i) => {
      const scheme = liveSchemes[i % liveSchemes.length];
      return Math.min(((scheme.benefitValue + i) % 5) + 2, 6);
    });
  }, [hasSubmitted, liveSchemes]);

  return (
    <div className="w-full bg-[#F5F5F7]/70 py-12 px-6 sm:px-10 lg:px-12 font-sans text-slate-800 relative z-10 pt-28">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
        
        {/* HEADER SUMMARY - Dashboard only */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              {t('dashboard.desc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('navbar.syncActive')}
            </span>
          </div>
        </div>

        {/* TWO COLUMN INTERACTIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDEBAR: PROFILE DATA INPUT CARD (5/12 cols) */}
          <form 
            onSubmit={handleProfileSubmit}
            className="lg:col-span-5 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                  {t('dashboard.settings')}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t('dashboard.filters')}
              </span>
            </div>

            {/* Input fields */}
            <div className="flex flex-col gap-6">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.fullName')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder={t('auth.enterName')}
                  className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 font-medium text-slate-700"
                />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.age')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="age"
                    min="10"
                    max="100"
                    value={formAge || 10}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #2563EB 0%, #2563EB ${agePercentage}%, #F1F5F9 ${agePercentage}%, #F1F5F9 100%)`
                    }}
                    className="flex-1 custom-range-slider cursor-pointer"
                  />
                  <div className="w-24 flex items-center justify-between bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      placeholder="--"
                      value={formAge || ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setFormAge(0);
                          return;
                        }
                        const val = Number(raw);
                        setFormAge(Math.min(100, val));
                      }}
                      onBlur={() => {
                        if (formAge > 0 && formAge < 10) {
                          setFormAge(10);
                        }
                      }}
                      className="w-10 text-right bg-transparent text-sm font-bold text-slate-800 focus:outline-none border-none p-0"
                    />
                    <span className="text-xs font-semibold text-slate-400 shrink-0">
                      {t('whySaarthi.visual.left') === 'शिल्लक' ? 'वर्षे' : t('whySaarthi.visual.left') === 'शेष' ? 'वर्ष' : 'yrs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* State - WITH CUSTOM SEARCH DROPDOWN OVERLAY */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.state')}</label>
                <input type="hidden" name="state" value={formState} />
                
                <button
                  type="button"
                  onClick={() => {
                    setIsStateDropdownOpen(!isStateDropdownOpen);
                    setIsEducationDropdownOpen(false);
                    setIsEmploymentDropdownOpen(false);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 border border-slate-200 hover:border-slate-355 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <span className={!formState ? "text-slate-400 font-normal" : ""}>
                    {formState || "Select your state"}
                  </span>
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
                        placeholder={t('profileSetup.searchState')}
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
                            {t('profileSetup.noStates')}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.gender')}</label>
                <input type="hidden" name="gender" value={formGender} />
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => setFormGender(gen)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95",
                        formGender === gen
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-slate-55 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {gen === 'Male' ? t('common.genders.male') : gen === 'Female' ? t('common.genders.female') : t('common.genders.other')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Level - FULLY CUSTOM BEAUTIFUL DROPDOWN */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.education')}</label>
                <input type="hidden" name="education" value={formEducation} />
                
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
                    {formEducation ? (
                      <>
                        {formEducation === '10th' && t('common.education.10th')}
                        {formEducation === '12th' && t('common.education.12th')}
                        {formEducation === 'Graduate' && t('common.education.graduate')}
                        {formEducation === 'Masters' && t('common.education.masters')}
                        {formEducation === 'Doctorate' && t('common.education.doctorate')}
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">Select education</span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-455 shrink-0" />
                </button>

                {isEducationDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsEducationDropdownOpen(false)} />
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
                      {[
                        { value: '10th', labelKey: "common.education.10th" },
                        { value: '12th', labelKey: "common.education.12th" },
                        { value: 'Graduate', labelKey: "common.education.graduate" },
                        { value: 'Masters', labelKey: "common.education.masters" },
                        { value: 'Doctorate', labelKey: "common.education.doctorate" }
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
                              : "text-slate-655 hover:bg-slate-50"
                          )}
                        >
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Family Income - STARTS FROM 1000 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.income')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="income"
                    min="1000"
                    max="1000000"
                    step="1000"
                    value={formIncome || 1000}
                    onChange={(e) => setFormIncome(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #2563EB 0%, #2563EB ${incomePercentage}%, #F1F5F9 ${incomePercentage}%, #F1F5F9 100%)`
                    }}
                    className="flex-1 custom-range-slider cursor-pointer"
                  />
                  <div className="w-24 flex items-center justify-between bg-slate-55 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                    <span className="text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="1000"
                      max="1000000"
                      step="any"
                      placeholder="Enter annual income"
                      value={formIncome || ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setFormIncome(0);
                          return;
                        }
                        const val = Number(raw);
                        if (val > 1000000) {
                          setFormIncome(1000000);
                        } else {
                          setFormIncome(val);
                        }
                      }}
                      onBlur={() => {
                        if (formIncome > 0 && formIncome < 1000) {
                          setFormIncome(1000);
                        }
                      }}
                      className="w-16 text-right bg-transparent text-sm font-bold text-slate-800 focus:outline-none border-none p-0"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.category')}</label>
                <input type="hidden" name="category" value={formCategory} />
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
                          : "bg-slate-55 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupation / Employment Status - FULLY CUSTOM BEAUTIFUL DROPDOWN */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profileSetup.occupation')}</label>
                <input type="hidden" name="employment" value={formEmployment} />
                
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
                    {formEmployment ? (
                      <>
                        {formEmployment === 'Student' && t('common.employment.student')}
                        {formEmployment === 'Unemployed' && t('common.employment.unemployed')}
                        {formEmployment === 'Entrepreneur' && t('common.employment.entrepreneur')}
                        {formEmployment === 'Employed' && t('common.employment.employed')}
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">Select occupation</span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-455 shrink-0" />
                </button>

                {isEmploymentDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsEmploymentDropdownOpen(false)} />
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
                      {[
                        { value: 'Student', labelKey: "common.employment.student" },
                        { value: 'Unemployed', labelKey: "common.employment.unemployed" },
                        { value: 'Entrepreneur', labelKey: "common.employment.entrepreneur" },
                        { value: 'Employed', labelKey: "common.employment.employed" }
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
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Interests (Startup, Scholarships, Gov Schemes, Skill Development) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.interests')}</label>
                <input type="hidden" name="interests" value={formInterests.join(',')} />
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Startup', 'Scholarships', 'Gov Schemes', 'Skill Development'].map((interest) => {
                    const isSelected = formInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormInterests(formInterests.filter(i => i !== interest));
                          } else {
                            setFormInterests([...formInterests, interest]);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95",
                          isSelected
                            ? "bg-[#2563EB] border-[#2563EB] text-white shadow-sm"
                            : "bg-slate-55 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Match CTA button below the Profile Settings */}
              {formError && (
                <div className="w-full bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-2.5 rounded-xl font-medium text-center animate-fade-in mt-4">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isN8nLoading}
                className="w-full bg-[#2563EB] hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed select-none text-sm text-center active:scale-98 shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {isN8nLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Finding the best government schemes for you...</span>
                  </>
                ) : (
                  <>
                    <span>Find My Schemes</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

            </div>
          </form>

          {/* RIGHT SIDE: DASHBOARD CHARTS (7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-8 h-full">
            
            {/* TOP ROW: ELIGIBILITY FUNNEL & TOTAL VALUE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Funnel Chart Card (Span 2) - SHOWING CONNECTING GRAPH */}
              <div className="md:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[440px] relative overflow-hidden">
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
                <div className="flex items-end justify-between h-72 px-2 relative z-10">
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
                        {bar.tooltip}
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
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[440px]">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-base text-slate-900 tracking-tight">Total Benefit Value</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Annual Savings</span>
                </div>

                <div className="my-6">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                    ₹{displayBenefitValue.toLocaleString('en-IN')}
                  </h2>
                  {displayMatchedCount > 0 ? (
                    <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase tracking-wider animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Eligible for {displayMatchedCount} schemes</span>
                    </p>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase tracking-wider animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Generate recommendations to see your potential benefits.</span>
                    </p>
                  )}
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
                        className="h-full bg-gradient-to-r from-blue-50 to-blue-500 rounded-full relative"
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
                        className="h-full bg-gradient-to-r from-emerald-50 to-emerald-500 rounded-full relative"
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
                        className="h-full bg-gradient-to-r from-rose-50 to-rose-500 rounded-full relative"
                      >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff, #fff 3px, transparent 3px, transparent 7px)' }} />
                      </motion.div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Transactions Activity Card - DYNAMIC BASED ON USER DATA */}
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[280px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900 tracking-tight">{t('dashboard.activeOpportunities')}</span>
                  <div className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100">
                    <span className="text-[14px] font-bold text-slate-400">···</span>
                  </div>
                </div>

                <div className="my-2 flex flex-col gap-2">
                  {recsLoading ? (
                    <div className="animate-pulse flex flex-col gap-2.5 my-1">
                      <div className="h-9 w-28 bg-slate-200 rounded-lg" />
                      <div className="h-3.5 w-40 bg-slate-150 rounded" />
                    </div>
                  ) : (
                    <>
                      <h2 className={cn(
                        "font-extrabold text-slate-900 tracking-tight leading-none",
                        recsCount !== null && recsCount > 0 ? "text-4xl" : "text-xl sm:text-2xl mt-1.5 mb-1"
                      )}>
                        {recsCount !== null && recsCount > 0 ? recsCount : t('dashboard.noRecommendationsYet', 'No Recommendations Yet')}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                        {t('dashboard.eligibleGovSchemes', 'Eligible Government Schemes')}
                      </p>
                    </>
                  )}
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
                                ? colIdx === 4 ? "bg-emerald-600 scale-125" : "bg-emerald-50/80" 
                                : "bg-slate-100"
                            )} 
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-550">
                  <span>{t('dashboard.vsLastPeriod')}</span>
                  <span className="text-emerald-500 font-bold">{hasSubmitted ? t('dashboard.newMatchesPercent') : t('dashboard.noMatchesYet')}</span>
                </div>
              </div>

              {/* Upcoming Deadlines Card */}
              <div className="md:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between min-h-[280px] relative overflow-hidden group hover:border-blue-200 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-55">
                    <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2 select-none">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {t('dashboard.upcomingDeadlines')}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none border",
                      criticalCount > 0 
                        ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse font-extrabold" 
                        : "bg-slate-50 border-slate-200/50 text-slate-400"
                    )}>
                      {hasSubmitted && criticalCount > 0 ? t('deadlines.urgent', { count: criticalCount }) : t('deadlines.noUrgent')}
                    </span>
                  </div>
 
                  <div className="mt-4">
                    {recsLoading ? (
                      <div className="flex flex-col divide-y divide-slate-100 animate-pulse">
                        {[1, 2, 3].map((i, idx) => (
                          <div key={i} className={cn(
                            "flex items-center justify-between gap-4 py-3.5",
                            idx === 0 ? "pt-0" : "",
                            idx === 2 ? "pb-0" : ""
                          )}>
                            <div className="flex-1">
                              <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                            </div>
                            <div className="h-5 bg-slate-200 rounded w-20 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : !hasSubmitted ? (
                      <div className="text-xs text-slate-450 text-center py-8">
                        {t('dashboard.submitFiltersDeadline')}
                      </div>
                    ) : sortedDashboardDeadlines.length > 0 ? (
                      <div className="flex flex-col divide-y divide-slate-100">
                        {sortedDashboardDeadlines.slice(0, 3).map((item, idx) => {
                          const { scheme, category } = item;
                          const translated = getTranslatedScheme(scheme);

                          return (
                            <div key={scheme.id} className={cn(
                              "flex items-center justify-between gap-4 py-3 transition-colors",
                              idx === 0 ? "pt-0" : "",
                              idx === 2 ? "pb-0" : ""
                            )}>
                              <span className="text-[12.5px] font-bold text-slate-800 flex-1 min-w-0 line-clamp-2 leading-snug">
                                {translated.name}
                              </span>
                              <span className="text-[12px] font-semibold text-slate-500 shrink-0">
                                {getCleanDeadlineDisplay(scheme)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-450 text-center py-8">
                        {t('deadlines.noUpcoming')}
                      </div>
                    )}
                  </div>
                </div>
 
                <div className="pt-2.5 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-555 mt-2">
                  <span>{t('dashboard.trackedMilestones')}</span>
                  {hasSubmitted && sortedDashboardDeadlines.length > 3 ? (
                    <button
                      onClick={() => setIsDeadlinesModalOpen(true)}
                      className="text-[#2563EB] hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer hover:underline animate-fade-in"
                    >
                      View More &rarr;
                    </button>
                  ) : (
                    <span className="text-slate-800 font-bold">
                      {hasSubmitted ? `${sortedDashboardDeadlines.length} ${t('dashboard.alertsLabel') || 'Alert(s)'}` : t('dashboard.noAlerts') || '0 Alerts'}
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: ELIGIBILITY SCORE INSIGHT CARD (FULL-WIDTH BELOW THEM) */}
            <div 
              className="rounded-[24px] p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 min-h-[160px] text-white relative overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.06)] animate-none"
              style={{
                background: 'linear-gradient(135deg, #FF9C7D 0%, #F46B84 50%, #7EA8FF 100%)'
              }}
            >
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />

              <div className="flex flex-col gap-2 relative z-10 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {t('dashboard.eligibilityScore') || 'Eligibility Score'}
                  </span>
                  <Sparkles className="w-4 h-4 text-white/80" />
                </div>
                <p className="text-sm text-white/95 font-medium leading-relaxed mt-1">
                  {eligibilityMessage}
                </p>
              </div>

              <div className="relative z-10 sm:text-right flex flex-col sm:items-end justify-center shrink-0">
                <h2 className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
                  {displayEligibilityScore}%
                </h2>
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider mt-1 sm:mt-2">
                  {t('dashboard.overallCompatibility') || 'Overall Compatibility'}
                </span>
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
                  {t('dashboard.matchedOpportunitiesCount', { count: liveSchemes.length })}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {t('dashboard.schemesDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  {t('dashboard.autoFiltered')}
                </span>
              </div>
            </div>

            {n8nError && (
              <div className="w-full bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-xl">
                {t('dashboard.engineWarning')}: {n8nError}.
              </div>
            )}

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {isN8nLoading || recsLoading ? (
                // Subtle modern skeleton shimmer placeholders
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="border border-slate-100 bg-white rounded-[20px] p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.02)] animate-pulse">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-20 bg-slate-200 rounded-full" />
                        <div className="h-5 w-24 bg-slate-200 rounded-full" />
                      </div>
                      <div className="h-6 w-3/4 bg-slate-200 rounded mt-1" />
                      <div className="h-4 w-5/6 bg-slate-200 rounded mt-2 animate-pulse" />
                      <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                      <div className="h-4 w-28 bg-slate-150 rounded" />
                      <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ))
              ) : liveSchemes.length > 0 ? (
                liveSchemes.slice(0, 10).map((scheme) => {
                  const translated = getTranslatedScheme(scheme);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      key={scheme.id}
                      id={`scheme-card-${scheme.id}`}
                      className="border border-slate-200/50 bg-white rounded-[20px] p-6 sm:p-7 flex flex-col h-full justify-between transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] shadow-[0_16px_36px_rgba(15,23,42,0.03),0_4px_12px_rgba(15,23,42,0.01)] hover:shadow-[0_24px_48px_rgba(15,23,42,0.08),0_6px_16px_rgba(15,23,42,0.03)] hover:-translate-y-1.5 hover:border-blue-200/60 group relative overflow-hidden select-none"
                    >
                      {/* Subtle hover glow accent */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[20px]" />

                      <div className="flex flex-col relative z-10 flex-1 min-w-0">
                        {/* Category */}
                        <div className="shrink-0 mb-3.5">
                          <span className={cn(
                            "text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border select-none",
                            scheme.category === 'Scholarship' 
                              ? "bg-blue-50 text-[#2563EB] border-blue-200/30" 
                              : scheme.category === 'Gov Scheme'
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/30"
                              : "bg-rose-50 text-rose-600 border-rose-200/30"
                          )}>
                            {scheme.category === 'Scholarship' ? t('whySaarthi.visual.scholarships') : scheme.category === 'Gov Scheme' ? t('whySaarthi.visual.schemes') : t('common.categories.skillProgram')}
                          </span>
                        </div>

                        {/* Benefit */}
                        <div className="font-bold text-[17px] sm:text-[19px] text-slate-900 leading-[1.3] line-clamp-2 shrink-0 mb-2">
                          {translated.benefitAmount}
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-[15px] sm:text-[16px] text-slate-700 tracking-tight leading-[1.4] group-hover:text-[#2563EB] transition-colors line-clamp-2 shrink-0 mb-2.5">
                          {translated.name}
                        </h4>

                        {/* Description */}
                        <p 
                          className="text-[14px] sm:text-[14.5px] text-slate-500 font-normal leading-[1.7] shrink-0 block w-full"
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: '0px' }}
                        >
                          {translated.description}
                        </p>

                        {/* Flex-1 Spacer to maintain uniform spacing and push footer to the bottom */}
                        <div className="flex-1" />
                      </div>

                      <div className="flex items-center justify-between pt-5 sm:pt-6 border-t border-slate-100 mt-auto relative z-10 shrink-0">
                        <div className="flex items-center gap-1 text-[8.5px] text-emerald-600 font-bold uppercase tracking-wider shrink-0 bg-emerald-50/50 border border-emerald-100/60 px-2 py-0.5 rounded-md select-none">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{t('dashboard.eligibilityMet')}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setActiveScheme(scheme)}
                          className="flex items-center gap-1.5 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.25)] px-4 py-2 rounded-xl transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none active:scale-95 group/btn"
                        >
                          <span>{t('common.buttons.details', 'Details')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="md:col-span-2 py-16 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <Layers className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">No recommendations available.</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                      Click 'Find My Schemes' to generate recommendations.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Locked State Placeholder Card */
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[220px]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{t('dashboard.discoverMatched')}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                {t('dashboard.pleaseFillProfile')}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Floating Centered Modal for Deadlines */}
      <AnimatePresence>
        {isDeadlinesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with darken and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsDeadlinesModalOpen(false)}
              className="fixed inset-0 bg-slate-950/30 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white w-full max-w-2xl rounded-[28px] border border-slate-100 shadow-[0_24px_64px_rgba(15,23,42,0.12),0_8px_24px_rgba(15,23,42,0.06)] flex flex-col max-h-[80vh] overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight select-none">
                    {t('dashboard.upcomingDeadlines')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDeadlinesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer select-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list of deadlines */}
              <div className="overflow-y-auto overscroll-contain p-6 flex flex-col gap-6 flex-1">
                {filteredModalDeadlines.length > 0 ? (
                  <div className="flex flex-col bg-slate-50/25 border border-slate-100/70 rounded-2xl px-5 py-1 divide-y divide-slate-100">
                    {filteredModalDeadlines.map((item) => renderModalItem(item))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <Layers className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t('deadlines.noMatching')}</h4>
                      <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">
                        {t('deadlines.refineSearch')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compact Opportunity Detail Modal */}
      <Modal
        isOpen={activeScheme !== null}
        onClose={() => setActiveScheme(null)}
        className="max-w-[420px] rounded-[16px]"
        title={
          activeScheme && (
            <h3 className="font-bold text-sm text-slate-900 select-none">
              {getTranslatedScheme(activeScheme).name}
            </h3>
          )
        }
        footer={
          activeScheme && (
            <a
              href={activeScheme.portalUrl || 'https://www.india.gov.in/my-government/schemes'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveScheme(null)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg active:scale-95 flex items-center gap-1 transition-all cursor-pointer select-none focus:outline-none"
            >
              <span>{t('dashboard.visitWebsite', 'Visit Website')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </a>
          )
        }
      >
        {activeScheme && (
          (() => {
            const translated = getTranslatedScheme(activeScheme);
            return (
              <div className="flex flex-col gap-4 text-slate-700 text-xs font-sans select-text">
                {/* Required Documents Section */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 select-none">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('dashboard.requiredDocs')}</span>
                  </h4>

                  {translated.documents && translated.documents.length > 0 ? (
                    <div className="flex flex-col gap-1.5 pl-5 text-[13px]">
                      {translated.documents.map((doc, docIdx) => (
                        <div 
                          key={docIdx}
                          className="flex items-start gap-1.5 text-slate-600"
                        >
                          <span className="text-slate-400 select-none shrink-0">•</span>
                          <span className="break-words [word-break:break-word] [overflow-wrap:anywhere]">{doc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic pl-5 text-[13px]">{t('documents.noDocsRequired', 'No documents required.')}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Official Website Section */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 select-none">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('dashboard.officialLink', 'Official Link')}</span>
                  </h4>

                  {activeScheme.portalUrl ? (
                    <a
                      href={activeScheme.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all break-words [word-break:break-word] [overflow-wrap:anywhere] pl-5 block"
                    >
                      {activeScheme.portalUrl}
                    </a>
                  ) : (
                    <p className="text-slate-400 italic pl-5 text-[13px]">{t('dashboard.noLinkAvailable', 'No official link available.')}</p>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </Modal>
    </div>
  );
};
