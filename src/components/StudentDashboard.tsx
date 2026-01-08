import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Play, Clock, TrendingUp, Calendar, ChevronRight, ChevronDown, ChevronUp, Award, Target, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NANDINI } from '../data/nandini';
import { useAuth } from '../context/AuthContext';
import type { Course, Enrollment } from '../lib/courses';
import { enrollInCourse, subscribeMyEnrollments, subscribePublishedCourses } from '../lib/courses';
import type { CourseMeeting } from '../lib/courseMeetings';
import { subscribeCourseMeeting } from '../lib/courseMeetings';
import { AILanguageChat } from './AILanguageChat';
import { PremiumPaymentModal } from './PremiumPaymentModal';
import { hasPremiumAccess } from '../lib/userProfile';
import { AdBanner } from './AdBanner';

interface StudentDashboardProps {
  onNavigate: (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'lesson' | 'aibot' | 'bulk'>('bulk');
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseMeetingsByCourseId, setCourseMeetingsByCourseId] = useState<Record<string, CourseMeeting | null>>({});

  const [actionError, setActionError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const [showAllCourses, setShowAllCourses] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const unsubCourses = subscribePublishedCourses(setPublishedCourses);
    return () => unsubCourses();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubEnrollments = subscribeMyEnrollments(user.uid, setEnrollments);
    return () => unsubEnrollments();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    hasPremiumAccess(user.uid).then(setIsPremium).catch(() => setIsPremium(false));
  }, [user]);

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((e) => e.courseId)), [enrollments]);
  const myCourses = useMemo(
    () => publishedCourses.filter((c) => enrolledCourseIds.has(c.id)),
    [publishedCourses, enrolledCourseIds]
  );
  const recommendedCourses = useMemo(
    () => publishedCourses.filter((c) => !enrolledCourseIds.has(c.id)).slice(0, 3),
    [publishedCourses, enrolledCourseIds]
  );

  const primaryCourseId = myCourses[0]?.id ?? null;

  useEffect(() => {
    if (myCourses.length === 0) {
      setCourseMeetingsByCourseId({});
      return;
    }

    const unsubs = myCourses.map((c) =>
      subscribeCourseMeeting(
        c.id,
        (meeting) => {
          setCourseMeetingsByCourseId((prev) => ({ ...prev, [c.id]: meeting }));
        },
        () => {
          setCourseMeetingsByCourseId((prev) => ({ ...prev, [c.id]: null }));
        }
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [myCourses]);

  const primaryZoomUrl = useMemo(() => {
    if (!primaryCourseId) return null;
    const meeting = courseMeetingsByCourseId[primaryCourseId];
    if (!meeting) return null;
    if (meeting.provider !== 'zoom') return null;
    if (meeting.status !== 'active') return null;
    return meeting.joinUrl;
  }, [primaryCourseId, courseMeetingsByCourseId]);

  const enrolledLanguages = useMemo(() => {
    const set = new Set(myCourses.map((c) => c.language).filter(Boolean));
    return Array.from(set);
  }, [myCourses]);

  const uiCourses = myCourses.map((c) => ({
    id: c.id,
    title: c.title,
    progress: 0,
    instructor: NANDINI.name,
    lessons: 0,
    completed: 0,
    thumbnail: 'https://images.unsplash.com/photo-1758797316117-8d133af25f8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZWFjaGVyJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2NzAyNzMzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    language: c.language,
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="student-dashboard" onNavigate={onNavigate} userType="student" />
      
      <motion.main
        className="flex-1 overflow-y-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pt-20 lg:pt-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-slate-900 mb-2">Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!</h1>
            <p className="text-base sm:text-lg text-slate-600">Continue your language learning journey</p>
          </div>

          {actionError ? (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {actionError}
            </div>
          ) : null}

          {/* Active Zoom Banner */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  {primaryZoomUrl ? (
                    <span className="px-2 sm:px-3 py-1 bg-primary-foreground/10 rounded-full text-xs uppercase tracking-wider">Zoom link active</span>
                  ) : (
                    <span className="px-2 sm:px-3 py-1 bg-primary-foreground/10 rounded-full text-xs uppercase tracking-wider">No session right now</span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl mb-1 sm:mb-2">{primaryZoomUrl ? 'Zoom Class' : 'Your next class will appear here'}</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80">
                  {primaryZoomUrl ? `${NANDINI.name} • Join via Zoom` : `Enroll in a course to get your Zoom link`}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (primaryZoomUrl) {
                    window.open(primaryZoomUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                disabled={!primaryZoomUrl}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 group text-sm sm:text-base ${
                  primaryZoomUrl
                    ? 'bg-primary-foreground text-primary hover:opacity-90'
                    : 'bg-primary-foreground/20 text-primary-foreground/70 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                {primaryZoomUrl ? 'Join Zoom' : 'Join Zoom'}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl text-slate-900 font-bold">{myCourses.length}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Active Courses</div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl text-slate-900 font-bold">Active</div>
                  <div className="text-xs sm:text-sm text-slate-600">Learning Status</div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl text-slate-900 font-bold">In Progress</div>
                  <div className="text-xs sm:text-sm text-slate-600">Course Progress</div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl text-slate-900 font-bold">{enrolledLanguages.length}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Languages</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* My Courses */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-xl sm:text-2xl text-slate-900">My Courses</h2>
                  <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-1">
                    Showing enrolled courses
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {uiCourses.length > 0 ? (showAllCourses ? uiCourses : uiCourses.slice(0, 2)).map((course) => (
                    <div
                      key={course.id}
                      className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                        <div className="relative w-full h-40 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            unsplashQuery="teacher education"
                          />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs text-slate-700">
                            {course.language}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg text-slate-900 mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">by {course.instructor}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">
                            <span>{course.completed} / {course.lessons} lessons</span>
                            <span>•</span>
                            <span>{course.progress}% complete</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3 sm:mb-0">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                          {courseMeetingsByCourseId[course.id]?.provider === 'zoom' &&
                          courseMeetingsByCourseId[course.id]?.status === 'active' &&
                          courseMeetingsByCourseId[course.id]?.joinUrl ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = courseMeetingsByCourseId[course.id]?.joinUrl;
                                if (url) window.open(url, '_blank', 'noopener,noreferrer');
                              }}
                              className="flex-1 sm:flex-none sm:self-center px-4 sm:px-5 py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                            >
                              Join Zoom
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onNavigate('pronunciation')}
                              className="flex-1 sm:flex-none sm:self-center px-4 sm:px-5 py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                            >
                              Practice
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 text-slate-700">
                      <div className="text-base sm:text-lg text-slate-900 mb-2">No enrolled courses yet</div>
                      <div className="text-sm text-slate-600 mb-4">Choose a course below to get started.</div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recommendedCourses.map((c) => (
                          <button
                            key={c.id}
                            onClick={async () => {
                              if (!user) return;
                              try {
                                setActionError(null);
                                setEnrollingCourseId(c.id);
                                await enrollInCourse({ courseId: c.id, userId: user.uid });
                              } catch {
                                setActionError('Unable to enroll right now. Please try again.');
                              } finally {
                                setEnrollingCourseId(null);
                              }
                            }}
                            disabled={!user || enrollingCourseId === c.id}
                            className="p-4 rounded-xl sm:rounded-2xl bg-white border border-indigo-200 hover:bg-indigo-50 transition-colors text-left"
                          >
                            <div className="text-sm sm:text-base text-slate-900">{c.title}</div>
                            <div className="text-xs text-slate-600 mt-1">{c.language}</div>
                            <div className="mt-3 text-sm text-indigo-700">{enrollingCourseId === c.id ? 'Enrolling…' : 'Enroll'}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {uiCourses.length > 2 && (
                    <button
                      onClick={() => setShowAllCourses(!showAllCourses)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      {showAllCourses ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show {uiCourses.length - 2} More Courses
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Language Progress */}
              <div>
                <h2 className="text-xl sm:text-2xl text-slate-900 mb-4 sm:mb-6">Language Progress</h2>
                {enrolledLanguages.length === 0 ? (
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 text-slate-700 text-sm sm:text-base">
                    Enroll in a course to start tracking progress.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {enrolledLanguages.slice(0, 3).map((lang) => (
                      <div key={lang} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                        <div className="text-sm sm:text-base text-slate-900 mb-1">{lang}</div>
                        <div className="text-xs sm:text-sm text-slate-600">Progress tracking coming soon</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Upcoming Sessions */}
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <h3 className="text-lg text-slate-900 mb-4">Upcoming Sessions</h3>
                {primaryZoomUrl ? (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-slate-900 mb-1 truncate">Zoom meeting link is active</h4>
                        <p className="text-xs text-slate-600 mb-1">{NANDINI.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          Join with “Join Zoom”
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">No upcoming sessions scheduled yet.</div>
                )}
                <button
                  type="button"
                  disabled
                  className="w-full mt-4 py-2.5 text-slate-500 bg-slate-100 rounded-xl text-sm cursor-not-allowed"
                >
                  View Full Schedule (coming soon)
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <h3 className="text-lg text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => onNavigate('pronunciation')}
                    className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Practice Pronunciation
                  </button>
                </div>
              </div>

              {/* Ad Banner - Instructor Revenue */}
              <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 overflow-hidden">
                <AdBanner 
                  adSlot="1300164797"
                  adFormat="auto"
                  responsive={true}
                  className="min-h-[250px]"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Premium Payment Modal */}
      <PremiumPaymentModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setPaymentType('bulk');
        }}
        onPaymentSuccess={() => {
          if (paymentType === 'aibot') {
            // Handle AI bot unlock
            setIsPremium(true);
          } else {
            // Handle premium access
            setIsPremium(true);
          }
        }}
        type={paymentType === 'aibot' ? 'aibot' : 'lesson'}
      />

      {/* AI Chat Assistant - Premium feature */}
      <AILanguageChat 
        defaultLanguage="Bengali"
        onUpgradeClick={() => {
          setPaymentType('aibot');
          setShowPremiumModal(true);
        }}
      />
    </div>
  );
}
