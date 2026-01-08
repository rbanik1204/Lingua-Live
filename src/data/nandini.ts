export const NANDINI = {
  name: "Nandini Ghosh",
  email: "nandini.nandini01@gmail.com",
  location: "Kolkata, India",
  phone: "+91 9804021841",
  specialization: "Online Bengali & English Instructor",
  languages: ["Bengali", "English", "Hindi", "French", "Japanese"] as const,
  rating: 5.0,
  totalStudents: 2847,
  classesTaught: 496,
  experience: "10+ years teaching Bengali & English online",
  bio: "Hello! My name is Nandini. I hold a Master's degree in English. I graduated from Hope City College (California) with a 120-hour TEFL certificate. I also have a Professional Teaching Certificate from Arizona State University. I have taught in 4 international schools and completed 8,000+ online lessons, teaching students from Japan, USA, UK, France, and other countries.",
  // Place the instructor image at: public/assets/images/instructor.jpg
  // (or update this path if you use a different filename)
  photoUrl: "/assets/images/instructor.jpg",
  avatarUrl:
    "https://ui-avatars.com/api/?name=Nandini+Ghosh&background=6366f1&color=fff&size=128",
  credibilityHighlights: [
    "10+ years of online teaching experience",
    "Master's degree in English",
    "120-hour TEFL certified (Hope City College, California)",
    "Professional Teaching Certificate (Arizona State University)",
    "Teaching experience in 4 international schools",
    "8,000+ online lessons completed",
    "Taught students from Japan, USA, UK, France, and more",
    "Taught on NativeCamp, Preply, AmazingTalker, Varsity Tutors, LiveXP",
    "AI language data contributor (RWS, OneForma, Outlier)",
  ] as const,
  socialLinks: {
    youtube: "https://www.youtube.com/@nandinighosh8086/about",
    linkedin: "https://www.linkedin.com/in/nandini-ghosh-6921a023b/",
    amazingtalker: "https://en.amazingtalker.com/dashboard/teacher?level=general",
    preply: "https://preply.in/NANDINI7EN8454526",
  },
  permanentZoomMeeting: {
    joinUrl: "https://us04web.zoom.us/j/79411494765?pwd=po1OqHkSh95ae49ZFSTK1sBrtXaufj.1",
    meetingId: "794 1149 4765",
    passcode: "5rPy71",
    topic: "Nandini Ghosh's Zoom Meeting",
    scheduledTime: "Every month on the 1st, 10:00 PM India Time",
    iCalUrl: "https://us04web.zoom.us/meeting/up0pduispz8tHNFkh2NNyGhVQ22OLegHlIst/ics?icsToken=DPjk_Igk5UFU32Jq2gAALAAAAJs-9yz5KOzsrNrt7Ek_433k15foPNOEqF-7it2ebGQt5c28ermmXefsB46AinLYXVuOBo3DB_AlJx3W8jAwMDAwMQ&meetingMasterEventId=BhFJBMhaQBOEDefL5pOsqA",
  },
} as const;
