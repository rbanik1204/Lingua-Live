// Comprehensive Lessons with Vocabulary, Phrases, and Cultural Insights

export type LessonLanguage = 'Bengali' | 'English';

export type LessonContent = {
  id: number;
  title: string;
  description: string;
  category: string;
  language: LessonLanguage;
  words: string[];
  sentences: string[];
  grammar?: string;
  culturalNote?: string;
  quiz?: Array<{ question: string; answer: string }>;
  unlockType: 'free' | 'progress' | 'premium';
};

export const LESSONS: LessonContent[] = [
  // FREE BENGALI LESSONS (1-4)
  {
    id: 1,
    title: 'Greetings and Basic Courtesy',
    description: 'Learn essential Bengali greetings and polite expressions',
    category: 'Beginner',
    language: 'Bengali',
    unlockType: 'free',
    words: [
      'নমস্কার - Hello - nomoshkar',
      'হ্যালো - Hello - hello',
      'সুপ্রভাত - Morning - shuprovat',
      'সন্ধ্যা - Evening - shondha',
      'রাত্রি - Night - ratri',
      'ধন্যবাদ - Thanks - dhonnobad',
      'দয়া - Please - doya',
      'মাফ - Sorry - maf',
      'স্বাগতম - Welcome - shagatom',
      'বিদায় - Goodbye - biday'
    ],
    sentences: [
      'নমস্কার - Hello - nomoshkar',
      'সুপ্রভাত আপনি কেমন আছেন - Good morning how are you - shuprovat apni kemon achhen',
      'আমি ভালো আছি - I am fine - ami bhalo achhi'
    ],
    grammar: 'Bengali greetings are polite and calm. আপনি (apni) is respectful and safe for beginners.',
    culturalNote: 'In Bengali culture, greetings are formal and show respect. নমস্কার is widely used across all times of day.'
  },
  {
    id: 2,
    title: 'Introducing Yourself',
    description: 'Learn how to introduce yourself and ask names in Bengali',
    category: 'Beginner',
    language: 'Bengali',
    unlockType: 'free',
    words: [
      'আমি - I - ami',
      'তুমি - You - tumi',
      'আপনি - You (formal) - apni',
      'নাম - Name - naam',
      'বয়স - Age - boyosh',
      'বাড়ি - Home - bari',
      'শহর - City - shohor',
      'দেশ - Country - desh',
      'পরিচয় - Introduction - porichoy',
      'ছাত্র - Student - chhatro'
    ],
    sentences: [
      'আমার নাম অনিতা - My name is Anita - amar naam Anita',
      'আপনার নাম কি - What is your name - apnar naam ki'
    ],
    grammar: 'আমার means "my" and আপনার means "your" (polite). These possessive forms are essential for basic introductions.',
    culturalNote: 'Asking someone\'s name politely shows respect in Bengali culture. Always use আপনি (formal you) with strangers.'
  },
  {
    id: 3,
    title: 'Polite Words',
    description: 'Master essential polite expressions and courtesy words',
    category: 'Beginner',
    language: 'Bengali',
    unlockType: 'free',
    words: [
      'ধন্যবাদ - Thanks - dhonnobad',
      'দয়া - Kindness - doya',
      'মাফ - Forgive - maf',
      'সাহায্য - Help - shahajjo',
      'কৃপা - Please - kripa',
      'শ্রদ্ধা - Respect - shraddha',
      'ভদ্র - Polite - bhodro',
      'নম্র - Humble - nomro',
      'সেবা - Service - sheba',
      'আদর - Affection - ador'
    ],
    sentences: [
      'দয়া করে বসুন - Please sit - doya kore boshun',
      'ধন্যবাদ আপনার সাহায্যের জন্য - Thank you for your help - dhonnobad apnar shahajjer jonno',
      'দয়া করে সাহায্য করুন - Please help - doya kore shahajjo korun'
    ],
    grammar: 'দয়া করে (please) comes before the verb. ধন্যবাদ can stand alone or be followed by reason with জন্য (for).',
    culturalNote: 'Politeness is highly valued in Bengali society. Using these words shows good manners and respect.'
  },
  {
    id: 4,
    title: 'Yes, No, and Understanding',
    description: 'Learn to respond and express understanding in Bengali',
    category: 'Beginner',
    language: 'Bengali',
    unlockType: 'free',
    words: [
      'হ্যাঁ - Yes - haan',
      'না - No - na',
      'ঠিক - Correct - thik',
      'ভুল - Wrong - bhul',
      'বুঝি - Understand - bujhi',
      'জানি - Know - jani',
      'শুনি - Hear - shuni',
      'দেখি - See - dekhi',
      'পারি - Can - pari',
      'চাই - Want - chai'
    ],
    sentences: [
      'হ্যাঁ ঠিক আছে - Yes okay - haan thik ache',
      'না আমি বুঝিনি - No I did not understand - na ami bujhini',
      'আপনি বুঝেছেন - Did you understand - apni bujhechen',
      'হ্যাঁ বুঝেছি - Yes I understand - haan bujhechi'
    ],
    grammar: 'বুঝেছি (bujhechi) is past tense meaning "I understood/understand". বুঝিনি (bujhini) is negative past tense.',
    culturalNote: 'It\'s perfectly acceptable to say you don\'t understand. Bengali speakers appreciate honesty in communication.'
  },

  // PREMIUM BENGALI LESSONS (5-20) - Individual purchase at $2 each
  {
    id: 5,
    title: 'Family Basics',
    description: 'Learn vocabulary for family members and relationships',
    category: 'Beginner',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'মা - Mother - maa',
      'বাবা - Father - baba',
      'ভাই - Brother - bhai',
      'বোন - Sister - bon',
      'দাদা - Grandfather - dada',
      'দিদি - Sister - didi',
      'কাকা - Uncle - kaka',
      'মামা - Uncle - mama',
      'পরিবার - Family - poribar',
      'সন্তান - Child - shontan'
    ],
    sentences: [
      'আমার মা বাড়িতে আছেন - My mother is at home - amar maa barite achhen',
      'আমার এক ভাই আছে - I have one brother - amar ek bhai ache',
      'আপনার ভাই আছে - Do you have a brother - apnar bhai ache'
    ],
    grammar: 'Use আমার (my) before family terms. আছে means "have" or "there is". আছেন is the respectful form.',
    culturalNote: 'Extended families play important roles in Bengali culture. Family is often the first topic in conversations.'
  },
  {
    id: 6,
    title: 'Numbers, Counting, and Money (Daily Life)',
    description: 'Learn Bengali numbers, counting, and money-related vocabulary',
    category: 'Intermediate',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'এক - One - ek',
      'দুই - Two - dui',
      'তিন - Three - tin',
      'চার - Four - chaar',
      'পাঁচ - Five - panch',
      'টাকা - Money - taka',
      'দাম - Price - daam',
      'কত - How much / How many - koto',
      'বেশি - Expensive / More - beshi',
      'কম - Cheap / Less - kom',
      'আছে - Have / There is - ache'
    ],
    sentences: [
      'এটা কত টাকা - How much is this - eta koto taka',
      'দাম বেশি - The price is high - daam beshi',
      'এটা পাঁচ টাকা - This is five taka - eta panch taka',
      'এটার দাম কত - How much is this - etar daam koto',
      'দাম কম - The price is low - daam kom',
      'আমার দুই টাকা আছে - I have two taka - amar dui taka ache',
      'এটা দশ টাকা - This is ten taka - eta dosh taka',
      'দাম কম করবেন - Please reduce the price - daam kom korben',
      'ঠিক আছে - Okay - thik ache'
    ],
    grammar: 'In daily Bengali, টাকা is used for all money amounts. Numbers come before টাকা. কত means "how much" or "how many".',
    culturalNote: 'Bargaining is common in Bengali markets. Asking দাম কম করবেন (please reduce the price) is a normal part of shopping culture.',
    quiz: [
      { question: 'How do you say "How much is this"', answer: 'এটা কত টাকা' },
      { question: 'Translate: "The price is low"', answer: 'দাম কম' }
    ]
  },
  {
    id: 7,
    title: 'Objects Around You (Daily Use Items)',
    description: 'Learn vocabulary for everyday objects and items',
    category: 'Intermediate',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'বই - Book - boi',
      'কলম - Pen - kolom',
      'চেয়ার - Chair - cheyar',
      'টেবিল - Table - tebil',
      'মোবাইল - Mobile phone - mobile',
      'চাবি - Key - chabi',
      'ব্যাগ - Bag - bag',
      'ঘর - Room - ghor',
      'জল - Water - jol',
      'এটা - This - eta',
      'ওটা - That - ota',
      'আছে - Is / There is - ache'
    ],
    sentences: [
      'এটা কি বই - Is this a book - eta ki boi',
      'ওটা টেবিল - That is a table - ota tebil',
      'এখানে জল আছে - There is water here - ekhane jol ache',
      'এটা আমার কলম - This is my pen - eta amar kolom',
      'ওটা চেয়ার - That is a chair - ota cheyar',
      'ব্যাগে চাবি আছে - The key is in the bag - bage chabi ache',
      'এটা কি - What is this - eta ki',
      'এটা বই - This is a book - eta boi',
      'এটা আমার মোবাইল - This is my phone - eta amar mobile'
    ],
    grammar: 'Bengali often drops "is" — এটা বই is natural speech. এটা (eta) means "this" and ওটা (ota) means "that". কি at the end makes it a question.',
    culturalNote: 'Many Bengali words for modern objects are borrowed from English (মোবাইল, ব্যাগ, টেবিল), making them easier to learn.',
    quiz: [
      { question: 'How do you say "This is my bag"', answer: 'এটা আমার ব্যাগ' },
      { question: 'Translate: "There is water here"', answer: 'এখানে জল আছে' }
    ]
  },
  {
    id: 8,
    title: 'Daily Actions and Verbs (Present Tense)',
    description: 'Master common verbs and daily actions in present tense',
    category: 'Intermediate',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'করা - To do - kora',
      'যাওয়া - To go - jaowa',
      'আসা - To come - asha',
      'খাওয়া - To eat - khaowa',
      'পান করা - To drink - pan kora',
      'পড়া - To read / study - pora',
      'লেখা - To write - lekha',
      'কাজ - Work - kaj',
      'করি - Do (I) - kori',
      'যাই - Go (I) - jai',
      'খাই - Eat (I) - khai'
    ],
    sentences: [
      'আমি কাজ করি - I work - ami kaj kori',
      'আমি ভাত খাই - I eat rice - ami bhat khai',
      'আমি স্কুলে যাই - I go to school - ami schoole jai',
      'আমি বই পড়ি - I read a book - ami boi pori',
      'আমি জল পান করি - I drink water - ami jol pan kori',
      'আমি বাড়ি যাই - I go home - ami bari jai',
      'আপনি কি কাজ করেন - Do you work - apni ki kaj koren',
      'হ্যাঁ আমি কাজ করি - Yes I work - haan ami kaj kori',
      'আপনি কোথায় যান - Where do you go - apni kothay jan',
      'তুমি কি পড়ো - Do you study - tumi ki poro',
      'হ্যাঁ আমি পড়ি - Yes I study - haan ami pori'
    ],
    grammar: 'Bengali present tense often ends in ই for "I" (আমি). করি, যাই, খাই, পড়ি are all first-person present tense forms.',
    culturalNote: 'The verb পড়া means both "read" and "study" in Bengali, reflecting the culture\'s emphasis on education.',
    quiz: [
      { question: 'How do you say "I eat rice"', answer: 'আমি ভাত খাই' },
      { question: 'Translate: "I go to school"', answer: 'আমি স্কুলে যাই' }
    ]
  },
  {
    id: 9,
    title: 'Food, Meals, and Ordering',
    description: 'Essential vocabulary for food, meals, and ordering in restaurants',
    category: 'Intermediate',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'ভাত - Rice - bhat',
      'রুটি - Roti - ruti',
      'তরকারি - Vegetable curry - torkari',
      'ডাল - Lentils - dal',
      'মাছ - Fish - maach',
      'মাংস - Meat - mangsho',
      'জল - Water - jol',
      'চা - Tea - cha',
      'খাবার - Food - khabar',
      'মেনু - Menu - menu',
      'খাই - Eat (I) - khai',
      'পান করি - Drink (I) - pan kori',
      'চাই - Want - chai'
    ],
    sentences: [
      'আমি ভাত খাই - I eat rice - ami bhat khai',
      'আমি চা পান করি - I drink tea - ami cha pan kori',
      'আমি খাবার চাই - I want food - ami khabar chai',
      'আমি রুটি খাই - I eat roti - ami ruti khai',
      'আমি মাছ খাই - I eat fish - ami maach khai',
      'একটু জল চাই - I want some water - ektu jol chai',
      'আপনি কী খাবেন - What will you eat - apni ki khaben',
      'আমি ভাত আর ডাল খাব - I will eat rice and dal - ami bhat ar dal khabo',
      'আপনি চা পান করবেন - Will you drink tea - apni cha pan korben',
      'তুমি কী খাবে - What will you eat - tumi ki khabe',
      'আমি মাছ খাব - I will eat fish - ami maach khabo',
      'জল চাই - I want water - jol chai'
    ],
    grammar: 'Bengali often skips "please" in casual ordering — tone matters more than words. চাই means "want". খাবেন is polite future form.',
    culturalNote: 'Tea (চা) is integral to Bengali culture. Offering tea is a sign of hospitality and friendship. Rice (ভাত) and fish (মাছ) are staples of Bengali cuisine.',
    quiz: [
      { question: 'How do you say "I want food"', answer: 'আমি খাবার চাই' },
      { question: 'Translate: "I drink tea"', answer: 'আমি চা পান করি' }
    ]
  },

  // PREMIUM BENGALI LESSONS (10-20) - Requires $10 payment
  {
    id: 10,
    title: 'Time, Days, and Daily Routine',
    description: 'Learn time expressions, days, and how to talk about daily routines',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'সময় - Time - shomoy',
      'আজ - Today - aj',
      'কাল - Yesterday / Tomorrow - kal',
      'সকাল - Morning - shokal',
      'দুপুর - Afternoon - dupur',
      'সন্ধ্যা - Evening - shondha',
      'রাত - Night - raat',
      'দিন - Day - din',
      'প্রতিদিন - Every day - protodin',
      'যাই - Go (I) - jai',
      'খাই - Eat (I) - khai',
      'কাজ করি - Work (I) - kaj kori'
    ],
    sentences: [
      'আজ আমার কাজ আছে - Today I have work - aj amar kaj ache',
      'আমি সকালে উঠি - I wake up in the morning - ami shokale uthi',
      'আমি রাতে ঘুমাই - I sleep at night - ami raate ghumai',
      'আজ স্কুলে যাই - I go to school today - aj schoole jai',
      'দুপুরে ভাত খাই - I eat rice in the afternoon - dupure bhat khai',
      'সন্ধ্যায় বাড়ি আসি - I come home in the evening - shondhay bari ashi',
      'আপনি প্রতিদিন কী করেন - What do you do every day - apni protodin ki koren',
      'আমি কাজ করি - I work - ami kaj kori',
      'আপনি কখন বাড়ি আসেন - When do you come home - apni kokhon bari ashen',
      'তুমি সকালে কী করো - What do you do in the morning - tumi shokale ki koro',
      'আমি স্কুলে যাই - I go to school - ami schoole jai',
      'আমি প্রতিদিন কাজ করি - I work every day - ami protodin kaj kori'
    ],
    grammar: 'কাল can mean yesterday or tomorrow. Context decides the meaning. Bengali present tense with time words describes daily routines.',
    culturalNote: 'Bengali culture has strong daily routines. কাল\'s dual meaning reflects the culture\'s cyclical view of time.',
    quiz: [
      { question: 'How do you say "I sleep at night"', answer: 'আমি রাতে ঘুমাই' },
      { question: 'Translate: "Every day I work"', answer: 'আমি প্রতিদিন কাজ করি' }
    ]
  },
  {
    id: 11,
    title: 'Time Words',
    description: 'Express time and temporal relationships',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'আজ - Today - aaj',
      'কাল - Yesterday/Tomorrow - kaal',
      'এখন - Now - ekhon',
      'পরে - Later - pore',
      'আগে - Before - age',
      'সকাল - Morning - shokal',
      'দুপুর - Noon - dupur',
      'বিকাল - Afternoon - bikal',
      'সন্ধ্যা - Evening - shondha',
      'রাত - Night - raat'
    ],
    sentences: [
      'আমি এখন ব্যস্ত - I am busy now',
      'আমি পরে আসব - I will come later',
      'আপনি এখন ফ্রি - Are you free now',
      'না আমি এখন ব্যস্ত - No I am busy now'
    ],
    grammar: 'কাল can mean both yesterday and tomorrow - context determines the meaning. আসব is future tense.',
    culturalNote: 'Bengali time expressions are flexible. কাল\'s dual meaning reflects the culture\'s cyclical view of time.'
  },
  {
    id: 12,
    title: 'Places',
    description: 'Learn names of common locations and places',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'বাড়ি - Home - bari',
      'স্কুল - School - school',
      'বাজার - Market - bajar',
      'অফিস - Office - office',
      'হাসপাতাল - Hospital - hashpatal',
      'দোকান - Shop - dokan',
      'রাস্তা - Road - rasta',
      'পার্ক - Park - park',
      'মন্দির - Temple - mondir',
      'স্টেশন - Station - station'
    ],
    sentences: [
      'আমি বাড়িতে আছি - I am at home',
      'সে অফিসে যায় - He/She goes to office',
      'আপনি কোথায় আছেন - Where are you',
      'আমি স্কুলে যাই - I go to school'
    ],
    grammar: 'Add তে (te) or এ (e) to places to mean "at/to". বাড়িতে = at home, স্কুলে = to/at school.',
    culturalNote: 'বাজার (market) is the heart of Bengali community life. Markets are social gathering places, not just shopping areas.'
  },
  {
    id: 13,
    title: 'Asking Questions',
    description: 'Master question words and interrogative forms',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'কি - What - ki',
      'কোথায় - Where - kothay',
      'কে - Who - ke',
      'কেন - Why - keno',
      'কখন - When - kokhon',
      'কিভাবে - How - kibhabe',
      'কতটা - How much - kotota',
      'কোন - Which - kon',
      'কয়টা - How many - koyota',
      'কার - Whose - kar'
    ],
    sentences: [
      'আপনার নাম কি - What is your name',
      'আপনি কোথায় যান - Where do you go',
      'এটা কি - What is this',
      'আপনি কে - Who are you'
    ],
    grammar: 'Question words usually come at the end in Bengali. কি can mean both "what" and turns statements into yes/no questions.',
    culturalNote: 'Asking questions shows interest in Bengali culture. Direct questions are acceptable and show engagement.'
  },
  {
    id: 14,
    title: 'Feelings and Emotions',
    description: 'Express emotions and describe how you feel',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'সুখী - Happy - shukhi',
      'দুঃখিত - Sad - dukhito',
      'ভালো - Good - bhalo',
      'ক্লান্ত - Tired - klanto',
      'রাগ - Anger - raag',
      'ভয় - Fear - bhoy',
      'আনন্দ - Joy - anondo',
      'চিন্তা - Worry - chinta',
      'ভালোবাসা - Love - bhalobasha',
      'আশা - Hope - asha'
    ],
    sentences: [
      'আমি সুখী - I am happy',
      'আমি ক্লান্ত - I am tired',
      'আপনি কেমন আছেন - How are you',
      'আমি ভালো আছি - I am fine'
    ],
    grammar: 'Emotion words follow আমি (I am). আছি indicates current state. কেমন আছেন means "how are you".',
    culturalNote: 'Bengali speakers openly express emotions. Asking "কেমন আছেন" (how are you) is a genuine inquiry, not just formality.'
  },
  {
    id: 15,
    title: 'Body Parts',
    description: 'Learn body part vocabulary and express pain',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'হাত - Hand - haat',
      'চোখ - Eye - chokh',
      'মাথা - Head - matha',
      'পা - Leg - pa',
      'মুখ - Face - mukh',
      'কান - Ear - kaan',
      'নাক - Nose - naak',
      'দাঁত - Tooth - daat',
      'শরীর - Body - shorir',
      'পেট - Stomach - pet'
    ],
    sentences: [
      'আমার মাথা ব্যথা - I have a headache',
      'আমার হাত ব্যথা - My hand hurts',
      'কি হয়েছে - What happened',
      'আমার পা ব্যথা - My leg hurts'
    ],
    grammar: 'To express pain: আমার (my) + body part + ব্যথা (pain/hurt). This structure is simple and widely used.',
    culturalNote: 'In Bengali culture, people often inquire about health. Sharing minor ailments is common and shows closeness.'
  },
  {
    id: 16,
    title: 'Weather',
    description: 'Describe weather conditions and temperature',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'গরম - Hot - gorom',
      'ঠান্ডা - Cold - thanda',
      'বৃষ্টি - Rain - brishti',
      'আবহাওয়া - Weather - abohawa',
      'রোদ - Sun - rod',
      'মেঘ - Cloud - megh',
      'ঝড় - Storm - jhor',
      'বাতাস - Wind - batash',
      'তুষার - Snow - tushar',
      'কুয়াশা - Fog - kuyasha'
    ],
    sentences: [
      'আজ খুব গরম - Today is very hot',
      'আজ বৃষ্টি হচ্ছে - It is raining today',
      'আজ আবহাওয়া কেমন - How is the weather today'
    ],
    grammar: 'হচ্ছে means "is happening/occurring". খুব (very) intensifies adjectives. আজ (today) starts weather statements.',
    culturalNote: 'Weather is a popular conversation starter in Bengal. Monsoon season (বর্ষাকাল) is especially significant culturally.'
  },
  {
    id: 17,
    title: 'Needs and Requests',
    description: 'Express needs, wants, and ask for help',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'চাই - Want - chai',
      'দরকার - Need - dorkar',
      'সাহায্য - Help - shahajjo',
      'প্রয়োজন - Necessity - proyojon',
      'ইচ্ছা - Wish - iccha',
      'অনুরোধ - Request - onurodh',
      'সমস্যা - Problem - shomossha',
      'সমাধান - Solution - shomadhan',
      'যত্ন - Care - jotno',
      'সহায়তা - Support - shohayota'
    ],
    sentences: [
      'আমার সাহায্য দরকার - I need help',
      'আমি জল চাই - I want water',
      'আপনার কি দরকার - What do you need',
      'আমার জল দরকার - I need water'
    ],
    grammar: 'দরকার (need) follows the pattern: আমার (my) + thing + দরকার. চাই (want) follows: আমি + thing + চাই.',
    culturalNote: 'Bengalis are generally helpful and responsive to requests. Don\'t hesitate to ask for সাহায্য (help).'
  },
  {
    id: 18,
    title: 'Directions and Location',
    description: 'Navigate and describe locations',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'সামনে - Front - shamne',
      'পিছনে - Back - pichone',
      'কাছে - Near - kache',
      'দূরে - Far - dure',
      'ডানে - Right - dane',
      'বামে - Left - bame',
      'উপর - Up - upor',
      'নিচে - Down - niche',
      'ভিতরে - Inside - bhitore',
      'বাইরে - Outside - baire'
    ],
    sentences: [
      'দোকানটা কাছে - The shop is near',
      'স্কুলটা দূরে - The school is far',
      'দোকানটা কোথায় - Where is the shop',
      'বাড়িটা কাছে - The house is near'
    ],
    grammar: 'Location words follow the noun. টা makes nouns definite. কোথায় (where) is used to ask about location.',
    culturalNote: 'Giving directions in Bengal often includes landmarks like shops, temples, or well-known buildings rather than street names.'
  },
  {
    id: 19,
    title: 'Simple Conversations',
    description: 'Engage in basic dialogue and language learning',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'বলি - Speak - boli',
      'বুঝি - Understand - bujhi',
      'একটু - Little - ektu',
      'অনেক - Much - onek',
      'কথা - Talk - kotha',
      'ভাষা - Language - bhasha',
      'শব্দ - Word - shobdo',
      'বাক্য - Sentence - bakyo',
      'প্রশ্ন - Question - proshno',
      'উত্তর - Answer - uttor'
    ],
    sentences: [
      'আপনি কি বাংলা বলেন - Do you speak Bengali',
      'আমি একটু বাংলা বলি - I speak a little Bengali',
      'আপনি কি বুঝেন - Do you understand',
      'হ্যাঁ একটু বুঝি - Yes I understand a little',
      'আমি বাংলা বলি - I speak Bengali'
    ],
    grammar: 'বলি and বুঝি are first person present. বলেন and বুঝেন are polite forms. একটু (a little) shows modesty.',
    culturalNote: 'Bengali speakers appreciate any effort to learn their language. Saying একটু বাংলা বলি shows humility and is well-received.'
  },
  {
    id: 20,
    title: 'Confidence and Review',
    description: 'Express learning progress and ability',
    category: 'Advanced',
    language: 'Bengali',
    unlockType: 'premium',
    words: [
      'শিখছি - Learning - shikhchi',
      'পারি - Can - pari',
      'চেষ্টা - Try - cheshta',
      'অভ্যাস - Practice - ovyas',
      'উন্নতি - Progress - unnoti',
      'সফল - Successful - sofol',
      'লক্ষ্য - Goal - lokkhyo',
      'আত্মবিশ্বাস - Confidence - atmobishwas',
      'জ্ঞান - Knowledge - gyan',
      'দক্ষতা - Skill - dokhkhota'
    ],
    sentences: [
      'আমি বাংলা শিখছি - I am learning Bengali',
      'আমি বাংলা বলতে পারি - I can speak Bengali',
      'আপনি বাংলা শিখছেন - Are you learning Bengali',
      'হ্যাঁ আমি বাংলা শিখছি - Yes I am learning Bengali',
      'আমি চেষ্টা করতে পারি - I can try'
    ],
    grammar: 'শিখছি is present continuous (learning). পারি means "can/able to". বলতে পারি = can speak (verb infinitive + পারি).',
    culturalNote: 'Learning Bengali shows respect for the culture. Bengalis are proud of their language and will encourage your efforts enthusiastically!'
  },

  // PREMIUM LESSONS (11-20)
  {
    id: 11,
    title: 'Asking Questions and Directions',
    description: 'Learn to ask questions and understand directions in Bengali',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'কি - What - ki',
      'কোথায় - Where - kothay',
      'কেন - Why - keno',
      'কখন - When - kokhon',
      'কিভাবে - How - kibhabe',
      'দিক - Direction - dik',
      'ডান - Right - dan',
      'বাম - Left - bam',
      'সরাসরি - Straight - shorashori',
      'এদিকে - This way - edike'
    ],
    sentences: [
      'আপনি কোথায় যাচ্ছেন - Where are you going (formal) - apni kothay jacchen',
      'আমি বাজারে যাচ্ছি - I am going to the market - ami bazare jacchi',
      'এটা কেন করছেন - Why are you doing this (formal) - eta keno korchen',
      'তুমি কোথায় যাচ্ছো - Where are you going (informal) - tumi kothay jaccho',
      'আমি স্কুলে যাচ্ছি - I am going to school - ami schoole jacchi',
      'এটা কেন করছো - Why are you doing this (informal) - eta keno korcho',
      'সোজা যান তারপর ডান মুড়ুন - Go straight then turn right - shoja jan tarpor dan murun',
      'সরাসরি যাও এবং বাম মুড়ো - Go straight and turn left - shorashori jao ebong bam muro'
    ],
    grammar: 'Question words (কি, কোথায়, কেন, কখন) typically come after the subject. আপনি is formal "you" and তুমি is informal. Always match formality level with context - respect first, then casual.',
    culturalNote: 'In Bengali culture, asking directions politely is important. Use formal language (আপনি) with strangers and elders, informal (তুমি) with friends and peers. Directional terms are essential for navigating Bengali-speaking areas.',
    quiz: [
      {
        question: 'How do you say "Where are you going" (formal)?',
        answer: 'আপনি কোথায় যাচ্ছেন'
      },
      {
        question: 'Translate: Go straight and then turn right',
        answer: 'সোজা যান তারপর ডান মুড়ুন'
      }
    ]
  },
  {
    id: 12,
    title: 'Places Around You (Home, School, Market)',
    description: 'Learn names of common places and how to talk about them',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'বাড়ি - Home - bari',
      'স্কুল - School - school',
      'কলেজ - College - college',
      'বাজার - Market - bazar',
      'হাসপাতাল - Hospital - hospital',
      'পুলিশ স্টেশন - Police station - police station',
      'রেস্তোরাঁ - Restaurant - restoran',
      'গাড়ি পার্কিং - Car parking - gari parking'
    ],
    sentences: [
      'আমি বাড়িতে যাচ্ছি - I am going home - ami barite jacchi',
      'আপনি স্কুলে যাচ্ছেন - You are going to school (formal) - apni schoole jacchen',
      'এটি হাসপাতাল কোথায় - Where is the hospital - eti hospital kothay',
      'আমি বাজারে যাচ্ছি - I am going to the market - ami bazare jacchi',
      'তুমি কলেজে যাচ্ছো - You are going to college (informal) - tumi college-e jaccho',
      'রেস্তোরাঁ কোথায় - Where is the restaurant - restoran kothay'
    ],
    grammar: 'Place names take the locative suffix -তে or -এ (to/at). বাড়িতে = at home, স্কুলে = at school. Use formal আপনি with respect, informal তুমি casually.',
    culturalNote: 'Bengali cities and towns are organized around key community places: বাজার (markets) are social hubs, স্কুল and কলেজ are education centers. Knowing these locations helps navigate daily life.',
    quiz: [
      {
        question: 'How do you say "I am going home"?',
        answer: 'আমি বাড়িতে যাচ্ছি'
      },
      {
        question: 'Translate: Where is the restaurant?',
        answer: 'রেস্তোরাঁ কোথায়'
      }
    ]
  },
  {
    id: 13,
    title: 'Emotions and Feelings',
    description: 'Express your emotions and feelings naturally in Bengali',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'ভালো - Good - bhalo',
      'খারাপ - Bad - kharap',
      'সুখী - Happy - shukhi',
      'দুঃখী - Sad - dukkhi',
      'ক্লান্ত - Tired - klanto',
      'রেগে - Angry - rege',
      'ভয় - Afraid / Scared - bhoy',
      'উদ্বিগ্ন - Worried - udbigno',
      'প্রসন্ন - Cheerful / Pleasant - proshonno'
    ],
    sentences: [
      'আমি ভালো - I am fine / good - ami bhalo',
      'আমি দুঃখী - I am sad - ami dukkhi',
      'আপনি কেমন - How are you feeling (formal) - apni kemon',
      'আমি ক্লান্ত - I am tired - ami klanto',
      'তুমি সুখী - You are happy - tumi shukhi',
      'আমি রেগে - I am angry - ami rege',
      'হ্যাঁ, আমি ভালো - Yes, I am fine - haan, ami bhalo',
      'তুমি সুখী? - Are you happy - tumi shukhi?',
      'তুমি রেগে? - Are you angry - tumi rege?',
      'হ্যাঁ, আমি রেগে - Yes, I am angry - haan, ami rege'
    ],
    grammar: 'Emotions are expressed simply: আমি + emotion word. কেমন (how) is used to ask about feelings. Match formality: আপনি কেমন (formal), তুমি কেমন (informal).',
    culturalNote: 'Bengalis express emotions openly among close friends and family. It\'s natural to ask "কেমন আছো?" (how are you?) to show care. Respect context when sharing feelings - formal with elders, casual with peers.',
    quiz: [
      {
        question: 'How do you say "I am angry"?',
        answer: 'আমি রেগে'
      },
      {
        question: 'Translate: Are you happy?',
        answer: 'তুমি সুখী?'
      }
    ]
  },
  {
    id: 14,
    title: 'Requests and Needs',
    description: 'Learn to make polite requests and express your needs',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'চাই - Want - chai',
      'দরকার - Need - dorkar',
      'সাহায্য - Help - shahajjo',
      'একটু - A little - ektu',
      'বড় - Big - boro',
      'ছোট - Small - chhoto',
      'দয়া করে - Please - doya kore',
      'সহজ - Easy - shohoj',
      'কঠিন - Difficult - kothin'
    ],
    sentences: [
      'আমি সাহায্য চাই - I want help - ami shahajjo chai',
      'আমার সাহায্য দরকার - I need help - amar shahajjo dorkar',
      'দয়া করে এটি দিন - Please give this - doya kore eti din',
      'একটু সাহায্য করো - Help me a little - ektu shahajjo koro',
      'আমার এটা দরকার - I need this - amar eta dorkar',
      'একটু সহজ করো - Make it a little easy - ektu shohoj koro',
      'দয়া করে আমাকে সাহায্য করবেন - Please help me - doya kore amake shahajjo korben',
      'ঠিক আছে - Okay - thik ache'
    ],
    grammar: 'চাই (want) and দরকার (need) express desires and requirements. দয়া করে (please) makes requests polite. Use করবেন (formal) or করো (informal) for verb conjugations.',
    culturalNote: 'Politeness is essential in Bengali culture. Always use দয়া করে when asking for something from strangers or elders. Close friends may use shorter, casual requests.',
    quiz: [
      {
        question: 'How do you say "I need help"?',
        answer: 'আমার সাহায্য দরকার'
      },
      {
        question: 'Translate: Please give this',
        answer: 'দয়া করে এটি দিন'
      }
    ]
  },
  {
    id: 15,
    title: 'Travel and Transportation',
    description: 'Learn vocabulary for traveling and using transportation',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'যাই - Go - jai',
      'বাস - Bus - bus',
      'ট্রেন - Train - tren',
      'গাড়ি - Car - gari',
      'বাইক - Bike / Motorcycle - bike',
      'রাস্তা - Road - rasta',
      'স্টেশন - Station - station',
      'টিকিট - Ticket - ticket'
    ],
    sentences: [
      'আমি ট্রেনে যাচ্ছি - I am going by train - ami trene jacchi',
      'আপনি কোথায় যাবেন - Where will you go (formal) - apni kothay jaben',
      'একটি টিকিট চাই - I want one ticket - ekti ticket chai',
      'আমি বাসে যাচ্ছি - I am going by bus - ami base jacchi',
      'তুমি কোথায় যাচ্ছো - Where are you going - tumi kothay jaccho',
      'একটি টিকিট দাও - Give me one ticket - ekti ticket dao',
      'আমি ট্রেনে যাব - I will go by train - ami trene jabo'
    ],
    grammar: 'Transportation modes use the locative suffix -এ: বাসে (by bus), ট্রেনে (by train). যাব is future tense "will go", যাচ্ছি is present continuous "am going".',
    culturalNote: 'Public transportation is common in Bangladesh and West Bengal. Buses and trains are affordable and widely used. Always purchase tickets before boarding to avoid fines.',
    quiz: [
      {
        question: 'How do you say "I am going by bus"?',
        answer: 'আমি বাসে যাচ্ছি'
      },
      {
        question: 'Translate: I want one ticket',
        answer: 'একটি টিকিট চাই'
      }
    ]
  },
  {
    id: 16,
    title: 'Shopping and Bargaining',
    description: 'Master shopping vocabulary and bargaining phrases',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'দাম - Price - daam',
      'কম - Cheap / Less - kom',
      'বেশি - Expensive / More - beshi',
      'কেনা - Buy - kena',
      'বিক্রি - Sell - bikri',
      'দোকান - Shop / Store - dokaan',
      'টাকা - Money - taka',
      'ছাড় - Discount - chhar',
      'টিকিট - Ticket - ticket',
      'দয়া করে - Please - doya kore'
    ],
    sentences: [
      'আমি এটি কিনতে চাই - I want to buy this - ami eti kinte chai',
      'এটি কত টাকা - How much is this - eti koto taka',
      'দয়া করে দাম কমান - Please reduce the price - doya kore daam koman',
      'আমার এটা চাই - I want this - amar eta chai',
      'দাম কত - How much - daam koto',
      'কম দাও - Give less (informal bargaining) - kom dao',
      'এটি দশ টাকা - It is ten taka - eti dosh taka',
      'পাঁচ টাকা - Five taka - panch taka'
    ],
    grammar: 'কিনতে চাই = want to buy (infinitive + চাই). কত টাকা asks "how much money". কমান (formal) and দাও (informal) are imperative forms for "reduce/give".',
    culturalNote: 'Bargaining is a cultural norm in Bengali markets. It\'s expected and shows engagement. Start by asking the price, then politely request a discount. Street vendors expect negotiation but remain respectful.',
    quiz: [
      {
        question: 'How do you say "I want to buy this"?',
        answer: 'আমি এটি কিনতে চাই'
      },
      {
        question: 'Translate: Give less',
        answer: 'কম দাও'
      }
    ]
  },
  {
    id: 17,
    title: 'Health and Body',
    description: 'Learn to talk about health and body parts',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'হাঁসপাতাল - Hospital - hospital',
      'ডাক্তার - Doctor - doktar',
      'ব্যথা - Pain - byatha',
      'শরীর - Body - shorir',
      'মাথা - Head - matha',
      'হাত - Hand - hat',
      'পা - Leg / Foot - pa',
      'দরদ - Pain - dord',
      'ঠান্ডা - Cold - thanda',
      'জ্বর - Fever - jhor'
    ],
    sentences: [
      'আমার মাথা ব্যথা করছে - I have a headache - amar matha byatha korche',
      'আমি ডাক্তারের কাছে যাচ্ছি - I am going to the doctor - ami doktarer kache jacchi',
      'আপনি কেমন আছেন - How are you (formal) - apni kemon achhen',
      'আমার পা ব্যথা করছে - My leg hurts - amar pa byatha korche',
      'আমি শারীরিকভাবে ক্লান্ত - I am physically tired - ami sharirik bhabe klanto',
      'তুমি কেমন - How are you (informal) - tumi kemon'
    ],
    grammar: 'আমার + body part + ব্যথা করছে = "my [body part] hurts". ডাক্তারের কাছে = "to the doctor" (possessive + কাছে for "to someone").',
    culturalNote: 'Health discussions are common in Bengali culture. When visiting a doctor, be specific about symptoms. Family members often accompany patients to appointments for support.',
    quiz: [
      {
        question: 'How do you say "I have a headache"?',
        answer: 'আমার মাথা ব্যথা করছে'
      },
      {
        question: 'Translate: I am going to the doctor',
        answer: 'আমি ডাক্তারের কাছে যাচ্ছি'
      }
    ]
  },
  {
    id: 18,
    title: 'Weather and Seasons',
    description: 'Discuss weather conditions and seasons in Bengali',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'গরম - Hot - gorom',
      'ঠান্ডা - Cold - thanda',
      'বৃষ্টি - Rain - brishti',
      'সূর্য - Sun - surjo',
      'মেঘ - Cloud - megh',
      'হাওয়া - Wind - hawa',
      'বর্ষা - Monsoon / Rainy season - borsha',
      'শীত - Winter - sheet',
      'গ্রীষ্ম - Summer - grishsho',
      'হলুদ আকাশ - Yellow sky / Sunny sky - holud akash'
    ],
    sentences: [
      'আজ খুব গরম - Today is very hot - aj khub gorom',
      'বৃষ্টি হচ্ছে - It is raining - brishti hocche',
      'আপনি কি শীত পছন্দ করেন - Do you like winter - apni ki sheet pochhondo koren',
      'আজ ঠান্ডা - It is cold today - aj thanda',
      'হাওয়া বইছে - Wind is blowing - hawa boiche',
      'তুমি বর্ষা পছন্দ করো? - Do you like the monsoon - tumi borsha pochhondo koro',
      'আজ কেমন আবহাওয়া - How is the weather today - aj kemon abohawa'
    ],
    grammar: 'আজ (today) + weather adjective describes current conditions. পছন্দ করেন/করো = like/prefer (formal/informal). হচ্ছে indicates ongoing action "is happening".',
    culturalNote: 'Weather is a popular conversation topic in Bengal. The monsoon season (বর্ষা) is culturally significant, bringing relief from summer heat but also flooding challenges. Bengalis have a deep connection to seasonal changes.',
    quiz: [
      {
        question: 'How do you say "It is raining"?',
        answer: 'বৃষ্টি হচ্ছে'
      },
      {
        question: 'Translate: Today is very hot',
        answer: 'আজ খুব গরম'
      }
    ]
  },
  {
    id: 19,
    title: 'Entertainment and Hobbies',
    description: 'Talk about your hobbies and entertainment preferences',
    category: 'Intermediate',
    unlockType: 'premium',
    words: [
      'পড়া - Read / Study - pora',
      'লেখা - Write - lekha',
      'গাওয়া - Sing - gawa',
      'গেম খেলা - Playing games - game khela',
      'সঙ্গীত - Music - shongit',
      'নাচ - Dance - nach',
      'চলচ্চিত্র - Movie / Film - cholocchitro',
      'চিত্রাঙ্কন - Drawing / Art - chitronkon',
      'খেলাধুলা - Sports - kheladhula'
    ],
    sentences: [
      'আমি গান শুনি - I listen to music - ami gan shuni',
      'আপনি কি ছবি আঁকেন - Do you draw pictures? (formal) - apni ki chobi aken',
      'আমি খেলাধুলা করি - I play sports - ami kheladhula kori',
      'আমি গেম খেলি - I play games - ami game kheli',
      'তুমি নাচ করো? - Do you dance - tumi nach koro?',
      'আমি ছবি আঁকি - I draw pictures - ami chobi aki',
      'আপনি কী করেন অবসর সময়ে - What do you do in your free time - apni ki koren obosor shomoye',
      'তুমি কী করো ফ্রি টাইমে - What do you do in your free time - tumi ki koro free time-e'
    ],
    grammar: 'Hobby verbs use simple present tense: আমি + verb করি (I do). কি is used for yes/no questions. অবসর সময়ে = in free time (formal), ফ্রি টাইমে is casual English borrowing.',
    culturalNote: 'Bengalis have rich cultural traditions in music, dance, and literature. Rabindra Sangeet (Tagore\'s songs) is beloved. Cricket and football are popular sports. Sharing hobbies builds social connections.',
    quiz: [
      {
        question: 'How do you say "I listen to music"?',
        answer: 'আমি গান শুনি'
      },
      {
        question: 'Translate: Do you dance?',
        answer: 'তুমি নাচ করো?'
      }
    ]
  },
  {
    id: 20,
    title: 'Review and Simple Conversations',
    description: 'Practice comprehensive conversations using all learned concepts',
    category: 'Advanced',
    unlockType: 'premium',
    words: [
      'নমস্কার - Hello (formal) - nomoshkar',
      'হ্যালো - Hello (informal) - hello',
      'বিদায় - Goodbye - biday',
      'আপনি / তুমি - You (formal / informal) - apni / tumi',
      'আমি - I - ami',
      'ভালো / খারাপ - Good / Bad - bhalo / kharap',
      'কেমন - How - kemon',
      'কোথায় - Where - kothay',
      'চাই / দরকার - Want / Need - chai / dorkar'
    ],
    sentences: [
      'আপনি কেমন - How are you - apni kemon',
      'আমি ভালো - I am fine - ami bhalo',
      'আপনি কোথায় যাচ্ছেন - Where are you going - apni kothay jacchen',
      'তুমি কেমন - How are you - tumi kemon',
      'আমি ক্লান্ত - I am tired - ami klanto',
      'তুমি কোথায় যাচ্ছো - Where are you going - tumi kothay jaccho',
      'নমস্কার, আপনি কেমন - Hello, how are you - nomoshkar, apni kemon',
      'আমি ভালো, ধন্যবাদ - I am fine, thank you - ami bhalo, dhonnobad',
      'হ্যালো, তুমি কেমন - Hi, how are you - hello, tumi kemon'
    ],
    grammar: 'This lesson reviews key patterns: greetings, asking/answering "how are you", discussing destinations, and expressing needs. Focus on formal (আপনি) vs informal (তুমি) contexts.',
    culturalNote: 'Mastering these conversational basics allows you to navigate daily interactions in Bengali-speaking regions. Remember: formality shows respect, casual speech builds closeness. Context determines which to use.',
    quiz: [
      {
        question: 'How do you say "How are you?" (informal)?',
        answer: 'তুমি কেমন'
      },
      {
        question: 'Translate: I am tired',
        answer: 'আমি ক্লান্ত'
      }
    ]
  },

  // ENGLISH LESSONS (21-40) - Lessons 1-4 Free, 5-20 Premium
  // FREE ENGLISH LESSONS (21-24)
  {
    id: 21,
    title: 'Lesson 1: Greetings & Introductions',
    description: 'Learn essential English greetings and how to introduce yourself',
    category: 'Beginner',
    language: 'English',
    unlockType: 'free',
    words: [
      'Hello - নমস্কার - hello',
      'Goodbye - বিদায় - goodbye',
      'Please - দয়া করে - please',
      'Thank you - ধন্যবাদ - thank you',
      'Yes - হ্যাঁ - yes',
      'No - না - no',
      'Name - নাম - name',
      'Nice - সুন্দর - nice'
    ],
    sentences: [
      'Hello! - নমস্কার! - hello',
      'What is your name? - আপনার নাম কী? - what is your name',
      'My name is John. - আমার নাম জন। - my name is john',
      'Nice to meet you. - আপনার সাথে দেখা করে ভালো লাগলো। - nice to meet you',
      'How are you? - আপনি কেমন আছেন? - how are you',
      'I am fine, thank you. - আমি ভালো আছি, ধন্যবাদ। - i am fine thank you',
      'Goodbye! - বিদায়! - goodbye',
      'See you later! - পরে দেখা হবে! - see you later',
      'Please help me. - দয়া করে আমাকে সাহায্য করুন। - please help me',
      'Thank you very much! - অনেক ধন্যবাদ! - thank you very much'
    ],
    grammar: 'In English, greetings are essential for polite conversation. "How are you?" is a common greeting.',
    culturalNote: 'English speakers value politeness and often use "please" and "thank you" in conversations.'
  },
  {
    id: 22,
    title: 'Lesson 2: Numbers & Counting',
    description: 'Master numbers from 1-20 and basic counting',
    category: 'Beginner',
    language: 'English',
    unlockType: 'free',
    words: [
      'One - এক - one',
      'Two - দুই - two',
      'Three - তিন - three',
      'Four - চার - four',
      'Five - পাঁচ - five',
      'Ten - দশ - ten',
      'Twenty - বিশ - twenty',
      'Number - সংখ্যা - number'
    ],
    sentences: [
      'I have one book. - আমার একটি বই আছে। - i have one book',
      'There are two apples. - দুটি আপেল আছে। - there are two apples',
      'I am five years old. - আমার বয়স পাঁচ বছর। - i am five years old',
      'Count to ten. - দশ পর্যন্ত গণনা করুন। - count to ten',
      'I see three birds. - আমি তিনটি পাখি দেখতে পাচ্ছি। - i see three birds',
      'Give me four pencils. - আমাকে চারটি পেন্সিল দিন। - give me four pencils',
      'She has ten fingers. - তার দশটি আঙুল আছে। - she has ten fingers',
      'I need twenty dollars. - আমার বিশ ডলার দরকার। - i need twenty dollars',
      'Can you count? - তুমি কি গণনা করতে পারো? - can you count',
      'How many books? - কতগুলো বই? - how many books'
    ],
    grammar: 'Numbers are used with nouns. For example: "one book", "two apples". Use "How many" to ask about quantity.',
    culturalNote: 'Counting is universal, but different cultures may have different number systems or counting methods.'
  },
  {
    id: 23,
    title: 'Lesson 3: Colors',
    description: 'Identify and describe colors in everyday objects',
    category: 'Beginner',
    language: 'English',
    unlockType: 'free',
    words: [
      'Red - লাল - red',
      'Blue - নীল - blue',
      'Green - সবুজ - green',
      'Yellow - হলুদ - yellow',
      'Black - কালো - black',
      'White - সাদা - white',
      'Pink - গোলাপী - pink',
      'Color - রঙ - color'
    ],
    sentences: [
      'The sky is blue. - আকাশ নীল। - the sky is blue',
      'I like red flowers. - আমি লাল ফুল পছন্দ করি। - i like red flowers',
      'This is a green tree. - এটি একটি সবুজ গাছ। - this is a green tree',
      'The sun is yellow. - সূর্য হলুদ। - the sun is yellow',
      'My car is black. - আমার গাড়ি কালো। - my car is black',
      'The snow is white. - বরফ সাদা। - the snow is white',
      'She wears a pink dress. - সে গোলাপী পোশাক পরে। - she wears a pink dress',
      'What is your favorite color? - তোমার প্রিয় রঙ কী? - what is your favorite color',
      'I see many colors. - আমি অনেক রঙ দেখি। - i see many colors',
      'The apple is red. - আপেলটি লাল। - the apple is red'
    ],
    grammar: 'Colors are adjectives that describe nouns. They come before the noun in English (e.g., "red car").',
    culturalNote: 'Colors have cultural meanings. For example, white often represents purity in Western cultures.'
  },
  {
    id: 24,
    title: 'Lesson 4: Family Members',
    description: 'Learn vocabulary for family relationships',
    category: 'Beginner',
    language: 'English',
    unlockType: 'free',
    words: [
      'Mother - মা - mother',
      'Father - বাবা - father',
      'Brother - ভাই - brother',
      'Sister - বোন - sister',
      'Grandmother - দাদী/নানী - grandmother',
      'Grandfather - দাদা/নানা - grandfather',
      'Family - পরিবার - family',
      'Parents - পিতামাতা - parents'
    ],
    sentences: [
      'This is my mother. - এই আমার মা। - this is my mother',
      'My father is tall. - আমার বাবা লম্বা। - my father is tall',
      'I have one brother. - আমার একটি ভাই আছে। - i have one brother',
      'My sister is young. - আমার বোন ছোট। - my sister is young',
      'I love my family. - আমি আমার পরিবারকে ভালোবাসি। - i love my family',
      'Where is your grandmother? - তোমার দাদী কোথায়? - where is your grandmother',
      'My grandfather is old. - আমার দাদা বৃদ্ধ। - my grandfather is old',
      'We are a happy family. - আমরা একটি সুখী পরিবার। - we are a happy family',
      'My parents work hard. - আমার পিতামাতা কঠোর পরিশ্রম করেন। - my parents work hard',
      'Do you have siblings? - তোমার কি ভাই-বোন আছে? - do you have siblings'
    ],
    grammar: 'Possessive pronouns like "my", "your", "his", "her" show ownership (e.g., "my mother").',
    culturalNote: 'Family is important in most cultures. English has specific terms for each family member.'
  },

  // PREMIUM ENGLISH LESSONS (25-44) - Individual purchase at $2 each
  {
    id: 25,
    title: 'Lesson 5: Days of the Week',
    description: 'Master the seven days and related expressions',
    category: 'Intermediate',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Monday - সোমবার - monday',
      'Tuesday - মঙ্গলবার - tuesday',
      'Wednesday - বুধবার - wednesday',
      'Thursday - বৃহস্পতিবার - thursday',
      'Friday - শুক্রবার - friday',
      'Saturday - শনিবার - saturday',
      'Sunday - রবিবার - sunday',
      'Week - সপ্তাহ - week'
    ],
    sentences: [
      'Today is Monday. - আজ সোমবার। - today is monday',
      'I work on Tuesday. - আমি মঙ্গলবার কাজ করি। - i work on tuesday',
      'Wednesday is a busy day. - বুধবার একটি ব্যস্ত দিন। - wednesday is a busy day',
      'We meet on Thursday. - আমরা বৃহস্পতিবার মিলিত হই। - we meet on thursday',
      'Friday is the last working day. - শুক্রবার শেষ কাজের দিন। - friday is the last working day',
      'I rest on Saturday. - আমি শনিবার বিশ্রাম নিই। - i rest on saturday',
      'Sunday is a holiday. - রবিবার একটি ছুটির দিন। - sunday is a holiday',
      'What day is today? - আজ কী বার? - what day is today',
      'There are seven days in a week. - একটি সপ্তাহে সাত দিন আছে। - there are seven days in a week',
      'I like weekends. - আমি সপ্তাহান্ত পছন্দ করি। - i like weekends'
    ],
    grammar: 'Days of the week are always capitalized in English. Use "on" with days (e.g., "on Monday").',
    culturalNote: 'In many Western cultures, the weekend is Saturday and Sunday, while the work week starts on Monday.'
  },
  {
    id: 26,
    title: 'Lesson 6: Months of the Year',
    description: 'Learn all twelve months and seasonal references',
    category: 'Intermediate',
    language: 'English',
    unlockType: 'premium',
    words: [
      'January - জানুয়ারী - january',
      'February - ফেব্রুয়ারী - february',
      'March - মার্চ - march',
      'April - এপ্রিল - april',
      'May - মে - may',
      'June - জুন - june',
      'July - জুলাই - july',
      'August - আগস্ট - august'
    ],
    sentences: [
      'January is cold. - জানুয়ারী ঠান্ডা। - january is cold',
      'My birthday is in February. - আমার জন্মদিন ফেব্রুয়ারীতে। - my birthday is in february',
      'Spring starts in March. - বসন্ত মার্চে শুরু হয়। - spring starts in march',
      'April has thirty days. - এপ্রিলে ত্রিশ দিন আছে। - april has thirty days',
      'May is beautiful. - মে সুন্দর। - may is beautiful',
      'School ends in June. - স্কুল জুনে শেষ হয়। - school ends in june',
      'July is very hot. - জুলাই খুব গরম। - july is very hot',
      'August is the eighth month. - আগস্ট অষ্টম মাস। - august is the eighth month',
      'What month is it? - এটি কোন মাস? - what month is it',
      'There are twelve months in a year. - একটি বছরে বারো মাস আছে। - there are twelve months in a year'
    ],
    grammar: 'Months are always capitalized. Use "in" with months (e.g., "in January").',
    culturalNote: 'Different cultures celebrate different holidays throughout the year, often tied to specific months.'
  },
  {
    id: 27,
    title: 'Lesson 7: Weather',
    description: 'Describe weather conditions and temperature',
    category: 'Intermediate',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Sunny - রৌদ্রোজ্জ্বল - sunny',
      'Rainy - বৃষ্টিপাত - rainy',
      'Cloudy - মেঘলা - cloudy',
      'Windy - ঝড়ো - windy',
      'Hot - গরম - hot',
      'Cold - ঠান্ডা - cold',
      'Snow - বরফ - snow',
      'Weather - আবহাওয়া - weather'
    ],
    sentences: [
      'It is sunny today. - আজ রৌদ্রোজ্জ্বল। - it is sunny today',
      'It is raining outside. - বাইরে বৃষ্টি হচ্ছে। - it is raining outside',
      'The sky is cloudy. - আকাশ মেঘলা। - the sky is cloudy',
      'It is very windy. - এটি খুব ঝড়ো। - it is very windy',
      'Today is hot. - আজ গরম। - today is hot',
      'Winter is cold. - শীতকাল ঠান্ডা। - winter is cold',
      'It will snow tomorrow. - আগামীকাল বরফ পড়বে। - it will snow tomorrow',
      'How is the weather? - আবহাওয়া কেমন? - how is the weather',
      'The weather is nice. - আবহাওয়া সুন্দর। - the weather is nice',
      'I love sunny days. - আমি রৌদ্রোজ্জ্বল দিন পছন্দ করি। - i love sunny days'
    ],
    grammar: 'Use "it is" to describe weather (e.g., "It is sunny"). Weather adjectives describe conditions.',
    culturalNote: 'Weather is a common conversation topic in English-speaking countries, especially in the UK.'
  },
  {
    id: 28,
    title: 'Lesson 8: Food & Drinks',
    description: 'Essential vocabulary for meals and beverages',
    category: 'Intermediate',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Food - খাবার - food',
      'Water - পানি - water',
      'Bread - রুটি - bread',
      'Rice - ভাত - rice',
      'Apple - আপেল - apple',
      'Milk - দুধ - milk',
      'Tea - চা - tea',
      'Coffee - কফি - coffee'
    ],
    sentences: [
      'I like food. - আমি খাবার পছন্দ করি। - i like food',
      'Can I have water? - আমি কি পানি পেতে পারি? - can i have water',
      'I eat bread for breakfast. - আমি সকালের নাস্তায় রুটি খাই। - i eat bread for breakfast',
      'We eat rice every day. - আমরা প্রতিদিন ভাত খাই। - we eat rice every day',
      'This apple is delicious. - এই আপেলটি সুস্বাদু। - this apple is delicious',
      'Children drink milk. - শিশুরা দুধ পান করে। - children drink milk',
      'I want tea. - আমি চা চাই। - i want tea',
      'Do you like coffee? - তুমি কি কফি পছন্দ করো? - do you like coffee',
      'Food is important. - খাবার গুরুত্বপূর্ণ। - food is important',
      'I am hungry. - আমার ক্ষুধা লেগেছে। - i am hungry'
    ],
    grammar: 'Use "eat" for solid food and "drink" for liquids. "I like" expresses preferences.',
    culturalNote: 'Different cultures have different staple foods. Rice is common in Asia, bread in Europe and America.'
  },
  {
    id: 29,
    title: 'Lesson 9: Animals',
    description: 'Learn names of common animals',
    category: 'Intermediate',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Dog - কুকুর - dog',
      'Cat - বিড়াল - cat',
      'Bird - পাখি - bird',
      'Fish - মাছ - fish',
      'Cow - গরু - cow',
      'Horse - ঘোড়া - horse',
      'Elephant - হাতি - elephant',
      'Animal - প্রাণী - animal'
    ],
    sentences: [
      'I have a dog. - আমার একটি কুকুর আছে। - i have a dog',
      'The cat is sleeping. - বিড়ালটি ঘুমাচ্ছে। - the cat is sleeping',
      'Birds can fly. - পাখিরা উড়তে পারে। - birds can fly',
      'Fish live in water. - মাছ পানিতে বাস করে। - fish live in water',
      'The cow gives milk. - গরু দুধ দেয়। - the cow gives milk',
      'I ride a horse. - আমি ঘোড়ায় চড়ি। - i ride a horse',
      'Elephants are big. - হাতিরা বড়। - elephants are big',
      'I love animals. - আমি প্রাণীদের ভালোবাসি। - i love animals',
      'Do you have a pet? - তোমার কি পোষা প্রাণী আছে? - do you have a pet',
      'Animals need food. - প্রাণীদের খাবার দরকার। - animals need food'
    ],
    grammar: 'Animal names are nouns. Use "a" or "an" before singular animals (e.g., "a dog").',
    culturalNote: 'Pets are popular in many cultures. Dogs and cats are the most common household pets.'
  },
  {
    id: 30,
    title: 'Lesson 10: Body Parts',
    description: 'Identify parts of the human body',
    category: 'Intermediate',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Head - মাথা - head',
      'Eye - চোখ - eye',
      'Nose - নাক - nose',
      'Mouth - মুখ - mouth',
      'Ear - কান - ear',
      'Hand - হাত - hand',
      'Leg - পা - leg',
      'Foot - পা - foot'
    ],
    sentences: [
      'My head hurts. - আমার মাথা ব্যথা করছে। - my head hurts',
      'I have two eyes. - আমার দুটি চোখ আছে। - i have two eyes',
      'Touch your nose. - তোমার নাক স্পর্শ করো। - touch your nose',
      'Open your mouth. - তোমার মুখ খোলো। - open your mouth',
      'I hear with my ears. - আমি আমার কান দিয়ে শুনি। - i hear with my ears',
      'Wash your hands. - তোমার হাত ধোও। - wash your hands',
      'My leg is strong. - আমার পা শক্তিশালী। - my leg is strong',
      'I walk with my feet. - আমি আমার পা দিয়ে হাঁটি। - i walk with my feet',
      'The body is amazing. - শরীর অসাধারণ। - the body is amazing',
      'Take care of your body. - তোমার শরীরের যত্ন নাও। - take care of your body'
    ],
    grammar: 'Use possessive pronouns with body parts (e.g., "my hand", "your nose").',
    culturalNote: 'Understanding body parts is essential for health and communication, especially in emergencies.'
  },
  {
    id: 31,
    title: 'Lesson 11: Clothes',
    description: 'Vocabulary for common clothing items',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Shirt - শার্ট - shirt',
      'Pants - প্যান্ট - pants',
      'Dress - পোশাক - dress',
      'Shoes - জুতা - shoes',
      'Hat - টুপি - hat',
      'Coat - কোট - coat',
      'Socks - মোজা - socks',
      'Clothes - কাপড় - clothes'
    ],
    sentences: [
      'I wear a shirt. - আমি একটি শার্ট পরি। - i wear a shirt',
      'These pants are blue. - এই প্যান্টগুলো নীল। - these pants are blue',
      'She has a beautiful dress. - তার একটি সুন্দর পোশাক আছে। - she has a beautiful dress',
      'My shoes are new. - আমার জুতা নতুন। - my shoes are new',
      'I wear a hat in summer. - আমি গ্রীষ্মে টুপি পরি। - i wear a hat in summer',
      'The coat is warm. - কোটটি উষ্ণ। - the coat is warm',
      'I need clean socks. - আমার পরিষ্কার মোজা দরকার। - i need clean socks',
      'Wash your clothes. - তোমার কাপড় ধোও। - wash your clothes',
      'What are you wearing? - তুমি কী পরেছো? - what are you wearing',
      'I like new clothes. - আমি নতুন কাপড় পছন্দ করি। - i like new clothes'
    ],
    grammar: 'Use "wear" with clothing. Some clothing items are plural (pants, shoes, socks).',
    culturalNote: 'Clothing varies by culture and climate. Formal and casual dress codes differ across societies.'
  },
  {
    id: 32,
    title: 'Lesson 12: At School',
    description: 'Essential school and education vocabulary',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'School - স্কুল - school',
      'Teacher - শিক্ষক - teacher',
      'Student - ছাত্র - student',
      'Book - বই - book',
      'Pencil - পেন্সিল - pencil',
      'Classroom - ক্লাসরুম - classroom',
      'Learn - শিখা - learn',
      'Study - পড়া - study'
    ],
    sentences: [
      'I go to school. - আমি স্কুলে যাই। - i go to school',
      'My teacher is kind. - আমার শিক্ষক দয়ালু। - my teacher is kind',
      'I am a student. - আমি একজন ছাত্র। - i am a student',
      'This is my book. - এটি আমার বই। - this is my book',
      'Can I borrow a pencil? - আমি কি একটি পেন্সিল ধার নিতে পারি? - can i borrow a pencil',
      'The classroom is clean. - ক্লাসরুমটি পরিষ্কার। - the classroom is clean',
      'I want to learn English. - আমি ইংরেজি শিখতে চাই। - i want to learn english',
      'I study every day. - আমি প্রতিদিন পড়ি। - i study every day',
      'School is important. - স্কুল গুরুত্বপূর্ণ। - school is important',
      'Do you like school? - তুমি কি স্কুল পছন্দ করো? - do you like school'
    ],
    grammar: '"Go to" is used with places like school. "Learn" means to acquire knowledge.',
    culturalNote: 'Education is valued worldwide. School systems vary, but learning is universal.'
  },
  {
    id: 33,
    title: 'Lesson 13: Time',
    description: 'Tell time and use time expressions',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Time - সময় - time',
      'Hour - ঘণ্টা - hour',
      'Minute - মিনিট - minute',
      'Morning - সকাল - morning',
      'Afternoon - দুপুর - afternoon',
      'Evening - সন্ধ্যা - evening',
      'Night - রাত - night',
      'Clock - ঘড়ি - clock'
    ],
    sentences: [
      'What time is it? - এখন কয়টা বাজে? - what time is it',
      'It is three o\'clock. - তিনটা বাজে। - it is three oclock',
      'One hour has sixty minutes. - এক ঘণ্টায় ষাট মিনিট থাকে। - one hour has sixty minutes',
      'Good morning! - সুপ্রভাত! - good morning',
      'I eat lunch in the afternoon. - আমি দুপুরে দুপুরের খাবার খাই। - i eat lunch in the afternoon',
      'The evening is beautiful. - সন্ধ্যা সুন্দর। - the evening is beautiful',
      'Good night! - শুভ রাত্রি! - good night',
      'Look at the clock. - ঘড়িটি দেখো। - look at the clock',
      'Time is important. - সময় গুরুত্বপূর্ণ। - time is important',
      'I wake up in the morning. - আমি সকালে ঘুম থেকে উঠি। - i wake up in the morning'
    ],
    grammar: 'Use "What time is it?" to ask the time. "O\'clock" is used for exact hours.',
    culturalNote: 'Time management is valued in many cultures. Being punctual shows respect.'
  },
  {
    id: 34,
    title: 'Lesson 14: Places in Town',
    description: 'Learn vocabulary for common locations',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'House - বাড়ি - house',
      'Shop - দোকান - shop',
      'Park - পার্ক - park',
      'Hospital - হাসপাতাল - hospital',
      'Bank - ব্যাংক - bank',
      'Restaurant - রেস্তোরাঁ - restaurant',
      'Library - লাইব্রেরি - library',
      'Market - বাজার - market'
    ],
    sentences: [
      'I live in a house. - আমি একটি বাড়িতে থাকি। - i live in a house',
      'Let\'s go to the shop. - চলো দোকানে যাই। - lets go to the shop',
      'Children play in the park. - শিশুরা পার্কে খেলে। - children play in the park',
      'The hospital is big. - হাসপাতালটি বড়। - the hospital is big',
      'I need to go to the bank. - আমাকে ব্যাংকে যেতে হবে। - i need to go to the bank',
      'We eat at the restaurant. - আমরা রেস্তোরাঁয় খাই। - we eat at the restaurant',
      'I read books in the library. - আমি লাইব্রেরিতে বই পড়ি। - i read books in the library',
      'The market is crowded. - বাজারটি জনাকীর্ণ। - the market is crowded',
      'Where is the hospital? - হাসপাতাল কোথায়? - where is the hospital',
      'I like this town. - আমি এই শহর পছন্দ করি। - i like this town'
    ],
    grammar: 'Use "in" with enclosed spaces (in the house) and "at" with specific locations (at the bank).',
    culturalNote: 'Town layouts vary by culture. Knowing place names helps with navigation and daily life.'
  },
  {
    id: 35,
    title: 'Lesson 15: Directions',
    description: 'Give and understand directions',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Left - বাম - left',
      'Right - ডান - right',
      'Straight - সোজা - straight',
      'Near - কাছে - near',
      'Far - দূরে - far',
      'Here - এখানে - here',
      'There - সেখানে - there',
      'Where - কোথায় - where'
    ],
    sentences: [
      'Turn left. - বাম দিকে ঘুরুন। - turn left',
      'Turn right. - ডান দিকে ঘুরুন। - turn right',
      'Go straight. - সোজা যাও। - go straight',
      'The shop is near. - দোকানটি কাছে। - the shop is near',
      'The city is far. - শহরটি দূরে। - the city is far',
      'Come here. - এখানে এসো। - come here',
      'It is over there. - এটি সেখানে আছে। - it is over there',
      'Where is the bank? - ব্যাংক কোথায়? - where is the bank',
      'I am lost. - আমি হারিয়ে গেছি। - i am lost',
      'Can you help me? - তুমি কি আমাকে সাহায্য করতে পারো? - can you help me'
    ],
    grammar: 'Imperatives (commands) don\'t need a subject (e.g., "Turn left", not "You turn left").',
    culturalNote: 'Giving clear directions is helpful. In some cultures, people use landmarks rather than street names.'
  },
  {
    id: 36,
    title: 'Lesson 16: Actions & Verbs',
    description: 'Common action verbs in daily life',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Run - দৌড়ানো - run',
      'Jump - লাফানো - jump',
      'Sit - বসা - sit',
      'Stand - দাঁড়ানো - stand',
      'Walk - হাঁটা - walk',
      'Sleep - ঘুমানো - sleep',
      'Read - পড়া - read',
      'Write - লেখা - write'
    ],
    sentences: [
      'I run fast. - আমি দ্রুত দৌড়াই। - i run fast',
      'Can you jump? - তুমি কি লাফাতে পারো? - can you jump',
      'Please sit down. - দয়া করে বসুন। - please sit down',
      'Stand up! - দাঁড়াও! - stand up',
      'I walk to school. - আমি স্কুলে হাঁটি। - i walk to school',
      'I sleep at night. - আমি রাতে ঘুমাই। - i sleep at night',
      'I read books. - আমি বই পড়ি। - i read books',
      'I write letters. - আমি চিঠি লিখি। - i write letters',
      'What do you do? - তুমি কী করো? - what do you do',
      'I like to play. - আমি খেলতে পছন্দ করি। - i like to play'
    ],
    grammar: 'Action verbs describe what someone does. Use "can" to express ability (e.g., "I can run").',
    culturalNote: 'Physical activity is valued in many cultures. Regular exercise is considered important for health.'
  },
  {
    id: 37,
    title: 'Lesson 17: Feelings & Emotions',
    description: 'Express how you feel',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Happy - খুশি - happy',
      'Sad - দুঃখিত - sad',
      'Angry - রাগান্বিত - angry',
      'Tired - ক্লান্ত - tired',
      'Hungry - ক্ষুধার্ত - hungry',
      'Thirsty - তৃষ্ণার্ত - thirsty',
      'Excited - উত্তেজিত - excited',
      'Scared - ভীত - scared'
    ],
    sentences: [
      'I am happy. - আমি খুশি। - i am happy',
      'She looks sad. - সে দুঃখিত দেখাচ্ছে। - she looks sad',
      'He is angry. - সে রাগান্বিত। - he is angry',
      'I am very tired. - আমি খুব ক্লান্ত। - i am very tired',
      'I am hungry. - আমার ক্ষুধা লেগেছে। - i am hungry',
      'I am thirsty. - আমার তৃষ্ণা লেগেছে। - i am thirsty',
      'She is excited. - সে উত্তেজিত। - she is excited',
      'The child is scared. - শিশুটি ভীত। - the child is scared',
      'How do you feel? - তুমি কেমন অনুভব করছো? - how do you feel',
      'I feel good. - আমি ভালো অনুভব করছি। - i feel good'
    ],
    grammar: 'Use "I am" + adjective to describe feelings (e.g., "I am happy").',
    culturalNote: 'Expressing emotions openly varies by culture. Some cultures are more reserved than others.'
  },
  {
    id: 38,
    title: 'Lesson 18: Shopping',
    description: 'Essential phrases for buying and selling',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Buy - কেনা - buy',
      'Sell - বিক্রি করা - sell',
      'Price - দাম - price',
      'Money - টাকা - money',
      'Cheap - সস্তা - cheap',
      'Expensive - দামী - expensive',
      'Pay - পরিশোধ করা - pay',
      'Receipt - রসিদ - receipt'
    ],
    sentences: [
      'I want to buy this. - আমি এটি কিনতে চাই। - i want to buy this',
      'They sell fruits. - তারা ফল বিক্রি করে। - they sell fruits',
      'What is the price? - দাম কত? - what is the price',
      'I need money. - আমার টাকা দরকার। - i need money',
      'This is cheap. - এটি সস্তা। - this is cheap',
      'That is too expensive. - এটি খুব দামী। - that is too expensive',
      'I will pay cash. - আমি নগদ পরিশোধ করব। - i will pay cash',
      'Can I have a receipt? - আমি কি একটি রসিদ পেতে পারি? - can i have a receipt',
      'I like shopping. - আমি কেনাকাটা পছন্দ করি। - i like shopping',
      'How much is this? - এটি কত? - how much is this'
    ],
    grammar: 'Use "How much" to ask about price. "Too + adjective" shows excess (e.g., "too expensive").',
    culturalNote: 'Shopping customs vary. Bargaining is common in some cultures but not in others.'
  },
  {
    id: 39,
    title: 'Lesson 19: Health',
    description: 'Health-related vocabulary and expressions',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Healthy - সুস্থ - healthy',
      'Sick - অসুস্থ - sick',
      'Doctor - ডাক্তার - doctor',
      'Medicine - ওষুধ - medicine',
      'Pain - ব্যথা - pain',
      'Fever - জ্বর - fever',
      'Cough - কাশি - cough',
      'Rest - বিশ্রাম - rest'
    ],
    sentences: [
      'I am healthy. - আমি সুস্থ। - i am healthy',
      'He is sick. - সে অসুস্থ। - he is sick',
      'I need a doctor. - আমার একজন ডাক্তার দরকার। - i need a doctor',
      'Take your medicine. - তোমার ওষুধ নাও। - take your medicine',
      'I have pain. - আমার ব্যথা আছে। - i have pain',
      'She has a fever. - তার জ্বর আছে। - she has a fever',
      'I have a cough. - আমার কাশি আছে। - i have a cough',
      'You need rest. - তোমার বিশ্রাম দরকার। - you need rest',
      'Stay healthy! - সুস্থ থাকো! - stay healthy',
      'Health is important. - স্বাস্থ্য গুরুত্বপূর্ণ। - health is important'
    ],
    grammar: 'Use "have" with illnesses (e.g., "I have a fever"). "Need" expresses necessity.',
    culturalNote: 'Health care systems vary globally. Preventive care is increasingly emphasized worldwide.'
  },
  {
    id: 40,
    title: 'Lesson 20: Review & Practice',
    description: 'Comprehensive review of all previous lessons',
    category: 'Advanced',
    language: 'English',
    unlockType: 'premium',
    words: [
      'Practice - অনুশীলন - practice',
      'Remember - মনে রাখা - remember',
      'Repeat - পুনরাবৃত্তি করা - repeat',
      'Review - পুনর্বিবেচনা - review',
      'Learn - শিখা - learn',
      'Speak - কথা বলা - speak',
      'Understand - বুঝা - understand',
      'Improve - উন্নতি করা - improve'
    ],
    sentences: [
      'I practice every day. - আমি প্রতিদিন অনুশীলন করি। - i practice every day',
      'Remember the words. - শব্দগুলো মনে রাখো। - remember the words',
      'Please repeat. - দয়া করে পুনরাবৃত্তি করুন। - please repeat',
      'Let\'s review the lesson. - চলো পাঠটি পুনর্বিবেচনা করি। - lets review the lesson',
      'I want to learn English. - আমি ইংরেজি শিখতে চাই। - i want to learn english',
      'I speak English. - আমি ইংরেজি বলি। - i speak english',
      'Do you understand? - তুমি কি বুঝতে পারছো? - do you understand',
      'I want to improve. - আমি উন্নতি করতে চাই। - i want to improve',
      'Practice makes perfect. - অনুশীলন নিখুঁত করে তোলে। - practice makes perfect',
      'Keep learning! - শেখা চালিয়ে যাও! - keep learning'
    ],
    grammar: 'Review all grammar from previous lessons. Focus on sentence structure and verb usage.',
    culturalNote: 'Continuous practice is key to language learning. Patience and persistence lead to fluency.',
    quiz: [
      {
        question: 'How do you greet someone in English?',
        answer: 'Hello'
      },
      {
        question: 'What do you say when you are grateful?',
        answer: 'Thank you'
      }
    ]
  }
];

