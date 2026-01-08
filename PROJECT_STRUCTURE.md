# LinguaLive - Professional Folder Structure

> **Premium EdTech Platform** - Learn. Speak. Perfect — Live.

---

## 📁 Complete Project Structure

```
lingualive-ui/
│
├── index.html                      # Landing page with hero section
├── login.html                      # Login / Signup page
├── dashboard.html                  # Student dashboard (renamed from student-dashboard.html)
├── teacher-dashboard.html          # Teacher dashboard
├── live-class.html                 # Live class interface
├── pronunciation.html              # Pronunciation practice (renamed from pronunciation-practice.html)
├── recordings.html                 # Download lectures (renamed from recorded-lectures.html)
│
├── assets/                         # Static assets
│   ├── images/                     # Logos, banners, photos
│   ├── icons/                      # SVG icons
│   └── fonts/                      # Custom fonts (if any)
│
├── css/                            # Stylesheets (Modular CSS Architecture)
│   ├── base.css                    # CSS Reset + Variables
│   ├── layout.css                  # Grid & Layout styles
│   ├── components.css              # Reusable UI components
│   └── pages/
│       ├── animations.css          # Animations & micro-interactions
│       ├── dashboard.css           # Dashboard-specific styles
│       ├── live-class.css          # Live class page styles
│       └── pronunciation.css       # Pronunciation page styles
│
├── js/                             # JavaScript (Modular Architecture)
│   ├── config.js                   # App configuration (API URLs, constants)
│   ├── auth.js                     # Main authentication logic
│   │
│   ├── data/                       # Mock data for development
│   │   └── mockData.js             # Fake courses, users, classes
│   │
│   ├── services/                   # Service layer (Future backend integration)
│   │   ├── authService.js          # Authentication service
│   │   ├── courseService.js        # Course management
│   │   └── liveService.js          # Live class WebRTC service
│   │
│   ├── ui/                         # UI Components
│   │   ├── navbar.js               # Navigation bar component
│   │   ├── sidebar.js              # Sidebar component
│   │   ├── modal.js                # Modal dialogs
│   │   └── toast.js                # Toast notifications
│   │
│   ├── pages/                      # Page-specific scripts
│   │   ├── dashboard.js            # Student dashboard logic
│   │   ├── live-class.js           # Live class functionality
│   │   ├── pronunciation.js        # Pronunciation practice logic
│   │   └── recordings.js           # Recordings page logic
│   │
│   └── utils/                      # Utility functions
│       ├── helpers.js              # General helper functions
│       ├── dom.js                  # DOM manipulation utilities
│       └── constants.js            # Application constants
│
└── README.md                       # Project documentation
```

---

## 🎯 Architecture Overview

### CSS Architecture

**Four-Layer CSS System:**

1. **base.css** - Foundation layer
   - CSS Reset for consistency
   - CSS Custom Properties (variables)
   - Theme colors, spacing, typography
   - Global styles

2. **layout.css** - Structure layer
   - Grid system
   - Flexbox utilities
   - Container styles
   - Responsive breakpoints
   - Sidebar & header layouts

3. **components.css** - Component layer
   - Buttons (primary, secondary, ghost)
   - Cards (glass-effect, interactive)
   - Forms (inputs, selects, textareas)
   - Modals & dialogs
   - Badges & avatars
   - Toast notifications
   - Dropdowns
   - Progress bars
   - Spinners

