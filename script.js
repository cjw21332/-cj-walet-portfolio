document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }
    initThemeToggle();
    initCanvas();
    initTyping();
    initCertificationCount();
    initStatsCounter();
    initCursor();
    initCLIModal();
    initPDFModal();
    initForm();
    initRevealOnScroll();
    initSkills();
    initMobileNav();
    initPortalTooltips();
    initGitHubContributions();
});

function initCertificationCount() {
    const certificationCount = document.querySelectorAll('.cert-card[data-cert-title]').length;
    document.querySelectorAll('.hud-certification-count').forEach((element) => {
        element.textContent = String(certificationCount);
    });
    document.querySelectorAll('.certification-stat-number').forEach((element) => {
        element.setAttribute('data-target', String(certificationCount));
    });
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('portfolio-theme', nextTheme);
        updateThemeIcon(nextTheme);
    });

    function updateThemeIcon(theme) {
        const icon = toggleBtn.querySelector('i');
        if (!icon) return;
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
            icon.style.color = '#ff9900';
        } else {
            icon.className = 'fas fa-moon';
            icon.style.color = '';
        }
    }
}

function initGitHubContributions() {
    const section = document.getElementById('github-stats');
    const grid = document.getElementById('gh-contribution-grid');
    const title = document.getElementById('gh-contrib-title');
    const summary = document.getElementById('gh-contrib-summary');
    const months = document.getElementById('gh-months-bar');
    const footnote = document.getElementById('gh-contrib-footnote');
    const languages = document.getElementById('gh-languages');
    const repositories = document.getElementById('gh-repository-count');
    if (!section || !grid || !title || !summary) return;
    let requestController = null;

    const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(`${value.slice(0, 10)}T00:00:00`));

    const setMessage = (message) => {
        grid.innerHTML = `<p class="gh-data-message">${message} <a href="https://github.com/cjw21332" target="_blank" rel="noopener noreferrer">View GitHub profile</a>.</p>`;
    };

    const render = (data) => {
        grid.replaceChildren();
        data.weeks.forEach((week) => {
            const column = document.createElement('div');
            column.className = 'gh-contribution-week';
            week.contributionDays.forEach((day) => {
                const cell = document.createElement('span');
                cell.className = 'gh-contribution-cell';
                const level = day.contributionCount === 0 ? 0 : day.contributionCount < 2 ? 1 : day.contributionCount < 4 ? 2 : day.contributionCount < 7 ? 3 : 4;
                cell.dataset.level = level;
                cell.title = `${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'} on ${day.date}`;
                cell.setAttribute('aria-label', cell.title);
                column.appendChild(cell);
            });
            grid.appendChild(column);
        });
        title.textContent = `${data.totalContributions.toLocaleString()} contributions · Sep 2025 – Sep 19, 2026`;
        if (footnote) footnote.innerHTML = `<strong>cjw21332</strong>'s contribution data is shown for Sep 2025 – Sep 19, 2026.`;
        summary.textContent = `${formatDate(data.fromDate || data.from)} – ${formatDate(data.toDate || data.to)} · Updated just now`;
        if (months) {
            const start = new Date(`${(data.fromDate || data.from).slice(0, 10)}T00:00:00`);
            const end = new Date(`${(data.toDate || data.to).slice(0, 10)}T00:00:00`);
            const labels = [];
            const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
            while (cursor <= end) {
                labels.push(new Intl.DateTimeFormat(undefined, {
                    month: 'short',
                    year: cursor.getMonth() === 0 || cursor.getMonth() === start.getMonth() || cursor.getMonth() === end.getMonth() ? 'numeric' : undefined
                }).format(cursor));
                cursor.setMonth(cursor.getMonth() + 1);
            }
            months.replaceChildren(...labels.map(label => {
                const element = document.createElement('span');
                element.textContent = label;
                return element;
            }));
        }
        if (languages && data.languages?.length) languages.textContent = data.languages.join(', ');
        if (repositories && Number.isInteger(data.repositoryCount)) repositories.textContent = data.repositoryCount.toLocaleString();
    };

    const fallback = (error) => {
        console.warn('[GitHub] Unable to load contribution data:', error);
        title.textContent = 'Unable to load contribution data';
        summary.textContent = 'GitHub data unavailable';
        if (months) months.replaceChildren(Object.assign(document.createElement('span'), {
            textContent: 'Date range unavailable'
        }));
        if (languages) languages.textContent = 'Unavailable';
        if (repositories) repositories.textContent = 'Unavailable';
        setMessage('Unable to load contribution data.');
    };

    const load = async () => {
        if (document.visibilityState === 'hidden') return;
        requestController?.abort();
        requestController = new AbortController();
        summary.classList.add('gh-live-status');
        try {
            const response = await fetch(`/api/github-contributions?refresh=${Date.now()}`, {
                signal: requestController.signal,
                cache: 'no-store'
            });
            if (response.status === 403 || response.status === 429) {
                console.warn('[GitHub] Contribution request was rate-limited.');
            }
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            render(await response.json());
        } catch (error) {
            if (error.name !== 'AbortError') fallback(error);
        } finally {
            summary.classList.remove('gh-live-status');
        }
    };

    load();
    window.addEventListener('pagehide', () => {
        requestController?.abort();
    }, { once: true });
}

