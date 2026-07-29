import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Logo } from '../components/shared/Logo';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from 'react-i18next';

export interface AuthUser {
  name: string;
  email: string;
  picture?: string;
}

interface AuthProps {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToExplore: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onBackToExplore }) => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg(t('auth.fillAll'));
      return;
    }
    
    // Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg(t('auth.invalidEmail'));
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        if (data.session) {
          onLoginSuccess({
            name: data.user?.user_metadata?.full_name || name,
            email: data.user?.email || email
          });
        } else {
          setSuccessMsg("Account created! Please check your email and confirm your account before signing in.");
        }
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.user) {
          onLoginSuccess({
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
            email: data.user.email || ''
          });
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.message === 'Email not confirmed') {
        setErrorMsg('Please confirm your email address. Check your inbox for the confirmation link before logging in.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setErrorMsg(err.message || 'Failed to initialize Google Sign In.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[90vh] bg-[#F8FAFC]/50 flex items-center justify-center py-16 px-6 font-sans text-slate-800 relative z-10 pt-28">
      {/* BACKGROUND DECORATION LIGHT */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.06)_0%,rgba(147,197,253,0.04)_45%,transparent_75%)] blur-2xl pointer-events-none z-0" />

      <div className="w-full max-w-[420px] bg-white rounded-[24px] border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-8 sm:p-10 flex flex-col items-center gap-6 relative z-10">
        
        {/* LOGO ICON CONTAINER */}
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
          <svg className="w-7 h-7 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        {/* HEADER INFORMATION */}
        <div className="text-center flex flex-col gap-1.5 w-full">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            {isSignUp ? t('auth.signupDesc') : t('auth.signinDesc')}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {errorMsg && (
          <div className="w-full flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-xs px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS DISPLAY */}
        {successMsg && (
          <div className="w-full flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs px-3 py-2.5 rounded-xl">
            <svg className="w-4 h-4 shrink-0 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* INPUTS FORM */}
        <form onSubmit={handleEmailPasswordSubmit} className="w-full flex flex-col gap-4">
          
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.fullName')}</label>
              <input
                type="text"
                required
                placeholder={t('auth.enterName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-slate-200/90 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 placeholder:text-slate-400 transition-all duration-200"
              />
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.email')}</label>
            <input
              type="email"
              required
              placeholder={t('auth.enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-slate-200/90 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-550/10 focus:border-blue-500/60 placeholder:text-slate-400 transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.password')}</label>
              {!isSignUp && (
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  {t('auth.forgotPassword')}
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-slate-200/90 rounded-xl pl-4 pr-12 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 placeholder:text-slate-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer text-xs font-bold"
              >
                {showPassword ? t('auth.hide') : t('auth.show')}
              </button>
            </div>
          </div>

          {/* Sign In CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer select-none text-sm text-center active:scale-98 shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>{isSignUp ? t('auth.createAccount') : t('auth.signIn')}</span>
            )}
          </button>

        </form>

        {/* DIVIDER */}
        <div className="w-full flex items-center justify-center my-1.5 relative">
          <div className="w-full h-[1px] bg-slate-100 absolute z-0" />
          <span className="bg-white relative z-10 px-4 text-xs font-medium text-slate-400">
            {t('auth.or')}
          </span>
        </div>

        {/* SOCIAL SIGN IN BUTTONS */}
        <div className="w-full">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-98 text-sm font-semibold cursor-pointer text-slate-700 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.01c2.34-2.16 3.69-5.32 3.69-8.74Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.01-3.12c-1.12.75-2.54 1.19-3.95 1.19-3.05 0-5.64-2.06-6.56-4.83H1.31v3.23A12.004 12.004 0 0 0 12 24Z"/>
              <path fill="#FBBC05" d="M5.44 14.33a7.17 7.17 0 0 1 0-4.66V6.44H1.31a12.013 12.013 0 0 0 0 11.12l4.13-3.23Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.33 0 3.28 2.68 1.31 6.44l4.13 3.23c.92-2.77 3.51-4.83 6.56-4.83Z"/>
            </svg>
            <span>{t('auth.google')}</span>
          </button>
        </div>

        {/* TOGGLE LINK */}
        <div className="text-center text-xs font-semibold mt-2 text-slate-400">
          {isSignUp ? t('auth.alreadyHave') : t('auth.dontHave')}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 transition-colors font-bold cursor-pointer select-none"
          >
            {isSignUp ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </div>

        {/* CANCEL BACK TO HOME */}
        <button
          type="button"
          onClick={onBackToExplore}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider mt-4"
        >
          {t('common.buttons.cancel')}
        </button>

      </div>
    </div>
  );
};
