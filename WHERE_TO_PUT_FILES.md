# 📍 WHERE TO PUT NANDINI'S CONTENT - Quick Reference

**Date:** December 29, 2025  
**Client:** Nandini Ghosh  
**Languages:** Bengali 🇧🇩 | Hindi 🇮🇳 | English 🇬🇧

---

## 🎯 THREE SIMPLE STEPS

### STEP 1: Organize Your Files
Sort all of Nandini's content into these categories:
- Voice recordings (MP3/WAV files)
- Practice PDFs
- Practice problems/worksheets
- Video lectures (if any)

### STEP 2: Place Files in Correct Folders
Use the folder paths below based on content type and language

### STEP 3: Test on Website
Open the website and verify files load correctly

---

## 📂 COMPLETE FILE PLACEMENT GUIDE

### 1️⃣ VOICE RECORDINGS (Pronunciation Practice)

**What:** Nandini's voice recordings for pronunciation  
**Format:** `.mp3`, `.wav`, or `.ogg`  
**Size:** Keep under 1 MB per file

#### 📁 Where to Put:

```
Bengali recordings → 
assets/audio/pronunciation/bengali/

    Recommended subfolders (Bengali):
    assets/audio/pronunciation/bengali/letters/   (single letters/sounds)
    assets/audio/pronunciation/bengali/words/     (full words)
    assets/audio/pronunciation/bengali/phrases/   (phrases/sentences)

Hindi recordings → 
assets/audio/pronunciation/hindi/

    Recommended subfolders (Hindi):
    assets/audio/pronunciation/hindi/letters/
    assets/audio/pronunciation/hindi/words/
    assets/audio/pronunciation/hindi/phrases/

English recordings → 
assets/audio/pronunciation/english/

    Recommended subfolders (English):
    assets/audio/pronunciation/english/letters/
    assets/audio/pronunciation/english/words/
    assets/audio/pronunciation/english/phrases/
```

#### ✅ Example Files:
```
assets/audio/pronunciation/bengali/
├── letters/
│   ├── ka.mp3
│   ├── kha.mp3
│   └── tra.mp3
├── words/
│   ├── dhonnobad.mp3
│   └── bhalobashi.mp3
└── phrases/
    ├── shuvo-sokal.mp3
    └── apni-kemon-achen.mp3

assets/audio/pronunciation/hindi/
├── letters/
│   ├── ka.mp3
│   └── kha.mp3
├── words/
│   └── dhanyavaad.mp3
└── phrases/
    ├── namaste.mp3
    └── main-theek-hoon.mp3

assets/audio/pronunciation/english/
├── letters/
│   ├── th.mp3
│   └── v.mp3
├── words/
│   ├── entrepreneur.mp3
│   └── pronunciation.mp3
└── phrases/
    ├── hello.mp3
    └── how-are-you.mp3
```

#### ✅ Naming Tip (so it stays organized)
- Letters: `ka.mp3`, `kha.mp3`, `ri.mp3`
- Words: `dhonnobad.mp3`, `bhalobashi.mp3`
- Phrases: `apni-kemon-achen.mp3`, `shuvo-sokal.mp3`

You can still keep older files directly inside `.../bengali/` (root) if you want — subfolders are just for better organization.

---

### 2️⃣ PRACTICE PDFs (Learning Materials)

**What:** PDF documents for learning (lessons, vocabulary, grammar)  
**Format:** `.pdf`  
**Size:** Keep under 10 MB per file

#### 📁 Where to Put:

```
Bengali PDFs → 
assets/documents/practice-pdfs/bengali/

Hindi PDFs → 
assets/documents/practice-pdfs/hindi/

English PDFs → 
assets/documents/practice-pdfs/english/
```

