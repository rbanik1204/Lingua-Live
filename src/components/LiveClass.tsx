import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Hand, MessageSquare, Users, X, Send, MoreVertical, Maximize2, Flag, ShieldAlert, Ban } from 'lucide-react';
import { NANDINI } from '../data/nandini';
import { useAuth } from '../context/AuthContext';
import { JitsiMeet } from './JitsiMeet';
import type { Course, Enrollment } from '../lib/courses';
import { subscribeMyEnrollments, subscribePublishedCourses, subscribeTeacherCourses } from '../lib/courses';
import type { LiveMessage, LiveSession } from '../lib/live';
import { endLiveSession, sendLiveMessage, startLiveSession, subscribeActiveSession, subscribeLiveSessionById, subscribeSessionMessages } from '../lib/live';
import { getJitsiEnvConfig } from '../lib/jitsi';
import { fetchJitsiModeratorJwt } from '../lib/jitsiJwt';
import type { CourseMeeting } from '../lib/courseMeetings';
import { subscribeCourseMeeting } from '../lib/courseMeetings';
import type { LiveBan, LiveParticipant, LiveReport } from '../lib/moderation';
import {
  banFromChat,
  heartbeatLiveParticipant,
  kickParticipant,
  reportLiveMessage,
  resolveReport,
  setHandRaised,
  subscribeBans,
  subscribeMyParticipant,
  subscribeParticipants,
  subscribeReports,
  unbanFromChat,
  upsertLiveParticipant,
} from '../lib/moderation';

interface LiveClassProps {
  onNavigate: (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => void;
  joinSessionId?: string | null;
}

export function LiveClass({ onNavigate, joinSessionId }: LiveClassProps) {
  const { user, role } = useAuth();
  const isInstructor = role === 'teacher' || role === 'admin';
  const jitsiEnv = useMemo(() => getJitsiEnvConfig(), []);
  const [jitsiJwt, setJitsiJwt] = useState<string | null>(null);
  const [jitsiJwtError, setJitsiJwtError] = useState<string | null>(null);
  const [courseMeeting, setCourseMeeting] = useState<CourseMeeting | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');

  const [liveParticipants, setLiveParticipants] = useState<LiveParticipant[]>([]);
  const [bans, setBans] = useState<LiveBan[]>([]);
  const [reports, setReports] = useState<LiveReport[]>([]);
  const [myParticipant, setMyParticipant] = useState<LiveParticipant | null>(null);
  const [chatTab, setChatTab] = useState<'chat' | 'participants' | 'reports'>('chat');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [forcedSessionId, setForcedSessionId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const jitsiApiRef = useRef<null | { executeCommand: (command: string, ...args: unknown[]) => void }>(null);

  useEffect(() => {
    const unsubCourses = subscribePublishedCourses(setPublishedCourses);
    return () => unsubCourses();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubs: Array<() => void> = [];

    if (role === 'teacher' || role === 'admin') {
      unsubs.push(subscribeTeacherCourses(user.uid, setTeacherCourses));
    } else {
      unsubs.push(subscribeMyEnrollments(user.uid, setEnrollments));
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user, role]);

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((e) => e.courseId)), [enrollments]);

  const accessibleCourses = useMemo(() => {
    if (role === 'teacher' || role === 'admin') return teacherCourses;
    return publishedCourses.filter((c) => enrolledCourseIds.has(c.id));
  }, [role, teacherCourses, publishedCourses, enrolledCourseIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Best-effort restore last selected course for instructors.
    try {
      const saved = window.localStorage.getItem('liveClass:selectedCourseId');
      if (saved) setSelectedCourseId(saved);
    } catch {
      // ignore
    }
    // Run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCourseId && accessibleCourses.length > 0) {
      setSelectedCourseId(accessibleCourses[0].id);
    }
    if (selectedCourseId && accessibleCourses.length > 0) {
      const stillAllowed = accessibleCourses.some((c) => c.id === selectedCourseId);
      if (!stillAllowed) setSelectedCourseId(accessibleCourses[0].id);
    }
  }, [accessibleCourses, selectedCourseId]);