function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];

    function createParticles() {
        particles.length = 0;
        const particleCount = Math.floor((width * height) / 14000);
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.9,
                vy: (Math.random() - 0.5) * 0.9,
                size: Math.random() * 2 + 1,
            });
        }
    }

    createParticles();

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function isLight() {
        return document.documentElement.getAttribute('data-theme') === 'light';
    }

    let animationFrame = null;

    function draw() {
        ctx.clearRect(0, 0, width, height);

        const light = isLight();
        const dotAlpha = light ? 0.3 : 0.65;
        const lineAlpha = light ? 0.07 : 0.18;
        const mouseAlpha = light ? 0.12 : 0.35;
        const dotColor1 = light ? '0, 80, 220' : '0, 119, 255';
        const dotColor2 = light ? '0, 130, 255' : '0, 210, 255';

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            const col = i % 2 === 0 ? dotColor1 : dotColor2;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${col}, ${dotAlpha})`;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${dotColor1}, ${lineAlpha * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                let dx = p.x - mouse.x;
                let dy = p.y - mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 160) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(${dotColor2}, ${mouseAlpha * (1 - dist / 160)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        animationFrame = requestAnimationFrame(draw);
    }
    draw();
}

function initTyping() {
    const element = document.querySelector('.typed-text');
    if (!element) return;

    const phrases = [
        "4th Year BSIT Student @ Quezon City University",
        "Aspiring Full Stack Web Developer",
        "Building AI-Powered Web Applications",
        "Passionate about SQL & Software Engineering"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            element.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 25 : 50;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400;
        }

        typingTimer = setTimeout(type, typeSpeed);
    }

    type();
}

function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    let animated = false;

    function updateStats() {
        const banner = document.querySelector('.stats-banner');
        if (!banner || animated) return;

        const rect = banner.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            animated = true;
            stats.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                const decimals = parseInt(stat.getAttribute('data-decimals') || 0);
                let current = 0;
                const increment = Math.max(target / 40, 0.1);

                const updateCount = () => {
                    current += increment;
                    if (current < target) {
                        stat.textContent = current.toFixed(decimals);
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.textContent = target.toFixed(decimals);
                    }
                };
                updateCount();
            });
        }
    }

    window.addEventListener('scroll', updateStats, { passive: true });
    updateStats();
}

function initCLIModal() {
    const modal = document.getElementById('cli-modal');
    const toggleBtn = document.getElementById('terminal-toggle');
    const closeBtn = document.querySelector('.close-cli');
    const input = document.getElementById('cli-input');
    const output = document.getElementById('cli-output');
    const cliBody = document.querySelector('.cli-body');

    if (!modal || !toggleBtn || !input || !output) return;

    let history = [];
    let historyIdx = -1;

    toggleBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        setTimeout(() => input.focus(), 100);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    if (cliBody) {
        cliBody.addEventListener('click', () => input.focus());
    }

    const availableCmds = ['help', 'whoami', 'skills', 'projects', 'exp', 'education', 'contact', 'clear', 'exit'];

    const commandMap = {
        help: `Available Commands:<br>
- <span class="highlight">whoami</span> : Brief bio summary<br>
- <span class="highlight">skills</span> : Technical skills &amp; stack<br>
- <span class="highlight">projects</span> : Showcase projects<br>
- <span class="highlight">exp</span> : Work &amp; internship experience<br>
- <span class="highlight">education</span> : University &amp; degree info<br>
- <span class="highlight">contact</span> : Contact channels<br>
- <span class="highlight">clear</span> : Clear output<br>
- <span class="highlight">exit</span> : Close terminal`,

        whoami: `CHARLES JAMES “CJ” J. WALET | 4th-year BSIT student at Quezon City University.<br>IT Technician Intern at Concentrix (SM Megamall IT Operations). Aspiring Full Stack Web Developer.`,

        skills: `<span style="color:var(--accent-electric)">[Frontend]</span> HTML5, CSS3, JavaScript, React, Vite, Tailwind CSS, TypeScript, Bootstrap<br>
