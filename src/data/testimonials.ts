export type Testimonial = {
  id: string;
  studentName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  platform?: string;
  date?: string;
  text: string;
  instructorReply?: string;
  instructorReplyDate?: string;
  avatarUrl?: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "preply-arpita-1",
    studentName: "Arpita",
    rating: 5,
    platform: "Preply",
    date: "June 26, 2023",
    text: "My son is enjoying his Bengali lessons and writing with Nandini.",
    instructorReply: "Thank you so much for taking the time to give me an encouraging review.",
    avatarUrl: "/assets/images/reviews/Arpita.jpg",
  },
  {
    id: "preply-anonymous-2023-04-08",
    studentName: "Bimal",
    rating: 5,
    platform: "Preply",
    date: "April 8, 2023",
    text: "I am very grateful to Nandini for teaching me Bengali. Her simplified manner of teaching tailored to my needs has helped me pick up a great pace within few lectures in a language I have never spoken before. In addition to this she is very humble, flexible and extremely helpful to work around times. I could only wish I found her earlier as my Bengali teacher.",
    instructorReply: "Thank you so much for taking the time to give me an encouraging review.😀❗",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Bimal&background=6366f1&color=fff&size=128",
  },
  {
    id: "preply-anonymous-2023-01-05",
    studentName: "Amandeep",
    rating: 5,
    platform: "Preply",
    date: "January 5, 2023",
    text: "I am just starting my journey in learning how to speak Bengali, but Nandini has me excited to learn! She is patient, and repeats things when I don't understand. She also makes sure to explain things in different ways to reinforce what she is teaching. I will update as my lessons continue but I am happy to be working with Nandini!",
    instructorReply: "Thank you so much for taking the time to give me an encouraging review.😀❗",
    instructorReplyDate: "January 6, 2023",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Amandeep&background=6366f1&color=fff&size=128",
  },
  {
    id: "review-sarah-2024",
    studentName: "Sarah Johnson",
    rating: 5,
    platform: "Zoom Class",
    date: "November 15, 2024",
    text: "Nandini is an exceptional English teacher! Her teaching methods are clear and engaging. I've improved my pronunciation and confidence significantly in just 3 months. She adapts lessons to my learning style and is always encouraging.",
    instructorReply: "Thank you Sarah! It's wonderful to see your progress. Keep up the great work!",
    avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=ec4899&color=fff&size=128",
  },
  {
    id: "review-priya-2024",
    studentName: "Priya Sharma",
    rating: 5,
    platform: "Preply",
    date: "October 22, 2024",
    text: "My daughter loves learning with Nandini! She makes every lesson fun and interactive. Her patience with children is remarkable. We've seen amazing progress in reading and writing skills. Highly recommend for young learners!",
    instructorReply: "Thank you so much! Your daughter is a wonderful student and I'm so proud of her progress! 🌟",
    avatarUrl: "https://ui-avatars.com/api/?name=Priya+Sharma&background=8b5cf6&color=fff&size=128",
  },
  {
    id: "review-michael-2024",
    studentName: "Michael Chen",
    rating: 5,
    platform: "Zoom Class",
    date: "September 8, 2024",
    text: "I needed to improve my business English for work presentations. Nandini focused exactly on what I needed - professional vocabulary, clear pronunciation, and confidence building. Her structured approach and real-world examples made learning practical and effective.",
    instructorReply: "Thank you Michael! I'm glad our lessons are helping you succeed in your career. You're doing excellent work!",
    avatarUrl: "https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff&size=128",
  },
  {
    id: "review-anjali-2024",
    studentName: "Anjali Patel",
    rating: 5,
    platform: "Preply",
    date: "August 30, 2024",
    text: "Learning Bengali with Nandini has been a wonderful experience. She breaks down complex grammar into simple concepts. The cultural insights she shares make lessons even more enriching. Perfect for heritage learners like me!",
    instructorReply: "Thank you Anjali! It's my pleasure to help you connect with your heritage through language. 😊",
    avatarUrl: "https://ui-avatars.com/api/?name=Anjali+Patel&background=f59e0b&color=fff&size=128",
  },
  {
    id: "review-james-2024",
    studentName: "James Williams",
    rating: 5,
    platform: "Zoom Class",
    date: "July 18, 2024",
    text: "Preparing for IELTS with Nandini was the best decision I made. Her strategies for each section, detailed feedback, and practice materials were incredibly helpful. I achieved my target score! She's knowledgeable, professional, and supportive.",
    instructorReply: "Congratulations James! Your hard work paid off. Wishing you all the best in your future endeavors! 🎉",
    avatarUrl: "https://ui-avatars.com/api/?name=James+Williams&background=3b82f6&color=fff&size=128",
  },
  {
    id: "review-fatima-2024",
    studentName: "Fatima Rahman",
    rating: 5,
    platform: "Preply",
    date: "June 5, 2024",
    text: "Nandini's teaching style is perfect for beginners. She never rushes and always ensures I understand before moving forward. Her positive energy makes learning enjoyable. I can now have basic conversations confidently!",
    instructorReply: "Thank you Fatima! Your enthusiasm and dedication make teaching a joy. Keep practicing! 💫",
    avatarUrl: "https://ui-avatars.com/api/?name=Fatima+Rahman&background=06b6d4&color=fff&size=128",
  },
  {
    id: "review-david-2024",
    studentName: "David Martinez",
    rating: 5,
    platform: "Zoom Class",
    date: "May 12, 2024",
    text: "As an adult learner returning to education, I was nervous about taking English classes. Nandini created a comfortable, judgment-free environment. Her personalized lessons and constant encouragement helped me overcome my fears. Excellent teacher!",
    instructorReply: "Thank you David! I'm so proud of how far you've come. Your determination is inspiring! 🌟",
    avatarUrl: "https://ui-avatars.com/api/?name=David+Martinez&background=ef4444&color=fff&size=128",
  },
  {
    id: "review-neha-2024",
    studentName: "Neha Gupta",
    rating: 5,
    platform: "Preply",
    date: "April 20, 2024",
    text: "My 8-year-old daughter has been taking lessons for 6 months now. The improvement in her reading and writing is remarkable. Nandini uses creative activities and keeps her engaged throughout. Best investment in my child's education!",
    instructorReply: "Thank you so much! Your daughter is a bright student and it's wonderful to be part of her learning journey! 📚✨",
    avatarUrl: "https://ui-avatars.com/api/?name=Neha+Gupta&background=a855f7&color=fff&size=128",
  },
  {
    id: "review-robert-2024",
    studentName: "Robert Taylor",
    rating: 5,
    platform: "Zoom Class",
    date: "March 10, 2024",
    text: "I've been learning Bengali for my upcoming trip to Kolkata. Nandini taught me practical phrases, cultural etiquette, and even helped with pronunciation nuances. Her lessons are well-organized and effective. I feel prepared for my journey!",
    instructorReply: "Thank you Robert! Have a wonderful trip to Kolkata. You'll do great! 🛫",
    avatarUrl: "https://ui-avatars.com/api/?name=Robert+Taylor&background=14b8a6&color=fff&size=128",
  },
] as const;
