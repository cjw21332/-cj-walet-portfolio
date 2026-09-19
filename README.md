# CJ Walet Portfolio

Personal portfolio website for **CHARLES JAMES “CJ” J. WALET**, a 4th-year BSIT student at Quezon City University and aspiring full-stack web developer.

The site presents CJ’s profile, technical skills, internship experience, AI Reviewer capstone project, GitHub activity, certifications, education, and contact information in a dark blue/cyan developer-interface aesthetic.

## Features

- Responsive portfolio layout for desktop, tablet, and mobile screens
- Dark/light theme switcher with local storage persistence
- Animated particle-network background
- Scrollable neon custom scrollbar
- Staggered section reveal animations with reduced-motion support
- Interactive skills explorer with Frontend, Backend, Database, DevOps & Tools, and Others categories
- Interactive terminal modal with portfolio commands
- Certificate document viewer
- GitHub profile and contribution display
- Contact form with validation, character counter, notification email, and visitor auto-reply
- Responsive navigation overlay for small screens
- Hover cards for location and social profile details

## Technology Inventory

The Skills section contains 33 technologies, platforms, concepts, and IT tools represented across the portfolio content, project stack, certifications, and internship experience.

### Frontend

- HTML5
- CSS3
- JavaScript
- React
- Vite
- Tailwind CSS
- TypeScript
- Bootstrap

### Backend and API

- Node.js
- NestJS
- npm
- Postman
- REST APIs

### Databases

- SQL
- MySQL
- PostgreSQL
- Supabase
- Prisma

### DevOps and Development Tools

- Git
- GitHub
- Visual Studio Code
- Terminal
- AWS Amplify
- Vercel

### Cloud, AI, Productivity, and IT Operations

- AWS Cloud
- Amazon Q Developer
- Amazon Location Service
- AWS Machine Learning
- Claude API
- Microsoft Office
- Google Workspace
- Hardware support
- System reimaging

## Project Stack

The featured **AI Reviewer** capstone project uses:

- React and Vite for the client application
- Tailwind CSS for interface styling
- Node.js and NestJS for backend services
- Prisma for database access
- PostgreSQL and Supabase for relational data and hosted services
- Anthropic Claude API for AI-generated reviewers, flashcards, and quizzes

## Project Structure

```text
Portfolio/
├── index.html                 Main portfolio markup
├── styles.css                 Layout, themes, animations, and responsive styles
├── script.js                  UI behavior, skills data, terminal, forms, and animations
├── api/
│   ├── send-email.js          Serverless contact-form email handler
│   ├── mailer.js              Maileroo SMTP delivery helper
│   └── emailTemplates/        Table-based notification and auto-reply templates
│   ├── github-contributions.js Live GitHub contribution API route
├── assets/
│   ├── cjw-logo-dark.svg      CJW logo for dark surfaces
│   └── cjw-logo-light.svg     CJW logo for light surfaces
├── favicon.ico                CJW favicon
├── certifications/            Certificate PDF documents
├── professional pic.png       Profile image
├── concentrix.jpg             Internship company logo
├── sfhs logo.jpg              School/education asset
├── Walet_Charles James CJ_CV.pdf
└── README.md                  Project documentation
```

## Running Locally

Because the portfolio loads local assets, PDFs, images, and a serverless API route, use a local web server instead of opening `index.html` directly.

For example, with Visual Studio Code:

1. Open the project folder.
2. Start a local static server such as Live Server.
3. Open the served URL in a browser.

The contact form endpoint expects the deployed serverless route at:

```text
/api/send-email
```

## Contact Form Configuration

The contact handler uses Maileroo to send:

1. A notification to CJ when a visitor submits the form.
2. An automatic acknowledgement to the visitor.

Configure the Maileroo SMTP account through server-side environment variables before deployment. The frontend does not receive these values:

```text
SMTP_HOST=smtp.maileroo.com
SMTP_PORT=465
SMTP_USERNAME=your_maileroo_smtp_username
SMTP_PASSWORD=your_maileroo_smtp_password
MAILEROO_FROM_EMAIL=your_maileroo_smtp_username
GITHUB_TOKEN=github_personal_access_token_with_read_user_scope
```

Do not commit API keys, SMTP passwords, or other credentials to source control. Client-visible configuration should contain only values that are safe to expose publicly.

`GITHUB_TOKEN` is used only by the serverless contribution route so private contributions can be aggregated without exposing a token in the browser. The GitHub section refreshes every 20 minutes while visible, pauses in background tabs, and calculates the previous 12 months from the current date.

Transactional email markup lives in `api/emailTemplates/`. Both messages use standalone table-based HTML with inline styles and a plain-text alternative for Gmail, Outlook, and mobile clients.

## Interactive Terminal Commands

Open the **Shell** button in the navigation to use the built-in terminal. Available commands are:

```text
help
whoami
skills
projects
exp
education
contact
clear
exit
```

## Design System

The visual language combines:

- Deep navy backgrounds and translucent cards
- Electric blue and cyan accents
- Fira Code for developer-oriented labels and terminal content
- Plus Jakarta Sans for readable body copy
- Glowing borders, particle connections, and restrained glass effects
- Responsive layouts that collapse into stacked content on smaller screens

## Accessibility and UX

- Semantic navigation and labelled sections
- Keyboard-operable skills tabs
- Accessible labels for icon-only social links
- Reduced-motion handling for reveal animations
- Responsive touch-friendly controls
- Native scrolling remains available with a themed scrollbar

## Maintenance Notes

- Keep the technology inventory in `script.js` aligned with the visible project, certification, experience, and terminal content.
- Update the statistics counter in `index.html` when the inventory count changes.
- Keep certificate filenames synchronized with the `data-cert-url` values in `index.html`.
- Keep public profile links and contact details synchronized across the hero, contact section, terminal, and footer.