4. **pages/** - Page-specific layer
   - animations.css - Animations & transitions
   - dashboard.css - Dashboard styles
   - live-class.css - Live class styles
   - pronunciation.css - Practice page styles

### JavaScript Architecture

**Modular ES6 Architecture:**

1. **config.js** - Central configuration
   - API URLs
   - Feature flags
   - App constants
   - Routes

2. **utils/** - Utility layer
   - helpers.js - General utilities (formatting, validation)
   - dom.js - DOM manipulation helpers
   - constants.js - Application constants

3. **data/** - Data layer
   - mockData.js - Mock data for development
   - (Future: API data models)

4. **services/** - Service layer (Business logic)
   - authService.js - Authentication
   - courseService.js - Course management
   - liveService.js - WebRTC for live classes
   - (Future backend integration point)

5. **ui/** - UI Components layer
   - navbar.js - Navigation component
   - sidebar.js - Sidebar component
   - modal.js - Modal dialogs
   - toast.js - Notifications

6. **pages/** - Page-specific logic
   - dashboard.js - Dashboard functionality
   - live-class.js - Live class features
   - pronunciation.js - Practice logic
   - recordings.js - Recordings features

---

## 🚀 Getting Started

### Quick Start

1. **Open any HTML file** in a modern browser
2. **No build process required** - Uses Tailwind CDN
3. **All dependencies are CDN-based**

### Development Workflow

```bash
# Simply open files in browser
# Recommended: Use Live Server extension in VS Code

# Or use Python simple server
python -m http.server 8000

# Or use Node.js http-server
npx http-server
```

---

## 📦 Dependencies

All loaded via CDN (no npm install needed):

- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **Google Fonts (Inter)** - Typography

---

## 🎨 Design System

### Colors (CSS Variables)

```css
--color-primary: #6366f1    /* Indigo */
--color-secondary: #a855f7  /* Purple */
--color-accent: #3b82f6     /* Blue */
```

### Typography

- **Font Family:** Inter (Google Fonts)
- **Font Sizes:** xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- **Font Weights:** 300, 400, 500, 600, 700, 800

### Spacing Scale

- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem
- 3xl: 4rem

---

## 🔧 Key Features

### Implemented

✅ Responsive layout system  
✅ Glassmorphism effects  
✅ Smooth animations  
✅ Toast notifications  
✅ Modal dialogs  
✅ Form validation  
✅ Mock authentication  
✅ Mock data layer  
✅ Utility functions  
✅ DOM helpers  
✅ CSS custom properties  

### Ready for Backend Integration

🔌 Service layer architecture  
🔌 API endpoint configuration  
🔌 Authentication service  
🔌 WebRTC ready structure  
🔌 Mock data can be easily replaced  

---

## 📝 Usage Examples

### Using CSS Classes

```html
<!-- Button with primary gradient -->
<button class="btn btn-primary">
    Click Me
</button>

<!-- Glass-effect card -->
<div class="card card-glass">
    <div class="card-header">
        <h3>Title</h3>
    </div>
    <div class="card-body">
        Content
    </div>
</div>

<!-- Badge -->
<span class="badge badge-live">LIVE</span>
```

### Using JavaScript Services

```javascript
// Import service
import authService from './js/services/authService.js';

// Login
const result = await authService.login('email@example.com', 'password');

if (result.success) {
    console.log('Logged in:', result.user);
}

// Get current user
const user = authService.getCurrentUser();

// Check if authenticated
if (authService.checkAuth()) {
    // User is logged in
}
```

### Using Utilities

```javascript
// Import helpers
import { helpers } from './js/utils/helpers.js';

// Format date
const formatted = helpers.formatDate(new Date(), 'MMM DD, YYYY');

// Validate email
if (helpers.isValidEmail('test@example.com')) {
    // Valid
}

// Local storage
helpers.storage.set('key', { data: 'value' });
const data = helpers.storage.get('key');
```

### Using DOM Utilities

```javascript
// Import DOM helpers
import { dom } from './js/utils/dom.js';

// Select elements
const element = dom.$('#myId');
const elements = dom.$$('.myClass');

// Create element
const button = dom.create('button', {
    className: 'btn btn-primary',
    textContent: 'Click Me',
    onClick: () => alert('Clicked!')
});

// Show/hide
dom.show(element);
dom.hide(element);

// Add/remove classes
dom.addClass(element, 'active');
dom.removeClass(element, 'active');
```

---

## 🎯 Future Backend Integration

### API Integration Points

**All service files are structured for easy backend integration:**

```javascript
// Current (Mock):
async login(email, password) {
    await sleep(1000); // Simulate delay
    return mockData.currentUser;
}

// Future (Real API):
async login(email, password) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
}
```

### WebRTC for Live Classes

The `liveService.js` structure is ready for WebRTC integration:
- Video/Audio capture
- Peer connections
- Screen sharing
- Chat messaging

---

## 📱 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

All components are fully responsive.

---

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Screen reader support
- Reduced motion support

---

## 🐛 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 📄 License

Proprietary - Client Project

---

## 👥 Credits

**Built for education technology with focus on:**
- Modern SaaS design principles
- Scalable architecture
- Clean code practices
- Performance optimization
- User experience excellence

---

**LinguaLive** - Where pronunciation meets perfection ❤️

---

## 📞 Support & Maintenance

For questions about the architecture or modifications, refer to the inline documentation in each file. Every service, utility, and component is well-documented with JSDoc comments.

### File Naming Conventions

- **Kebab-case for HTML/CSS:** `live-class.html`, `base.css`
- **camelCase for JavaScript:** `authService.js`, `mockData.js`
- **PascalCase for classes:** `AuthService`, `ModalComponent`

### Code Style

- ES6+ JavaScript (modules, arrow functions, async/await)
- CSS Custom Properties for theming
- BEM-like naming for CSS classes
- Clean, readable, maintainable code

---

*Last Updated: December 29, 2025*
