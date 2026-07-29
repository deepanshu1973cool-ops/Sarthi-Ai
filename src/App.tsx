import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/landing/Hero';
import { OpportunitiesShowcase } from './components/landing/OpportunitiesShowcase';
import { HowItWorks } from './components/landing/HowItWorks';
import { WhySaarthi } from './components/landing/WhySaarthi';
import { Features } from './components/landing/Features';
import { Dashboard } from './pages/Dashboard';
import { CustomerCare } from './pages/CustomerCare';
import { Footer } from './components/layout/Footer';
import { Auth } from './pages/Auth';
import { ProfileSetup } from './pages/ProfileSetup';
import { FloatingChatButton } from './components/chat/FloatingChatButton';
import { ChatWindow } from './components/chat/ChatWindow';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { fetchProfile, insertProfile, updateProfile, UserProfile } from './services/profileService';
import { fetchProgress, createProgress, updateProgress, UserProgress, mapDBToProgress, DBProgress } from './services/progressService';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const landingRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Check session and load user profile
  useEffect(() => {
    let isMounted = true;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        setUser(session.user);
        loadProfileForUser(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setProgress(null);
        setIsLoadingProfile(false);
      }
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      console.log("Auth State Event:", event);
      if (session) {
        setUser(session.user);
        if (event === 'SIGNED_IN') {
          await loadProfileForUser(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
        setProgress(null);
        setActiveTab('explore');
        setIsLoadingProfile(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfileForUser = async (userId: string) => {
    try {
      setIsLoadingProfile(true);
      const userProfile = await fetchProfile(userId);
      setProfile(userProfile);
      
      if (userProfile) {
        // Load or create progress record since profile exists
        let userProgress = await fetchProgress(userId);
        if (!userProgress) {
          userProgress = await createProgress(userId);
        }
        setProgress(userProgress);
        
        // If user already has profile and is on auth screen, go to dashboard
        setActiveTab((prev) => (prev === 'auth' || prev === 'profile-setup' ? 'dashboard' : prev));
      } else {
        // Set local default progress for first-time signups
        setProgress({
          id: userId,
          userId: userId,
          profileCompleted: false,
          eligibilityChecked: false,
          recommendationsGenerated: 0,
          applicationsStarted: 0,
          applicationsSubmitted: 0
        });
        setActiveTab('profile-setup');
        showToast(t('toasts.setupProfile'));
      }
    } catch (error) {
      console.error("Error loading user profile or progress:", error);
      showToast(t('toasts.errorLoadingSession'));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Subscribe to real-time changes on user_progress table for this user
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-progress-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log("Real-time progress update payload:", payload);
          if (payload.eventType === 'DELETE') {
            setProgress(null);
          } else if (payload.new && Object.keys(payload.new).length > 0) {
            setProgress(mapDBToProgress(payload.new as DBProgress));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleCtaClick = () => {
    if (user) {
      if (profile) {
        setActiveTab('dashboard');
        showToast(t('toasts.openingDashboard'));
      } else {
        setActiveTab('profile-setup');
        showToast(t('toasts.completeProfileFirst'));
      }
    } else {
      setActiveTab('auth');
      showToast(t('toasts.redirectingSignIn'));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProgress(null);
    setActiveTab('explore');
    showToast(t('toasts.loggedOut'));
  };

  const handleTabChange = (tabId: string) => {
    // Guards
    if (tabId === 'dashboard') {
      if (!user) {
        setActiveTab('auth');
        window.scrollTo({ top: 0 });
        showToast(t('toasts.signInDashboard'));
        return;
      }
      if (!profile) {
        setActiveTab('profile-setup');
        window.scrollTo({ top: 0 });
        showToast(t('toasts.completeProfileFirst'));
        return;
      }
    }
    
    // Scroll instantly to top for page transitions, except when scrolling to landing sections
    if (tabId !== 'how-it-works') {
      window.scrollTo({ top: 0 });
    }

    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      showToast(t('toasts.loadingDashboard'));
    } else if (tabId === 'customer-care') {
      showToast(t('toasts.loadingCustomerCare'));
    } else if (tabId === 'auth') {
      showToast(t('toasts.redirectingSignIn'));
    }
  };

  // Profile setup submission
  const handleProfileSetupSubmit = async (profileData: UserProfile) => {
    if (!user) return;
    try {
      const newProfile = await insertProfile(user.id, profileData);
      setProfile(newProfile);
      
      const newProgress = await updateProgress(user.id, { profileCompleted: true });
      setProgress(newProgress);

      setActiveTab('dashboard');
      showToast(t('toasts.profileCreated'));
    } catch (error) {
      console.error("Error creating profile:", error);
      showToast(t('toasts.profileSaveFailed'));
      throw error;
    }
  };

  // Dashboard profile update submission
  const handleDashboardProfileUpdate = async (profileData: UserProfile) => {
    if (!user) return;
    try {
      const updated = await updateProfile(user.id, profileData);
      setProfile(updated);

      const newProgress = await updateProgress(user.id, { profileCompleted: true });
      setProgress(newProgress);

      showToast(t('toasts.profileUpdated'));
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(t('toasts.profileUpdateFailed'));
      throw error;
    }
  };

  // Handler for progress updates
  const handleProgressUpdate = async (updates: Partial<UserProgress>) => {
    if (!user) return;
    try {
      const updated = await updateProgress(user.id, updates);
      setProgress(updated);
    } catch (error) {
      console.error("Error updating user progress:", error);
      showToast(t('toasts.syncProgressFailed'));
      throw error;
    }
  };

  // Reset scroll, configure manual scroll restoration, and route to Explore / Hero section on reload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0 });
    
    // Clear hash parameters to prevent browser auto-jumping
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Smooth Scroll Trigger to landing anchors based on activeTab and wrapper DOM mount
  useEffect(() => {
    if (activeTab === 'how-it-works' && landingRef.current) {
      const element = document.querySelector('#how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeTab, landingRef.current]);

  // Handle immediate page scroll changes
  useEffect(() => {
    if (activeTab === 'explore') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab === 'dashboard' || activeTab === 'customer-care' || activeTab === 'auth' || activeTab === 'profile-setup') {
      window.scrollTo({ top: 0 });
    }
  }, [activeTab]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-400">{t('toasts.loadingSession') || 'Loading your profile session...'}</span>
        </div>
      </div>
    );
  }

  // Map supabase user object to navbar format
  const navbarUser = user ? {
    name: profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    picture: user.user_metadata?.avatar_url
  } : null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F172A] font-sans selection:bg-blue-500/20 selection:text-blue-600 relative overflow-x-hidden">
      {/* Floating Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ctaText={navbarUser ? t('navbar.dashboard') : t('navbar.login')}
        onCtaClick={handleCtaClick}
        user={navbarUser}
        onLogout={handleLogout}
      />

      {/* Main Content with Animated Transitions */}
      <main className="w-full relative min-h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="w-full"
          >
            {activeTab === 'dashboard' && profile && user ? (
              <Dashboard 
                userId={user.id}
                profile={profile} 
                onProfileUpdate={handleDashboardProfileUpdate} 
                progress={progress}
                onProgressUpdate={handleProgressUpdate}
              />
            ) : activeTab === 'profile-setup' && user ? (
              <ProfileSetup 
                initialEmail={user.email || ''} 
                initialName={user.user_metadata?.full_name || ''} 
                onSubmit={handleProfileSetupSubmit}
                onCancel={handleLogout}
              />
            ) : activeTab === 'customer-care' ? (
              <CustomerCare />
            ) : activeTab === 'auth' ? (
              <Auth 
                onLoginSuccess={(userData) => {
                  showToast(t('toasts.welcomeBackUser', { name: userData.name }));
                  supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                      setUser(session.user);
                      loadProfileForUser(session.user.id);
                    }
                  });
                }}
                onBackToExplore={() => setActiveTab('explore')}
              />
            ) : (
              <div ref={landingRef} className="w-full flex flex-col">
                <Hero onCtaClick={handleCtaClick} />
                <OpportunitiesShowcase />
                <HowItWorks />
                <Features />
                <WhySaarthi />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with Route Updater */}
      <Footer onTabChange={handleTabChange} />

      {/* Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-medium flex items-center gap-2 border border-slate-800">
          <Check className="w-3.5 h-3.5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Chatbot Assistant */}
      <FloatingChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)} />
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
