import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  User, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  Briefcase, 
  Users, 
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../services/profileService';
import { cn } from '../utils/cn';
import { useTranslation } from 'react-i18next';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir"
];

interface ProfileSetupProps {
  initialEmail: string;
  initialName?: string;
  onSubmit: (profileData: UserProfile) => Promise<void>;
  onCancel: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  initialEmail,
  initialName = '',
  onSubmit,
  onCancel
}) => {
  const { t } = useTranslation();

  // Form state
  const [fullName, setFullName] = useState(initialName || initialEmail.split('@')[0]);
  const [age, setAge] = useState<number>(20);
  const [state, setState] = useState<string>('Maharashtra');
  const [gender, setGender] = useState<string>('Male');
  const [education, setEducation] = useState<string>('Graduate');
  const [income, setIncome] = useState<number>(180000);
  const [category, setCategory] = useState<string>('SC');
  const [employment, setEmployment] = useState<string>('Student');

  // UI dropdown states
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [isEmploymentDropdownOpen, setIsEmploymentDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredStates = useMemo(() => {
    return INDIAN_STATES.filter(st => st.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const incomePercentage = useMemo(() => {
    const min = 1000;
    const max = 1000000;
    if (income <= min) return 0;
    if (income >= max) return 100;
    return ((income - min) / (max - min)) * 100;
  }, [income]);

  const agePercentage = useMemo(() => {
    const min = 1;
    const max = 100;
    if (age <= min) return 0;
    if (age >= max) return 100;
    return ((age - min) / (max - min)) * 100;
  }, [age]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (age < 1 || age > 120) {
      setErrorMessage("Please enter a valid age.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        fullName,
        age,
        state,
        gender,
        education,
        income,
        category,
        employment
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[90vh] bg-[#F8FAFC]/50 flex items-center justify-center py-16 px-6 font-sans text-slate-800 relative z-10 pt-28">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.06)_0%,rgba(147,197,253,0.04)_45%,transparent_75%)] blur-2xl pointer-events-none z-0" />

      <div className="w-full max-w-[600px] bg-white rounded-[24px] border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-8 sm:p-10 flex flex-col gap-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col gap-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('profileSetup.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal max-w-md mx-auto">
            {t('profileSetup.desc')}
          </p>
        </div>

        {errorMessage && (
          <div className="w-full bg-rose-50 border border-rose-100 text-rose-650 text-xs px-4 py-3 rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" /> {t('auth.fullName')}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.enterName')}
              className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 placeholder:text-slate-450 transition-all"
            />
          </div>

          {/* Grid for Age & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('profileSetup.age')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #2563EB 0%, #2563EB ${agePercentage}%, #F1F5F9 ${agePercentage}%, #F1F5F9 100%)`
                  }}
                  className="flex-1 custom-range-slider cursor-pointer"
                />
                <div className="w-24 flex items-center justify-between bg-[#FAFAFA] border border-slate-200 px-2.5 py-1.5 rounded-xl shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={age || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 1 : Number(e.target.value);
                      setAge(Math.min(100, Math.max(1, val)));
                    }}
                    className="w-10 text-right bg-transparent text-sm font-bold text-slate-800 focus:outline-none border-none p-0"
                  />
                  <span className="text-xs font-semibold text-slate-400 shrink-0">
                    {t('whySaarthi.visual.left') === 'शिल्लक' ? 'वर्षे' : t('whySaarthi.visual.left') === 'शेष' ? 'वर्ष' : 'yrs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('profileSetup.gender')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => setGender(gen)}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      gender === gen
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-[#FAFAFA] border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {gen === 'Male' ? t('common.genders.male') : gen === 'Female' ? t('common.genders.female') : t('common.genders.other')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* State of Residence */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> {t('profileSetup.state')}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsStateDropdownOpen(!isStateDropdownOpen);
                setIsEducationDropdownOpen(false);
                setIsEmploymentDropdownOpen(false);
              }}
              className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>{state}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isStateDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStateDropdownOpen(false)} />
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 flex flex-col gap-2 max-h-60 overflow-hidden">
                  <input
                    type="text"
                    placeholder={t('profileSetup.searchState')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  <div className="flex flex-col overflow-y-auto max-h-40 divide-y divide-slate-50">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setState(st);
                            setIsStateDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer hover:bg-slate-50",
                            state === st ? "text-[#2563EB] bg-blue-50/50" : "text-slate-600"
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

          {/* Education Level */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> {t('profileSetup.education')}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsEducationDropdownOpen(!isEducationDropdownOpen);
                setIsStateDropdownOpen(false);
                setIsEmploymentDropdownOpen(false);
              }}
              className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>
                {education === '10th' && t('common.education.10th')}
                {education === '12th' && t('common.education.12th')}
                {education === 'Graduate' && t('common.education.graduate')}
                {education === 'Masters' && t('common.education.masters')}
                {education === 'Doctorate' && t('common.education.doctorate')}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isEducationDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsEducationDropdownOpen(false)} />
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
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
                        setEducation(opt.value);
                        setIsEducationDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer hover:bg-slate-50",
                        education === opt.value ? "text-[#2563EB] bg-blue-50/50" : "text-slate-600"
                      )}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Grid for Income & Social Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Annual Income */}
            <div className="flex flex-col gap-1.5 justify-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-500" /> {t('profileSetup.income')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #2563EB 0%, #2563EB ${incomePercentage}%, #F1F5F9 ${incomePercentage}%, #F1F5F9 100%)`
                  }}
                  className="flex-1 custom-range-slider cursor-pointer"
                />
                <div className="w-24 flex items-center justify-between bg-[#FAFAFA] border border-slate-200 px-2.5 py-1.5 rounded-xl shrink-0">
                  <span className="text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1000"
                    max="1000000"
                    step="any"
                    value={income || ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setIncome(0);
                        return;
                      }
                      const val = Number(raw);
                      if (val > 1000000) {
                        setIncome(1000000);
                      } else {
                        setIncome(val);
                      }
                    }}
                    onBlur={() => {
                      if (!income || income < 1000) {
                        setIncome(1000);
                      }
                    }}
                    className="w-16 text-right bg-transparent text-sm font-bold text-slate-800 focus:outline-none border-none p-0"
                  />
                </div>
              </div>
            </div>

            {/* Social Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> {t('profileSetup.category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60"
              >
                {['General', 'OBC', 'SC', 'ST', 'EWS'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Occupation / Employment Status */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" /> {t('profileSetup.occupation')}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsEmploymentDropdownOpen(!isEmploymentDropdownOpen);
                setIsStateDropdownOpen(false);
                setIsEducationDropdownOpen(false);
              }}
              className="w-full bg-[#FAFAFA] border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>
                {employment === 'Student' && t('common.employment.student')}
                {employment === 'Unemployed' && t('common.employment.unemployed')}
                {employment === 'Entrepreneur' && t('common.employment.entrepreneur')}
                {employment === 'Employed' && t('common.employment.employed')}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isEmploymentDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsEmploymentDropdownOpen(false)} />
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
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
                        setEmployment(opt.value);
                        setIsEmploymentDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer hover:bg-slate-50",
                        employment === opt.value ? "text-[#2563EB] bg-blue-50/50" : "text-slate-600"
                      )}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-[0_4px_12px_rgba(15,23,42,0.15)] active:scale-98"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('common.buttons.saveAndContinue')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-650 transition-colors uppercase tracking-wider mt-2 mx-auto"
          >
            {t('common.buttons.cancel')}
          </button>
        </form>

      </div>
    </div>
  );
};