<span style="color:var(--accent-blue)">[Backend &amp; DB]</span> Node.js, NestJS, npm, Postman, REST APIs, SQL, MySQL, PostgreSQL, Supabase, Prisma<br>
<span style="color:var(--accent-ice)">[Cloud, AI &amp; IT]</span> Git, GitHub, VS Code, Terminal, AWS Cloud, AWS Amplify, Amazon Q, Amazon Location, AWS ML, Claude API, Microsoft Office, Google Workspace, Hardware Support, System Reimaging`,

        projects: `<span class="highlight">AI Reviewer</span>: Full-stack web app generating study reviewers, flashcards, &amp; quizzes using Claude API.<br>Tech: React, Vite, Tailwind, Node.js, NestJS, Prisma, PostgreSQL, Supabase.`,

        exp: `<span class="highlight">IT Technician (Intern)</span> @ Concentrix — SM Megamall (IT Operations)<br>Sept 15, 2026 – Present | Hardware &amp; software troubleshooting, workstation reimaging, app deployment.`,

        education: `BS in Information Technology (4th Year)<br>Quezon City University (2021 - Present, Exp. 2027)`,

        contact: `Email: waletcharlesjames3@gmail.com<br>Phone: 0994-713-7570<br>GitHub: github.com/cjw21332<br>Facebook: facebook.com/its.charles.james<br>Location: Quezon City, Philippines`
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = input.value;
            const cmd = rawCmd.trim().toLowerCase();
            input.value = '';

            if (cmd !== '') {
                history.push(rawCmd);
                historyIdx = history.length;
            }

            const row = document.createElement('div');
            row.innerHTML = `<span class="prompt">visitor@cj:~$</span> ${rawCmd}`;
            output.appendChild(row);

            const result = document.createElement('div');
            result.style.marginBottom = '0.8rem';
            result.style.color = 'var(--text-muted)';

            if (cmd === 'clear') {
                output.innerHTML = '';
                return;
            } else if (cmd === 'exit') {
                modal.style.display = 'none';
                return;
            } else if (commandMap[cmd]) {
                result.innerHTML = commandMap[cmd];
                output.appendChild(result);
            } else if (cmd !== '') {
                result.innerHTML = `Command not found: '${cmd}'. Type <span class="highlight">'help'</span> for list of commands.`;
                output.appendChild(result);
            }

            output.scrollTop = output.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0 && historyIdx > 0) {
                historyIdx--;
                input.value = history[historyIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx < history.length - 1) {
                historyIdx++;
                input.value = history[historyIdx];
            } else {
                historyIdx = history.length;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const curr = input.value.trim().toLowerCase();
            const match = availableCmds.find(c => c.startsWith(curr));
            if (match) {
                input.value = match;
            }
        }
    });
}

function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        bar.style.height = `${progress}%`;
    }, { passive: true });
}

function initForm() {
    const form = document.getElementById('contact-form');
    const msgInput = document.getElementById('message');
    const charCountEl = document.getElementById('char-count');
    const successModal = document.getElementById('message-success-modal');
    const successClose = document.getElementById('message-success-close');
    const successAction = document.getElementById('message-success-action');

    const closeSuccessModal = () => {
        if (successModal) successModal.classList.remove('active');
    };

    const openSuccessModal = () => {
        if (!successModal) return;
        successModal.classList.add('active');
        successClose?.focus();
    };

    successClose?.addEventListener('click', closeSuccessModal);
    successAction?.addEventListener('click', closeSuccessModal);
    successModal?.addEventListener('click', (event) => {
        if (event.target === successModal) closeSuccessModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSuccessModal();
    });

    if (msgInput && charCountEl) {
        msgInput.addEventListener('input', () => {
            charCountEl.textContent = msgInput.value.length;
        });
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const msgVal = document.getElementById('message').value.trim();
        const captchaResponse = form.querySelector('[name="h-captcha-response"]')?.value;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!nameVal || !emailVal || !msgVal) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!captchaResponse) {
            alert('Please complete the captcha before sending your message.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>`;
        }

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameVal,
                    email: emailVal,
                    message: msgVal,
                    captchaToken: captchaResponse
                })
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Unable to send your message.');
            }

            if (submitBtn) {
                submitBtn.innerHTML = `<span>Message Sent!</span> <i class="fas fa-check"></i>`;
                submitBtn.style.background = 'var(--accent-blue)';
            }
            form.reset();
            if (charCountEl) charCountEl.textContent = '0';
            if (window.hcaptcha) window.hcaptcha.reset();
            openSuccessModal();
        } catch (err) {
            if (window.hcaptcha) window.hcaptcha.reset();
            if (submitBtn) {
                submitBtn.innerHTML = `<span>Unable to Send</span> <i class="fas fa-triangle-exclamation"></i>`;
            }
            alert(err.message || 'Unable to send your message. Please try again later.');
        } finally {
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Send Message</span> <i class="fas fa-paper-plane"></i>`;
                    submitBtn.style.background = '';
                }
            }, 4000);
        }
    });
}

function initRevealOnScroll() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

const SI = 'https://cdn.simpleicons.org';
const VSC_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 21'%3E%3Cpath fill='%23027eb4' d='M19.462 4.417c-0.129-0.057-0.278-0.05-0.407 0.021l-7.394 4.264L10.32 8.702l-1.341 0.771-7.394-4.264C1.456 5.166 0.5 5.968 0.5 7.155v6.69c0 1.186 0.956 1.989 2.085 2.639l7.394-4.264 0.383 0.222 1.341 0.771 7.394 4.264c1.129-0.65 2.085-1.452 2.085-2.639V7.155c0-1.186-0.956-1.989-2.085-2.738z'/%3E%3Cpath fill='%2300cfff' d='M11.661 10.354l7.394 4.264 0.005-0.003L12.559 8.702zM11.661 10.354L2.585 5.111l0.005-0.003zM2.59 15.892l9.071-5.242 0.005 0.003zM11.661 10.354l7.394 5.242-0.005 0.003z'/%3E%3C/svg%3E";

const skillCategories = [
    {
        id: "frontend",
        label: "Frontend",
        description: "Crafting responsive interfaces & SPAs with modern web frameworks and pixel-perfect styling.",
        technologies: [
            { name: "HTML5",      icon: `${SI}/html5/e34c26` },
            { name: "CSS3",       icon: `${SI}/css/1572b6` },
            { name: "JavaScript", icon: `${SI}/javascript/f7df1e` },
            { name: "React",      icon: `${SI}/react/61dafb` },
            { name: "Vite",       icon: `${SI}/vite/646cff` },
            { name: "Tailwind",   icon: `${SI}/tailwindcss/06b6d4` },
            { name: "TypeScript", icon: `${SI}/typescript/3178c6` },
            { name: "Bootstrap",  icon: `${SI}/bootstrap/7952b3` }
        ]
    },
    {
        id: "backend",
        label: "Backend",
        description: "Building REST APIs and server-side logic with Node.js and NestJS for full-stack applications.",
        technologies: [
            { name: "Node.js", icon: `${SI}/nodedotjs/339933` },
            { name: "NestJS",  icon: `${SI}/nestjs/e0234e` },
            { name: "npm",     icon: `${SI}/npm/cb3837` },
            { name: "Postman", icon: `${SI}/postman/ff6c37` },
            { name: "REST APIs", icon: null, fa: "fas fa-plug", faColor: "#00d2ff" }
        ]
    },
    {
        id: "database",
        label: "Database",
        description: "Writing SQL, designing schemas, and managing relational data with MySQL, PostgreSQL, Supabase, and ORM tools.",
        technologies: [
            { name: "SQL",        icon: null, fa: "fas fa-database", faColor: "#00d2ff" },
            { name: "MySQL",      icon: `${SI}/mysql/4479a1` },
            { name: "PostgreSQL", icon: `${SI}/postgresql/4169e1` },
            { name: "Supabase",   icon: `${SI}/supabase/3ecf8e` },
            { name: "Prisma",     icon: `${SI}/prisma/ffffff`, lightBg: true }
        ]
    },
    {
        id: "devops",
        label: "DevOps & Tools",
        description: "Version control, editors, API tools, deployment platforms, and command-line workflows.",
        technologies: [
            { name: "Git",      icon: `${SI}/git/f05032` },
            { name: "GitHub",   icon: `${SI}/github/ffffff`, lightBg: true },
            { name: "Vercel",   icon: `${SI}/vercel/ffffff`, lightBg: true },
            { name: "VS Code",  icon: VSC_SVG },
            { name: "Terminal", icon: `${SI}/gnubash/4eaa25` },
            { name: "AWS Amplify", icon: "assets/aws-amplify.svg" }
        ]
    },
    {
        id: "others",
        label: "Others",
        description: "Cloud, AI, productivity, and IT operations skills supporting development and technical work.",
        technologies: [
            { name: "MS Office", icon: null, fa: "fab fa-microsoft",        faColor: "#d83b01" },
            { name: "Google WS", icon: `${SI}/google/4285f4` },
            { name: "Claude API", icon: `${SI}/claude/d97757` },
            { name: "AWS Cloud", icon: null, fa: "fab fa-aws", faColor: "#ff9900" },
            { name: "Amazon Q", icon: null, fa: "fab fa-aws", faColor: "#ff9900" },
            { name: "Amazon Location", icon: null, fa: "fas fa-location-dot", faColor: "#38bdf8" },
            { name: "AWS ML", icon: null, fa: "fab fa-aws", faColor: "#ff9900" },
            { name: "Hardware Support", icon: null, fa: "fas fa-screwdriver-wrench", faColor: "#94a3b8" },
            { name: "System Reimaging", icon: null, fa: "fas fa-desktop", faColor: "#94a3b8" }
        ]
    }
];

function initSkills() {
    const container = document.querySelector('.skills-section');
    if (!container) return;

    const catBtns = container.querySelectorAll('.skill-cat-btn');
    const panelInner = container.querySelector('.skills-panel-inner');
    const panel = container.querySelector('.skills-panel');
    const descEl = panel ? panel.querySelector('.skills-desc') : null;
    const techGrid = panel ? panel.querySelector('.skills-tech-grid') : null;
    if (!descEl || !techGrid) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeCategory = 'frontend';
    let isTransitioning = false;

    function renderCategory(catId, animate = true) {
        const cat = skillCategories.find(c => c.id === catId);
        if (!cat) return;

        if (!animate || prefersReducedMotion) {
            descEl.textContent = cat.description;
            techGrid.innerHTML = '';
            cat.technologies.forEach((tech, i) => {
                const item = createTechItem(tech);
                techGrid.appendChild(item);
                requestAnimationFrame(() => {
                    item.classList.add('visible');
                });
            });
            return;
        }

        panelInner.classList.add('inner-fade-out');

        setTimeout(() => {
            descEl.textContent = cat.description;
            techGrid.innerHTML = '';

            cat.technologies.forEach((tech, i) => {
                const item = createTechItem(tech);
                techGrid.appendChild(item);
                setTimeout(() => {
                    item.classList.add('visible');
                }, prefersReducedMotion ? 0 : i * 40 + 50);
            });

            panelInner.classList.remove('inner-fade-out');
            isTransitioning = false;
        }, 200);
    }

    function createTechItem(tech) {
        const item = document.createElement('div');
        item.className = 'tech-item';
        const iconClass = tech.lightBg ? 'tech-icon tech-icon--lightbg' : 'tech-icon';
        let iconHTML;
        if (tech.icon) {
            iconHTML = `<img src="${tech.icon}" alt="${tech.name}" loading="lazy" width="28" height="28">`;
        } else {
            const color = tech.faColor ? tech.faColor : 'var(--accent-blue)';
            iconHTML = `<i class="${tech.fa}" style="font-size:1.6rem;color:${color}"></i>`;
        }
        item.innerHTML = `
            <div class="${iconClass}">${iconHTML}</div>
            <span class="tech-label">${tech.name}</span>
        `;
        return item;
    }

    function setActive(btn) {
        const catId = btn.getAttribute('data-category');
        if (catId === activeCategory) return;
        catBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeCategory = catId;
        renderCategory(activeCategory);
    }

    catBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-scale');
            setActive(btn);
        });
        btn.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-scale');
        });
        btn.addEventListener('click', () => {
            setActive(btn);
        });
        btn.addEventListener('focus', () => {
            document.body.classList.add('cursor-scale');
            setActive(btn);
        });
        btn.addEventListener('blur', () => {
            document.body.classList.remove('cursor-scale');
        });
        btn.addEventListener('keydown', (e) => {
            const btns = Array.from(catBtns);
            const idx = btns.indexOf(btn);
            let next = null;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                next = btns[(idx + 1) % btns.length];
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                next = btns[(idx - 1 + btns.length) % btns.length];
            } else if (e.key === 'Home') {
                e.preventDefault();
                next = btns[0];
            } else if (e.key === 'End') {
                e.preventDefault();
                next = btns[btns.length - 1];
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActive(btn);
                return;
            }
            if (next) {
                next.focus();
                setActive(next);
            }
        });
    });

    if (activeCategory) {
        const defaultBtn = container.querySelector(`.skill-cat-btn[data-category="${activeCategory}"]`);
        if (defaultBtn) {
            defaultBtn.classList.add('active');
            defaultBtn.setAttribute('aria-selected', 'true');
        }
    }

    renderCategory('frontend');
}

function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.cursor-follower');
    if (!cursor || !follower || !window.matchMedia('(pointer: fine)').matches) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;
    let initialized = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

        if (!initialized) {
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
            posX = mouseX;
            posY = mouseY;
            initialized = true;
        }
    });

    function animateFollower() {
        posX += (mouseX - posX) * 0.12;
        posY += (mouseY - posY) * 0.12;
        follower.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    const interactables = document.querySelectorAll('a, button, .project-card, .pillar-card, .cert-card, input, textarea, .skill-cat-btn, select');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
}

function initMobileNav() {
    const mobileBtn = document.getElementById('mobile-toggle');
    const closeBtn = document.getElementById('close-mobile');
    const navOverlay = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!mobileBtn || !navOverlay) return;

    mobileBtn.addEventListener('click', () => {
        navOverlay.classList.add('active');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            navOverlay.classList.remove('active');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navOverlay.classList.remove('active');
        });
    });
}

function initPDFModal() {
    const modal = document.getElementById('pdf-modal');
    const titleEl = document.getElementById('pdf-modal-title');
    const frame = document.getElementById('pdf-frame');
    const closeBtns = document.querySelectorAll('.close-pdf');
    const certCards = document.querySelectorAll('.cert-preview-target');

    if (!modal || !frame || !certCards.length) return;

    certCards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-cert-url');
            const title = card.getAttribute('data-cert-title');

            if (url) {
                // Remove toolbar, navigation panes, scrollbars, and download options
                frame.src = `${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
                if (titleEl) titleEl.textContent = title || 'Certificate Viewer';
                modal.style.display = 'flex';
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            frame.src = '';
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            frame.src = '';
        }
    });
}