#### ✅ Example Files:
```
assets/documents/practice-pdfs/bengali/
├── lesson-01-alphabet.pdf
├── lesson-02-basic-words.pdf
├── lesson-03-greetings.pdf
├── vocabulary-week-1.pdf
└── grammar-guide-bengali.pdf

assets/documents/practice-pdfs/hindi/
├── lesson-01-devanagari.pdf
├── lesson-02-vowels-consonants.pdf
├── vocabulary-builder.pdf
└── hindi-grammar-basics.pdf

assets/documents/practice-pdfs/english/
├── pronunciation-guide.pdf
├── common-mistakes.pdf
├── vocabulary-advanced.pdf
└── grammar-reference.pdf
```

---

### 3️⃣ PRACTICE PROBLEMS (Worksheets & Quizzes)

**What:** Practice exercises, worksheets, quizzes  
**Format:** `.pdf`, `.docx`  
**Size:** Keep under 5 MB per file

#### 📁 Where to Put:

```
Bengali problems → 
assets/documents/practice-problems/bengali/

Hindi problems → 
assets/documents/practice-problems/hindi/

English problems → 
assets/documents/practice-problems/english/
```

#### ✅ Example Files:
```
assets/documents/practice-problems/bengali/
├── practice-greetings-beginner.pdf
├── practice-numbers-intermediate.pdf
├── quiz-week-1.pdf
├── worksheet-pronunciation.pdf
└── exercises-grammar.pdf

assets/documents/practice-problems/hindi/
├── practice-alphabet-beginner.pdf
├── quiz-devanagari.pdf
├── worksheet-verbs.pdf
└── exercises-tenses.pdf

assets/documents/practice-problems/english/
├── practice-pronunciation-beginner.pdf
├── quiz-vocabulary.pdf
├── worksheet-grammar.pdf
└── exercises-speaking.pdf
```

---

### 4️⃣ VIDEO LECTURES (Recorded Classes)

**What:** Recorded video lectures by Nandini  
**Format:** `.mp4` (recommended), `.webm`  
**Size:** Use compressed videos (under 100 MB recommended)

#### 📁 Where to Put:

```
Bengali videos → 
assets/videos/recorded-lectures/bengali/

Hindi videos → 
assets/videos/recorded-lectures/hindi/

English videos → 
assets/videos/recorded-lectures/english/
```

#### ✅ Example Files:
```
assets/videos/recorded-lectures/bengali/
├── lecture-01-introduction.mp4
├── lecture-02-alphabet-overview.mp4
├── lecture-03-pronunciation-tips.mp4
└── lecture-04-basic-conversation.mp4

assets/videos/recorded-lectures/hindi/
├── lecture-01-introduction.mp4
├── lecture-02-devanagari-script.mp4
└── lecture-03-basic-grammar.mp4

assets/videos/recorded-lectures/english/
├── lecture-01-pronunciation-basics.mp4
├── lecture-02-common-mistakes.mp4
└── lecture-03-conversation-practice.mp4
```

---

## 🚀 QUICK UPLOAD METHODS

### Method 1: Drag & Drop (EASIEST)
1. Open Windows Explorer
2. Navigate to the correct folder (see paths above)
3. Drag your files from source location
4. Drop into the folder
5. ✅ Done!

### Method 2: Copy-Paste
1. Select your files
2. Right-click → Copy (or Ctrl+C)
3. Navigate to correct folder
4. Right-click → Paste (or Ctrl+V)
5. ✅ Done!

### Method 3: PowerShell Script (ADVANCED)
```powershell
# Run the helper script
.\upload-helper.ps1

# Follow the menu to upload files
```

---

## 📝 FILE NAMING BEST PRACTICES

### ✅ GOOD Names:
```
hello.mp3
thank-you.mp3
lesson-01-basics.pdf
practice-greetings-beginner.pdf
lecture-01-introduction.mp4
```

### ❌ BAD Names:
```
Audio 1.mp3
Recording (2).mp3
Document1.pdf
VID20231201.mp4
Untitled.pdf
```

### 💡 Naming Rules:
1. Use lowercase letters
2. Separate words with hyphens (-)
3. No spaces or special characters
4. Be descriptive but concise
5. Include lesson/lecture numbers if applicable

---

## 🔍 VERIFY YOUR UPLOADS