// Helper functions for lesson management
export function getLessonById(id: number): LessonContent | undefined {
  return LESSONS.find(lesson => lesson.id === id);
}

export function getFreeLessons(): LessonContent[] {
  return LESSONS.filter(lesson => lesson.unlockType === 'free');
}

export function getProgressLessons(): LessonContent[] {
  return LESSONS.filter(lesson => lesson.unlockType === 'progress');
}

export function getPremiumLessons(): LessonContent[] {
  return LESSONS.filter(lesson => lesson.unlockType === 'premium');
}

export function isLessonUnlocked(
  lessonId: number,
  completedLessons: number[],
  purchasedLessons: number[] | boolean, // Can be array of purchased lesson IDs or boolean for all premium
  isTeacher?: boolean
): boolean {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;

  // Teachers/Instructors can always access all lessons for editing
  if (isTeacher) return true;

  // Free lessons (1-4) are always unlocked
  if (lesson.unlockType === 'free') return true;

  // Premium lessons (5-20) require individual purchase or full premium access
  if (lesson.unlockType === 'premium') {
    // Check if full premium access (boolean true)
    if (typeof purchasedLessons === 'boolean') {
      return purchasedLessons;
    }
    // Check if specific lesson was purchased
    if (Array.isArray(purchasedLessons)) {
      return purchasedLessons.includes(lessonId);
    }
    return false;
  }

  return false;
}
