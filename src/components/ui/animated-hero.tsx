import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "react-i18next";

// Helper for generating deterministic star particles for background decoration
const STARS_DATA = Array.from({ length: 65 }, (_, i) => ({
  id: i,
  x: (i * 37) % 100, // percentage x
  y: (i * 53) % 100, // percentage y
  size: (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5),
  color: i % 4 === 0 ? "rgba(99, 102, 241, 0.7)" : i % 3 === 0 ? "rgba(59, 130, 246, 0.65)" : "rgba(100, 116, 139, 0.5)",
  duration: 1.8 + (i % 5) * 0.7,
  delay: (i % 7) * 0.4,
  isSparkle: i % 11 === 0,
}));

function Hero({ onCtaClick }: { onCtaClick?: () => void }) {
  const { t } = useTranslation();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => t('hero.titles', { returnObjects: true }) as string[] || ["opportunities", "scholarships", "schemes", "benefits", "grants"],
    [t]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2200);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center pt-24 sm:pt-28 pb-16 px-6 sm:px-12 bg-white text-[#0F172A] relative overflow-hidden">
      {/* Base Canvas */}
      <div className="absolute inset-0 bg-white pointer-events-none z-0" />

      {/* LAUNCH UI STYLE BLUE AMBIENT BACKGROUND GLOW */}
      {/* Outer Rim Glow Frame (Left, Right & Bottom subtle blue halo) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.18)_0%,rgba(147,197,253,0.12)_45%,transparent_75%)] blur-2xl pointer-events-none z-0" />

      {/* Main Bottom Ambient Glow Beam (recreating the Launch UI orange bottom glow in blue) */}
      <div className="absolute bottom-0 inset-x-0 h-[260px] sm:h-[340px] bg-gradient-to-t from-blue-500/25 via-sky-300/15 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Soft Side Ambient Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(219,234,254,0.35)_100%)] pointer-events-none z-0" />

      {/* Bottom Border Accent Line Blur */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent blur-[1px] pointer-events-none z-0" />

      {/* Background Star Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {STARS_DATA.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
            }}
            animate={
              star.isSparkle
                ? { opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }
                : { opacity: [0.35, 0.8, 0.35] }
            }
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="flex gap-6 py-6 lg:py-12 items-center justify-center flex-col text-center">

          {/* Heading with Nexa Serif Display Font ('font-serif-display') & Animated Word Switcher */}
          <div className="flex gap-4 flex-col items-center text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl tracking-tight text-center font-serif-display font-bold text-[#0F172A] leading-[1.18]">
              <span>{t('hero.titlePrefix')}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-2 md:pt-2 h-[1.3em]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-serif-display font-bold text-[#2563EB] drop-shadow-[0_2px_10px_rgba(37,99,235,0.25)]"
                    initial={{ opacity: 0, y: "-100%" }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? "-120%" : "120%",
                            opacity: 0,
                          }
                    }
                  >
                    {title}.
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#64748B] max-w-lg text-center font-normal pt-2">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex pt-4 w-full justify-center"
          >
            <Button
              size="lg"
              className="group gap-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold rounded-full px-8 shadow-md transition-all active:scale-98 cursor-pointer h-11 mx-auto"
              onClick={onCtaClick}
            >
              <span>{t('hero.cta')}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export { Hero };
