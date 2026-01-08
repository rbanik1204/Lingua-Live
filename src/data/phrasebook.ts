export type PhrasebookLanguage = 'Bengali' | 'Hindi' | 'English';

export type PhrasebookCategoryId =
  | 'people'
  | 'greetings'
  | 'common'
  | 'travel'
  | 'food';

export interface PhrasebookEntry {
  id: string;
  english: string;
  target: string;
  romanization?: string;
}

export interface PhrasebookCategory {
  id: PhrasebookCategoryId;
  title: string;
  entries: PhrasebookEntry[];
}

export interface PhrasebookData {
  language: PhrasebookLanguage;
  languageCode: string;
  categories: PhrasebookCategory[];
}

export const PHRASEBOOK: Record<PhrasebookLanguage, PhrasebookData> = {
  Bengali: {
    language: 'Bengali',
    languageCode: 'bn-IN',
    categories: [
      {
        id: 'people',
        title: 'People',
        entries: [
          { id: 'bn-people-1', english: 'I', target: 'আমি', romanization: 'āmi' },
          { id: 'bn-people-2', english: 'You (informal)', target: 'তুমি', romanization: 'tumi' },
          { id: 'bn-people-3', english: 'You (formal)', target: 'আপনি', romanization: 'āpni' },
          { id: 'bn-people-4', english: 'He / She', target: 'সে', romanization: 'se' },
          { id: 'bn-people-5', english: 'We', target: 'আমরা', romanization: 'āmra' },
          { id: 'bn-people-6', english: 'They', target: 'তারা', romanization: 'tārā' },
          { id: 'bn-people-7', english: 'My name is…', target: 'আমার নাম …', romanization: 'āmār nām …' },
          { id: 'bn-people-8', english: 'What is your name?', target: 'আপনার নাম কী?', romanization: 'āpnār nām kī?' },
          { id: 'bn-people-9', english: 'Nice to meet you', target: 'আপনার সাথে দেখা করে ভালো লাগলো', romanization: 'āpnār sāthe dekhā kore bhālo lāglo' },
          { id: 'bn-people-10', english: 'How are you?', target: 'আপনি কেমন আছেন?', romanization: 'āpni kemon āchen?' },
          { id: 'bn-people-11', english: 'I am fine', target: 'আমি ভালো আছি', romanization: 'āmi bhālo āchi' },
          { id: 'bn-people-12', english: 'Where are you from?', target: 'আপনি কোথা থেকে?', romanization: 'āpni kothā theke?' },
        ],
      },
      {
        id: 'greetings',
        title: 'Greetings',
        entries: [
          { id: 'bn-greet-1', english: 'Hello', target: 'হ্যালো', romanization: 'hyālō' },
          { id: 'bn-greet-2', english: 'Good morning', target: 'সুপ্রভাত', romanization: 'suprabhāt' },
          { id: 'bn-greet-3', english: 'Good afternoon', target: 'শুভ অপরাহ্ন', romanization: 'śubho aporāhno' },
          { id: 'bn-greet-4', english: 'Good evening', target: 'শুভ সন্ধ্যা', romanization: 'śubho sandhyā' },
          { id: 'bn-greet-5', english: 'Good night', target: 'শুভ রাত্রি', romanization: 'śubho rātri' },
          { id: 'bn-greet-6', english: 'Thank you', target: 'ধন্যবাদ', romanization: 'dhonnobād' },
          { id: 'bn-greet-7', english: "You're welcome", target: 'স্বাগতম', romanization: 'swāgotom' },
          { id: 'bn-greet-8', english: 'Please', target: 'দয়া করে', romanization: 'dôyā kore' },
          { id: 'bn-greet-9', english: 'Sorry', target: 'দুঃখিত', romanization: 'dukkhito' },
          { id: 'bn-greet-10', english: 'Excuse me', target: 'মাফ করবেন', romanization: 'māph korben' },
          { id: 'bn-greet-11', english: 'Yes', target: 'হ্যাঁ', romanization: 'hyā̃' },
          { id: 'bn-greet-12', english: 'No', target: 'না', romanization: 'nā' },
        ],
      },
      {
        id: 'common',
        title: 'Common Phrases',
        entries: [
          { id: 'bn-common-1', english: "I don't understand", target: 'আমি বুঝতে পারছি না', romanization: 'āmi bujhte pārchi nā' },
          { id: 'bn-common-2', english: 'Can you repeat?', target: 'আরেকবার বলবেন?', romanization: 'ārekbār bolben?' },
          { id: 'bn-common-3', english: 'Speak slowly, please', target: 'দয়া করে আস্তে বলুন', romanization: 'dôyā kore āste bolun' },
          { id: 'bn-common-4', english: 'What does this mean?', target: 'এর মানে কী?', romanization: 'er māne kī?' },
          { id: 'bn-common-5', english: 'I like it', target: 'আমার ভালো লাগে', romanization: 'āmār bhālo lāge' },
          { id: 'bn-common-6', english: "I don't like it", target: 'আমার ভালো লাগে না', romanization: 'āmār bhālo lāge nā' },
          { id: 'bn-common-7', english: 'Where is the bathroom?', target: 'টয়লেট কোথায়?', romanization: 'ṭoyleṭ kothāy?' },
          { id: 'bn-common-8', english: 'Help!', target: 'সাহায্য!', romanization: 'sāhāyyo!' },
          { id: 'bn-common-9', english: 'I need a doctor', target: 'আমার ডাক্তার দরকার', romanization: 'āmār ḍākṭār dôrকার' },
          { id: 'bn-common-10', english: 'How much is this?', target: 'এটার দাম কত?', romanization: 'eṭār dām kôto?' },
          { id: 'bn-common-11', english: 'Too expensive', target: 'খুব দামি', romanization: 'khub dāmi' },
          { id: 'bn-common-12', english: 'OK / Alright', target: 'ঠিক আছে', romanization: 'ṭhīk āche' },
        ],
      },
      {
        id: 'travel',
        title: 'Travel',
        entries: [
          { id: 'bn-travel-1', english: 'Where is…?', target: '… কোথায়?', romanization: '… kothāy?' },
          { id: 'bn-travel-2', english: 'Left', target: 'বাঁ দিকে', romanization: 'bā̃ dike' },
          { id: 'bn-travel-3', english: 'Right', target: 'ডান দিকে', romanization: 'ḍān dike' },
          { id: 'bn-travel-4', english: 'Straight ahead', target: 'সোজা', romanization: 'sojā' },
          { id: 'bn-travel-5', english: 'Near', target: 'কাছাকাছি', romanization: 'kāchākāchi' },
          { id: 'bn-travel-6', english: 'Far', target: 'দূরে', romanization: 'dūre' },
          { id: 'bn-travel-7', english: 'I need a taxi', target: 'আমার ট্যাক্সি দরকার', romanization: 'āmār ṭyāksi dôrকার' },
          { id: 'bn-travel-8', english: 'Train station', target: 'রেল স্টেশন', romanization: 'rel sṭeśon' },
          { id: 'bn-travel-9', english: 'Bus stop', target: 'বাস স্টপ', romanization: 'bās sṭop' },
          { id: 'bn-travel-10', english: 'Airport', target: 'বিমানবন্দর', romanization: 'bimānbôndôr' },
          { id: 'bn-travel-11', english: 'Ticket', target: 'টিকিট', romanization: 'ṭikiṭ' },
          { id: 'bn-travel-12', english: 'I am lost', target: 'আমি পথ হারিয়েছি', romanization: 'āmi pôth hāriyechi' },
        ],
      },
      {
        id: 'food',
        title: 'Food & Drinks',
        entries: [
          { id: 'bn-food-1', english: 'Water', target: 'পানি', romanization: 'pāni' },
          { id: 'bn-food-2', english: 'Tea', target: 'চা', romanization: 'chā' },
          { id: 'bn-food-3', english: 'Coffee', target: 'কফি', romanization: 'kôphi' },
          { id: 'bn-food-4', english: 'Rice', target: 'ভাত', romanization: 'bhāt' },
          { id: 'bn-food-5', english: 'Bread', target: 'রুটি', romanization: 'ruṭi' },
          { id: 'bn-food-6', english: 'Vegetarian', target: 'নিরামিষ', romanization: 'nirāmiṣ' },
          { id: 'bn-food-7', english: 'Spicy', target: 'ঝাল', romanization: 'jhāl' },
          { id: 'bn-food-8', english: 'Not spicy', target: 'ঝাল নয়', romanization: 'jhāl noy' },
          { id: 'bn-food-9', english: 'Delicious', target: 'সুস্বাদু', romanization: 'suśwādu' },
          { id: 'bn-food-10', english: 'I am hungry', target: 'আমার ক্ষিদে পেয়েছে', romanization: 'āmār khide peẏeche' },
          { id: 'bn-food-11', english: 'I am thirsty', target: 'আমার তৃষ্ণা পেয়েছে', romanization: 'āmār tr̥ṣṇā peẏeche' },
          { id: 'bn-food-12', english: 'The bill, please', target: 'বিলটা দিন, দয়া করে', romanization: 'bilṭā din, dôyā kore' },
        ],
      },
    ],
  },

  Hindi: {
    language: 'Hindi',
    languageCode: 'hi-IN',
    categories: [
      {
        id: 'people',
        title: 'People',
        entries: [
          { id: 'hi-people-1', english: 'I', target: 'मैं', romanization: 'main' },
          { id: 'hi-people-2', english: 'You (informal)', target: 'तुम', romanization: 'tum' },
          { id: 'hi-people-3', english: 'You (formal)', target: 'आप', romanization: 'aap' },
          { id: 'hi-people-4', english: 'He / She', target: 'वह', romanization: 'vah' },
          { id: 'hi-people-5', english: 'We', target: 'हम', romanization: 'ham' },
          { id: 'hi-people-6', english: 'They', target: 'वे', romanization: 've' },
          { id: 'hi-people-7', english: 'My name is…', target: 'मेरा नाम … है', romanization: 'merā nām … hai' },
          { id: 'hi-people-8', english: 'What is your name?', target: 'आपका नाम क्या है?', romanization: 'āpkā nām kyā hai?' },
          { id: 'hi-people-9', english: 'Nice to meet you', target: 'आपसे मिलकर खुशी हुई', romanization: 'āpse milkar khushī huī' },
          { id: 'hi-people-10', english: 'How are you?', target: 'आप कैसे हैं?', romanization: 'āp kaise hain?' },
          { id: 'hi-people-11', english: 'I am fine', target: 'मैं ठीक हूँ', romanization: 'main ṭhīk hū̃' },
          { id: 'hi-people-12', english: 'Where are you from?', target: 'आप कहाँ से हैं?', romanization: 'āp kahā̃ se hain?' },
        ],
      },
      {
        id: 'greetings',
        title: 'Greetings',
        entries: [
          { id: 'hi-greet-1', english: 'Hello', target: 'नमस्ते', romanization: 'namaste' },
          { id: 'hi-greet-2', english: 'Good morning', target: 'सुप्रभात', romanization: 'suprabhāt' },
          { id: 'hi-greet-3', english: 'Good afternoon', target: 'शुभ दोपहर', romanization: 'śubh dopahar' },
          { id: 'hi-greet-4', english: 'Good evening', target: 'शुभ संध्या', romanization: 'śubh sandhyā' },
          { id: 'hi-greet-5', english: 'Good night', target: 'शुभ रात्रि', romanization: 'śubh rātri' },
          { id: 'hi-greet-6', english: 'Thank you', target: 'धन्यवाद', romanization: 'dhanyavād' },
          { id: 'hi-greet-7', english: "You're welcome", target: 'कोई बात नहीं', romanization: 'koi bāt nahī̃' },
          { id: 'hi-greet-8', english: 'Please', target: 'कृपया', romanization: 'kr̥payā' },
          { id: 'hi-greet-9', english: 'Sorry', target: 'माफ़ कीजिए', romanization: 'māf kījie' },
          { id: 'hi-greet-10', english: 'Excuse me', target: 'सुनिए', romanization: 'suniye' },
          { id: 'hi-greet-11', english: 'Yes', target: 'हाँ', romanization: 'hā̃' },
          { id: 'hi-greet-12', english: 'No', target: 'नहीं', romanization: 'nahī̃' },
        ],
      },
      {
        id: 'common',
        title: 'Common Phrases',
        entries: [
          { id: 'hi-common-1', english: "I don't understand", target: 'मुझे समझ नहीं आया', romanization: 'mujhe samajh nahī̃ āyā' },
          { id: 'hi-common-2', english: 'Can you repeat?', target: 'क्या आप फिर से कह सकते हैं?', romanization: 'kyā āp phir se kah sakte hain?' },
          { id: 'hi-common-3', english: 'Speak slowly, please', target: 'कृपया धीरे बोलिए', romanization: 'kr̥payā dhīre bolie' },
          { id: 'hi-common-4', english: 'What does this mean?', target: 'इसका क्या मतलब है?', romanization: 'iskā kyā matlab hai?' },
          { id: 'hi-common-5', english: 'I like it', target: 'मुझे यह पसंद है', romanization: 'mujhe yah pasand hai' },
          { id: 'hi-common-6', english: "I don't like it", target: 'मुझे यह पसंद नहीं है', romanization: 'mujhe yah pasand nahī̃ hai' },
          { id: 'hi-common-7', english: 'Where is the bathroom?', target: 'शौचालय कहाँ है?', romanization: 'śauchālay kahā̃ hai?' },
          { id: 'hi-common-8', english: 'Help!', target: 'मदद!', romanization: 'madad!' },
          { id: 'hi-common-9', english: 'I need a doctor', target: 'मुझे डॉक्टर चाहिए', romanization: 'mujhe ḍॉक्टर chāhiye' },
          { id: 'hi-common-10', english: 'How much is this?', target: 'यह कितने का है?', romanization: 'yah kitne kā hai?' },
          { id: 'hi-common-11', english: 'Too expensive', target: 'बहुत महँगा', romanization: 'bahut mahangā' },
          { id: 'hi-common-12', english: 'OK / Alright', target: 'ठीक है', romanization: 'ṭhīk hai' },
        ],
      },
      {
        id: 'travel',
        title: 'Travel',
        entries: [
          { id: 'hi-travel-1', english: 'Where is…?', target: '… कहाँ है?', romanization: '… kahā̃ hai?' },
          { id: 'hi-travel-2', english: 'Left', target: 'बाएँ', romanization: 'bāẽ' },
          { id: 'hi-travel-3', english: 'Right', target: 'दाएँ', romanization: 'dāẽ' },
          { id: 'hi-travel-4', english: 'Straight ahead', target: 'सीधे', romanization: 'sīdhe' },
          { id: 'hi-travel-5', english: 'Near', target: 'पास', romanization: 'pās' },
          { id: 'hi-travel-6', english: 'Far', target: 'दूर', romanization: 'dūr' },
          { id: 'hi-travel-7', english: 'I need a taxi', target: 'मुझे टैक्सी चाहिए', romanization: 'mujhe ṭaिक्सी chāhiye' },
          { id: 'hi-travel-8', english: 'Train station', target: 'रेलवे स्टेशन', romanization: 'relve sṭeśan' },
          { id: 'hi-travel-9', english: 'Bus stop', target: 'बस स्टॉप', romanization: 'bas sṭop' },
          { id: 'hi-travel-10', english: 'Airport', target: 'हवाई अड्डा', romanization: 'havāī aḍḍā' },
          { id: 'hi-travel-11', english: 'Ticket', target: 'टिकट', romanization: 'ṭikaṭ' },
          { id: 'hi-travel-12', english: 'I am lost', target: 'मैं रास्ता भूल गया/गई हूँ', romanization: 'main rāstā bhūl gayā/gaī hū̃' },
        ],
      },
      {
        id: 'food',
        title: 'Food & Drinks',
        entries: [
          { id: 'hi-food-1', english: 'Water', target: 'पानी', romanization: 'pānī' },
          { id: 'hi-food-2', english: 'Tea', target: 'चाय', romanization: 'chāy' },
          { id: 'hi-food-3', english: 'Coffee', target: 'कॉफ़ी', romanization: 'kॉfī' },
          { id: 'hi-food-4', english: 'Rice', target: 'चावल', romanization: 'chāval' },
          { id: 'hi-food-5', english: 'Bread', target: 'रोटी', romanization: 'roṭī' },
          { id: 'hi-food-6', english: 'Vegetarian', target: 'शाकाहारी', romanization: 'śākāhārī' },
          { id: 'hi-food-7', english: 'Spicy', target: 'तीखा', romanization: 'tīkhā' },
          { id: 'hi-food-8', english: 'Not spicy', target: 'कम तीखा', romanization: 'kam tīkhā' },
          { id: 'hi-food-9', english: 'Delicious', target: 'बहुत स्वादिष्ट', romanization: 'bahut swādiṣṭ' },
          { id: 'hi-food-10', english: 'I am hungry', target: 'मुझे भूख लगी है', romanization: 'mujhe bhūkh lagī hai' },
          { id: 'hi-food-11', english: 'I am thirsty', target: 'मुझे प्यास लगी है', romanization: 'mujhe pyās lagī hai' },
          { id: 'hi-food-12', english: 'The bill, please', target: 'बिल दीजिए, कृपया', romanization: 'bil dījie, kr̥payā' },
        ],
      },
    ],
  },

  English: {
    language: 'English',
    languageCode: 'en-GB',
    categories: [
      {
        id: 'people',
        title: 'People',
        entries: [
          { id: 'en-people-1', english: 'I', target: 'I', romanization: 'eye' },
          { id: 'en-people-2', english: 'You', target: 'You', romanization: 'yoo' },
          { id: 'en-people-3', english: 'He', target: 'He', romanization: 'hee' },
          { id: 'en-people-4', english: 'She', target: 'She', romanization: 'shee' },
          { id: 'en-people-5', english: 'We', target: 'We', romanization: 'wee' },
          { id: 'en-people-6', english: 'They', target: 'They', romanization: 'thay' },
          { id: 'en-people-7', english: 'My name is…', target: 'My name is…', romanization: 'my name iz…' },
          { id: 'en-people-8', english: 'What is your name?', target: 'What is your name?', romanization: 'wot iz yor naym?' },
          { id: 'en-people-9', english: 'Nice to meet you', target: 'Nice to meet you', romanization: 'nys tuh meet yoo' },
          { id: 'en-people-10', english: 'How are you?', target: 'How are you?', romanization: 'how ar yoo?' },
          { id: 'en-people-11', english: 'I am fine', target: 'I am fine', romanization: 'eye am fyn' },
          { id: 'en-people-12', english: 'Where are you from?', target: 'Where are you from?', romanization: 'wair ar yoo from?' },
        ],
      },
      {
        id: 'greetings',
        title: 'Greetings',
        entries: [
          { id: 'en-greet-1', english: 'Hello', target: 'Hello', romanization: 'heh-LOH' },
          { id: 'en-greet-2', english: 'Good morning', target: 'Good morning', romanization: 'gud MOR-ning' },
          { id: 'en-greet-3', english: 'Good afternoon', target: 'Good afternoon', romanization: 'gud af-ter-NOON' },
          { id: 'en-greet-4', english: 'Good evening', target: 'Good evening', romanization: 'gud EE-vning' },
          { id: 'en-greet-5', english: 'Good night', target: 'Good night', romanization: 'gud nyt' },
          { id: 'en-greet-6', english: 'Thank you', target: 'Thank you', romanization: 'thangk yoo' },
          { id: 'en-greet-7', english: "You're welcome", target: "You're welcome", romanization: 'yor WEL-kum' },
          { id: 'en-greet-8', english: 'Please', target: 'Please', romanization: 'pleez' },
          { id: 'en-greet-9', english: 'Sorry', target: 'Sorry', romanization: 'SOR-ee' },
          { id: 'en-greet-10', english: 'Excuse me', target: 'Excuse me', romanization: 'ik-SKYOOZ mee' },
          { id: 'en-greet-11', english: 'Yes', target: 'Yes', romanization: 'yes' },
          { id: 'en-greet-12', english: 'No', target: 'No', romanization: 'noh' },
        ],
      },
      {
        id: 'common',
        title: 'Common Phrases',
        entries: [
          { id: 'en-common-1', english: "I don't understand", target: "I don't understand", romanization: 'eye dohnt un-der-STAND' },
          { id: 'en-common-2', english: 'Can you repeat?', target: 'Can you repeat?', romanization: 'kan yoo ri-PEET?' },
          { id: 'en-common-3', english: 'Speak slowly, please', target: 'Speak slowly, please', romanization: 'speek SLOH-lee pleez' },
          { id: 'en-common-4', english: 'What does this mean?', target: 'What does this mean?', romanization: 'wot duhz this meen?' },
          { id: 'en-common-5', english: 'I like it', target: 'I like it', romanization: 'eye lyk it' },
          { id: 'en-common-6', english: "I don't like it", target: "I don't like it", romanization: 'eye dohnt lyk it' },
          { id: 'en-common-7', english: 'Where is the bathroom?', target: 'Where is the bathroom?', romanization: 'wair iz thuh BATH-room?' },
          { id: 'en-common-8', english: 'Help!', target: 'Help!', romanization: 'help!' },
          { id: 'en-common-9', english: 'I need a doctor', target: 'I need a doctor', romanization: 'eye need uh DOK-ter' },
          { id: 'en-common-10', english: 'How much is this?', target: 'How much is this?', romanization: 'how much iz this?' },
          { id: 'en-common-11', english: 'Too expensive', target: 'Too expensive', romanization: 'too ik-SPEN-siv' },
          { id: 'en-common-12', english: 'OK / Alright', target: 'OK / Alright', romanization: 'oh-KAY / awl-RYT' },
        ],
      },
      {
        id: 'travel',
        title: 'Travel',
        entries: [
          { id: 'en-travel-1', english: 'Where is…?', target: 'Where is…?', romanization: 'wair iz…?' },
          { id: 'en-travel-2', english: 'Left', target: 'Left', romanization: 'left' },
          { id: 'en-travel-3', english: 'Right', target: 'Right', romanization: 'ryt' },
          { id: 'en-travel-4', english: 'Straight ahead', target: 'Straight ahead', romanization: 'strayt uh-HED' },
          { id: 'en-travel-5', english: 'Near', target: 'Near', romanization: 'neer' },
          { id: 'en-travel-6', english: 'Far', target: 'Far', romanization: 'fah' },
          { id: 'en-travel-7', english: 'I need a taxi', target: 'I need a taxi', romanization: 'eye need uh TAK-see' },
          { id: 'en-travel-8', english: 'Train station', target: 'Train station', romanization: 'trayn STAY-shun' },
          { id: 'en-travel-9', english: 'Bus stop', target: 'Bus stop', romanization: 'buhs stop' },
          { id: 'en-travel-10', english: 'Airport', target: 'Airport', romanization: 'AIR-port' },
          { id: 'en-travel-11', english: 'Ticket', target: 'Ticket', romanization: 'TIK-it' },
          { id: 'en-travel-12', english: 'I am lost', target: 'I am lost', romanization: 'eye am lost' },
        ],
      },
      {
        id: 'food',
        title: 'Food & Drinks',
        entries: [
          { id: 'en-food-1', english: 'Water', target: 'Water', romanization: 'WAW-ter' },
          { id: 'en-food-2', english: 'Tea', target: 'Tea', romanization: 'tee' },
          { id: 'en-food-3', english: 'Coffee', target: 'Coffee', romanization: 'KAW-fee' },
          { id: 'en-food-4', english: 'Rice', target: 'Rice', romanization: 'rys' },
          { id: 'en-food-5', english: 'Bread', target: 'Bread', romanization: 'bred' },
          { id: 'en-food-6', english: 'Vegetarian', target: 'Vegetarian', romanization: 'vej-i-TAIR-ee-un' },
          { id: 'en-food-7', english: 'Spicy', target: 'Spicy', romanization: 'SPY-see' },
          { id: 'en-food-8', english: 'Not spicy', target: 'Not spicy', romanization: 'not SPY-see' },
          { id: 'en-food-9', english: 'Delicious', target: 'Delicious', romanization: 'di-LISH-us' },
          { id: 'en-food-10', english: 'I am hungry', target: 'I am hungry', romanization: 'eye am HUN-gree' },
          { id: 'en-food-11', english: 'I am thirsty', target: 'I am thirsty', romanization: 'eye am THUR-stee' },
          { id: 'en-food-12', english: 'The bill, please', target: 'The bill, please', romanization: 'thuh bil pleez' },
        ],
      },
    ],
  },
};
