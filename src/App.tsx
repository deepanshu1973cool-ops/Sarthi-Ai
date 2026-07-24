import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { OpportunitiesShowcase } from './components/OpportunitiesShowcase';
import { HowItWorks } from './components/HowItWorks';
import { WhySaarthi } from './components/WhySaarthi';
import { Features } from './components/Features';
import { Dashboard } from './components/Dashboard';
import { CustomerCare } from './components/CustomerCare';
import { Footer } from './components/Footer';
import { Auth, AuthUser } from './components/Auth';
import { Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const handleCtaClick = () => {
    if (user) {
      setActiveTab('dashboard');
      showToast("Opening Government Dashboard...");
    } else {
      setActiveTab('auth');
      showToast("Redirecting to Sign In...");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('explore');
    showToast("Logged out successfully.");
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      showToast("Loading your Eligibility Dashboard...");
    } else if (tabId === 'customer-care') {
      showToast("Loading Customer Care Support Desk...");
    } else if (tabId === 'auth') {
      showToast("Redirecting to Sign In...");
    } else {
      showToast(`Navigated to '${tabId}'`);
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
    setActiveTab('explore');
  }, []);

  // Smooth Scroll Trigger on Tab Change (handles delayed mounts due to AnimatePresence exit transitions)
  useEffect(() => {
    if (activeTab === 'how-it-works') {
      const element = document.querySelector('#how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If element is not in DOM (e.g. transitioning from dashboard/auth), wait for mount animation to complete
        const timer = setTimeout(() => {
          const el = document.querySelector('#how-it-works');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 260); // 240ms exit duration + 20ms render frame buffer
        return () => clearTimeout(timer);
      }
    } else if (activeTab === 'explore') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab === 'dashboard' || activeTab === 'customer-care' || activeTab === 'auth') {
      window.scrollTo({ top: 0 });
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F172A] font-sans selection:bg-blue-500/20 selection:text-blue-600 relative overflow-x-hidden">
      {/* Floating Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ctaText={user ? "Dashboard" : "Login"}
        onCtaClick={handleCtaClick}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content with Animated Transitions */}
      <main className="w-full relative min-h-[80vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {activeTab === 'dashboard' ? (
              <Dashboard />
            ) : activeTab === 'customer-care' ? (
              <CustomerCare />
            ) : activeTab === 'auth' ? (
              <Auth 
                onLoginSuccess={(userData) => {
                  setUser(userData);
                  setActiveTab('dashboard');
                  showToast(`Welcome back, ${userData.name}!`);
                }}
                onBackToExplore={() => setActiveTab('explore')}
              />
            ) : (
              <div className="w-full flex flex-col">
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
    </div>
  );
}
