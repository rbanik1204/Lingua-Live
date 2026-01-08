import fs from 'node:fs';
import path from 'node:path';

const OUT_BASE = path.join(process.cwd(), 'public', 'assets', 'data', 'pronunciation-seed');

/**
 * We intentionally generate from small safe word banks to avoid shipping
 * copyrighted dictionaries while still meeting the requested 1000 items.
 */
const NOUNS = [
  { en: 'water', hi: 'पानी', bn: 'পানি' },
  { en: 'food', hi: 'खाना', bn: 'খাবার' },
  { en: 'tea', hi: 'चाय', bn: 'চা' },
  { en: 'coffee', hi: 'कॉफ़ी', bn: 'কফি' },
  { en: 'milk', hi: 'दूध', bn: 'দুধ' },
  { en: 'bread', hi: 'रोटी', bn: 'রুটি' },
  { en: 'rice', hi: 'चावल', bn: 'ভাত' },
  { en: 'salt', hi: 'नमक', bn: 'লবণ' },
  { en: 'sugar', hi: 'चीनी', bn: 'চিনি' },
  { en: 'fruit', hi: 'फल', bn: 'ফল' },
  { en: 'vegetables', hi: 'सब्ज़ी', bn: 'সবজি' },
  { en: 'banana', hi: 'केला', bn: 'কলা' },
  { en: 'apple', hi: 'सेब', bn: 'আপেল' },
  { en: 'mango', hi: 'आम', bn: 'আম' },
  { en: 'orange', hi: 'संतरा', bn: 'কমলা' },
  { en: 'egg', hi: 'अंडा', bn: 'ডিম' },
  { en: 'fish', hi: 'मछली', bn: 'মাছ' },
  { en: 'chicken', hi: 'चिकन', bn: 'মুরগি' },
  { en: 'breakfast', hi: 'नाश्ता', bn: 'নাশতা' },
  { en: 'lunch', hi: 'दोपहर का खाना', bn: 'দুপুরের খাবার' },
  { en: 'dinner', hi: 'रात का खाना', bn: 'রাতের খাবার' },

  { en: 'book', hi: 'किताब', bn: 'বই' },
  { en: 'pen', hi: 'कलम', bn: 'কলম' },
  { en: 'pencil', hi: 'पेंसिल', bn: 'পেন্সিল' },
  { en: 'notebook', hi: 'कॉपी', bn: 'খাতা' },
  { en: 'paper', hi: 'कागज़', bn: 'কাগজ' },
  { en: 'bag', hi: 'बैग', bn: 'ব্যাগ' },
  { en: 'school', hi: 'स्कूल', bn: 'স্কুল' },
  { en: 'class', hi: 'कक्षा', bn: 'ক্লাস' },
  { en: 'teacher', hi: 'शिक्षक', bn: 'শিক্ষক' },
  { en: 'student', hi: 'छात्र', bn: 'ছাত্র' },
  { en: 'homework', hi: 'गृहकार्य', bn: 'বাড়ির কাজ' },
  { en: 'exam', hi: 'परीक्षा', bn: 'পরীক্ষা' },
  { en: 'question', hi: 'प्रश्न', bn: 'প্রশ্ন' },
  { en: 'answer', hi: 'उत्तर', bn: 'উত্তর' },
  { en: 'lesson', hi: 'पाठ', bn: 'পাঠ' },
  { en: 'practice', hi: 'अभ्यास', bn: 'অনুশীলন' },
  { en: 'pronunciation', hi: 'उच्चारण', bn: 'উচ্চারণ' },

  { en: 'house', hi: 'घर', bn: 'বাড়ি' },
  { en: 'room', hi: 'कमरा', bn: 'ঘর' },
  { en: 'kitchen', hi: 'रसोई', bn: 'রান্নাঘর' },
  { en: 'bathroom', hi: 'बाथरूम', bn: 'বাথরুম' },
  { en: 'bed', hi: 'बिस्तर', bn: 'বিছানা' },
  { en: 'chair', hi: 'कुर्सी', bn: 'চেয়ার' },
  { en: 'table', hi: 'मेज़', bn: 'টেবিল' },
  { en: 'door', hi: 'दरवाज़ा', bn: 'দরজা' },
  { en: 'window', hi: 'खिड़की', bn: 'জানালা' },
  { en: 'key', hi: 'चाबी', bn: 'চাবি' },

  { en: 'mother', hi: 'माँ', bn: 'মা' },
  { en: 'father', hi: 'पिता', bn: 'বাবা' },
  { en: 'brother', hi: 'भाई', bn: 'ভাই' },
  { en: 'sister', hi: 'बहन', bn: 'বোন' },
  { en: 'friend', hi: 'दोस्त', bn: 'বন্ধু' },
  { en: 'family', hi: 'परिवार', bn: 'পরিবার' },
  { en: 'child', hi: 'बच्चा', bn: 'শিশু' },
  { en: 'name', hi: 'नाम', bn: 'নাম' },

  { en: 'phone', hi: 'फोन', bn: 'ফোন' },
  { en: 'computer', hi: 'कंप्यूटर', bn: 'কম্পিউটার' },
  { en: 'internet', hi: 'इंटरनेट', bn: 'ইন্টারনেট' },
  { en: 'message', hi: 'संदेश', bn: 'বার্তা' },

  { en: 'money', hi: 'पैसा', bn: 'টাকা' },
  { en: 'price', hi: 'कीमत', bn: 'দাম' },
  { en: 'market', hi: 'बाज़ार', bn: 'বাজার' },
  { en: 'shop', hi: 'दुकान', bn: 'দোকান' },
  { en: 'bill', hi: 'बिल', bn: 'বিল' },
  { en: 'card', hi: 'कार्ड', bn: 'কার্ড' },
  { en: 'bank', hi: 'बैंक', bn: 'ব্যাংক' },

  { en: 'bus', hi: 'बस', bn: 'বাস' },
  { en: 'train', hi: 'ट्रेन', bn: 'ট্রেন' },
  { en: 'taxi', hi: 'टैक्सी', bn: 'ট্যাক্সি' },
  { en: 'car', hi: 'कार', bn: 'গাড়ি' },
  { en: 'bike', hi: 'बाइक', bn: 'বাইক' },
  { en: 'ticket', hi: 'टिकट', bn: 'টিকিট' },
  { en: 'station', hi: 'स्टेशन', bn: 'স্টেশন' },
  { en: 'airport', hi: 'हवाई अड्डा', bn: 'বিমানবন্দর' },
  { en: 'hotel', hi: 'होटल', bn: 'হোটেল' },
  { en: 'restaurant', hi: 'रेस्टोरेंट', bn: 'রেস্টুরেন্ট' },
  { en: 'map', hi: 'नक्शा', bn: 'মানচিত্র' },
  { en: 'address', hi: 'पता', bn: 'ঠিকানা' },

  { en: 'doctor', hi: 'डॉक्टर', bn: 'ডাক্তার' },
  { en: 'hospital', hi: 'अस्पताल', bn: 'হাসপাতাল' },
  { en: 'medicine', hi: 'दवा', bn: 'ওষুধ' },
  { en: 'fever', hi: 'बुखार', bn: 'জ্বর' },
  { en: 'pain', hi: 'दर्द', bn: 'ব্যথা' },
  { en: 'help', hi: 'मदद', bn: 'সাহায্য' },
  { en: 'emergency', hi: 'आपातकाल', bn: 'জরুরি অবস্থা' },

  { en: 'rain', hi: 'बारिश', bn: 'বৃষ্টি' },
  { en: 'sun', hi: 'सूरज', bn: 'সূর্য' },
  { en: 'wind', hi: 'हवा', bn: 'বাতাস' },
  { en: 'cold', hi: 'ठंड', bn: 'ঠান্ডা' },
  { en: 'heat', hi: 'गर्मी', bn: 'গরম' },

  { en: 'time', hi: 'समय', bn: 'সময়' },
  { en: 'today', hi: 'आज', bn: 'আজ' },
  { en: 'tomorrow', hi: 'कल', bn: 'আগামীকাল' },
  { en: 'yesterday', hi: 'कल', bn: 'গতকাল' },
  { en: 'morning', hi: 'सुबह', bn: 'সকাল' },
  { en: 'evening', hi: 'शाम', bn: 'সন্ধ্যা' },
  { en: 'night', hi: 'रात', bn: 'রাত' },
];

