/* ============================================================
   script.js — Portfolio SUGIANTO
   ============================================================ */
(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ============================================================
     KONFIGURASI PIN — GANTI DI SINI
     ------------------------------------------------------------
     PIN default: 1234
     Hash di bawah = SHA-256 dari "1234".

     Kalau mau ganti PIN, buka DevTools Console di browser dan jalankan:

       crypto.subtle.digest('SHA-256', new TextEncoder().encode('PIN_BARU_ANDA'))
         .then(b => console.log(
           Array.from(new Uint8Array(b))
             .map(x => x.toString(16).padStart(2, '0')).join('')
         ));

     Lalu ganti string di bawah dengan hasilnya.
     ============================================================ */
  const PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 60_000;         // 60 detik setelah 5x salah
  const UNLOCK_TTL_MS = 30 * 60_000; // 30 menit sesi terbuka
  const UNLOCK_KEY = "sugianto.private.unlockedAt";

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");

  const storedTheme = (() => {
    try { return localStorage.getItem("theme"); } catch { return null; }
  })();

  const initialTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap");
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
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
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

  /* ---------- Header scroll ---------- */
  const header = $("#siteHeader");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal ---------- */
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
      requestAnimationFrame(() => { fill.style.width = `${level}%`; });
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

  /* ---------- Placeholder image builder ---------- */
  const palettes = [
    ["#6c8cff", "#8b5cf6"],
    ["#22d3ee", "#3b82f6"],
    ["#f472b6", "#8b5cf6"],
    ["#34d399", "#0ea5e9"],
    ["#f59e0b", "#ef4444"],
    ["#a78bfa", "#6366f1"],
  ];

  const privatePalettes = [
    ["#f59e0b", "#b45309"],
    ["#fbbf24", "#d97706"],
    ["#f97316", "#c2410c"],
    ["#eab308", "#a16207"],
    ["#fb923c", "#ea580c"],
    ["#facc15", "#ca8a04"],
  ];

  function makeImage(label, c1, c2, isPrivate = false) {
    const watermark = isPrivate
      ? `<text x="770" y="60" font-family="system-ui" font-size="22" font-weight="800"
              fill="rgba(255,255,255,.7)" text-anchor="end">PRIVATE</text>`
      : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${c1}"/>
          <stop offset="1" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="650" cy="120" r="180" fill="rgba(255,255,255,.12)"/>
      <circle cx="120" cy="500" r="220" fill="rgba(0,0,0,.14)"/>
      ${watermark}
      <text x="60" y="540" font-family="system-ui, sans-serif" font-size="42"
            font-weight="700" fill="rgba(255,255,255,.92)">${label}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  /* ---------- Public projects ---------- */
  const publicProjects = [
    { id: "ledger-api",   title: "Ledger API",   category: "backend", year: "2025", description: "REST + GraphQL API untuk sistem keuangan, uptime 99,99%." },
    { id: "taskflow",     title: "TaskFlow",     category: "web",     year: "2024", description: "Manajemen proyek kolaboratif dengan update real-time." },
    { id: "pocketbudget", title: "PocketBudget", category: "mobile",  year: "2024", description: "Keuangan pribadi offline-first untuk Android & iOS." },
    { id: "deploykit",    title: "DeployKit",    category: "devops",  year: "2025", description: "CLI + template CI untuk deployment tanpa downtime." },
    { id: "insight",      title: "Insight",      category: "web",     year: "2023", description: "Dashboard analitik, grafik aksesibel, performa tinggi." },
    { id: "authguard",    title: "AuthGuard",    category: "backend", year: "2023", description: "Microservice autentikasi & otorisasi berbasis token." },
    { id: "fieldnotes",   title: "FieldNotes",   category: "mobile",  year: "2022", description: "Pengumpulan data lapangan yang jalan tanpa sinyal." },
    { id: "pipeline",     title: "Pipeline",     category: "devops",  year: "2024", description: "Observability untuk pipeline CI/CD & log." },
  ];

  /* ---------- Private projects ---------- */
  const privateProjects = [
    { id: "p-bts",      title: "Behind the scenes", category: "private", year: "2025", description: "Foto proses ngoding, catatan, dan sticky notes." },
    { id: "p-setup",    title: "Setup meja kerja",  category: "private", year: "2024", description: "Meja, monitor, dan alat kerja sehari-hari." },
    { id: "p-certs",    title: "Sertifikat",        category: "private", year: "2023", description: "Sertifikat dan pencapaian yang saya simpan." },
    { id: "p-drafts",   title: "Draft proyek",      category: "private", year: "2025", description: "Ide dan draft yang belum dirilis ke publik." },
    { id: "p-notes",    title: "Catatan belajar",   category: "private", year: "2024", description: "Rangkuman belajar, snippet, dan eksperimen." },
    { id: "p-ui",       title: "Eksperimen UI",     category: "private", year: "2024", description: "Prototype UI dan animasi yang belum dipakai." },
  ];

  const categoryLabel = { web: "Web", backend: "Backend", mobile: "Mobile", devops: "DevOps", private: "Pribadi" };

  function enrich(projects, palettesList, isPrivate) {
    return projects.map((p, i) => ({
      ...p,
      image: makeImage(p.title.split(" ")[0], ...palettesList[i % palettesList.length], isPrivate),
      categoryLabel: categoryLabel[p.category] || p.category,
    }));
  }

  const publicEnriched = enrich(publicProjects, palettes, false);
  const privateEnriched = enrich(privateProjects, privatePalettes, true);

  /* ---------- Public gallery ---------- */
  const gallery = $("#gallery");
  const galleryEmpty = $("#galleryEmpty");
  const filterButtons = $$(".filter-btn");

  let visiblePublic = [];

  function renderPublic(filter = "all") {
    gallery.textContent = "";
    visiblePublic = publicEnriched.filter((p) => filter === "all" || p.category === filter);
    galleryEmpty.hidden = visiblePublic.length > 0;

    visiblePublic.forEach((project, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-card";
      card.dataset.id = project.id;
      card.setAttribute("aria-label", `Buka proyek: ${project.title}`);

      const img = document.createElement("img");
      img.src = project.image;
      img.alt = `Pratinjau ${project.title}`;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 800; img.height = 600;

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
      card.addEventListener("click", () => openLightbox(visiblePublic, index, "public"));
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
      renderPublic(btn.dataset.filter);
    });
  });

  renderPublic("all");

  /* ---------- Lightbox (dipakai untuk publik & privat) ---------- */
  function createLightbox(refs, sourceKey) {
    const { wrap, image, title, meta, counter, prev, next } = refs;
    const closeBtn = $(".lb-close", wrap);

    let items = [];
    let index = 0;
    let lastFocused = null;

    function paint() {
      const item = items[index];
      if (!item) return;
      image.src = item.image;
      image.alt = `Pratinjau ${item.title}`;
      title.textContent = item.title;
      meta.textContent = `${item.categoryLabel} · ${item.year} · ${item.description}`;
      counter.textContent = `${index + 1} / ${items.length}`;
    }

    function open(list, startIndex) {
      items = list;
      index = startIndex;
      paint();
      lastFocused = document.activeElement;
      wrap.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => closeBtn.focus());
      document.addEventListener("keydown", onKey);
    }

    function close() {
      wrap.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function go(dir) {
      if (!items.length) return;
      index = (index + dir + items.length) % items.length;
      paint();
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); return; }
      if (e.key === "Tab") {
        const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', wrap)
          .filter((el) => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    $$("[data-close]", wrap).forEach((el) => el.addEventListener("click", close));

    return { open, close, sourceKey };
  }

  const publicLb = createLightbox({
    wrap: $("#lightbox"),
    image: $("#lbImage"),
    title: $("#lbTitle"),
    meta: $("#lbMeta"),
    counter: $("#lbCounter"),
    prev: $("#lbPrev"),
    next: $("#lbNext"),
  }, "public");

  const privateLb = createLightbox({
    wrap: $("#privateLightbox"),
    image: $("#pLbImage"),
    title: $("#pLbTitle"),
    meta: $("#pLbMeta"),
    counter: $("#pLbCounter"),
    prev: $("#pLbPrev"),
    next: $("#pLbNext"),
  }, "private");

  function openLightbox(list, index, kind) {
    if (kind === "private") privateLb.open(list, index);
    else publicLb.open(list, index);
  }

  /* ============================================================
     PRIVATE GALLERY + PIN
     ============================================================ */
  const privateSection = $("#private");
  const privateGallery = $("#privateGallery");
  const privateLink = $("#privateLink");
  const lockBtn = $("#lockBtn");

  const pinModal = $("#pinModal");
  const pinForm = $("#pinForm");
  const pinInput = $("#pinInput");
  const pinError = $("#pinError");
  const pinAttemptsEl = $("#pinAttempts");
  const pinSubmit = $("#pinSubmit");
  const pinCloseBtns = $$("[data-pin-close]");

  let attempts = 0;
  let lockedUntil = 0;
  let lockTimer = null;

  /* --- Sesi unlock --- */
  function isUnlocked() {
    try {
      const t = Number(sessionStorage.getItem(UNLOCK_KEY) || 0);
      return t > 0 && Date.now() - t < UNLOCK_TTL_MS;
    } catch {
      return false;
    }
  }

  function markUnlocked() {
    try { sessionStorage.setItem(UNLOCK_KEY, String(Date.now())); } catch {}
  }

  function clearUnlocked() {
    try { sessionStorage.removeItem(UNLOCK_KEY); } catch {}
  }

  /* --- Render galeri privat --- */
  function renderPrivate() {
    privateGallery.textContent = "";
    privateEnriched.forEach((project, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-card";
      card.dataset.id = project.id;
      card.setAttribute("aria-label", `Buka proyek pribadi: ${project.title}`);

      const img = document.createElement("img");
      img.src = project.image;
      img.alt = `Pratinjau ${project.title}`;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 800; img.height = 600;

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
      card.addEventListener("click", () => privateLb.open(privateEnriched, index));
      privateGallery.append(card);
    });
  }

  /* --- Buka / tutup bagian privat --- */
  function showPrivateSection(scrollTo = true) {
    if (privateSection.hidden) {
      renderPrivate();
      privateSection.hidden = false;
    }
    if (scrollTo) {
      requestAnimationFrame(() => {
        privateSection.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    }
  }

  function hidePrivateSection() {
    privateSection.hidden = true;
    privateGallery.textContent = "";
  }

  /* --- PIN modal --- */
  function openPinModal() {
    if (lockedUntil > Date.now()) {
      pinError.textContent = "Tunggu sebentar ya, masih dalam masa jeda.";
      return;
    }
    pinInput.value = "";
    pinError.textContent = "";
    pinInput.removeAttribute("aria-invalid");
    updateAttemptHint();
    pinModal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => pinInput.focus());
  }

  function closePinModal() {
    pinModal.hidden = true;
    document.body.style.overflow = "";
    pinInput.value = "";
    pinError.textContent = "";
    if (privateLink) privateLink.focus();
  }

  function updateAttemptHint() {
    if (lockedUntil > Date.now()) {
      const s = Math.ceil((lockedUntil - Date.now()) / 1000);
      pinAttemptsEl.textContent = `Terkunci. Coba lagi dalam ${s} detik.`;
    } else if (attempts > 0) {
      pinAttemptsEl.textContent = `Sisa percobaan: ${MAX_ATTEMPTS - attempts}`;
    } else {
      pinAttemptsEl.textContent = "";
    }
  }

  function startLockout(ms) {
    lockedUntil = Date.now() + ms;
    pinSubmit.disabled = true;

    if (lockTimer) clearInterval(lockTimer);
    lockTimer = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        clearInterval(lockTimer);
        lockedUntil = 0;
        attempts = 0;
        pinSubmit.disabled = false;
        pinError.textContent = "";
        updateAttemptHint();
      } else {
        updateAttemptHint();
      }
    }, 500);
  }

  async function sha256Hex(text) {
    if (!window.crypto?.subtle) return null;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  pinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (lockedUntil > Date.now()) {
      pinError.textContent = "Masih terkunci. Tunggu sebentar ya.";
      return;
    }

    const value = pinInput.value.trim();
    pinError.textContent = "";

    if (!value) {
      pinError.textContent = "PIN-nya diisi dulu ya.";
      pinInput.setAttribute("aria-invalid", "true");
      pinInput.focus();
      return;
    }

    const hash = await sha256Hex(value);

    if (hash === null) {
      // crypto.subtle tidak tersedia (misal bukan https/localhost)
      pinError.textContent =
        "Browser ini belum mendukung verifikasi PIN. Buka lewat localhost atau https.";
      return;
    }

    if (hash === PIN_HASH) {
      markUnlocked();
      closePinModal();
      showPrivateSection(true);
      attempts = 0;
      return;
    }

    attempts += 1;
    pinInput.value = "";
    pinInput.setAttribute("aria-invalid", "true");
    pinInput.focus();

    if (attempts >= MAX_ATTEMPTS) {
      startLockout(LOCKOUT_MS);
      pinError.textContent = "Terlalu banyak percobaan. Tunggu 60 detik.";
    } else {
      pinError.textContent = "PIN salah. Coba lagi.";
      updateAttemptHint();
    }
  });

  pinInput.addEventListener("input", () => {
    pinError.textContent = "";
    pinInput.removeAttribute("aria-invalid");
  });

  pinCloseBtns.forEach((el) => el.addEventListener("click", closePinModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pinModal.hidden) closePinModal();
  });

  /* --- Klik menu "Galeri pribadi" --- */
  privateLink.addEventListener("click", (e) => {
    if (isUnlocked()) {
      e.preventDefault();
      showPrivateSection(true);
      return;
    }
    e.preventDefault();
    openPinModal();
  });

  /* --- Tombol "Kunci lagi" --- */
  lockBtn.addEventListener("click", () => {
    clearUnlocked();
    hidePrivateSection();
    openPinModal();
  });

  /* --- Saat halaman dimuat: kalau sesi masih aktif, langsung tampil --- */
  if (isUnlocked()) {
    showPrivateSection(false);
  }

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const formStatus = $("#formStatus");
  const submitBtn = $("#submitBtn");
  const charCount = $("#charCount");
  const messageField = $("#message");

  const fields = {
    name: {
      el: $("#name"), err: $("#err-name"),
      validate: (v) => v.trim().length >= 2 ? true : "Nama minimal 2 karakter ya.",
    },
    email: {
      el: $("#email"), err: $("#err-email"),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? true : "Email-nya kayaknya belum bener. Cek lagi ya.",
    },
    topic: {
      el: $("#topic"), err: $("#err-topic"),
      validate: (v) => v !== "" ? true : "Pilih dulu mau bahas apa.",
    },
    message: {
      el: messageField, err: $("#err-message"),
      validate: (v) => {
        const t = v.trim();
        if (t.length < 10) return "Tulis minimal 10 karakter ya.";
        if (t.length > 1500) return "Pesannya kepanjangan (maks 1500 karakter).";
        return true;
      },
    },
  };

  function validateField(el) {
    const entry = Object.values(fields).find((f) => f.el === el);
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

    const honeypot = $("#website");
    if (honeypot.value.trim() !== "") {
      formStatus.textContent = "Makasih — pesannya udah masuk.";
      formStatus.classList.add("is-success");
      form.reset();
      charCount.textContent = "0";
      return;
    }

    let lastSent = 0;
    try { lastSent = Number(localStorage.getItem("lastContact") || 0); } catch {}
    if (Date.now() - lastSent < 30_000) {
      formStatus.textContent = "Sabar dulu ya, baru aja kirim pesan.";
      formStatus.classList.add("is-error");
      return;
    }

    let valid = true;
    Object.values(fields).forEach(({ el }) => {
      if (!validateField(el)) valid = false;
    });

    if (!valid) {
      formStatus.textContent = "Ada yang perlu dibenerin dulu ya.";
      formStatus.classList.add("is-error");
      const firstInvalid = Object.values(fields)
        .map((f) => f.el)
        .find((el) => el.getAttribute("aria-invalid") === "true");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim…";
    formStatus.textContent = "";

    window.setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim pesan";

      try { localStorage.setItem("lastContact", String(Date.now())); } catch {}

      form.reset();
      charCount.textContent = "0";
      Object.values(fields).forEach(({ el, err }) => {
        err.textContent = "";
        el.removeAttribute("aria-invalid");
      });

      formStatus.textContent =
        "Makasih ya! Pesannya udah masuk, saya balas <48 jam 🙌";
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
      copyBtn.setAttribute("aria-label", "Email disalin");
      copyBtn.classList.add("is-copied");
      window.setTimeout(() => {
        copyBtn.setAttribute("aria-label", "Salin alamat email");
        copyBtn.classList.remove("is-copied");
      }, 1600);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(emailCode);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
