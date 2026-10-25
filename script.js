/* ============================================================
   script.js — Portfolio interactions
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");

  const storedTheme = (() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  })();

  const initialTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage may be disabled */
    }
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  applyTheme(initialTheme);

  themeToggle.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn");
  const nav = $("#primaryNav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuBtn.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  $$(".nav-link", nav).forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    if (e.target.closest("#primaryNav") || e.target.closest("#menuBtn")) return;
    setMenu(false);
  });

  /* ---------- Header scroll shadow ---------- */
  const header = $("#siteHeader");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    $$(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Skill bars ---------- */
  const skillCards = $$(".skill-card");

  function animateBars(card) {
    $$(".bar-fill", card).forEach((fill) => {
      const level = Math.max(0, Math.min(100, Number(fill.dataset.level) || 0));
      requestAnimationFrame(() => {
        fill.style.width = `${level}%`;
      });
    });
  }

  if ("IntersectionObserver" in window) {
    const skillObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateBars(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    skillCards.forEach((card) => skillObserver.observe(card));
  } else {
    skillCards.forEach(animateBars);
  }

  /* ---------- Project data ---------- */
  const palettes = [
    ["#6c8cff", "#8b5cf6"],
    ["#22d3ee", "#3b82f6"],
    ["#f472b6", "#8b5cf6"],
    ["#34d399", "#0ea5e9"],
    ["#f59e0b", "#ef4444"],
    ["#a78bfa", "#6366f1"],
  ];

  function makeImage(label, c1, c2) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${c1}"/>
          <stop offset="1" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="650" cy="120" r="180" fill="rgba(255,255,255,.12)"/>
      <circle cx="120" cy="500" r="220" fill="rgba(0,0,0,.12)"/>
      <text x="60" y="540" font-family="system-ui, sans-serif" font-size="42" font-weight="700" fill="rgba(255,255,255,.92)">${label}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  const projects = [
    {
      id: "aurora",
      title: "Aurora Design System",
      category: "ui",
      year: "2025",
      description: "A multi-brand token system adopted by 6 product teams.",
    },
    {
      id: "northwind",
      title: "Northwind Storefront",
      category: "web",
      year: "2024",
      description: "Headless commerce frontend with 98 Lighthouse score.",
    },
    {
      id: "pulse",
      title: "Pulse Health App",
      category: "mobile",
      year: "2024",
      description: "Cross-platform wellness app with offline-first sync.",
    },
    {
      id: "monogram",
      title: "Monogram Identity",
      category: "brand",
      year: "2023",
      description: "Visual identity and motion guidelines for a fintech startup.",
    },
    {
      id: "atlas",
      title: "Atlas Dashboard",
      category: "web",
      year: "2025",
      description: "Realtime analytics dashboard with accessible data viz.",
    },
    {
      id: "lumen",
      title: "Lumen UI Kit",
      category: "ui",
      year: "2023",
      description: "Component library and Figma kit for product teams.",
    },
    {
      id: "orbit",
      title: "Orbit Travel",
      category: "mobile",
      year: "2024",
      description: "Trip planning app with collaborative itineraries.",
    },
    {
      id: "verso",
      title: "Verso Studio Branding",
      category: "brand",
      year: "2022",
      description: "Full brand system for an architecture studio.",
    },
  ];

  const categoryLabel = {
    web: "Web",
    ui: "UI / UX",
    mobile: "Mobile",
    brand: "Branding",
  };

  const enrichedProjects = projects.map((project, i) => ({
    ...project,
    image: makeImage(project.title.split(" ")[0], ...palettes[i % palettes.length]),
    categoryLabel: categoryLabel[project.category] || project.category,
  }));

  /* ---------- Gallery ---------- */
  const gallery = $("#gallery");
  const galleryEmpty = $("#galleryEmpty");
  const filterButtons = $$(".filter-btn");

  let visibleProjects = [];

  function renderGallery(filter = "all") {
    gallery.textContent = "";
    visibleProjects = enrichedProjects.filter(
      (project) => filter === "all" || project.category === filter
    );

    galleryEmpty.hidden = visibleProjects.length > 0;

    visibleProjects.forEach((project, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-card";
      card.dataset.id = project.id;
      card.setAttribute("aria-label", `Open project: ${project.title}`);

      const img = document.createElement("img");
      img.src = project.image;
      img.alt = `${project.title} preview`;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 800;
      img.height = 600;

      const info = document.createElement("div");
      info.className = "gallery-info";

      const title = document.createElement("h3");
      title.textContent = project.title;

      const meta = document.createElement("p");

      const tag = document.createElement("span");
      tag.className = "gallery-tag";
      tag.textContent = project.categoryLabel;

      const year = document.createElement("span");
      year.textContent = project.year;

      meta.append(tag, year);
      info.append(title, meta);
      card.append(img, info);

      card.addEventListener("click", () => openLightbox(index));
      gallery.append(card);
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      renderGallery(btn.dataset.filter);
    });
  });

  renderGallery("all");

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImage = $("#lbImage");
  const lbTitle = $("#lbTitle");
  const lbMeta = $("#lbMeta");
  const lbCounter = $("#lbCounter");
  const lbClose = $(".lb-close", lightbox);

  let lbIndex = 0;
  let lastFocused = null;

  function paintLightbox() {
    const project = visibleProjects[lbIndex];
    if (!project) return;

    lbImage.src = project.image;
    lbImage.alt = `${project.title} preview`;
    lbTitle.textContent = project.title;
    lbMeta.textContent = `${project.categoryLabel} · ${project.year} · ${project.description}`;
    lbCounter.textContent = `${lbIndex + 1} / ${visibleProjects.length}`;
  }

  function openLightbox(index) {
    if (!visibleProjects.length) return;

    lbIndex = ((index % visibleProjects.length) + visibleProjects.length) % visibleProjects.length;
    paintLightbox();

    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => lbClose.focus());
    document.addEventListener("keydown", lightboxKeydown);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", lightboxKeydown);

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function navigateLightbox(dir) {
    if (!visibleProjects.length) return;
    lbIndex = (lbIndex + dir + visibleProjects.length) % visibleProjects.length;
    paintLightbox();
  }

  function lightboxKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateLightbox(-1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateLightbox(1);
      return;
    }

    if (e.key === "Tab") {
      const focusables = $$(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        lightbox
      ).filter((el) => !el.disabled && el.offsetParent !== null);

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  $("#lbPrev").addEventListener("click", () => navigateLightbox(-1));
  $("#lbNext").addEventListener("click", () => navigateLightbox(1));
  $$("[data-close]", lightbox).forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const formStatus = $("#formStatus");
  const submitBtn = $("#submitBtn");
  const charCount = $("#charCount");
  const messageField = $("#message");

  const fields = {
    name: {
      el: $("#name"),
      err: $("#err-name"),
      validate: (value) =>
        value.trim().length >= 2 ? true : "Please enter at least 2 characters.",
    },
    email: {
      el: $("#email"),
      err: $("#err-email"),
      validate: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
          ? true
          : "Please enter a valid email address.",
    },
    topic: {
      el: $("#topic"),
      err: $("#err-topic"),
      validate: (value) => (value !== "" ? true : "Please choose a topic."),
    },
    message: {
      el: messageField,
      err: $("#err-message"),
      validate: (value) => {
        const text = value.trim();
        if (text.length < 10) return "Please write at least 10 characters.";
        if (text.length > 1500) return "Message is too long (max 1500 characters).";
        return true;
      },
    },
  };

  function validateField(el) {
    const entry = Object.values(fields).find((field) => field.el === el);
    if (!entry) return true;

    const result = entry.validate(el.value);

    if (result === true) {
      entry.err.textContent = "";
      el.removeAttribute("aria-invalid");
      return true;
    }

    entry.err.textContent = result;
    el.setAttribute("aria-invalid", "true");
    return false;
  }

  Object.values(fields).forEach(({ el, err }) => {
    el.addEventListener("input", () => {
      err.textContent = "";
      el.removeAttribute("aria-invalid");
    });
    el.addEventListener("blur", () => validateField(el));
  });

  messageField.addEventListener("input", () => {
    charCount.textContent = String(messageField.value.length);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    formStatus.textContent = "";
    formStatus.className = "form-status";

    /* Honeypot — bots fill hidden fields. Pretend success. */
    const honeypot = $("#website");
    if (honeypot.value.trim() !== "") {
      formStatus.textContent = "Thanks — your message has been sent.";
      formStatus.classList.add("is-success");
      form.reset();
      charCount.textContent = "0";
      return;
    }

    /* Simple client-side rate limit: 30 seconds */
    let lastSent = 0;
    try {
      lastSent = Number(localStorage.getItem("lastContact") || 0);
    } catch {
      lastSent = 0;
    }

    if (Date.now() - lastSent < 30_000) {
      formStatus.textContent = "Please wait a moment before sending another message.";
      formStatus.classList.add("is-error");
      return;
    }

    let valid = true;
    Object.values(fields).forEach(({ el }) => {
      if (!validateField(el)) valid = false;
    });

    if (!valid) {
      formStatus.textContent = "Please fix the highlighted fields.";
      formStatus.classList.add("is-error");

      const firstInvalid = Object.values(fields)
        .map((field) => field.el)
        .find((el) => el.getAttribute("aria-invalid") === "true");

      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* Simulate a network request. Replace with your real endpoint. */
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    formStatus.textContent = "";

    window.setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";

      try {
        localStorage.setItem("lastContact", String(Date.now()));
      } catch {
        /* ignore */
      }

      form.reset();
      charCount.textContent = "0";

      Object.values(fields).forEach(({ el, err }) => {
        err.textContent = "";
        el.removeAttribute("aria-invalid");
      });

      formStatus.textContent =
        "Thanks — your message has been sent. I’ll reply within 48 hours.";
      formStatus.classList.add("is-success");
    }, 900);
  });

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copyEmail");
  const emailCode = $("#emailAddress");

  copyBtn.addEventListener("click", async () => {
    const text = emailCode.textContent.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }

      copyBtn.setAttribute("aria-label", "Email copied");
      copyBtn.classList.add("is-copied");

      window.setTimeout(() => {
        copyBtn.setAttribute("aria-label", "Copy email address");
        copyBtn.classList.remove("is-copied");
      }, 1600);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(emailCode);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