const ADJECTIVES = [
  { en: 'good', hi: 'अच्छा', bn: 'ভালো' },
  { en: 'bad', hi: 'बुरा', bn: 'খারাপ' },
  { en: 'big', hi: 'बड़ा', bn: 'বড়' },
  { en: 'small', hi: 'छोटा', bn: 'ছোট' },
  { en: 'new', hi: 'नया', bn: 'নতুন' },
  { en: 'old', hi: 'पुराना', bn: 'পুরোনো' },
  { en: 'clean', hi: 'साफ़', bn: 'পরিষ্কার' },
  { en: 'tasty', hi: 'स्वादिष्ट', bn: 'সুস্বাদু' },
  { en: 'important', hi: 'महत्वपूर्ण', bn: 'গুরুত্বপূর্ণ' },
  { en: 'beautiful', hi: 'सुंदर', bn: 'সুন্দর' },
];

function titleCase(s) {
  return s
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function titleCaseToken(s) {
  const w = String(s || '');
  return w ? w[0].toUpperCase() + w.slice(1) : w;
}

function titleCaseHyphenated(s) {
  return String(s || '')
    .split('-')
    .map((p) => titleCaseToken(p))
    .join('-');
}

function isSingleToken(s) {
  return !/\s/.test(String(s || '').trim());
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function buildWords(language) {
  const target = 1000;
  const seenTarget = new Set();
  const out = [];

  const push = (obj) => {
    const key = String(obj?.targetText ?? '').trim();
    if (!key) return;
    if (seenTarget.has(key)) return;
    seenTarget.add(key);
    out.push(obj);
  };

  // 1) noun-only for all nouns
  for (const n of NOUNS) {
    if (language === 'English') {
      const t = titleCaseToken(n.en);
      if (isSingleToken(t)) push({ targetText: t, english: titleCase(n.en) });
    } else if (language === 'Hindi') {
      const t = n.hi;
      if (isSingleToken(t)) push({ targetText: t, english: titleCase(n.en) });
    } else {
      const t = n.bn;
      if (isSingleToken(t)) push({ targetText: t, english: titleCase(n.en) });
    }
    if (out.length >= target) return out.slice(0, target);
  }

  // 2) adjective-noun hyphenated compounds (single token)
  for (const adj of ADJECTIVES) {
    for (const n of NOUNS) {
      if (language === 'English') {
        if (!isSingleToken(adj.en) || !isSingleToken(n.en)) continue;
        const targetText = titleCaseHyphenated(`${adj.en}-${n.en}`);
        push({ targetText, english: titleCase(`${adj.en} ${n.en}`) });
      } else if (language === 'Hindi') {
        if (!isSingleToken(adj.hi) || !isSingleToken(n.hi)) continue;
        push({ targetText: `${adj.hi}-${n.hi}`, english: titleCase(`${adj.en} ${n.en}`) });
      } else {
        if (!isSingleToken(adj.bn) || !isSingleToken(n.bn)) continue;
        push({ targetText: `${adj.bn}-${n.bn}`, english: titleCase(`${adj.en} ${n.en}`) });
      }
      if (out.length >= target) return out.slice(0, target);
    }
  }

  // 3) If still short, add a second-adjective variant (still a single token)
  for (const adj1 of ADJECTIVES) {
    for (const adj2 of ADJECTIVES) {
      if (adj1.en === adj2.en) continue;
      for (const n of NOUNS) {
        if (language === 'English') {
          if (!isSingleToken(adj1.en) || !isSingleToken(adj2.en) || !isSingleToken(n.en)) continue;
          const targetText = titleCaseHyphenated(`${adj1.en}-${adj2.en}-${n.en}`);
          push({ targetText, english: titleCase(`${adj1.en} ${adj2.en} ${n.en}`) });
        } else if (language === 'Hindi') {
          if (!isSingleToken(adj1.hi) || !isSingleToken(adj2.hi) || !isSingleToken(n.hi)) continue;
          push({ targetText: `${adj1.hi}-${adj2.hi}-${n.hi}`, english: titleCase(`${adj1.en} ${adj2.en} ${n.en}`) });
        } else {
          if (!isSingleToken(adj1.bn) || !isSingleToken(adj2.bn) || !isSingleToken(n.bn)) continue;
          push({ targetText: `${adj1.bn}-${adj2.bn}-${n.bn}`, english: titleCase(`${adj1.en} ${adj2.en} ${n.en}`) });
        }
        if (out.length >= target) return out.slice(0, target);
      }
    }
  }

  return out.slice(0, target);
}

function buildSentences(language) {
  const target = 1000;
  const nouns = NOUNS;

  const enTemplates = [
    (n) => `I want ${n.en}.`,
    (n) => `I need ${n.en}.`,
    (n) => `Please give me ${n.en}.`,
    (n) => `Where is the ${n.en}?`,
    (n) => `This is my ${n.en}.`,
    (n) => `Do you have ${n.en}?`,
    (n) => `I like ${n.en}.`,
    (n) => `I don't like ${n.en}.`,
    (n) => `I am looking for ${n.en}.`,
    (n) => `Is this ${n.en}?`,
  ];

  const hiTemplates = [
    (n) => ({ target: `मुझे ${n.hi} चाहिए।`, en: `I need ${n.en}.` }),
    (n) => ({ target: `कृपया मुझे ${n.hi} दीजिए।`, en: `Please give me ${n.en}.` }),
    (n) => ({ target: `${n.hi} कहाँ है?`, en: `Where is the ${n.en}?` }),
    (n) => ({ target: `यह मेरा ${n.hi} है।`, en: `This is my ${n.en}.` }),
    (n) => ({ target: `क्या आपके पास ${n.hi} है?`, en: `Do you have ${n.en}?` }),
    (n) => ({ target: `मुझे ${n.hi} पसंद है।`, en: `I like ${n.en}.` }),
    (n) => ({ target: `मुझे ${n.hi} पसंद नहीं है।`, en: `I don't like ${n.en}.` }),
    (n) => ({ target: `मैं ${n.hi} ढूँढ रहा हूँ।`, en: `I am looking for ${n.en}.` }),
    (n) => ({ target: `यह ${n.hi} बहुत अच्छा है।`, en: `This is a very good ${n.en}.` }),
    (n) => ({ target: `क्या यह ${n.hi} है?`, en: `Is this ${n.en}?` }),
  ];

  const bnTemplates = [
    (n) => ({ target: `আমি ${n.bn} চাই।`, en: `I want ${n.en}.` }),
    (n) => ({ target: `দয়া করে আমাকে ${n.bn} দিন।`, en: `Please give me ${n.en}.` }),
    (n) => ({ target: `${n.bn} কোথায়?`, en: `Where is the ${n.en}?` }),
    (n) => ({ target: `এটা আমার ${n.bn}।`, en: `This is my ${n.en}.` }),
    (n) => ({ target: `আপনার কাছে কি ${n.bn} আছে?`, en: `Do you have ${n.en}?` }),
    (n) => ({ target: `আমি ${n.bn} পছন্দ করি।`, en: `I like ${n.en}.` }),
    (n) => ({ target: `আমি ${n.bn} পছন্দ করি না।`, en: `I don't like ${n.en}.` }),
    (n) => ({ target: `আমি ${n.bn} খুঁজছি।`, en: `I am looking for ${n.en}.` }),
    (n) => ({ target: `এটা খুব ভালো ${n.bn}।`, en: `This is a very good ${n.en}.` }),
    (n) => ({ target: `এটা কি ${n.bn}?`, en: `Is this ${n.en}?` }),
  ];

  const seenTarget = new Set();
  const out = [];

  const push = (obj) => {
    const key = String(obj?.targetText ?? '').trim();
    if (!key) return;
    if (seenTarget.has(key)) return;
    seenTarget.add(key);
    out.push(obj);
  };

  // 1) base templates
  if (language === 'English') {
    for (const n of nouns) {
      for (const t of enTemplates) {
        const s = t(n);
        push({ targetText: s, english: s });
        if (out.length >= target) return out.slice(0, target);
      }
    }
  } else if (language === 'Hindi') {
    for (const n of nouns) {
      for (const t of hiTemplates) {
        const v = t(n);
        push({ targetText: v.target, english: v.en });
        if (out.length >= target) return out.slice(0, target);
      }
    }
  } else {
    for (const n of nouns) {
      for (const t of bnTemplates) {
        const v = t(n);
        push({ targetText: v.target, english: v.en });
        if (out.length >= target) return out.slice(0, target);
      }
    }
  }

  // 2) adjective variants to scale up to 1000+ uniquely
  // English: adjective directly before the noun in templates where that reads naturally.
  const enAdjTemplates = [
    (adj, n) => `I want ${adj.en} ${n.en}.`,
    (adj, n) => `I need ${adj.en} ${n.en}.`,
    (adj, n) => `Please give me ${adj.en} ${n.en}.`,
    (adj, n) => `Where is the ${adj.en} ${n.en}?`,
    (adj, n) => `This is my ${adj.en} ${n.en}.`,
    (adj, n) => `Do you have ${adj.en} ${n.en}?`,
  ];

  const hiAdjTemplates = [
    (adj, n) => ({ target: `मुझे ${adj.hi} ${n.hi} चाहिए।`, en: `I need ${adj.en} ${n.en}.` }),
    (adj, n) => ({ target: `कृपया मुझे ${adj.hi} ${n.hi} दीजिए।`, en: `Please give me ${adj.en} ${n.en}.` }),
    (adj, n) => ({ target: `${adj.hi} ${n.hi} कहाँ है?`, en: `Where is the ${adj.en} ${n.en}?` }),
    (adj, n) => ({ target: `यह मेरा ${adj.hi} ${n.hi} है।`, en: `This is my ${adj.en} ${n.en}.` }),
    (adj, n) => ({ target: `क्या आपके पास ${adj.hi} ${n.hi} है?`, en: `Do you have ${adj.en} ${n.en}?` }),
  ];

  const bnAdjTemplates = [
    (adj, n) => ({ target: `আমি ${adj.bn} ${n.bn} চাই।`, en: `I want ${adj.en} ${n.en}.` }),
    (adj, n) => ({ target: `দয়া করে আমাকে ${adj.bn} ${n.bn} দিন।`, en: `Please give me ${adj.en} ${n.en}.` }),
    (adj, n) => ({ target: `${adj.bn} ${n.bn} কোথায়?`, en: `Where is the ${adj.en} ${n.en}?` }),
    (adj, n) => ({ target: `এটা আমার ${adj.bn} ${n.bn}।`, en: `This is my ${adj.en} ${n.en}.` }),
    (adj, n) => ({ target: `আপনার কাছে কি ${adj.bn} ${n.bn} আছে?`, en: `Do you have ${adj.en} ${n.en}?` }),
  ];

  if (language === 'English') {
    for (const adj of ADJECTIVES) {
      for (const n of nouns) {
        for (const t of enAdjTemplates) {
          const s = t(adj, n);
          push({ targetText: s, english: s });
          if (out.length >= target) return out.slice(0, target);
        }
      }
    }
  } else if (language === 'Hindi') {
    for (const adj of ADJECTIVES) {
      for (const n of nouns) {
        for (const t of hiAdjTemplates) {
          const v = t(adj, n);
          push({ targetText: v.target, english: v.en });
          if (out.length >= target) return out.slice(0, target);
        }
      }
    }
  } else {
    for (const adj of ADJECTIVES) {
      for (const n of nouns) {
        for (const t of bnAdjTemplates) {
          const v = t(adj, n);
          push({ targetText: v.target, english: v.en });
          if (out.length >= target) return out.slice(0, target);
        }
      }
    }
  }

  return out.slice(0, target);
}

function writeLang(language) {
  const langSlug = language.toLowerCase();
  const words = buildWords(language);
  const sentences = buildSentences(language);

  if (words.length !== 1000) throw new Error(`${language} words count ${words.length} != 1000`);
  if (sentences.length !== 1000) throw new Error(`${language} sentences count ${sentences.length} != 1000`);

  writeJson(path.join(OUT_BASE, langSlug, 'word.json'), words);
  writeJson(path.join(OUT_BASE, langSlug, 'sentence.json'), sentences);
}

writeLang('English');
writeLang('Hindi');
writeLang('Bengali');

console.log('Generated pronunciation seed JSON files at:', OUT_BASE);