function initMagneticElements() {
    const elements = document.querySelectorAll('.magnetic-element');

    elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
        });
    });
}

function initPortalTooltips() {
    const portalTargets = document.querySelectorAll('.location-hover-target, .social-preview-target');
    
    portalTargets.forEach(target => {
        const tooltip = target.querySelector('.map-tooltip-card') || target.querySelector('.social-preview-card');
        if (!tooltip) return;

        const isSocialTooltip = target.classList.contains('social-preview-target');
        if (isSocialTooltip) {
            tooltip.classList.add('social');

            target.addEventListener('click', (e) => {
                if (window.matchMedia('(hover: none)').matches) {
                    e.preventDefault();
                    tooltip.classList.toggle('active');
                }
            });
            return;
        }

        // Make it a portal
        tooltip.classList.add('portal-tooltip');
        document.body.appendChild(tooltip); 
        
        let hideTimeout;

        const show = () => {
            clearTimeout(hideTimeout);
            const rect = target.getBoundingClientRect();

            tooltip.classList.add('active');
            
            // Position
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            const gap = 12; // Gap between link and tooltip
            
            let top, left;

            // Center horizontally relative to trigger
            left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
            
            // Keep in bounds with more padding (20px)
            left = Math.max(20, Math.min(left, document.documentElement.clientWidth - tooltip.offsetWidth - 20));

            if (spaceAbove > tooltip.offsetHeight + gap + 20) {
                // Show above if space
                top = rect.top - tooltip.offsetHeight - gap;
                tooltip.classList.remove('arrow-bottom');
                tooltip.classList.add('arrow-top');
            } else {
                // Otherwise show below
                top = rect.bottom + gap;
                tooltip.classList.remove('arrow-top');
                tooltip.classList.add('arrow-bottom');
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        };

        const hide = () => {
            hideTimeout = setTimeout(() => {
                tooltip.classList.remove('active');
            }, 150);
        };

        target.addEventListener('mouseenter', show);
        target.addEventListener('mouseleave', hide);
        tooltip.addEventListener('mouseenter', show);
        tooltip.addEventListener('mouseleave', hide);

        // Touch support
        target.addEventListener('click', (e) => {
            if (window.matchMedia('(hover: none)').matches) {
                e.preventDefault();
                tooltip.classList.toggle('active');
            }
        });
    });
}
