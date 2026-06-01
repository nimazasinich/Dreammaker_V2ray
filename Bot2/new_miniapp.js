function miniAppHtml() {
  const planData = Object.values(PLANS).map(p => ({
    id: p.id,
    emoji: p.emoji,
    name_fa: p.name_fa,
    name_en: p.name_en,
    data_gb: p.data_gb,
    days: p.days,
    price: p.price,
    popular: !!p.popular,
  }));
  const payload = JSON.stringify({
    brand: CONFIG.BRAND_NAME,
    support: CONFIG.SUPPORT_USERNAME,
    plans: planData,
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <title>${CONFIG.BRAND_NAME}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#f0f4f8;
      --panel:#ffffff;
      --text:#0f172a;
      --muted:#64748b;
      --border:#e2e8f0;
      --primary:#0d9488;
      --primary-dk:#0f766e;
      --primary-lt:rgba(13,148,136,.10);
      --accent:#dc2626;
      --gold:#d97706;
      --ok:#16a34a;
      --r:12px;
      --r-lg:16px;
      --sh-sm:0 2px 8px rgba(0,0,0,.06);
      --sh:0 4px 20px rgba(0,0,0,.10);
      --sh-lg:0 8px 32px rgba(0,0,0,.14);
      --safe-top:env(safe-area-inset-top,0px);
      --safe-btm:env(safe-area-inset-bottom,0px);
    }
    body{
      background:var(--tg-theme-bg-color,var(--bg));
      color:var(--tg-theme-text-color,var(--text));
      font:14px/1.6 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      min-height:100vh;
      overflow-x:hidden;
    }
    a,button,input,select{font:inherit;color:inherit}
    button{cursor:pointer;border:none;background:none}
    /* ── layout ─────────────────────────────── */
    .app{max-width:680px;margin:0 auto;padding:calc(10px + var(--safe-top)) 12px calc(100px + var(--safe-btm))}
    /* ── topbar ─────────────────────────────── */
    .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 0 14px}
    .brand{display:flex;align-items:center;gap:10px}
    .logo-wrap{width:44px;height:44px;flex-shrink:0}
    .brand-info h1{font-size:18px;font-weight:800;letter-spacing:-.3px;line-height:1.2}
    .brand-info .tagline{font-size:11px;color:var(--tg-theme-hint-color,var(--muted))}
    .lang-sw{display:flex;border:1.5px solid var(--border);border-radius:10px;overflow:hidden;flex-shrink:0}
    .lang-btn{padding:8px 13px;font-size:12px;font-weight:700;color:var(--tg-theme-hint-color,var(--muted));transition:all .15s}
    .lang-btn.active{background:var(--primary);color:#fff}
    /* ── hero ────────────────────────────────── */
    .hero{
      background:linear-gradient(135deg,#0d9488,#0f766e 55%,#115e59);
      border-radius:var(--r-lg);
      padding:18px;color:#fff;margin-bottom:12px;
      position:relative;overflow:hidden
    }
    .hero::after{content:'';position:absolute;top:-40%;right:-5%;width:55%;height:180%;
      background:rgba(255,255,255,.05);border-radius:50%;pointer-events:none}
    .hero-title{font-size:20px;font-weight:800;line-height:1.3;margin-bottom:5px}
    .hero-sub{font-size:12px;opacity:.82;margin-bottom:14px}
    .tech-chips{display:flex;flex-wrap:wrap;gap:6px}
    .tech-chip{
      background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.22);
      border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;
      backdrop-filter:blur(4px)
    }
    /* route svg */
    .route-wrap{margin-top:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:12px}
    .route-svg{width:100%;height:auto;display:block}
    /* ── advisor ─────────────────────────────── */
    .advisor{
      background:var(--tg-theme-secondary-bg-color,var(--panel));
      border:1px solid var(--border);border-radius:var(--r-lg);
      padding:14px;margin-bottom:12px;box-shadow:var(--sh-sm)
    }
    .advisor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:12px}
    .advisor-head-left{display:flex;align-items:center;gap:9px}
    .advisor-icon{
      width:36px;height:36px;border-radius:10px;flex-shrink:0;
      background:linear-gradient(135deg,var(--primary),#7c3aed);
      display:flex;align-items:center;justify-content:center;color:#fff
    }
    .advisor-title{font-size:15px;font-weight:700;line-height:1.2}
    .advisor-desc{font-size:11px;color:var(--tg-theme-hint-color,var(--muted))}
    .free-badge{background:#dcfce7;color:#16a34a;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap}
    .usage-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:11px}
    .usage-tab{
      border:1.5px solid var(--border);border-radius:10px;padding:9px 6px;
      background:transparent;color:var(--tg-theme-hint-color,var(--muted));
      font-size:12px;font-weight:600;
      display:flex;flex-direction:column;align-items:center;gap:4px;
      transition:all .15s
    }
    .usage-tab svg{opacity:.55;transition:opacity .15s}
    .usage-tab.active{border-color:var(--primary);background:var(--primary-lt);color:var(--primary)}
    .usage-tab.active svg{opacity:1}
    .advisor-result{
      background:linear-gradient(135deg,rgba(13,148,136,.08),rgba(13,148,136,.03));
      border:1px solid rgba(13,148,136,.22);border-radius:10px;
      padding:11px 13px;display:flex;align-items:center;gap:10px
    }
    .result-emoji{font-size:26px;line-height:1;flex-shrink:0}
    .result-text strong{display:block;font-size:14px;font-weight:700;color:var(--primary);margin-bottom:2px}
    .result-text span{font-size:12px;color:var(--tg-theme-hint-color,var(--muted));line-height:1.4}
    /* ── search bar ──────────────────────────── */
    .search-bar{display:grid;grid-template-columns:1fr auto;gap:8px;margin-bottom:12px}
    .search-wrap{position:relative}
    .search-icon{position:absolute;inset-inline-start:11px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;display:flex}
    .search-input{
      width:100%;border:1.5px solid var(--border);border-radius:var(--r);
      padding:11px 11px 11px 36px;
      background:var(--tg-theme-secondary-bg-color,var(--panel));
      outline:none;transition:border-color .15s
    }
    [dir=rtl] .search-input{padding:11px 36px 11px 11px}
    .search-input:focus{border-color:var(--primary)}
    .filter-select{
      border:1.5px solid var(--border);border-radius:var(--r);
      padding:11px 10px;
      background:var(--tg-theme-secondary-bg-color,var(--panel));
      outline:none;min-width:96px
    }
    /* ── section heading ─────────────────────── */
    .sec-head{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:700;margin-bottom:10px;color:var(--text)}
    .sec-head svg{color:var(--primary)}
    /* ── plans grid ──────────────────────────── */
    .plans-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px}
    @media(max-width:380px){.plans-grid{grid-template-columns:1fr}}
    /* plan card */
    .plan-card{
      background:var(--tg-theme-secondary-bg-color,var(--panel));
      border:1.5px solid var(--border);border-radius:var(--r-lg);
      padding:13px;cursor:pointer;position:relative;
      transition:border-color .18s,box-shadow .18s,transform .1s;
      box-shadow:var(--sh-sm);overflow:hidden;
      animation:fadeUp .3s ease both
    }
    .plan-card::before{
      content:'';position:absolute;top:0;inset-inline-start:0;
      width:3px;height:100%;
      background:var(--pc,var(--primary));opacity:.45;
      transition:opacity .18s
    }
    .plan-card.sel{border-color:var(--pc,var(--primary));box-shadow:0 0 0 3px color-mix(in srgb,var(--pc,var(--primary)),transparent 80%),var(--sh)}
    .plan-card.sel::before{opacity:1}
    .plan-card:active{transform:scale(.975)}
    .pop-badge{
      position:absolute;top:9px;inset-inline-end:9px;
      background:linear-gradient(135deg,#f59e0b,#d97706);
      color:#fff;font-size:10px;font-weight:800;
      padding:3px 8px;border-radius:999px;letter-spacing:.3px;
      display:flex;align-items:center;gap:3px
    }
    .plan-hd{display:flex;align-items:center;gap:9px;margin-bottom:11px;padding-inline-end:56px}
    .plan-icon{
      width:38px;height:38px;border-radius:10px;flex-shrink:0;
      background:color-mix(in srgb,var(--pc,var(--primary)),transparent 86%);
      color:var(--pc,var(--primary));
      display:flex;align-items:center;justify-content:center
    }
    .plan-name{font-size:15px;font-weight:700;line-height:1.2}
    .plan-hint{font-size:11px;color:var(--tg-theme-hint-color,var(--muted))}
    .plan-specs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:9px}
    .spec{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 8px}
    .spec .sl{display:block;font-size:10px;color:var(--muted);margin-bottom:1px}
    .spec .sv{font-size:13px;font-weight:700}
    .fit-bar{height:4px;background:var(--border);border-radius:999px;overflow:hidden;margin-bottom:9px}
    .fit-fill{height:100%;width:var(--fw,50%);background:linear-gradient(90deg,var(--pc,var(--primary)),color-mix(in srgb,var(--pc,var(--primary)),#fff 30%));border-radius:999px;transition:width .4s ease}
    .plan-price-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:9px}
    .plan-price{font-size:19px;font-weight:800;color:var(--pc,var(--primary))}
    .price-unit{font-size:11px;color:var(--muted)}
    .plan-btns{display:grid;grid-template-columns:auto 1fr;gap:6px}
    .btn-prev{
      border:1.5px solid var(--border);border-radius:9px;padding:8px 10px;
      background:transparent;font-size:12px;font-weight:600;
      display:flex;align-items:center;gap:4px;transition:border-color .15s
    }
    .btn-prev:hover{border-color:var(--primary);color:var(--primary)}
    .btn-go{
      border:none;border-radius:9px;padding:8px 10px;
      background:var(--pc,var(--primary));color:#fff;
      font-size:12px;font-weight:700;
      display:flex;align-items:center;justify-content:center;gap:4px;
      transition:opacity .15s
    }
    .btn-go:active{opacity:.82}
    /* ── how section ─────────────────────────── */
    .how-sec{
      background:var(--tg-theme-secondary-bg-color,var(--panel));
      border:1px solid var(--border);border-radius:var(--r-lg);
      padding:15px;margin-bottom:12px
    }
    .steps{display:grid;gap:11px;margin-top:11px}
    .step{display:flex;align-items:flex-start;gap:11px}
    .step-n{
      width:28px;height:28px;border-radius:8px;flex-shrink:0;
      background:var(--primary);color:#fff;
      font-size:13px;font-weight:800;
      display:flex;align-items:center;justify-content:center
    }
    .step-t{font-size:13px;padding-top:4px}
    .feats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:13px}
    @media(max-width:400px){.feats{grid-template-columns:1fr}}
    .feat{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:11px}
    .feat-icon{
      width:30px;height:30px;border-radius:8px;
      background:var(--primary-lt);color:var(--primary);
      display:flex;align-items:center;justify-content:center;margin-bottom:8px
    }
    .feat-title{font-size:12px;font-weight:700;margin-bottom:3px}
    .feat-desc{font-size:11px;color:var(--tg-theme-hint-color,var(--muted));line-height:1.4}
    /* ── dock ────────────────────────────────── */
    .dock{
      position:fixed;bottom:0;left:0;right:0;
      background:color-mix(in srgb,var(--tg-theme-bg-color,var(--panel)),transparent 8%);
      backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
      border-top:1px solid var(--border);
      padding:9px 12px calc(9px + var(--safe-btm))
    }
    .dock-inner{max-width:680px;margin:0 auto;display:flex;align-items:center;gap:10px}
    .dock-info{display:flex;align-items:center;gap:9px;flex:1;min-width:0}
    .dock-icon{
      width:36px;height:36px;border-radius:9px;flex-shrink:0;
      background:var(--primary-lt);color:var(--primary);
      display:flex;align-items:center;justify-content:center
    }
    .dock-name{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .dock-price{font-size:11px;color:var(--tg-theme-hint-color,var(--muted))}
    .dock-btns{display:flex;gap:7px;flex-shrink:0}
    .dock-prev{
      border:1.5px solid var(--border);border-radius:10px;
      padding:9px 12px;font-size:13px;font-weight:600;background:transparent
    }
    .dock-buy{
      border:none;border-radius:10px;padding:9px 16px;
      background:var(--primary);color:#fff;
      font-size:13px;font-weight:700;
      display:flex;align-items:center;gap:5px
    }
    /* ── no result ───────────────────────────── */
    .no-res{grid-column:1/-1;text-align:center;padding:32px;color:var(--muted)}
    .no-res svg{display:block;margin:0 auto 10px;opacity:.35}
    /* ── animations ─────────────────────────── */
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  </style>
</head>
<body>
<div class="app">

  <!-- TOPBAR -->
  <header class="topbar">
    <div class="brand">
      <div class="logo-wrap">
        <svg class="logo-wrap" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="44" height="44" rx="10" fill="url(#lg)"/>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stop-color="#0d9488"/><stop offset="1" stop-color="#0f766e"/>
            </linearGradient>
          </defs>
          <path d="M10 22 C10 14 16 10 22 10 C28 10 34 14 34 22" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          <circle cx="22" cy="22" r="4" fill="white"/>
          <path d="M22 26 L22 34" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M16 32 L28 32" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="brand-info">
        <h1 id="brandName"></h1>
        <div class="tagline" data-i18n="tagline"></div>
      </div>
    </div>
    <div class="lang-sw">
      <button class="lang-btn" data-lang="fa">FA</button>
      <button class="lang-btn" data-lang="en">EN</button>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-title" data-i18n="headline"></div>
    <div class="hero-sub" data-i18n="intro"></div>
    <div class="tech-chips">
      <span class="tech-chip">VLESS + XHTTP</span>
      <span class="tech-chip">Cloudflare CDN</span>
      <span class="tech-chip">Germany</span>
      <span class="tech-chip">24/7</span>
    </div>
    <!-- SVG Route Diagram -->
    <div class="route-wrap">
      <svg class="route-svg" viewBox="0 0 460 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Node 1: User -->
        <rect x="2" y="10" width="86" height="52" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <text x="45" y="30" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="system-ui">
          <tspan x="45" dy="0">📱</tspan>
        </text>
        <text x="45" y="44" text-anchor="middle" fill="white" font-size="9" font-weight="600" font-family="system-ui">User</text>
        <text x="45" y="56" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="8" font-family="system-ui">Device</text>
        <!-- Arrow 1 -->
        <path d="M90 36 L126 36" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <polygon points="126,32 134,36 126,40" fill="rgba(255,255,255,0.6)"/>
        <!-- Node 2: Cloudflare -->
        <rect x="136" y="10" width="86" height="52" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <text x="179" y="30" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="system-ui">☁️</text>
        <text x="179" y="44" text-anchor="middle" fill="white" font-size="9" font-weight="600" font-family="system-ui">Cloudflare</text>
        <text x="179" y="56" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="8" font-family="system-ui">Edge CDN</text>
        <!-- Arrow 2 -->
        <path d="M224 36 L260 36" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <polygon points="260,32 268,36 260,40" fill="rgba(255,255,255,0.6)"/>
        <!-- Node 3: XHTTP -->
        <rect x="270" y="10" width="86" height="52" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <text x="313" y="30" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="system-ui">⚡</text>
        <text x="313" y="44" text-anchor="middle" fill="white" font-size="9" font-weight="600" font-family="system-ui">XHTTP Core</text>
        <text x="313" y="56" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="8" font-family="system-ui">VLESS TLS</text>
        <!-- Arrow 3 -->
        <path d="M358 36 L394 36" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <polygon points="394,32 402,36 394,40" fill="rgba(255,255,255,0.6)"/>
        <!-- Node 4: DE Server -->
        <rect x="404" y="10" width="54" height="52" rx="8" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
        <text x="431" y="30" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="system-ui">🇩🇪</text>
        <text x="431" y="44" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="system-ui">DE</text>
        <text x="431" y="56" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="8" font-family="system-ui">Server</text>
      </svg>
    </div>
  </section>

  <!-- ADVISOR -->
  <section class="advisor">
    <div class="advisor-head">
      <div class="advisor-head-left">
        <div class="advisor-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div>
          <div class="advisor-title" data-i18n="aiTitle"></div>
          <div class="advisor-desc" data-i18n="aiIntro"></div>
        </div>
      </div>
      <div class="free-badge" data-i18n="aiFree"></div>
    </div>
    <div class="usage-tabs">
      <button class="usage-tab" data-usage="chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span data-i18n="usageChat"></span>
      </button>
      <button class="usage-tab" data-usage="stream">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <span data-i18n="usageStream"></span>
      </button>
      <button class="usage-tab" data-usage="pro">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        <span data-i18n="usagePro"></span>
      </button>
    </div>
    <div class="advisor-result" id="advisorResult">
      <div class="result-emoji" id="resultEmoji"></div>
      <div class="result-text">
        <strong id="resultName"></strong>
        <span id="resultReason"></span>
      </div>
    </div>
  </section>

  <!-- SEARCH BAR -->
  <div class="search-bar">
    <div class="search-wrap">
      <div class="search-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input id="searchInput" class="search-input" type="search">
    </div>
    <select id="filterSel" class="filter-select">
      <option value="all" data-i18n="all"></option>
      <option value="light" data-i18n="light"></option>
      <option value="heavy" data-i18n="heavy"></option>
    </select>
  </div>

  <!-- PLANS SECTION HEADING -->
  <div class="sec-head">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
    <span data-i18n="plansTitle"></span>
  </div>

  <!-- PLANS GRID -->
  <div id="plansGrid" class="plans-grid"></div>

  <!-- HOW IT WORKS -->
  <section class="how-sec">
    <div class="sec-head" style="margin-bottom:0">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span data-i18n="howTitle"></span>
    </div>
    <div class="steps">
      <div class="step"><div class="step-n">1</div><div class="step-t" data-i18n="step1"></div></div>
      <div class="step"><div class="step-n">2</div><div class="step-t" data-i18n="step2"></div></div>
      <div class="step"><div class="step-n">3</div><div class="step-t" data-i18n="step3"></div></div>
    </div>
    <div class="feats">
      <div class="feat">
        <div class="feat-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="feat-title" data-i18n="unique1Title"></div>
        <div class="feat-desc" data-i18n="unique1"></div>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="feat-title" data-i18n="unique2Title"></div>
        <div class="feat-desc" data-i18n="unique2"></div>
      </div>
      <div class="feat">
        <div class="feat-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div class="feat-title" data-i18n="unique3Title"></div>
        <div class="feat-desc" data-i18n="unique3"></div>
      </div>
    </div>
  </section>

</div><!-- /.app -->

<!-- DOCK -->
<footer class="dock">
  <div class="dock-inner">
    <div class="dock-info">
      <div class="dock-icon" id="dockIcon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <div>
        <div class="dock-name" id="dockName"></div>
        <div class="dock-price" id="dockPrice"></div>
      </div>
    </div>
    <div class="dock-btns">
      <button class="dock-prev" id="dockPrev" data-i18n="preview"></button>
      <button class="dock-buy" id="dockBuy">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span data-i18n="buy"></span>
      </button>
    </div>
  </div>
</footer>

<script>
const DATA = ${payload};
const tg = window.Telegram && window.Telegram.WebApp;

// ── SVG icons per plan type ───────────────────────────────────────────────
const PLAN_ICONS = {
  starter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4.4 0-8-3.6-8-8 0-3 1.9-5.6 4.7-6.9L12 2l3.3 5.1C18.1 8.4 20 11 20 14c0 4.4-3.6 8-8 8z"/></svg>',
  basic: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  standard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  pro: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  elite: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>',
  unlimited: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/></svg>',
};

// ── Plan color palette ────────────────────────────────────────────────────
const PLAN_COLORS = {
  starter: '#22c55e',
  basic: '#3b82f6',
  standard: '#0d9488',
  plus: '#8b5cf6',
  pro: '#f97316',
  elite: '#eab308',
  unlimited: '#ec4899',
};

// ── i18n ──────────────────────────────────────────────────────────────────
const I18N = {
  fa: {
    tagline: 'فروشگاه هوشمند سرویس VPN',
    headline: 'پلن مناسب خود را انتخاب کنید',
    intro: 'پلن‌ها را جستجو، مقایسه کرده و برای ادامه خرید ارسال کنید.',
    all: 'همه', light: 'مصرف سبک', heavy: 'مصرف سنگین',
    plansTitle: 'پلن‌های ما',
    data: 'حجم', days: 'مدت', price: 'قیمت', toman: 'تومان',
    unlimited: 'نامحدود', popular: 'پرفروش',
    preview: 'پیش‌نمایش', buy: 'خرید',
    howTitle: 'مراحل فعال‌سازی',
    step1: '۱. پلن را انتخاب و ادامه خرید را بزنید.',
    step2: '۲. اطلاعات پرداخت در ربات نمایش داده می‌شود.',
    step3: '۳. پس از تایید، لینک اشتراک محافظت‌شده ارسال می‌شود.',
    aiTitle: 'DM Assist',
    aiIntro: 'پیشنهاد هوشمند بر اساس نوع مصرف شما',
    aiFree: 'رایگان',
    usageChat: 'پیام‌رسانی', usageStream: 'استریم', usagePro: 'حرفه‌ای',
    recommend: 'پیشنهاد: ',
    reasonChat: 'برای مصرف سبک، حجم کم با هزینه پایین مناسب‌تر است.',
    reasonStream: 'برای استفاده روزانه، تعادل قیمت و حجم اهمیت بیشتری دارد.',
    reasonPro: 'برای چند دستگاه یا دانلود سنگین، حجم بالاتر پایداری بهتری دارد.',
    unique1Title: 'مسیر اختصاصی', unique1: 'هر پلن XHTTP path و UUID منحصربه‌فرد دارد.',
    unique2Title: 'بومی تلگرام', unique2: 'رنگ‌ها و دکمه‌ها با Mini Apps هماهنگ است.',
    unique3Title: 'سریع و رایگان', unique3: 'پیشنهادگر داخلی وابسته به API پولی نیست.',
    noResult: 'پلنی با این جستجو پیدا نشد.',
    dockNoSel: 'پلنی انتخاب نشده'
  },
  en: {
    tagline: 'Smart VPN Storefront',
    headline: 'Pick the right plan faster',
    intro: 'Search, compare and send your selected plan back to the bot.',
    all: 'All', light: 'Light', heavy: 'Heavy',
    plansTitle: 'Our Plans',
    data: 'Data', days: 'Days', price: 'Price', toman: 'Toman',
    unlimited: 'Unlimited', popular: 'Best Seller',
    preview: 'Preview', buy: 'Buy',
    howTitle: 'Activation Flow',
    step1: '1. Select a plan and tap Continue.',
    step2: '2. Payment details appear in the bot.',
    step3: '3. After approval, a protected subscription link is delivered.',
    aiTitle: 'DM Assist',
    aiIntro: 'Smart recommendation based on your usage type',
    aiFree: 'Free',
    usageChat: 'Messaging', usageStream: 'Streaming', usagePro: 'Pro',
    recommend: 'Recommended: ',
    reasonChat: 'For light usage, lower data keeps cost efficient.',
    reasonStream: 'For daily use, balanced data and price matter most.',
    reasonPro: 'For multi-device or heavy downloads, higher data is more stable.',
    unique1Title: 'Dedicated Route', unique1: 'Each plan has its own XHTTP path and tier UUID.',
    unique2Title: 'Telegram-Native', unique2: 'Colors and buttons match Mini Apps behavior.',
    unique3Title: 'Fast & Free', unique3: 'The advisor runs locally, no paid AI API needed.',
    noResult: 'No plan matches your search.',
    dockNoSel: 'No plan selected'
  }
};

// ── State ─────────────────────────────────────────────────────────────────
var lang = 'fa';
var selected = 'standard';
var usage = 'stream';

// Initialise from Telegram or session
(function() {
  var sl = sessionStorage.getItem('dm_lang');
  var ss = sessionStorage.getItem('dm_sel');
  var su = sessionStorage.getItem('dm_usage');
  var ul = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code;
  if (sl && I18N[sl]) lang = sl;
  else if (ul && I18N[ul.slice(0,2)]) lang = ul.slice(0,2);
  if (ss) selected = ss;
  if (su) usage = su;
})();

// ── Helpers ───────────────────────────────────────────────────────────────
function t(k) { return (I18N[lang] && I18N[lang][k]) || k; }
function money(n) { return Number(n).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US'); }
function planLabel(p) { return lang === 'fa' ? p.name_fa : p.name_en; }
function planData(p) { return p.data_gb ? money(p.data_gb) + ' GB' : t('unlimited'); }
function planById(id) {
  var r = DATA.plans.filter(function(p){ return p.id === id; });
  return r.length ? r[0] : DATA.plans[2];
}
function fitScore(p) {
  var d = p.data_gb || 25;
  if (usage === 'chat')   return Math.max(20, 100 - Math.abs(d - 2) * 13);
  if (usage === 'pro')    return Math.min(100, 44 + d * 3.1);
  return Math.max(35, 100 - Math.abs(d - 8) * 5.5);
}
function advisorTarget() {
  return usage === 'chat' ? 'basic' : usage === 'pro' ? 'pro' : 'standard';
}
function planColor(id) { return PLAN_COLORS[id] || '#0d9488'; }
function planIcon(id) { return PLAN_ICONS[id] || PLAN_ICONS.standard; }

function persist() {
  sessionStorage.setItem('dm_lang', lang);
  sessionStorage.setItem('dm_sel', selected);
  sessionStorage.setItem('dm_usage', usage);
  if (tg && tg.CloudStorage && tg.CloudStorage.setItem) {
    tg.CloudStorage.setItem('dm_lang', lang);
    tg.CloudStorage.setItem('dm_sel', selected);
    tg.CloudStorage.setItem('dm_usage', usage);
  }
}

function send(action) {
  var payload = JSON.stringify({ action: action, planId: selected, lang: lang });
  if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
  if (tg && tg.sendData) tg.sendData(payload);
}

// ── Filter ────────────────────────────────────────────────────────────────
function filteredPlans() {
  var q = document.getElementById('searchInput').value.trim().toLowerCase();
  var f = document.getElementById('filterSel').value;
  return DATA.plans.filter(function(p) {
    var light = p.data_gb && p.data_gb <= 5;
    var heavy = !p.data_gb || p.data_gb >= 10;
    if (f === 'light' && !light) return false;
    if (f === 'heavy' && !heavy) return false;
    if (!q) return true;
    return [p.id, p.name_fa, p.name_en].join(' ').toLowerCase().indexOf(q) >= 0;
  });
}

// ── Render functions ──────────────────────────────────────────────────────
function renderI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.getElementById('brandName').textContent = DATA.brand;
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-lang]').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  document.getElementById('searchInput').placeholder = lang === 'fa' ? 'جستجوی نام پلن...' : 'Search plan name...';
  // Filter options
  document.querySelectorAll('#filterSel option').forEach(function(opt) {
    var k = opt.getAttribute('data-i18n');
    if (k) opt.text = t(k);
  });
}

function renderAdvisor() {
  document.querySelectorAll('[data-usage]').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-usage') === usage);
  });
  var pick = planById(advisorTarget());
  document.getElementById('resultEmoji').textContent = pick.emoji;
  document.getElementById('resultName').textContent = t('recommend') + planLabel(pick);
  var reasonKey = usage === 'chat' ? 'reasonChat' : usage === 'pro' ? 'reasonPro' : 'reasonStream';
  document.getElementById('resultReason').textContent = t(reasonKey);
}