### Check Audio Files Work:
```html
<!-- Test in browser console -->
<audio controls>
    <source src="./assets/audio/pronunciation/bengali/namaste.mp3">
</audio>
```

### Check PDFs Download:
```html
<!-- Test link -->
<a href="./assets/documents/practice-pdfs/bengali/lesson-01.pdf" download>
    Download PDF
</a>
```

### Check Videos Play:
```html
<!-- Test video -->
<video controls width="640">
    <source src="./assets/videos/recorded-lectures/bengali/lecture-01.mp4">
</video>
```

---

## 📊 CONTENT PRIORITY (What to Upload First)

### Week 1 - Immediate Priority:
1. ✅ **10-15 pronunciation audio files per language**
   - Basic greetings
   - Common words
   - Essential phrases

2. ✅ **3-5 lesson PDFs per language**
   - Lesson 1: Introduction
   - Lesson 2: Alphabet/Basics
   - Lesson 3: Basic Grammar

3. ✅ **2-3 practice worksheets per language**
   - Beginner exercises
   - Basic quizzes

### Week 2-4 - Secondary Priority:
4. ⏳ **More pronunciation files** (50+ per language)
5. ⏳ **More lesson PDFs** (10-15 per language)
6. ⏳ **More practice problems** (10-15 per language)
7. ⏳ **Video lectures** (5-10 per language)

---

## 🆘 TROUBLESHOOTING

### Problem: File won't play/open on website
**Solution:** 
- Check file format (MP3 for audio, MP4 for video, PDF for documents)
- Check file name has no spaces or special characters
- Check file path is correct in HTML

### Problem: File is too large
**Solution:**
- **Audio:** Use MP3 format, compress to 128 kbps
- **PDF:** Compress using online tools or Adobe Acrobat
- **Video:** Use H.264 codec, compress to 720p or 1080p

### Problem: Can't find where to put files
**Solution:**
- Run PowerShell: `tree /F assets` to see all folders
- Or use the upload-helper.ps1 script
- Or open Windows Explorer and navigate manually

---

## 📞 NEXT STEPS AFTER UPLOAD

1. ✅ Upload files to correct folders
2. ✅ Open website (index.html) in browser
3. ✅ Test pronunciation practice page
4. ✅ Test recorded lectures page
5. ✅ Verify all files load correctly
6. ✅ Share with Nandini for review

---

## 🎯 QUICK CHECKLIST

- [ ] Organized files by type (audio/PDF/problems/video)
- [ ] Organized files by language (Bengali/Hindi/English)
- [ ] Renamed files following naming conventions
- [ ] Placed audio files in `assets/audio/pronunciation/`
- [ ] Placed PDFs in `assets/documents/practice-pdfs/`
- [ ] Placed problems in `assets/documents/practice-problems/`
- [ ] Placed videos in `assets/videos/recorded-lectures/`
- [ ] Tested files on website
- [ ] Verified audio plays correctly
- [ ] Verified PDFs download correctly
- [ ] Verified videos play correctly

---

## 📚 HELPFUL RESOURCES

- **CONTENT_UPLOAD_GUIDE.md** - Detailed upload instructions
- **upload-helper.ps1** - PowerShell script for easy uploads
- **README.md** - Project documentation
- **QUICK_START.md** - Website setup guide

---

## ✨ SUMMARY

### FOR NANDINI'S VOICE RECORDINGS:
```
📁 assets/audio/pronunciation/[bengali|hindi|english]/
```

### FOR NANDINI'S PRACTICE PDFs:
```
📁 assets/documents/practice-pdfs/[bengali|hindi|english]/
```

### FOR NANDINI'S PRACTICE PROBLEMS:
```
📁 assets/documents/practice-problems/[bengali|hindi|english]/
```

### FOR NANDINI'S VIDEO LECTURES:
```
📁 assets/videos/recorded-lectures/[bengali|hindi|english]/
```

---

**Ready? Start uploading! Just drag and drop files into the correct folders!** 🚀

---

*Quick Reference Guide - Last Updated: December 29, 2025*
