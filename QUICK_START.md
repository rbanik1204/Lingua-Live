# ⚡ Quick Start Guide - LinguaLive

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open: http://localhost:5173/

## 🔐 Firebase Environment Variables

Create a `.env.local` in the project root with these values (from your Firebase project settings):

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

The config is validated in `src/lib/firebase.ts`.

## 🎥 Live Class Video (Self-hosted Jitsi + Guaranteed Host Moderator)

This app can use a self-hosted Jitsi where the teacher joins as a **guaranteed moderator** via JWT.

- Setup guide: `SELF_HOSTED_JITSI_JWT_SETUP.md`
- Frontend env (optional):

```bash
VITE_JITSI_DOMAIN=meet.yourdomain.com
VITE_JITSI_ROOM_NAME_PREFIX=
```

## 🔧 Firebase Functions (Required for JWT)

This repo includes a callable function `getJitsiJwt` under `functions/`.

Install + deploy:

```bash
cd functions
npm install
cd ..
npx firebase-tools deploy --only functions
```

## 🧭 Pages In App Navigation

- Landing
- Auth
- Student dashboard
- Teacher dashboard
- Live class
- Pronunciation practice

## 📦 Content Uploads

- Put teaching materials under `public/assets/`.
- See `WHERE_TO_PUT_FILES.md` and `CONTENT_UPLOAD_GUIDE.md`.

## 🏗️ Build

```bash
npm run build
npm run preview
```
    async yourMethod() {
        // Your logic
    }
}

export default new YourService();
```

---

## 🛠️ Common Tasks

### Add a New Page

1. **Create HTML file**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <link href="./css/base.css" rel="stylesheet">
       <link href="./css/layout.css" rel="stylesheet">
       <link href="./css/components.css" rel="stylesheet">
   </head>
   <body>
       <!-- Your content -->
   </body>
   </html>
   ```

2. **Add page-specific JavaScript** (optional)
   ```javascript
   // js/pages/your-page.js
   import authService from '../services/authService.js';
   
   // Your logic
   ```

3. **Add page-specific CSS** (optional)
   ```css
   /* css/pages/your-page.css */
   .your-page-class {
       /* Your styles */
   }
   ```

### Show a Toast Notification

```javascript
import toast from './js/ui/toast.js';

toast.success('Success message!');
toast.error('Error message!');
toast.warning('Warning message!');
toast.info('Info message!');
```

### Open a Modal Dialog

```javascript
import modal from './js/ui/modal.js';

// Simple alert
modal.alert({
    title: 'Hello',
    message: 'This is an alert!'
});

// Confirmation
modal.confirm({
    title: 'Confirm Delete',
    message: 'Are you sure?',
    onConfirm: async () => {
        // Do something
    }
});

// Custom modal
modal.show({
    title: 'Custom Modal',
    content: '<p>Your HTML content</p>',
    size: 'lg',
    buttons: [
        {
            text: 'Cancel',
            className: 'btn-ghost'
        },
        {
            text: 'Submit',
            className: 'btn-primary',
            onClick: async () => {
                // Handle submit
            }
        }
    ]
});
```

### Use Helper Functions

```javascript
import { helpers } from './js/utils/helpers.js';

// Format date
const date = helpers.formatDate(new Date(), 'MMM DD, YYYY');

// Validate email
if (helpers.isValidEmail('test@example.com')) {
    // Valid
}

// Debounce function
const debouncedSearch = helpers.debounce((query) => {
    console.log('Searching:', query);
}, 500);

// Local storage
helpers.storage.set('user', { name: 'John' });
const user = helpers.storage.get('user');
```

---

## 🐛 Troubleshooting

### Issue: "Cannot use import statement outside a module"
**Solution:** Add `type="module"` to your script tag:
```html
<script type="module" src="./js/your-script.js"></script>
```

### Issue: CORS errors when opening HTML directly
**Solution:** Use a local server (see setup options above)

### Issue: CSS not loading
**Solution:** Check file paths are correct:
```html
<!-- Correct -->
<link href="./css/base.css" rel="stylesheet">

<!-- Wrong -->
<link href="css/base.css" rel="stylesheet">
```

### Issue: JavaScript import errors
**Solution:** Ensure you're using correct relative paths:
```javascript
// From HTML file in root
import authService from './js/services/authService.js';

// From JS file in js/services/
import { helpers } from '../utils/helpers.js';
```

---

## 📚 Documentation Quick Links

- **README.md** - Full feature list and usage guide
- **PROJECT_STRUCTURE.md** - Detailed architecture documentation
- **IMPLEMENTATION_STATUS.md** - What's done and what's pending

---

## 🎯 Next Actions

### For Development
1. ✅ Setup complete - pages are ready to view
2. 📝 Create login.html (optional)
3. ⚡ Add page-specific JS (optional)
4. 🔌 Integrate with backend (when ready)

### For Production
1. ✅ Minify CSS and JavaScript
2. ✅ Optimize images
3. ✅ Add meta tags for SEO
4. ✅ Setup deployment pipeline

### For Learning
1. 📖 Read PROJECT_STRUCTURE.md
2. 🔍 Explore existing code
3. 🧪 Test services in console
4. 🎨 Customize colors and styles

---

## ✨ Pro Tips

1. **Use browser DevTools** - Right-click → Inspect to see CSS and test JavaScript
2. **Check console** - All services log useful debug information
3. **Read inline comments** - Code is well-documented
4. **Start small** - Make one change at a time
5. **Test often** - Refresh browser after changes

---

## 🎉 You're Ready!

Everything is set up and working. Just open `index.html` and explore!

**Happy coding! 🚀**

---

*Quick Start Guide - Last Updated: December 29, 2025*