function renderDock() {
  var p = planById(selected);
  var col = planColor(selected);
  document.getElementById('dockIcon').style.color = col;
  document.getElementById('dockIcon').style.background = 'color-mix(in srgb,' + col + ',transparent 86%)';
  document.getElementById('dockName').textContent = p ? planLabel(p) : t('dockNoSel');
  document.getElementById('dockPrice').textContent = p ? money(p.price) + ' ' + t('toman') : '';
}

function renderPlans() {
  var grid = document.getElementById('plansGrid');
  var list = filteredPlans();
  grid.innerHTML = '';

  if (!list.length) {
    var empty = document.createElement('div');
    empty.className = 'no-res';
    empty.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' + t('noResult');
    grid.appendChild(empty);
    return;
  }

  list.forEach(function(p, idx) {
    var col = planColor(p.id);
    var icon = planIcon(p.id);
    var isSel = p.id === selected;
    var fit = Math.round(fitScore(p));

    var card = document.createElement('article');
    card.className = 'plan-card' + (isSel ? ' sel' : '');
    card.style.setProperty('--pc', col);
    card.style.animationDelay = (idx * 0.04) + 's';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', planLabel(p));

    var popBadge = p.popular
      ? '<div class="pop-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' + t('popular') + '</div>'
      : '';

    card.innerHTML = popBadge +
      '<div class="plan-hd">' +
        '<div class="plan-icon">' + icon + '</div>' +
        '<div><div class="plan-name">' + planLabel(p) + '</div>' +
        '<div class="plan-hint">' + p.days + ' ' + (lang === 'fa' ? 'روز' : 'days') + '</div></div>' +
      '</div>' +
      '<div class="plan-specs">' +
        '<div class="spec"><span class="sl">' + t('data') + '</span><span class="sv">' + planData(p) + '</span></div>' +
        '<div class="spec"><span class="sl">' + t('days') + '</span><span class="sv">' + money(p.days) + '</span></div>' +
      '</div>' +
      '<div class="fit-bar"><div class="fit-fill" style="--fw:' + fit + '%"></div></div>' +
      '<div class="plan-price-row">' +
        '<span class="plan-price">' + money(p.price) + '</span>' +
        '<span class="price-unit">' + t('toman') + '</span>' +
      '</div>' +
      '<div class="plan-btns">' +
        '<button class="btn-prev" aria-label="' + t('preview') + '">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
          t('preview') +
        '</button>' +
        '<button class="btn-go">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
          t('buy') +
        '</button>' +
      '</div>';

    card.addEventListener('click', function(e) {
      var btn = e.target.closest('button');
      selected = p.id;
      persist();
      if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
      renderPlans();
      renderDock();
      if (btn && btn.classList.contains('btn-prev')) send('preview');
      else if (btn && btn.classList.contains('btn-go')) send('buy');
    });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selected = p.id;
        persist();
        renderPlans();
        renderDock();
      }
    });

    grid.appendChild(card);
  });
}