  useEffect(() => {
    if (forcedSessionId) return;
    if (!selectedCourseId) {
      setActiveSession(null);
      return;
    }
    const unsub = subscribeActiveSession(selectedCourseId, setActiveSession);
    return () => unsub();
  }, [selectedCourseId, forcedSessionId]);

  useEffect(() => {
    if (!joinSessionId) return;
    setForcedSessionId(joinSessionId);
  }, [joinSessionId]);

  useEffect(() => {
    if (!forcedSessionId) {
      setJoinError(null);
      setActionError(null);
      return;
    }

    const unsub = subscribeLiveSessionById(
      forcedSessionId,
      (session) => {
        setActiveSession(session);
        if (session?.courseId) {
          setSelectedCourseId(session.courseId);
          try {
            window.localStorage.setItem('liveClass:selectedCourseId', session.courseId);
          } catch {
            // ignore
          }
        }
      },
      (err) => {
        const anyErr = err as { code?: unknown; message?: unknown };
        const code = typeof anyErr?.code === 'string' ? anyErr.code : '';

        if (code.includes('permission-denied')) {
          setJoinError('You do not have access to this live class. Please enroll in the course first.');
        } else {
          setJoinError('Unable to open this live class right now.');
        }
      }
    );

    return () => unsub();
  }, [forcedSessionId]);


  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }
    const unsub = subscribeSessionMessages(activeSession.id, setMessages);
    return () => unsub();
  }, [activeSession?.id]);

  useEffect(() => {
    if (!activeSession || !user) {
      setLiveParticipants([]);
      setBans([]);
      setReports([]);
      setMyParticipant(null);
      return;
    }

    const unsubs: Array<() => void> = [];
    unsubs.push(subscribeParticipants(activeSession.id, setLiveParticipants));
    unsubs.push(subscribeMyParticipant({ sessionId: activeSession.id, uid: user.uid }, setMyParticipant));
    if (isInstructor) {
      unsubs.push(subscribeBans(activeSession.id, setBans));
      unsubs.push(subscribeReports(activeSession.id, setReports));
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [activeSession?.id, user?.uid, isInstructor]);

  const myDisplayName = useMemo(() => {
    if (!user) return null;
    return user.displayName || (user.email ? user.email.split('@')[0] : 'User');
  }, [user]);

  const teacherDisplayName = useMemo(() => {
    if (activeSession?.startedByUid && user && activeSession.startedByUid === user.uid) {
      return myDisplayName ?? NANDINI.name;
    }
    return NANDINI.name;
  }, [activeSession?.startedByUid, user, myDisplayName]);

  const isHost = Boolean(activeSession && user && activeSession.startedByUid === user.uid);

  useEffect(() => {
    if (!activeSession || !user) return;
    const name = myDisplayName ?? 'User';

    upsertLiveParticipant({ sessionId: activeSession.id, uid: user.uid, name, role }).catch(() => {
      // ignore
    });

    const interval = window.setInterval(() => {
      heartbeatLiveParticipant({ sessionId: activeSession.id, uid: user.uid }).catch(() => {
        // ignore
      });
    }, 20000);

    return () => window.clearInterval(interval);
  }, [activeSession?.id, user?.uid, myDisplayName, role]);

  useEffect(() => {
    if (!activeSession || !user) return;
    if (!myParticipant?.kicked) return;
    onNavigate(isInstructor ? 'teacher-dashboard' : 'student-dashboard');
  }, [activeSession?.id, user?.uid, myParticipant?.kicked, onNavigate, isInstructor]);

  useEffect(() => {
    if (!activeSession) return;
    if (!user) return;
    if (typeof myParticipant?.handRaised !== 'boolean') return;
    setIsHandRaised(Boolean(myParticipant.handRaised));
  }, [activeSession?.id, user?.uid, myParticipant?.handRaised]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? 'U').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase();
  };

  const palette = [
    'from-pink-500 to-rose-500',
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-violet-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-indigo-500 to-blue-500',
  ] as const;

  const colorFor = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return palette[hash % palette.length];
  };

  type UiParticipant = {
    uid: string;
    name: string;
    roleLabel: 'Teacher' | 'Admin' | 'Student';
    initials: string;
    color: string;
    isTeacher: boolean;
  };

  const participants = useMemo<UiParticipant[]>(() => {
    if (!activeSession) return [];
    return liveParticipants.map((p) => {
      const roleLabel = p.role === 'admin' ? 'Admin' : p.role === 'teacher' ? 'Teacher' : 'Student';
      return {
        uid: p.uid,
        name: p.name,
        roleLabel,
        initials: getInitials(p.name),
        color: colorFor(p.uid),
        isTeacher: p.role === 'teacher' || p.role === 'admin',
      };
    });
  }, [activeSession, liveParticipants]);

  const studentParticipants = useMemo(() => participants.filter((p) => !p.isTeacher), [participants]);
  const bannedUidSet = useMemo(() => new Set(bans.map((b) => b.uid)), [bans]);

  const selectedCourse = accessibleCourses.find((c) => c.id === selectedCourseId) ?? null;

  useEffect(() => {
    if (!selectedCourseId) {
      setCourseMeeting(null);
      return;
    }

    const unsub = subscribeCourseMeeting(
      selectedCourseId,
      (meeting) => {
        setCourseMeeting(meeting);
      },
      () => {
        setCourseMeeting(null);
      }
    );

    return () => unsub();
  }, [selectedCourseId]);

  const activeZoomUrl = useMemo(() => {
    if (!courseMeeting) return null;
    if (courseMeeting.provider !== 'zoom') return null;
    if (courseMeeting.status !== 'active') return null;
    if (!courseMeeting.joinUrl?.trim()) return null;
    return courseMeeting.joinUrl.trim();
  }, [courseMeeting]);

  const canJoin = !!activeSession;
  const canStart = isInstructor && !!selectedCourseId && !activeSession;
  const canEnd = isInstructor && !!activeSession;

  const inviteLink = useMemo(() => {
    if (!activeSession) return null;
    if (typeof window === 'undefined') return null;
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?page=live-class&sessionId=${encodeURIComponent(activeSession.id)}`;
  }, [activeSession]);

  const jitsiRoomName = useMemo(() => {
    if (!activeSession) return null;
    // Stable across devices. Keep it readable but unique.
    return `LinguaLive-${activeSession.id}`;
  }, [activeSession]);

  const jitsiJoinUrl = useMemo(() => {
    if (!activeSession || !jitsiRoomName) return null;
    const normalizedRoomName = jitsiRoomName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
    const prefix = jitsiEnv.roomNamePrefix?.trim();
    const fullRoomName = prefix
      ? `${prefix.replace(/\/+$/g, '')}/${normalizedRoomName.replace(/^\/+/, '')}`
      : normalizedRoomName;
    // encodeURI preserves slashes in tenant-style room names.
    return `https://${jitsiEnv.domain}/${encodeURI(fullRoomName)}`;
  }, [activeSession, jitsiRoomName, jitsiEnv.domain, jitsiEnv.roomNamePrefix]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Only the session owner needs a moderator JWT.
      if (!activeSession || !user || !jitsiRoomName) {
        setJitsiJwt(null);
        setJitsiJwtError(null);
        return;
      }

      // Public meet.jit.si does not accept your custom JWT, and fetching it can cause unnecessary remounts.
      if (jitsiEnv.domain === 'meet.jit.si') {
        setJitsiJwt(null);
        setJitsiJwtError(null);
        return;
      }

      const isSessionOwner = activeSession.startedByUid === user.uid;
      if (!isSessionOwner) {
        setJitsiJwt(null);
        setJitsiJwtError(null);
        return;
      }

      try {
        setJitsiJwtError(null);
        const token = await fetchJitsiModeratorJwt(jitsiRoomName);
        if (cancelled) return;
        setJitsiJwt(token);
      } catch (e) {
        if (cancelled) return;
        setJitsiJwt(null);
        setJitsiJwtError('Unable to verify host permissions for video.');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [activeSession?.id, activeSession?.startedByUid, user?.uid, jitsiRoomName, jitsiEnv.domain]);

  const shouldMountMeeting = useMemo(() => {
    if (!activeSession || !user || joinError || !jitsiRoomName) return false;
    // If we are on a self-hosted domain, host should mount with JWT ready to avoid a double-load.
    if (jitsiEnv.domain !== 'meet.jit.si' && isHost) {
      return Boolean(jitsiJwt);
    }
    return true;
  }, [activeSession, user, joinError, jitsiRoomName, jitsiEnv.domain, isHost, jitsiJwt]);

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      // Minimal feedback without adding new UI components.
      alert('Invite link copied. Share it with your students.');
    } catch {
      // Fallback: show link for manual copy.
      window.prompt('Copy this invite link:', inviteLink);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <Sidebar currentPage="live-class" onNavigate={onNavigate} userType={role === 'teacher' || role === 'admin' ? 'teacher' : 'student'} />
      
      <main className="flex-1 flex flex-col pt-16 lg:pt-0">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {activeSession ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="px-3 py-1 bg-red-500 rounded-full text-xs text-white uppercase tracking-wider">Live</span>
                    <span className="text-white/80 text-sm">Class ID: {activeSession.classId}</span>
                    {isInstructor && inviteLink ? (
                      <button
                        type="button"
                        onClick={copyInviteLink}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10 transition-colors"
                        title="Copy invite link"
                      >
                        Copy Invite Link
                      </button>
                    ) : null}
                  </>
                ) : (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white uppercase tracking-wider">No active session</span>
                )}
              </div>
              <h1 className="text-xl text-white">{selectedCourse?.title ?? 'Live Class'}</h1>
              <p className="text-sm text-white/70">
                {teacherDisplayName}
                {activeSession ? ` • ${participants.length} participant${participants.length === 1 ? '' : 's'}` : ''}
                {isHost ? ' • Host' : ''}
              </p>
              {joinError ? (
                <div className="mt-2 text-sm text-amber-200">{joinError}</div>
              ) : null}
              {actionError ? (
                <div className="mt-2 text-sm text-rose-200">{actionError}</div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCourseId ?? ''}
                onChange={(e) => setSelectedCourseId(e.target.value || null)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={accessibleCourses.length === 0}
              >
                {accessibleCourses.length === 0 ? (
                  <option value="">No courses</option>
                ) : (
                  accessibleCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                )}
              </select>

              {activeZoomUrl ? (
                <button
                  type="button"
                  onClick={() => window.open(activeZoomUrl, '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 rounded-xl text-sm transition-colors bg-white/10 hover:bg-white/20 text-white"
                  title="Open Zoom meeting"
                >
                  Open Zoom
                </button>
              ) : null}

              {canStart && (
                <button
                  onClick={async () => {
                    if (!selectedCourseId || !user) return;
                    try {
                      setActionError(null);
                      setIsStarting(true);
                      try {
                        window.localStorage.setItem('liveClass:selectedCourseId', selectedCourseId);
                      } catch {
                        // ignore
                      }
                      await startLiveSession({ courseId: selectedCourseId, startedByUid: user.uid });
                    } catch (err) {
                      const anyErr = err as { code?: unknown; message?: unknown };
                      const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
                      if (code.includes('permission-denied')) {
                        setActionError('Your account does not have teacher access yet. Please sign out and sign in again.');
                      } else {
                        setActionError('Unable to start live class right now.');
                      }
                    } finally {
                      setIsStarting(false);
                    }
                  }}
                  disabled={isStarting}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    isStarting
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isStarting ? 'Starting…' : 'Start'}
                </button>
              )}

              {canEnd && (
                <button
                  onClick={async () => {
                    if (!activeSession) return;
                    try {
                      setActionError(null);
                      setIsEnding(true);
                      await endLiveSession(activeSession.id);
                    } catch {
                      setActionError('Unable to end live class right now.');
                    } finally {
                      setIsEnding(false);
                    }
                  }}
                  disabled={isEnding}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    isEnding
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isEnding ? 'Ending…' : 'End'}
                </button>
              )}

              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              {activeSession && jitsiJoinUrl ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-sm text-white/80">
                    {jitsiEnv.domain === 'meet.jit.si'
                      ? 'If video asks for login or gets stuck, open it in a new tab.'
                      : 'You can also open video in a new tab.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(jitsiJoinUrl, '_blank', 'noopener,noreferrer')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10 transition-colors"
                  >
                    Open Video in New Tab
                  </button>
                </div>
              ) : null}

              {/* Main Teacher Video */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 group">
                {shouldMountMeeting ? (
                  <JitsiMeet
                    domain={jitsiEnv.domain}
                    roomNamePrefix={jitsiEnv.roomNamePrefix}
                    roomName={jitsiRoomName ?? 'lingualive'}
                    displayName={myDisplayName ?? 'User'}
                    email={user?.email ?? undefined}
                    jwt={jitsiEnv.domain !== 'meet.jit.si' && isHost ? jitsiJwt ?? undefined : undefined}
                    startWithAudioMuted={isMuted}
                    startWithVideoMuted={isVideoOff}
                    onApiReady={(api) => {
                      jitsiApiRef.current = api;
                    }}
                    onAudioMuteChanged={(muted) => setIsMuted(muted)}
                    onVideoMuteChanged={(muted) => setIsVideoOff(muted)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/15 mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                        {getInitials(teacherDisplayName)}
                      </div>
                      <div className="text-white text-lg">{teacherDisplayName}</div>
                      <div className="text-white/70 text-sm">
                        {joinError
                          ? joinError
                          : jitsiJwtError
                            ? jitsiJwtError
                          : activeSession
                            ? 'Preparing video…'
                            : 'No active session for this course'}
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Teacher Name Badge */}
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-3 pointer-events-none">
                  {activeSession ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> : <div className="w-2 h-2 bg-white/40 rounded-full"></div>}
                  <div>
                    <div className="text-white text-sm">{teacherDisplayName}</div>
                    <div className="text-white/70 text-xs">{isHost ? 'Host' : 'Instructor'}</div>
                  </div>
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  disabled
                  title="Fullscreen is not enabled yet"
                  className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm rounded-lg text-white/60 opacity-0 group-hover:opacity-100 transition-all cursor-not-allowed"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Participant Tiles */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants{activeSession ? ` (${participants.length})` : ''}
                  </h3>
                </div>

                {!activeSession ? (
                  <div className="text-sm text-white/60">No active session. Start a session to see participants.</div>
                ) : studentParticipants.length === 0 ? (
                  <div className="text-sm text-white/60">No students have joined yet.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {studentParticipants
                      .slice(0, 18)
                      .map((participant) => (
                        <div key={participant.uid} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-800 hover:ring-2 hover:ring-indigo-500 transition-all">
                          <div className={`w-full h-full bg-gradient-to-br ${participant.color} flex items-center justify-center`}>
                            <span className="text-3xl text-white">{participant.initials}</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                              <div className="text-white text-xs truncate">{participant.name}</div>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="w-80 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Live
                  </h3>
                  {isInstructor && activeSession ? (
                    <div className="ml-1 flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setChatTab('chat')}
                        className={`px-2 py-1 rounded-lg text-xs ${chatTab === 'chat' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatTab('participants')}
                        className={`px-2 py-1 rounded-lg text-xs ${chatTab === 'participants' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
                      >
                        People
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatTab('reports')}
                        className={`px-2 py-1 rounded-lg text-xs ${chatTab === 'reports' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
                      >
                        Reports
                      </button>
                    </div>
                  ) : null}
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!activeSession ? (
                  <div className="text-sm text-white/60">Start or join a live class to use live features.</div>
                ) : !isInstructor || chatTab === 'chat' ? (
                  messages.length === 0 ? (
                    <div className="text-sm text-white/60">No messages yet.</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl ${
                          msg.senderRole === 'teacher' || msg.senderRole === 'admin'
                            ? 'bg-indigo-600/20 border border-indigo-500/30'
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div
                            className={`text-xs px-2 py-0.5 rounded ${
                              msg.senderRole === 'teacher' || msg.senderRole === 'admin'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white/10 text-white/70'
                            }`}
                          >
                            {msg.senderRole === 'admin' ? 'Admin' : msg.senderRole === 'teacher' ? 'Teacher' : 'Student'}
                          </div>
                          {!isInstructor && msg.senderUid !== user?.uid ? (
                            <button
                              type="button"
                              onClick={() => {
                                setReportingMessageId(msg.id);
                                setReportReason('');
                              }}
                              className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                              title="Report message"
                            >
                              <Flag className="w-3 h-3" />
                              Report
                            </button>
                          ) : null}
                        </div>
                        <div className="text-sm text-white/90 mb-1">{msg.senderName}</div>
                        <div className="text-sm text-white whitespace-pre-wrap">{msg.text}</div>

                        {reportingMessageId === msg.id && user && myDisplayName ? (
                          <div className="mt-3 p-3 rounded-xl bg-black/25 border border-white/10">
                            <div className="text-xs text-white/80 mb-2">Report reason</div>
                            <input
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              placeholder="e.g. spam / abusive language"
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!activeSession || !user || !myDisplayName) return;
                                  if (!reportReason.trim()) return;
                                  await reportLiveMessage({
                                    sessionId: activeSession.id,
                                    messageId: msg.id,
                                    messageText: msg.text,
                                    reportedUserId: msg.senderUid,
                                    reportedUserName: msg.senderName,
                                    reportedByUid: user.uid,
                                    reportedByName: myDisplayName,
                                    reason: reportReason,
                                  });
                                  setReportingMessageId(null);
                                  setReportReason('');
                                }}
                                disabled={!reportReason.trim()}
                                className={`px-3 py-2 rounded-lg text-sm ${
                                  !reportReason.trim()
                                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                Submit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReportingMessageId(null);
                                  setReportReason('');
                                }}
                                className="px-3 py-2 rounded-lg text-sm bg-white/10 text-white hover:bg-white/15"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )
                ) : chatTab === 'participants' ? (
                  <>
                    <div className="text-xs text-white/60">Room participants</div>
                    {liveParticipants.length === 0 ? (
                      <div className="text-sm text-white/60">No participants yet.</div>
                    ) : (
                      liveParticipants.map((p) => {
                        const isBanned = bannedUidSet.has(p.uid);
                        const isSelf = user?.uid === p.uid;
                        const isTargetInstructor = p.role === 'teacher' || p.role === 'admin';
                        return (
                          <div key={p.uid} className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm text-white truncate">{p.name}</div>
                                <div className="text-xs text-white/60">
                                  {p.role === 'admin' ? 'Admin' : p.role === 'teacher' ? 'Teacher' : 'Student'}
                                  {p.kicked ? ' • Kicked' : ''}
                                  {isBanned ? ' • Chat banned' : ''}
                                  {p.handRaised ? ' • Hand raised' : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!activeSession) return;
                                    await kickParticipant({ sessionId: activeSession.id, uid: p.uid, kicked: !p.kicked });
                                  }}
                                  disabled={isSelf || isTargetInstructor}
                                  className={`px-2 py-2 rounded-lg text-xs flex items-center gap-1 ${
                                    isSelf || isTargetInstructor
                                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                      : 'bg-white/10 text-white hover:bg-white/15'
                                  }`}
                                  title={p.kicked ? 'Allow back' : 'Kick from room'}
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                  {p.kicked ? 'Unkick' : 'Kick'}
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!activeSession || !user) return;
                                    if (isBanned) {
                                      await unbanFromChat({ sessionId: activeSession.id, uid: p.uid });
                                    } else {
                                      await banFromChat({ sessionId: activeSession.id, uid: p.uid, bannedByUid: user.uid, reason: 'Banned by instructor' });
                                    }
                                  }}
                                  disabled={isSelf || isTargetInstructor}
                                  className={`px-2 py-2 rounded-lg text-xs flex items-center gap-1 ${
                                    isSelf || isTargetInstructor
                                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                      : isBanned
                                        ? 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/25'
                                        : 'bg-white/10 text-white hover:bg-white/15'
                                  }`}
                                  title={isBanned ? 'Remove chat ban' : 'Ban from chat'}
                                >
                                  <Ban className="w-4 h-4" />
                                  {isBanned ? 'Unban' : 'Ban'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-xs text-white/60">Reported messages</div>
                    {reports.length === 0 ? (
                      <div className="text-sm text-white/60">No reports.</div>
                    ) : (
                      reports
                        .filter((r) => r.status === 'open')
                        .slice(0, 30)
                        .map((r) => (
                          <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm text-white truncate">{r.reportedUserName}</div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!activeSession || !user) return;
                                  await resolveReport({ sessionId: activeSession.id, reportId: r.id, resolvedByUid: user.uid });
                                }}
                                className="px-2 py-2 rounded-lg text-xs bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25 flex items-center gap-1"
                              >
                                Resolve
                              </button>
                            </div>
                            <div className="text-xs text-white/70 mt-1">Reason: {r.reason}</div>
                            <div className="mt-2 text-xs text-white/80 whitespace-pre-wrap">{r.messageText}</div>
                            <div className="mt-2 text-[11px] text-white/50">Reported by {r.reportedByName}</div>
                          </div>
                        ))
                    )}
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!activeSession || !user || (myParticipant?.kicked ?? false)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    disabled={!activeSession || !user || (myParticipant?.kicked ?? false)}
                    onClick={async () => {
                      if (!activeSession || !user) return;
                      if (myParticipant?.kicked) return;
                      if (!chatMessage.trim()) return;
                      const senderName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
                      await sendLiveMessage({
                        sessionId: activeSession.id,
                        senderUid: user.uid,
                        senderName,
                        senderRole: role,
                        text: chatMessage,
                      });
                      setChatMessage('');
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      !activeSession || !user || (myParticipant?.kicked ?? false)
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {myParticipant?.kicked ? (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-100 text-sm">
                    You were removed from the room by the instructor.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">{selectedCourse?.title ?? 'Live Class'}</span>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (activeSession && jitsiApiRef.current) {
                    try {
                      jitsiApiRef.current.executeCommand('toggleAudio');
                      return;
                    } catch {
                      // fall through
                    }
                  }
                  setIsMuted((v) => !v);
                }}
                className={`p-4 rounded-xl transition-all ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  if (activeSession && jitsiApiRef.current) {
                    try {
                      jitsiApiRef.current.executeCommand('toggleVideo');
                      return;
                    } catch {
                      // fall through
                    }
                  }
                  setIsVideoOff((v) => !v);
                }}
                className={`p-4 rounded-xl transition-all ${
                  isVideoOff 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={async () => {
                  const next = !isHandRaised;
                  setIsHandRaised(next);
                  if (!activeSession || !user) return;
                  try {
                    await setHandRaised({ sessionId: activeSession.id, uid: user.uid, raised: next });
                  } catch {
                    // ignore
                  }
                }}
                className={`p-4 rounded-xl transition-all ${
                  isHandRaised 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                disabled={!activeSession || !user}
              >
                <Hand className="w-5 h-5" />
              </button>

              {!showChat && (
                <button
                  onClick={() => setShowChat(true)}
                  className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Show Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              )}

              <div className="w-px h-8 bg-white/20 mx-2"></div>

              <button
                onClick={() => {
                  if (jitsiApiRef.current) {
                    try {
                      jitsiApiRef.current.executeCommand('hangup');
                    } catch {
                      // ignore
                    }
                  }
                  onNavigate(isInstructor ? 'teacher-dashboard' : 'student-dashboard');
                }}
                className="px-6 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2"
                title="Leave Class"
              >
                <PhoneOff className="w-5 h-5" />
                <span>{canJoin ? 'Leave' : 'Back'}</span>
              </button>
            </div>

            <div className="w-20"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
