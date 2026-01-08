import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDI8jyi3sPaj99r83hB5dQZWcZ1XWWRq7A",
  authDomain: "lingualive-nandini.firebaseapp.com",
  projectId: "lingualive-nandini",
  storageBucket: "lingualive-nandini.firebasestorage.app",
  messagingSenderId: "540655720563",
  appId: "1:540655720563:web:d84f3e1eaca51c0c38ec30"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial content for each language
const initialContent = {
  Bengali: {
    letters: [
      { targetText: 'অ', english: 'a', romanization: 'a' },
      { targetText: 'আ', english: 'aa', romanization: 'aa' },
      { targetText: 'ই', english: 'i', romanization: 'i' },
      { targetText: 'উ', english: 'u', romanization: 'u' },
      { targetText: 'এ', english: 'e', romanization: 'e' },
      { targetText: 'ও', english: 'o', romanization: 'o' },
    ],
    words: [
      { targetText: 'নমস্কার', english: 'Hello', romanization: 'Nomoshkar' },
      { targetText: 'ধন্যবাদ', english: 'Thank you', romanization: 'Dhonnobad' },
      { targetText: 'জল', english: 'Water', romanization: 'Jol' },
      { targetText: 'খাবার', english: 'Food', romanization: 'Khabar' },
      { targetText: 'বই', english: 'Book', romanization: 'Boi' },
      { targetText: 'ঘর', english: 'House', romanization: 'Ghor' },
    ],
    sentences: [
      { targetText: 'আমার নাম রাহুল', english: 'My name is Rahul', romanization: 'Amar naam Rahul' },
      { targetText: 'আপনি কেমন আছেন?', english: 'How are you?', romanization: 'Apni kemon achhen?' },
      { targetText: 'আমি ভালো আছি', english: 'I am fine', romanization: 'Ami bhalo achhi' },
      { targetText: 'এটা কত টাকা?', english: 'How much is this?', romanization: 'Eta koto taka?' },
      { targetText: 'আমি বাংলা শিখছি', english: 'I am learning Bengali', romanization: 'Ami Bangla shikhchhi' },
      { targetText: 'দয়া করে সাহায্য করুন', english: 'Please help', romanization: 'Doya kore shahajjo korun' },
    ]
  },
  Hindi: {
    letters: [
      { targetText: 'अ', english: 'a', romanization: 'a' },
      { targetText: 'आ', english: 'aa', romanization: 'aa' },
      { targetText: 'इ', english: 'i', romanization: 'i' },
      { targetText: 'उ', english: 'u', romanization: 'u' },
      { targetText: 'ए', english: 'e', romanization: 'e' },
      { targetText: 'ओ', english: 'o', romanization: 'o' },
    ],
    words: [
      { targetText: 'नमस्ते', english: 'Hello', romanization: 'Namaste' },
      { targetText: 'धन्यवाद', english: 'Thank you', romanization: 'Dhanyavaad' },
      { targetText: 'पानी', english: 'Water', romanization: 'Paani' },
      { targetText: 'खाना', english: 'Food', romanization: 'Khaana' },
      { targetText: 'किताब', english: 'Book', romanization: 'Kitaab' },
      { targetText: 'घर', english: 'House', romanization: 'Ghar' },
    ],
    sentences: [
      { targetText: 'मेरा नाम राहुल है', english: 'My name is Rahul', romanization: 'Mera naam Rahul hai' },
      { targetText: 'आप कैसे हैं?', english: 'How are you?', romanization: 'Aap kaise hain?' },
      { targetText: 'मैं ठीक हूँ', english: 'I am fine', romanization: 'Main theek hoon' },
      { targetText: 'यह कितना है?', english: 'How much is this?', romanization: 'Yah kitna hai?' },
      { targetText: 'मैं हिंदी सीख रहा हूँ', english: 'I am learning Hindi', romanization: 'Main Hindi seekh raha hoon' },
      { targetText: 'कृपया मदद करें', english: 'Please help', romanization: 'Kripya madad karen' },
    ]
  },
  English: {
    letters: [
      { targetText: 'A', english: 'A', romanization: 'ay' },
      { targetText: 'B', english: 'B', romanization: 'bee' },
      { targetText: 'C', english: 'C', romanization: 'see' },
      { targetText: 'D', english: 'D', romanization: 'dee' },
      { targetText: 'E', english: 'E', romanization: 'ee' },
      { targetText: 'F', english: 'F', romanization: 'eff' },
    ],
    words: [
      { targetText: 'Hello', english: 'Hello', romanization: 'he-loh' },
      { targetText: 'Thank you', english: 'Thank you', romanization: 'thank yoo' },
      { targetText: 'Water', english: 'Water', romanization: 'waw-ter' },
      { targetText: 'Food', english: 'Food', romanization: 'food' },
      { targetText: 'Book', english: 'Book', romanization: 'book' },
      { targetText: 'House', english: 'House', romanization: 'hows' },
    ],
    sentences: [
      { targetText: 'My name is Sarah', english: 'My name is Sarah', romanization: 'my naym iz Sarah' },
      { targetText: 'How are you?', english: 'How are you?', romanization: 'how ar yoo' },
      { targetText: 'I am fine', english: 'I am fine', romanization: 'I am fyn' },
      { targetText: 'How much is this?', english: 'How much is this?', romanization: 'how much iz this' },
      { targetText: 'I am learning English', english: 'I am learning English', romanization: 'I am learning English' },
      { targetText: 'Please help me', english: 'Please help me', romanization: 'pleez help mee' },
    ]
  }
};

async function addInitialContent() {
  console.log('Starting to add initial content...\n');

  // This will be set when you run the script
  // Get your UID from: Firebase Console > Authentication > Users > copy your UID
  const createdByUid = process.env.USER_ID || 'admin-seed';

  if (!process.env.USER_ID) {
    console.log('⚠️  Warning: USER_ID not set. Using "admin-seed" as creator.');
    console.log('   Run with: USER_ID=your-uid node scripts/add-initial-content.mjs\n');
  }

  let totalAdded = 0;

  for (const [language, content] of Object.entries(initialContent)) {
    console.log(`\n📚 Adding ${language} content...`);

    // Add letters
    console.log(`  Adding ${content.letters.length} letters...`);
    for (const letter of content.letters) {
      await addDoc(collection(db, 'pronunciationItems'), {
        language,
        type: 'letter',
        targetText: letter.targetText,
        english: letter.english,
        romanization: letter.romanization,
        createdByUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      totalAdded++;
    }

    // Add words
    console.log(`  Adding ${content.words.length} words...`);
    for (const word of content.words) {
      await addDoc(collection(db, 'pronunciationItems'), {
        language,
        type: 'word',
        targetText: word.targetText,
        english: word.english,
        romanization: word.romanization,
        createdByUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      totalAdded++;
    }

    // Add sentences
    console.log(`  Adding ${content.sentences.length} sentences...`);
    for (const sentence of content.sentences) {
      await addDoc(collection(db, 'pronunciationItems'), {
        language,
        type: 'sentence',
        targetText: sentence.targetText,
        english: sentence.english,
        romanization: sentence.romanization,
        createdByUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      totalAdded++;
    }

    console.log(`  ✅ ${language} completed`);
  }

  console.log(`\n✅ All done! Added ${totalAdded} items total.`);
  console.log('\nYou can now edit/delete these items in the Pronunciation Practice page.');
}

addInitialContent()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