function render() {
  renderI18n();
  renderAdvisor();
  renderPlans();
  renderDock();
  if (tg && tg.MainButton) {
    tg.MainButton.setText(t('buy'));
    tg.MainButton.show();
  }
  if (tg && tg.SecondaryButton) {
    tg.SecondaryButton.setText(t('preview'));
    tg.SecondaryButton.show();
  }
}

// ── Event listeners ───────────────────────────────────────────────────────
document.querySelectorAll('[data-lang]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    lang = btn.getAttribute('data-lang');
    persist();
    render();
  });
});

document.querySelectorAll('[data-usage]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    usage = btn.getAttribute('data-usage');
    var pick = planById(advisorTarget());
    selected = pick.id;
    persist();
    if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
    renderAdvisor();
    renderPlans();
    renderDock();
  });
});

document.getElementById('searchInput').addEventListener('input', renderPlans);
document.getElementById('filterSel').addEventListener('change', renderPlans);

document.getElementById('dockPrev').addEventListener('click', function() { send('preview'); });
document.getElementById('dockBuy').addEventListener('click', function() { send('buy'); });

// ── Telegram Mini App setup ───────────────────────────────────────────────
if (tg) {
  tg.ready && tg.ready();
  tg.expand && tg.expand();
  tg.requestFullscreen && tg.requestFullscreen();
  if (tg.BackButton) { tg.BackButton.show(); tg.BackButton.onClick(function() { tg.close(); }); }
  if (tg.MainButton) { tg.MainButton.onClick(function() { send('buy'); }); }
  if (tg.SecondaryButton) { tg.SecondaryButton.onClick(function() { send('preview'); }); }
  if (tg.CloudStorage && tg.CloudStorage.getItems) {
    tg.CloudStorage.getItems(['dm_lang','dm_sel','dm_usage'], function(err, vals) {
      if (!err && vals) {
        if (I18N[vals.dm_lang]) lang = vals.dm_lang;
        if (vals.dm_sel) selected = vals.dm_sel;
        if (vals.dm_usage) usage = vals.dm_usage;
        render();
      }
    });
  }
}

render();
</script>
</body>
</html>`;
}

