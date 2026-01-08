import { useMemo, useState } from 'react';
import { Play, Users, Video, Download, MessageSquare, Mic2, ChevronRight, CheckCircle2, Globe, Award, Clock, Mail, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { NANDINI } from '../data/nandini';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TESTIMONIALS } from '../data/testimonials';
import { ThreeHeroBackground } from './ThreeHeroBackground';
import { BookingModal } from './BookingModal';
import { PremiumPaymentModal } from './PremiumPaymentModal';
import { AdBanner } from './AdBanner';

interface LandingPageProps {
  onNavigate: (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => void;
}

const EASE_SMOOTH: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_OVERSHOOT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SMOOTH } },
};

const cardStagger = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_SMOOTH, delay: 0.08 * i },
  }),
};

const softRise = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SMOOTH } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OVERSHOOT } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  const INITIAL_REVIEWS_COUNT = 6;
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isBookPurchaseOpen, setIsBookPurchaseOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const visibleTestimonials = useMemo(() => {
    return showAllReviews ? TESTIMONIALS : TESTIMONIALS.slice(0, INITIAL_REVIEWS_COUNT);
  }, [showAllReviews]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ThreeHeroBackground mode="page" />

      {/* Animated background elements */}
      <div className="aurora-blob" />
      <div className="aurora-blob alt float-soft" />
      <div className="ambient-grid" />
      
      {/* Floating particles */}
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Larger floating blobs */}
      <div className="particles-container">
        {[...Array(5)].map((_, i) => (
          <div
            key={`blob-${i}`}
            className="particle-blob animate-wave"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              background: `radial-gradient(circle, ${
                ['rgba(99, 102, 241, 0.3)', 'rgba(6, 182, 212, 0.3)', 'rgba(236, 72, 153, 0.3)'][
                  i % 3
                ]
              }, transparent)`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-2xl border-b border-white/40 shadow-lg shadow-indigo-200/20"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-400/40 float-soft">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">LinguaLive</span>
          </motion.div>
          <div className="hidden lg:flex items-center gap-6">
            <motion.a 
              href="#features" 
              className="text-slate-600 hover:text-indigo-600 transition-colors font-medium relative group"
              whileHover={{ y: -2 }}
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#free-classes" 
              className="text-slate-600 hover:text-indigo-600 transition-colors font-medium relative group"
              whileHover={{ y: -2 }}
            >
              Free Classes
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#reviews" 
              className="text-slate-600 hover:text-indigo-600 transition-colors font-medium relative group"
              whileHover={{ y: -2 }}
            >
              Reviews
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#pricing" 
              className="text-slate-600 hover:text-indigo-600 transition-colors font-medium relative group"
              whileHover={{ y: -2 }}
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#contact" 
              className="text-slate-600 hover:text-indigo-600 transition-colors font-medium relative group"
              whileHover={{ y: -2 }}
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all group-hover:w-full"></span>
            </motion.a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <motion.button 
              onClick={() => onNavigate('auth')}
              className="hidden sm:block px-4 sm:px-5 py-2 sm:py-2.5 text-slate-600 hover:text-indigo-600 rounded-xl transition-colors font-medium text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
            <motion.button 
              onClick={() => onNavigate('auth')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-indigo-400/40 transition-all font-medium glow-button text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-white/40 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#free-classes"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Free Classes
              </a>
              <a
                href="#reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Reviews
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Pricing
              </a>
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Contact
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('auth');
                }}
                className="block w-full text-left px-4 py-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 md:pt-32 pb-8 sm:pb-16 md:pb-20 px-4 sm:px-6 relative overflow-hidden section-shell">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="bg-decorative" style={{
            top: '10%',
            right: '5%',
            width: '300px',
            height: '300px',
            backgroundImage: 'url(https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop)',
            opacity: 0.06,
            transform: 'rotate(15deg)',
          }} />
          <div className="bg-decorative" style={{
            bottom: '15%',
            left: '8%',
            width: '250px',
            height: '250px',
            backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop)',
            opacity: 0.05,
            transform: 'rotate(-12deg)',
          }} />
          <div className="bg-decorative" style={{
            top: '50%',
            left: '50%',
            width: '400px',
            height: '400px',
            backgroundImage: 'url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop)',
            opacity: 0.04,
            transform: 'translate(-50%, -50%) rotate(25deg)',
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left: Hero Copy */}
            <motion.div
              className="lg:col-span-7 text-center lg:text-left"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-secondary shine-border mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-700">Zoom & Meet classes available</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-6 tracking-tight leading-[1.1] sm:leading-[1.05] font-bold">
                <span className="block text-slate-900">Learn. Speak. Perfect</span>
                <span className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">— Confidently.</span>
              </h1>

              <p className="text-sm sm:text-lg md:text-xl text-slate-700 mb-4 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium px-2 sm:px-0">
                Master languages through Zoom & Meet classes, real-time pronunciation practice, and guided feedback. Bengali and English — all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-10 px-4 sm:px-0">
                <motion.button
                  onClick={() => onNavigate('student-dashboard')}
                  className="group px-5 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 glow-button font-medium shadow-lg shadow-indigo-400/30 text-sm sm:text-base"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Get Started
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => onNavigate('pronunciation', { allowUnauthed: true })}
                  className="px-5 sm:px-8 py-2.5 sm:py-4 glass-card text-slate-900 rounded-xl sm:rounded-2xl font-medium border-2 border-white/60 hover:border-indigo-400/60 transition-all text-sm sm:text-base"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Free Pronunciation Practice
                </motion.button>
              </div>

              <motion.button
                type="button"
                onClick={() => onNavigate('student-dashboard')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                whileHover={{ y: -1 }}
              >
                Explore courses →
              </motion.button>

              {/* Stats */}
              <motion.div
                className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl glass-card tilt-card shine-border mx-4 sm:mx-0"
                variants={softRise}
                initial="hidden"
                animate="visible"
              >
                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  <motion.div className="text-center lg:text-left" whileHover={{ y: -4 }}>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-1 sm:mb-2">⭐ 5.0</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Rating</div>
                  </motion.div>
                  <motion.div className="text-center lg:text-left" whileHover={{ y: -4 }}>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">10,000+</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Zoom & Meet Classes</div>
                  </motion.div>
                  <motion.div className="text-center lg:text-left" whileHover={{ y: -4 }}>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-1 sm:mb-2">100%</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Satisfaction</div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Instructor Spotlight */}
            <div className="lg:col-span-5 px-4 sm:px-0">
              <motion.div
                className="p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl glass-card tilt-card shine-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="text-left flex-1">
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">Meet your instructor</div>
                      <div className="text-lg sm:text-xl md:text-2xl font-semibold">{NANDINI.name}</div>
                      <div className="text-sm sm:text-base font-medium text-primary mb-1">Bengali & English Language Teacher</div>
                      <div className="text-sm sm:text-base text-muted-foreground">{NANDINI.specialization}</div>
                      {NANDINI.location && (
                        <div className="text-xs sm:text-sm text-muted-foreground mt-1">{NANDINI.location}</div>
                      )}
                      <div className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                        Hi, I'm Nandini Ghosh — a passionate language teacher, poet, and lifelong learner. 
                        I've been teaching Bengali and English online for over a decade, creating customized lessons 
                        that are practical, engaging, and culturally rooted. I also write Bengali poems and Hindi Shayaries 
                        and have published a Bengali learning book on Amazon. Along with teaching, I work on international 
                        AI language projects, blending education, creativity, and technology.
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-card shadow-sm ring-2 ring-primary/10">
                        <ImageWithFallback
                          src={NANDINI.photoUrl || NANDINI.avatarUrl}
                          alt="Instructor photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border">
                      <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span>Rating</span>
                      </div>
                      <div className="text-base sm:text-lg md:text-xl font-semibold">{NANDINI.rating} / 5</div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border">
                      <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span>Experience</span>
                      </div>
                      <div className="text-base sm:text-lg md:text-xl font-semibold">{NANDINI.experience}</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">Why students trust her</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {NANDINI.credibilityHighlights.slice(0, 6).map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onNavigate('auth')}
                      className="flex-1 px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity glow-button"
                    >
                      View Instructor Profile
                    </button>
                    <button
                      onClick={() => onNavigate('student-dashboard')}
                      className="flex-1 px-6 py-3 rounded-2xl bg-secondary border border-border text-secondary-foreground hover:opacity-90 transition-opacity"
                    >
                      Book a Class
                    </button>
                  </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards - Trial Session & Premium Access */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 section-shell bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Start Your Learning Journey
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Choose the perfect option for your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* Trial Session Card */}
            <motion.div
              className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl glass-card tilt-card shine-border overflow-hidden"
              variants={cardStagger}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.26 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-2">$5</div>
                <div className="text-2xl sm:text-3xl font-semibold mb-2">Trial Session</div>
                <p className="text-sm sm:text-base text-muted-foreground">25 minutes • Perfect to get started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>One-on-one Zoom or Meet class</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Personalized level assessment</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Customized learning plan</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Flexible scheduling</span>
                </li>
              </ul>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity glow-button text-base sm:text-lg"
              >
                Book Trial Session
              </button>
            </motion.div>

            {/* AI Agent Card */}
            <motion.div
              className="relative p-4 sm:p-8 rounded-xl sm:rounded-3xl glass-card tilt-card shine-border overflow-hidden border-2 border-purple-300/50"
              variants={cardStagger}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.26 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm font-semibold">
                AI Powered
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">$5</div>
                <div className="text-2xl sm:text-3xl font-semibold mb-2">AI Language Agent</div>
                <p className="text-sm sm:text-base text-muted-foreground">Practice with AI conversation bot</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>24/7 AI conversation practice</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>Pronunciation feedback</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>Personalized learning path</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>Unlimited practice sessions</span>
                </li>
              </ul>
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity glow-button text-base sm:text-lg"
              >
                Get AI Agent Access
              </button>
            </motion.div>

            {/* Bengali Book Card */}
            <motion.div
              className="relative p-4 sm:p-8 rounded-xl sm:rounded-3xl glass-card tilt-card shine-border overflow-hidden border-2 border-orange-300/50"
              variants={cardStagger}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.26 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm font-semibold">
                Digital Book
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent mb-2">$10</div>
                <div className="text-2xl sm:text-3xl font-semibold mb-2">Bengali Book</div>
                <p className="text-sm sm:text-base text-muted-foreground">Complete conversation guide</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>Comprehensive learning material</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>Conversation examples</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>Grammar explanations</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>Instant PDF download</span>
                </li>
              </ul>
              <button
                onClick={() => setIsBookPurchaseOpen(true)}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold hover:opacity-90 transition-opacity glow-button text-base sm:text-lg"
              >
                Buy Bengali Book
              </button>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <p className="text-base sm:text-lg text-muted-foreground mb-2">💳 Secure payment via PayPal or UPI (PhonePe, GPay)</p>
            <p className="text-xs sm:text-sm text-muted-foreground">All sessions include Zoom or Meet link and confirmation email</p>
          </div>
        </div>
      </section>

      {/* Intro Section - Featured Introductory Session */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 section-shell scroll-mt-28 relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-purple-50/50">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              Watch Our Introductory Session
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Get started with this comprehensive introduction to our teaching approach</p>
          </div>

          <motion.div
            className="rounded-2xl overflow-hidden glass-card shine-border shadow-2xl"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.22 }}
          >
            <div className="aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/ojasjm9r_ig" 
                title="Introductory Session" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Introductory Session</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Learn about our methodology and what makes our classes effective</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 sm:py-16 md:py-20 px-4 sm:px-6 scroll-mt-20 sm:scroll-mt-28 section-shell relative overflow-hidden">
        {/* Background Decorative Images */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800)',
            opacity: 0.04,
            top: '10%',
            left: '-10%',
            width: '400px',
            height: '400px',
            transform: 'rotate(-15deg)'
          }} />
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800)',
            opacity: 0.05,
            bottom: '5%',
            right: '-5%',
            width: '500px',
            height: '500px',
            transform: 'rotate(20deg)'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-6 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent px-4">
              Everything you need to master a language
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground px-4">Professional tools for serious learners</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Feature Card 1 */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border"
              variants={cardStagger}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-105 transition-transform shadow-[0_16px_40px_rgba(11,79,108,0.35)]">
                <Video className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-base sm:text-xl mb-2 sm:mb-3 font-semibold">Zoom & Meet Classes</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Interactive sessions with your instructor on Zoom or Google Meet. Personalized attention and guided practice.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border"
              variants={cardStagger}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 transition-transform shadow-[0_16px_40px_rgba(11,79,108,0.35)]">
                <Mic2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 font-semibold">Pronunciation Practice</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                AI-powered speech recognition analyzes your pronunciation and provides instant, actionable feedback.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border"
              variants={cardStagger}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 transition-transform shadow-[0_16px_40px_rgba(11,79,108,0.35)]">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 font-semibold">Real-Time Chat</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Engage with instructors and peers during Zoom & Meet sessions. Ask questions and collaborate seamlessly.
              </p>
            </motion.div>

            {/* Feature Card 4 */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border"
              variants={cardStagger}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 transition-transform shadow-[0_16px_40px_rgba(11,79,108,0.35)]">
                <Download className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 font-semibold">Secure Access</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Log in to book classes and keep your learning progress private.
              </p>
            </motion.div>

            {/* Feature Card 5 */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border"
              variants={cardStagger}
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 transition-transform shadow-[0_16px_40px_rgba(11,79,108,0.35)]">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 font-semibold">Multi-Language Support</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Learn Bengali and English with specialized courses designed for each language's unique challenges.
              </p>
            </motion.div>

            {/* Feature Card 6 */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border"
              variants={cardStagger}
              custom={5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 transition-transform shadow-[0_16px_40px_rgba(11,79,108,0.35)]">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 font-semibold">Certificates & Progress</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Track your improvement with detailed analytics and earn certificates upon course completion.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHO DO I TEACH Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 section-shell">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-4">WHO DO I TEACH AND WHAT DO I TEACH</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">Courses tailored for every age group</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {/* Children */}
            <motion.div
              className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border text-center"
              variants={cardStagger}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop" 
                  alt="Children learning"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-primary">CHILDREN</h3>
              <div className="text-left space-y-3 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span>I offer courses in:</span>
                </p>
                <ul className="space-y-2 ml-8">
                  <li>Conversation</li>
                  <li>Grammar</li>
                  <li>Reading</li>
                  <li>Writing</li>
                  <li>Listening</li>
                  <li>Speaking</li>
                  <li>Comprehension</li>
                  <li>Vocabulary</li>
                  <li>Singing</li>
                  <li>Nursery Rhymes</li>
                  <li>Story Telling</li>
                  <li className="font-semibold">and much more... 😊</li>
                </ul>
              </div>
            </motion.div>

            {/* Teenagers */}
            <motion.div
              className="group p-8 rounded-2xl glass-card tilt-card shine-border text-center"
              variants={cardStagger}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-secondary/20 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop" 
                  alt="Teenagers learning"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-secondary">TEENAGERS</h3>
              <div className="text-left space-y-3 text-muted-foreground">
                <ul className="space-y-2">
                  <li>Conversation</li>
                  <li>Grammar</li>
                  <li>Reading</li>
                  <li>Writing</li>
                  <li>Speaking</li>
                  <li>Listening</li>
                  <li>Comprehension</li>
                  <li>Vocabulary</li>
                  <li>Interview Preparation</li>
                  <li>TOEIC</li>
                  <li>IELTS (speaking)</li>
                  <li>Business English (Beginner & Intermediate)</li>
                  <li>Daily news articles</li>
                  <li>Travel English</li>
                  <li>Callan Method</li>
                  <li className="font-semibold">and much more... 😊</li>
                </ul>
              </div>
            </motion.div>

            {/* Adults */}
            <motion.div
              className="group p-8 rounded-2xl glass-card tilt-card shine-border text-center"
              variants={cardStagger}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-accent/20 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=400&fit=crop" 
                  alt="Adults learning"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-accent">ADULTS</h3>
              <div className="text-left space-y-3 text-muted-foreground">
                <ul className="space-y-2">
                  <li>Conversation</li>
                  <li>Grammar</li>
                  <li>Reading</li>
                  <li>Writing</li>
                  <li>Speaking</li>
                  <li>Listening</li>
                  <li>Comprehension</li>
                  <li>Vocabulary</li>
                  <li>Interview Preparation</li>
                  <li>TOEIC</li>
                  <li>IELTS (speaking)</li>
                  <li>Business English (Beginner & Intermediate)</li>
                  <li>Daily news articles</li>
                  <li>Travel English</li>
                  <li>Callan Method</li>
                  <li className="font-semibold">and much more... 😊</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FREE VIDEO CLASSES Section */}
      <section id="free-classes" className="py-20 px-6 section-shell bg-gradient-to-b from-background to-secondary/10 scroll-mt-28 relative overflow-hidden">
        {/* Background Decorative Images */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800)',
            opacity: 0.06,
            top: '-10%',
            right: '5%',
            width: '450px',
            height: '450px',
            transform: 'rotate(10deg)'
          }} />
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800)',
            opacity: 0.04,
            bottom: '-5%',
            left: '0%',
            width: '500px',
            height: '500px',
            transform: 'rotate(-25deg)'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 font-bold bg-gradient-to-r from-green-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Free Video Classes
            </h2>
            <p className="text-xl text-muted-foreground">Watch sample lessons and get a feel for the teaching style</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Video 1 */}
            <motion.div
              className="rounded-2xl overflow-hidden glass-card shine-border"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.22 }}
            >
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/Nn98x3dpTWE" 
                  title="TOEIC" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">TOEIC Preparation</h3>
              </div>
            </motion.div>

            {/* Video 2 */}
            <motion.div
              className="rounded-2xl overflow-hidden glass-card shine-border"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.22 }}
            >
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/Tv-O_T2LWyM" 
                  title="GRAMMAR" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Grammar Essentials</h3>
              </div>
            </motion.div>

            {/* Video 3 - Renamed to How Bengali Lessons Work */}
            <motion.div
              className="rounded-2xl overflow-hidden glass-card shine-border"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.22 }}
            >
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/ehFA-qC-DXs" 
                  title="How Bengali Lessons Work" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">How Bengali Lessons Work</h3>
              </div>
            </motion.div>

            {/* Video 4 - Bengali Bliss (New) */}
            <motion.div
              className="rounded-2xl overflow-hidden glass-card shine-border"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.22 }}
            >
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/jpiyIVzXzJw" 
                  title="Bengali Bliss" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Bengali Bliss</h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 section-shell scroll-mt-20 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-4">
                Start learning in 3 simple steps
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Your journey to fluency begins here. Each step is designed to build confidence and accelerate learning.
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            <motion.div
              className="group relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border overflow-hidden"
              variants={cardStagger}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Choose Your Course</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Select from our curated courses in Bengali or English
                </p>
                <div className="mt-4 sm:mt-6 h-1 w-12 bg-primary rounded-full"></div>
              </div>
            </motion.div>

            <motion.div
              className="group relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border overflow-hidden"
              variants={cardStagger}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Join Zoom & Meet Classes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Attend interactive Zoom or Google Meet sessions, practice with your instructor, and build confidence
                </p>
                <div className="mt-6 h-1 w-12 bg-secondary rounded-full"></div>
              </div>
            </motion.div>

            <motion.div
              className="group relative p-8 rounded-2xl glass-card tilt-card shine-border overflow-hidden"
              variants={cardStagger}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Practice & Perfect</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use pronunciation tools and live practice to master your skills
                </p>
                <div className="mt-6 h-1 w-12 bg-accent rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 px-6 section-shell scroll-mt-28 relative overflow-hidden">
        {/* Background Decorative Images */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800)',
            opacity: 0.05,
            top: '5%',
            left: '-8%',
            width: '420px',
            height: '420px',
            transform: 'rotate(12deg)'
          }} />
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800)',
            opacity: 0.04,
            bottom: '10%',
            right: '-10%',
            width: '480px',
            height: '480px',
            transform: 'rotate(-18deg)'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl mb-4 font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Trusted by learners and parents
            </h2>
            <p className="text-xl text-muted-foreground">Real feedback from real students</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTestimonials.map((t) => (
              <motion.div
                key={t.id}
                className="p-8 rounded-2xl glass-card tilt-card shine-border"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.22 }}
                whileHover={{ y: -8, scale: 1.01 }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-card shrink-0">
                    <ImageWithFallback
                      src={t.avatarUrl}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div>{t.studentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {[t.platform, t.date].filter(Boolean).join(" • ")}
                    </div>
                    <div className="mt-1 text-sm text-primary">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">“{t.text}”</p>

                {t.instructorReply && (
                  <div className="mt-5 p-4 rounded-xl bg-secondary border border-border">
                    <div className="text-sm text-secondary-foreground mb-1">
                      Reply from {NANDINI.name}
                      {t.instructorReplyDate ? ` • ${t.instructorReplyDate}` : ""}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.instructorReply}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {TESTIMONIALS.length > INITIAL_REVIEWS_COUNT && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllReviews((v) => !v)}
                className="px-8 py-3 rounded-2xl bg-secondary border border-border text-secondary-foreground hover:opacity-90 transition-opacity"
              >
                {showAllReviews ? 'Show less' : 'Show more'}
              </button>
            </div>
          )}

          {/* Ad Banner Section */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 overflow-hidden p-4">
              <AdBanner 
                adSlot="1300164797"
                adFormat="auto"
                responsive={true}
                className="min-h-[250px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Booking */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 scroll-mt-20 sm:scroll-mt-28 section-shell relative overflow-hidden">
        {/* Background Decorative Images */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800)',
            opacity: 0.05,
            top: '0%',
            right: '5%',
            width: '460px',
            height: '460px',
            transform: 'rotate(-20deg)'
          }} />
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800)',
            opacity: 0.06,
            bottom: '-10%',
            left: '-5%',
            width: '520px',
            height: '520px',
            transform: 'rotate(25deg)'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent px-4">
              Book Your Session Now
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">Affordable, flexible, and personalized learning</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12">
            {/* Trial Session Card */}
            <motion.div
              className="relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border overflow-hidden"
              variants={cardStagger}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.26 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold">
                Trial Session
              </div>
              <div className="text-center mb-5 sm:mb-6">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2">$5</div>
                <div className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">25 Minutes</div>
                <p className="text-sm sm:text-base text-muted-foreground">Perfect for getting started</p>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span>One-on-one Zoom or Meet session</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span>Personalized feedback</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span>Flexible scheduling</span>
                </li>
              </ul>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity glow-button text-sm sm:text-base"
              >
                Book Trial Session
              </button>
            </motion.div>

            {/* AI Language Agent Card */}
            <motion.div
              className="relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border overflow-hidden border-2 border-primary/30"
              variants={cardStagger}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.26 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm font-semibold">
                AI Powered
              </div>
              <div className="text-center mb-5 sm:mb-6">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-1 sm:mb-2">$5</div>
                <div className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">AI Language Agent</div>
                <p className="text-sm sm:text-base text-muted-foreground">Intelligent conversation partner</p>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                  <span>24/7 AI conversation practice</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                  <span>Pronunciation feedback</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                  <span>Personalized learning path</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                  <span>Unlimited practice sessions</span>
                </li>
              </ul>
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity glow-button text-sm sm:text-base"
              >
                Get AI Agent Access
              </button>
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4 px-4">💳 Secure payment via PayPal, PhonePe, or Google Pay</p>
            <p className="text-xs sm:text-sm text-muted-foreground px-4">All sessions include Zoom or Meet link and confirmation email</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-8 sm:py-16 md:py-20 px-4 sm:px-6 section-shell bg-gradient-to-b from-background to-primary/5 scroll-mt-20 sm:scroll-mt-28 relative overflow-hidden">
        {/* Background Decorative Images */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800)',
            opacity: 0.05,
            top: '15%',
            left: '5%',
            width: '400px',
            height: '400px',
            transform: 'rotate(-12deg)'
          }} />
          <div className="bg-decorative" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=800)',
            opacity: 0.04,
            bottom: '5%',
            right: '8%',
            width: '450px',
            height: '450px',
            transform: 'rotate(18deg)'
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 font-bold bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent px-4">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">Have questions? We're here to help</p>
          </div>

          <div className="max-w-md mx-auto px-4">
            <motion.a
              href="mailto:lingualive.nandini@gmail.com"
              className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl glass-card tilt-card shine-border flex items-center gap-3 sm:gap-4 group hover:border-primary transition-all"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold mb-1 text-sm sm:text-base">Contact Email</div>
                <div className="text-primary text-sm sm:text-base break-all">lingualive.nandini@gmail.com</div>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 section-shell">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl mb-6">Ready to transform your language skills?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join thousands of students learning live right now</p>
          <motion.button 
            onClick={() => setIsBookingOpen(true)}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl hover:opacity-95 transition-opacity text-lg glow-button"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Your First Session
          </motion.button>
        </div>
      </section>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      {/* Footer */}
      <footer className="bg-foreground text-background/80 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl text-background">LinguaLive</span>
            </div>
            <p className="text-sm text-background/70">Empowering learners worldwide with live language education.</p>
          </div>
          <div>
            <h4 className="text-background mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors">Pricing</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="hover:text-background transition-colors"
                >
                  For Teachers
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-background mb-4">Instructor</h4>
            <ul className="space-y-2 text-sm">
              <li><a href={NANDINI.socialLinks.youtube} target="_blank" rel="noreferrer" className="hover:text-background transition-colors">YouTube</a></li>
              <li><a href={NANDINI.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-background transition-colors">LinkedIn</a></li>
              <li><a href={NANDINI.socialLinks.amazingtalker} target="_blank" rel="noreferrer" className="hover:text-background transition-colors">AmazingTalker</a></li>
              <li><a href={NANDINI.socialLinks.preply} target="_blank" rel="noreferrer" className="hover:text-background transition-colors">Preply</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-background mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-background/70">Help Center (coming soon)</span></li>
              <li><span className="text-background/70">Contact Us (coming soon)</span></li>
              <li><span className="text-background/70">Privacy Policy (coming soon)</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/60">
          © 2025 LinguaLive. All rights reserved.
        </div>
      </footer>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <PremiumPaymentModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        type="aibot"
        onPaymentSuccess={() => {
          alert('AI Agent access unlocked! Go to your dashboard to start chatting.');
          setIsPremiumModalOpen(false);
        }}
      />
      <PremiumPaymentModal
        isOpen={isBookPurchaseOpen}
        onClose={() => setIsBookPurchaseOpen(false)}
        type="book"
        bookLink="https://drive.google.com/file/d/1kHowU5xXkSuUZbYm6-3639cCZ-uAs5L_/view?usp=drive_link"
        onPaymentSuccess={() => {
          alert('Book purchased! Check your email for the download link or access it from your dashboard.');
          setIsBookPurchaseOpen(false);
        }}
      />
      </div>
    </div>
  );
}
