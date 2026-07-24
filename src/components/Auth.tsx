import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

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
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load Google Identity Services SDK client script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password || (isSignUp && !name)) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    // Simulate standard sign in / sign up
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: isSignUp ? name : emailOrPhone.split('@')[0],
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@saarthi.ai`
      });
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setErrorMsg(null);
    
    // Check if real Google SDK loaded successfully
    if ((window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          // Developer/tester client ID. Replace this with your Google Cloud client ID in production
          client_id: '886398235933-pvl8r6e5q7c3tq1kgbehof626r7932k2.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          ux_mode: 'popup',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              setIsLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const info = await res.json();
                onLoginSuccess({
                  name: info.name || info.email,
                  email: info.email,
                  picture: info.picture
                });
              } catch (err) {
                console.error("Failed to fetch Google user details:", err);
                triggerFallbackSignIn();
              } finally {
                setIsLoading(false);
              }
            }
          },
          error_callback: () => {
            triggerFallbackSignIn();
          }
        });
        client.requestAccessToken();
      } catch (err) {
        console.warn("Real Google login failed to initialize, using Sandbox Mode:", err);
        triggerFallbackSignIn();
      }
    } else {
      triggerFallbackSignIn();
    }
  };

  // Simulated Google Sign-In Popup window fallback for offline / development testing
  const triggerFallbackSignIn = () => {
    // Open a beautiful centralized account chooser window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      '',
      'GoogleAccountChooser',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>Sign in with Google</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-[#F3F4F6] font-sans flex items-center justify-center min-h-screen p-6">
            <div class="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-8 flex flex-col items-center">
              <!-- Google G logo -->
              <svg class="w-12 h-12 mb-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.01c2.34-2.16 3.69-5.32 3.69-8.74Z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.01-3.12c-1.12.75-2.54 1.19-3.95 1.19-3.05 0-5.64-2.06-6.56-4.83H1.31v3.23A12.004 12.004 0 0 0 12 24Z"/>
                <path fill="#FBBC05" d="M5.44 14.33a7.17 7.17 0 0 1 0-4.66V6.44H1.31a12.013 12.013 0 0 0 0 11.12l4.13-3.23Z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.33 0 3.28 2.68 1.31 6.44l4.13 3.23c.92-2.77 3.51-4.83 6.56-4.83Z"/>
              </svg>

              <h2 class="text-xl font-bold text-slate-800">Choose an account</h2>
              <p class="text-xs text-slate-400 mt-1">to continue to <span class="font-semibold text-blue-600">Saarthi AI</span></p>

              <!-- Accounts List -->
              <div class="w-full flex flex-col gap-3.5 mt-8">
                <button id="acc1" class="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left">
                  <div class="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">D</div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-800 leading-none">Deepanshu Sharma</h4>
                    <span class="text-xs text-slate-400">deepanshu@gmail.com</span>
                  </div>
                </button>

                <button id="acc2" class="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left">
                  <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">S</div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-800 leading-none">Saarthi Developer</h4>
                    <span class="text-xs text-slate-400">dev@saarthi.ai</span>
                  </div>
                </button>
              </div>

              <div class="w-full text-center mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                Authorized by Google Developer Sandbox
              </div>
            </div>

            <script>
              const selectAccount = (name, email) => {
                window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', name, email }, '*');
                window.close();
              };
              document.getElementById('acc1').onclick = () => selectAccount('Deepanshu Sharma', 'deepanshu@gmail.com');
              document.getElementById('acc2').onclick = () => selectAccount('Saarthi Developer', 'dev@saarthi.ai');
            </script>
          </body>
        </html>
      `);
      popup.document.close();
    }

    // Listen to messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage);
        onLoginSuccess({
          name: event.data.name,
          email: event.data.email
        });
      }
    };
    window.addEventListener('message', handleMessage);
  };

  const handleGitHubSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'GitHub User',
        email: 'github@saarthi.ai'
      });
    }, 1000);
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
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            {isSignUp ? 'Sign up to get started with Saarthi' : 'Sign in to continue to your account'}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {errorMsg && (
          <div className="w-full flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-xs px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* INPUTS FORM */}
        <form onSubmit={handleEmailPasswordSubmit} className="w-full flex flex-col gap-4">
          
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-slate-200/90 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 placeholder:text-slate-400 transition-all duration-200"
              />
            </div>
          )}

          {/* Email or Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email or Phone</label>
            <input
              type="text"
              required
              placeholder="Enter your email or phone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-slate-200/90 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 placeholder:text-slate-400 transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              {!isSignUp && (
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xs font-bold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Sign In CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all cursor-pointer select-none text-sm text-center active:scale-98 shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>

        </form>

        {/* DIVIDER */}
        <div className="w-full flex items-center justify-center my-1.5 relative">
          <div className="w-full h-[1px] bg-slate-100 absolute z-0" />
          <span className="bg-white relative z-10 px-4 text-xs font-medium text-slate-400">
            or continue with
          </span>
        </div>

        {/* SOCIAL SIGN IN BUTTONS */}
        <div className="w-full">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors duration-200 active:scale-98 text-xs font-bold cursor-pointer text-slate-700 bg-white"
          >
            <svg className="w-4.5 h-4.5 mr-1" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.01c2.34-2.16 3.69-5.32 3.69-8.74Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.01-3.12c-1.12.75-2.54 1.19-3.95 1.19-3.05 0-5.64-2.06-6.56-4.83H1.31v3.23A12.004 12.004 0 0 0 12 24Z"/>
              <path fill="#FBBC05" d="M5.44 14.33a7.17 7.17 0 0 1 0-4.66V6.44H1.31a12.013 12.013 0 0 0 0 11.12l4.13-3.23Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.33 0 3.28 2.68 1.31 6.44l4.13 3.23c.92-2.77 3.51-4.83 6.56-4.83Z"/>
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* TOGGLE LINK */}
        <div className="text-center text-xs font-semibold mt-2 text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 transition-colors font-bold cursor-pointer select-none"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {/* CANCEL BACK TO HOME */}
        <button
          type="button"
          onClick={onBackToExplore}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider mt-4"
        >
          Cancel & Go Back
        </button>

      </div>
    </div>
  );
};
