import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Video, Users, TrendingUp, Calendar, Clock, BarChart3, Play, Plus, ClipboardList, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../context/AuthContext';
import type { Course, CourseLanguage, Enrollment } from '../lib/courses';
import { createCourse, updateCourse, deleteCourse, subscribeEnrollmentsForCourses, subscribeTeacherCourses } from '../lib/courses';
import type { CourseMeeting } from '../lib/courseMeetings';
import { endCourseMeeting, startZoomMeeting, subscribeCourseMeeting } from '../lib/courseMeetings';
import { updateMyZoomLink } from '../lib/userProfile';
import { NANDINI } from '../data/nandini';
import { PaymentAdmin } from './PaymentAdmin';
import { TeacherAvailability } from './TeacherAvailability';
import type { ScheduledClass } from '../lib/scheduledClasses';
import { createScheduledClass, updateScheduledClass, deleteScheduledClass, subscribeTeacherScheduledClasses, getThisWeekClasses } from '../lib/scheduledClasses';

interface TeacherDashboardProps {
  onNavigate: (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [creating, setCreating] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseLanguage, setNewCourseLanguage] = useState<CourseLanguage>('Bengali');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseStartDate, setNewCourseStartDate] = useState('');
  const [newCourseStartTime, setNewCourseStartTime] = useState('');
  const [newCourseDuration, setNewCourseDuration] = useState('60');
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  const [zoomCourseId, setZoomCourseId] = useState<string | null>(null);
  const [zoomMeeting, setZoomMeeting] = useState<CourseMeeting | null>(null);
  const [zoomWorking, setZoomWorking] = useState(false);

  // Scheduled Classes state
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassStudentName, setNewClassStudentName] = useState('');
  const [newClassStudentEmail, setNewClassStudentEmail] = useState('');
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassTime, setNewClassTime] = useState('');
  const [newClassDuration, setNewClassDuration] = useState('60');
  const [newClassTopic, setNewClassTopic] = useState('');
  const [newClassNotes, setNewClassNotes] = useState('');
  const [addingClass, setAddingClass] = useState(false);

  const publishAndOpenZoom = async (courseId: string) => {
    if (!user) return;
    
    // Always use permanent Zoom link
    const joinUrl = NANDINI.permanentZoomMeeting.joinUrl;
    
    await startZoomMeeting({ courseId, createdByUid: user.uid });
    
    window.open(joinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddScheduledClass = async () => {
    if (!user || !newClassStudentName || !newClassDate || !newClassTime) {
      setActionError('Please fill in all required fields');
      return;
    }

    try {
      setAddingClass(true);
      setActionError(null);
      await createScheduledClass({
        teacherId: user.uid,
        studentName: newClassStudentName,
        studentEmail: newClassStudentEmail,
        date: newClassDate,
        time: newClassTime,
        duration: parseInt(newCourseDuration) || 60,
        topic: newClassTopic,
        notes: newClassNotes,
      });
      
      // Reset form
      setNewClassStudentName('');
      setNewClassStudentEmail('');
      setNewClassDate('');
      setNewClassTime('');
      setNewClassDuration('60');
      setNewClassTopic('');
      setNewClassNotes('');
      setShowAddClass(false);
    } catch (error) {
      console.error('Error adding scheduled class:', error);
      setActionError('Failed to add scheduled class. Please try again.');
    } finally {
      setAddingClass(false);
    }
  };

  const handleMarkClassComplete = async (classId: string) => {
    try {
      await updateScheduledClass(classId, { status: 'completed' });
    } catch (error) {
      console.error('Error marking class complete:', error);
      setActionError('Failed to update class status.');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled class?')) return;
    
    try {
      await deleteScheduledClass(classId);
    } catch (error) {
      console.error('Error deleting class:', error);
      setActionError('Failed to delete class.');
    }
  };

  const thisWeekClasses = useMemo(() => getThisWeekClasses(scheduledClasses), [scheduledClasses]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeTeacherCourses(user.uid, setCourses);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeTeacherScheduledClasses(user.uid, setScheduledClasses);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const courseIds = courses.map((c) => c.id);
    const unsub = subscribeEnrollmentsForCourses(courseIds, setEnrollments);
    return () => unsub();
  }, [courses]);

  useEffect(() => {
    if (!zoomCourseId && courses.length > 0) {
      setZoomCourseId(courses[0].id);
    }
    if (zoomCourseId && courses.length > 0) {
      const ok = courses.some((c) => c.id === zoomCourseId);
      if (!ok) setZoomCourseId(courses[0].id);
    }
  }, [courses, zoomCourseId]);

  useEffect(() => {
    if (!zoomCourseId) {
      setZoomMeeting(null);
      return;
    }
    const unsub = subscribeCourseMeeting(
      zoomCourseId,
      (meeting) => {
        setZoomMeeting(meeting);
      },
      () => {
        setZoomMeeting(null);
      }
    );
    return () => unsub();
  }, [zoomCourseId]);

  const uiCourses = useMemo(
    () =>
      courses.map((course) => {
        const students = enrollments.filter((e) => e.courseId === course.id).length;
        return {
        id: course.id,
        title: course.title,
        students,
        rating: '—',
        revenue: '—',
        thumbnail:
          'https://images.unsplash.com/photo-1758797316117-8d133af25f8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZWFjaGVyJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2NzAyNzMzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
        language: course.language,
        };
      }),
    [courses, enrollments]
  );

  const totalUniqueStudents = useMemo(() => {
    const set = new Set(enrollments.map((e) => e.userId));
    return set.size;
  }, [enrollments]);

  const activeCourseCount = courses.length;

  const upcomingClasses = useMemo(
    () =>
      [] as Array<{
        id: string;
        title: string;
        time: string;
        students: number;
        language: string;
      }>,
    []
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="teacher-dashboard" onNavigate={onNavigate} userType="teacher" />
      
      <motion.main
        className="flex-1 overflow-y-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-slate-900 mb-2">Instructor Dashboard</h1>
              <p className="text-lg text-slate-600">Manage your classes and students</p>
              {actionError ? <div className="mt-2 text-sm text-red-600">{actionError}</div> : null}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('pronunciation')}
                className="px-8 py-4 rounded-2xl transition-all flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 hover:shadow-xl"
                title="Open pronunciation library"
              >
                <ClipboardList className="w-5 h-5" />
                Pronunciation Library
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  if (!user || !zoomCourseId) return;

                  void (async () => {
                    try {
                      setZoomWorking(true);
                      await publishAndOpenZoom(zoomCourseId);
                    } catch {
                      setActionError('Unable to start Zoom meeting right now. Please try again.');
                    } finally {
                      setZoomWorking(false);
                    }
                  })();
                }}
                disabled={!user || !zoomCourseId || zoomWorking}
                className={`px-8 py-4 rounded-2xl transition-all flex items-center gap-2 group ${
                  !user || !zoomCourseId || zoomWorking
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-white border border-indigo-200 text-indigo-700 hover:shadow-xl'
                }`}
                title="Create and open a new Zoom meeting"
              >
                <Video className="w-5 h-5" />
                {zoomWorking ? 'Starting Zoom…' : 'Start Zoom Meeting'}
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => onNavigate('pronunciation')}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-opacity flex items-center gap-2 group"
              >
                <Play className="w-5 h-5" />
                Open Practice
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl text-slate-900">{totalUniqueStudents}</div>
                  <div className="text-sm text-slate-600">Total Students</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl text-slate-900">—</div>
                  <div className="text-sm text-slate-600">Monthly Revenue</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl text-slate-900">{activeCourseCount}</div>
                  <div className="text-sm text-slate-600">Active Courses</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl text-slate-900">—</div>
                  <div className="text-sm text-slate-600">Avg. Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* Instant Zoom Meeting */}
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl text-slate-900">Instant Zoom Meeting</h2>
                    <div className="text-sm text-slate-600">Paste your Zoom Personal Meeting link once, then Start</div>
                  </div>
                  <select
                    value={zoomCourseId ?? ''}
                    onChange={(e) => setZoomCourseId(e.target.value || null)}
                    disabled={!courses.length}
                    className="px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {courses.length === 0 ? <option value="">No courses</option> : null}
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="bg-white/70 border border-indigo-200 rounded-2xl p-4">
                    <div className="text-sm text-slate-600 mb-2">🔗 Permanent Zoom Meeting</div>
                    <div className="text-indigo-700 font-medium break-all">{NANDINI.permanentZoomMeeting.joinUrl}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      Meeting ID: {NANDINI.permanentZoomMeeting.meetingId} | Passcode: {NANDINI.permanentZoomMeeting.passcode}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setActionError(null);
                      if (!user || !zoomCourseId) return;
                      try {
                        setZoomWorking(true);
                        await publishAndOpenZoom(zoomCourseId);
                      } catch {
                        setActionError('Unable to start Zoom meeting. Please try again.');
                      } finally {
                        setZoomWorking(false);
                      }
                    }}
                    disabled={!user || !zoomCourseId || zoomWorking}
                    className={`w-full px-4 py-3 rounded-2xl transition-all ${
                      !user || !zoomCourseId || zoomWorking
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                    }`}
                  >
                    {zoomWorking ? 'Starting…' : zoomMeeting?.status === 'active' ? 'Update & Open Zoom' : 'Start & Open Zoom'}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-700">
                    Status:{' '}
                    <span className={zoomMeeting?.status === 'active' ? 'text-emerald-700' : 'text-slate-600'}>
                      {zoomMeeting?.status === 'active' ? 'Active' : 'Not active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {zoomMeeting?.status === 'active' && zoomMeeting.joinUrl ? (
                      <a
                        href={zoomMeeting.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm"
                      >
                        Open
                      </a>
                    ) : null}

                    <button
                      onClick={async () => {
                        setActionError(null);
                        if (!zoomCourseId) return;
                        try {
                          setZoomWorking(true);
                          await endCourseMeeting({ courseId: zoomCourseId });
                        } catch {
                          setActionError('Unable to end Zoom link right now.');
                        } finally {
                          setZoomWorking(false);
                        }
                      }}
                      disabled={!zoomCourseId || zoomWorking || zoomMeeting?.status !== 'active'}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        !zoomCourseId || zoomWorking || zoomMeeting?.status !== 'active'
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      End
                    </button>
                  </div>
                </div>
              </div>

              {/* Teacher Availability Management */}
              <div>
                <TeacherAvailability />
              </div>

              {/* Payment Verifications */}
              <div>
                <h2 className="text-2xl text-slate-900">Payment Verifications</h2>
                <div className="mt-1 text-sm text-slate-600">Review and approve student payment proofs</div>
                
                <div className="mt-4">
                  <PaymentAdmin />
                </div>
              </div>

              {/* Upcoming Classes */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-slate-900">Upcoming Classes</h2>
                  <button
                    type="button"
                    disabled
                    title="Scheduling is not enabled yet"
                    className="px-4 py-2 bg-slate-200 text-slate-500 rounded-xl cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule New
                  </button>
                </div>

                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {cls.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {cls.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {cls.students} students
                            </div>
                            <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs">
                              {cls.language}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = (profile?.zoomLink || '').trim();
                            if (!url) return;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          disabled={!profile?.zoomLink}
                          title={profile?.zoomLink ? 'Open Zoom meeting link' : 'Add your Zoom link in Instant Zoom Meeting first'}
                          className={`px-6 py-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                            profile?.zoomLink
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Open Zoom
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Courses */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-slate-900">My Courses</h2>
                  <button type="button" disabled title="Course management view is not enabled yet" className="text-slate-400 text-sm cursor-not-allowed">
                    Manage All
                  </button>
                </div>

                <div className="mb-5 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                  <div className="text-lg text-slate-900 mb-3">
                    {isEditing ? `Edit Course: ${editingCourse?.title}` : 'Create a new course'}
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      value={isEditing ? (editingCourse?.title || '') : newCourseTitle}
                      onChange={(e) => {
                        if (isEditing && editingCourse) {
                          setEditingCourse({ ...editingCourse, title: e.target.value });
                        } else {
                          setNewCourseTitle(e.target.value);
                        }
                      }}
                      placeholder="Course title"
                      className="px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />

                    <select
                      value={isEditing ? (editingCourse?.language || 'Bengali') : newCourseLanguage}
                      onChange={(e) => {
                        const lang = e.target.value as CourseLanguage;
                        if (isEditing && editingCourse) {
                          setEditingCourse({ ...editingCourse, language: lang });
                        } else {
                          setNewCourseLanguage(lang);
                        }
                      }}
                      className="px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="Bengali">Bengali</option>
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>

                    <button
                      disabled={!user || creating || (isEditing ? !editingCourse?.title.trim() : !newCourseTitle.trim())}
                      onClick={async () => {
                        if (!user) return;
                        setActionError(null);
                        try {
                          setCreating(true);
                          if (isEditing && editingCourse) {
                            // Update existing course
                            await updateCourse(editingCourse.id, {
                              title: editingCourse.title,
                              description: editingCourse.description,
                              language: editingCourse.language,
                              startDate: editingCourse.startDate,
                              startTime: editingCourse.startTime,
                              duration: editingCourse.duration,
                            });
                            setIsEditing(false);
                            setEditingCourse(null);
                          } else {
                            // Create new course
                            await createCourse({
                              createdByUid: user.uid,
                              title: newCourseTitle,
                              description: newCourseDescription,
                              language: newCourseLanguage,
                              isPublished: true,
                              startDate: newCourseStartDate || undefined,
                              startTime: newCourseStartTime || undefined,
                              duration: newCourseDuration ? parseInt(newCourseDuration) : undefined,
                            });
                            setNewCourseTitle('');
                            setNewCourseDescription('');
                            setNewCourseStartDate('');
                            setNewCourseStartTime('');
                            setNewCourseDuration('60');
                          }
                        } catch {
                          setActionError(isEditing ? 'Unable to update course. Please try again.' : 'Unable to create course. Please try again.');
                        } finally {
                          setCreating(false);
                        }
                      }}
                      className={`px-4 py-3 rounded-2xl transition-all ${
                        !user || creating || (isEditing ? !editingCourse?.title.trim() : !newCourseTitle.trim())
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                      }`}
                    >
                      {creating ? (isEditing ? 'Updating…' : 'Creating…') : (isEditing ? 'Update' : 'Create')}
                    </button>
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingCourse(null);
                      }}
                      className="mt-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                      Cancel editing
                    </button>
                  )}

                  <textarea
                    value={isEditing ? (editingCourse?.description || '') : newCourseDescription}
                    onChange={(e) => {
                      if (isEditing && editingCourse) {
                        setEditingCourse({ ...editingCourse, description: e.target.value });
                      } else {
                        setNewCourseDescription(e.target.value);
                      }
                    }}
                    placeholder="Short description (optional)"
                    className="mt-3 w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    rows={3}
                  />

                  <div className="mt-3 grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Start Date (optional)</label>
                      <input
                        type="date"
                        value={isEditing ? (editingCourse?.startDate || '') : newCourseStartDate}
                        onChange={(e) => {
                          if (isEditing && editingCourse) {
                            setEditingCourse({ ...editingCourse, startDate: e.target.value });
                          } else {
                            setNewCourseStartDate(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Start Time (optional)</label>
                      <input
                        type="time"
                        value={isEditing ? (editingCourse?.startTime || '') : newCourseStartTime}
                        onChange={(e) => {
                          if (isEditing && editingCourse) {
                            setEditingCourse({ ...editingCourse, startTime: e.target.value });
                          } else {
                            setNewCourseStartTime(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        value={isEditing ? (editingCourse?.duration || 60) : newCourseDuration}
                        onChange={(e) => {
                          if (isEditing && editingCourse) {
                            setEditingCourse({ ...editingCourse, duration: parseInt(e.target.value) || 60 });
                          } else {
                            setNewCourseDuration(e.target.value);
                          }
                        }}
                        min="15"
                        max="300"
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {uiCourses.map((course) => (
                    <div
                      key={course.id}
                      className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-200">
                        <ImageWithFallback
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          unsplashQuery="teacher education"
                        />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs text-slate-700">
                          {course.language}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-center mb-3">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <div className="text-lg text-slate-900">{course.students}</div>
                            <div className="text-xs text-slate-600">Students</div>
                          </div>
                          <div className="p-2 bg-amber-50 rounded-lg">
                            <div className="text-lg text-slate-900">⭐ {course.rating}</div>
                            <div className="text-xs text-slate-600">Rating</div>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <div className="text-lg text-slate-900">{course.revenue}</div>
                            <div className="text-xs text-slate-600">Revenue</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const fullCourse = courses.find(c => c.id === course.id);
                              if (fullCourse) {
                                setEditingCourse(fullCourse);
                                setIsEditing(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="flex-1 px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Are you sure you want to delete "${course.title}"? This cannot be undone.`)) return;
                              try {
                                await deleteCourse(course.id);
                              } catch {
                                alert('Failed to delete course. Please try again.');
                              }
                            }}
                            className="flex-1 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {uiCourses.length === 0 && (
                  <div className="mt-4 text-sm text-slate-600">
                    No courses yet — create your first course above.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                <h3 className="text-lg mb-4">This Month</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">Active Courses</span>
                    <span className="text-2xl">{activeCourseCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">Total Students</span>
                    <span className="text-2xl">{totalUniqueStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-100">Revenue</span>
                    <span className="text-2xl">—</span>
                  </div>
                </div>
              </div>

              {/* Scheduled Classes This Week */}
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-slate-900">This Week's Classes</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <button
                      onClick={() => setShowAddClass(!showAddClass)}
                      className="ml-2 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                      title="Add scheduled class"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showAddClass && (
                  <div className="mb-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Add New Class</h4>
                    <input
                      type="text"
                      placeholder="Student Name*"
                      value={newClassStudentName}
                      onChange={(e) => setNewClassStudentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Student Email"
                      value={newClassStudentEmail}
                      onChange={(e) => setNewClassStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={newClassDate}
                        onChange={(e) => setNewClassDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                      />
                      <input
                        type="time"
                        value={newClassTime}
                        onChange={(e) => setNewClassTime(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Topic (optional)"
                      value={newClassTopic}
                      onChange={(e) => setNewClassTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddScheduledClass}
                        disabled={addingClass || !newClassStudentName || !newClassDate || !newClassTime}
                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {addingClass ? 'Adding...' : 'Add Class'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddClass(false);
                          setNewClassStudentName('');
                          setNewClassStudentEmail('');
                          setNewClassDate('');
                          setNewClassTime('');
                          setNewClassTopic('');
                          setNewClassNotes('');
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {thisWeekClasses.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center">
                      <p className="text-sm text-slate-600">No classes scheduled this week</p>
                      <button
                        onClick={() => setShowAddClass(true)}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Add your first class
                      </button>
                    </div>
                  ) : (
                    thisWeekClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className={`p-3 rounded-xl border transition-all ${
                          cls.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-indigo-50 border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {cls.studentName}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {new Date(cls.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })} at {cls.time}
                            </div>
                            {cls.topic && (
                              <div className="text-xs text-slate-500 mt-1 truncate">
                                {cls.topic}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {cls.status === 'scheduled' && (
                              <button
                                onClick={() => handleMarkClassComplete(cls.id)}
                                className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete class"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
