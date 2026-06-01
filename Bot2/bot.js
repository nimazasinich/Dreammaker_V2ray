// ═══════════════════════════════════════════════════════════════════════════
// 🤖 DreamMaker Sales Bot — v3.1.0
// ═══════════════════════════════════════════════════════════════════════════
// Features:
//   • Bilingual FA/EN with auto-persist
//   • Rich UI: banners, progress bars, visual plan cards
//   • Full purchase flow with receipt photo forwarding
//   • My Services page with active subscription details
//   • Renew Service flow
//   • Admin: broadcast, reply-to-user, pending orders, stats
//   • Rate limiting (flood protection)
//   • Auto bot-command registration on first request
//   • Typing indicator before heavy operations
//   • Deep-link referral support (/start ref_XXX)
//   • protect_content for config messages
//   • Critical fix: TELEGRAM_API resolved after env-inject
//   • Telegram Mini App storefront with fullscreen, CloudStorage, haptics
//   • Webhook secret validation support
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  BOT_TOKEN:    '',   // filled from env on every request
  ADMIN_ID:     '',   // filled from env on every request
  SUB_BASE:     'https://dreammaker-groupsoft.ir/sub?uuid=',
  CDN_DOMAIN:   'cdn.dreammaker-groupsoft.ir',
  WEBHOOK_URL:  'https://dreammaker-groupsoft.ir/tgbot',
  MINI_APP_URL: '',
  BRAND_NAME:   'DreamMaker',
  BOT_USERNAME: '',
  SUPPORT_USERNAME: 'DreamMakerSupport',
  PANEL_API_BASE: '',
  PANEL_USER: '',
  PANEL_PASS: '',
  DEFAULT_LANG: 'fa',
  ORDER_TTL:    86400,   // 24 h
  SESSION_TTL:  86400,   // 24 h  (was 1 h → caused session loss)
  RATE_LIMIT_S: 1,       // min seconds between any user action
  VERSION:      '3.1.0',
};

// ⚠️  TELEGRAM_API must be a getter — token isn't available at module init
const tgAPI = () => `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 EMOJI PALETTE
// ─────────────────────────────────────────────────────────────────────────────

const E = {
  home:'🏠', back:'◀️', next:'▶️', cancel:'❌', check:'✅',
  rocket:'🚀', star:'⭐', fire:'🔥', gem:'💎', crown:'👑', sparkles:'✨', zap:'⚡',
  cart:'🛒', money:'💰', card:'💳', gift:'🎁', box:'📦', receipt:'🧾',
  info:'ℹ️', warn:'⚠️', bell:'🔔', lock:'🔐', link:'🔗', copy:'📋',
  admin:'👨‍💼', stats:'📊', users:'👥', orders:'📋', settings:'⚙️', mega:'📢',
  pending:'⏳', approved:'✅', rejected:'❌', green:'🟢', red:'🔴',
  seedling:'🌱', phone:'📱', briefcase:'💼', plus_star:'⭐', pro_rocket:'🚀',
  elite:'👑', inf:'♾️', support:'💬', globe:'🌐', refresh:'🔄',
  chart:'📈', search:'🔎', gauge:'🧭', qr:'▦', user:'👤', pin:'📌', flag_ir:'🇮🇷', flag_gb:'🇬🇧',
  new:'🆕', id:'🆔', clock:'⏰', cal:'📅', bar:'━',
};

// ─────────────────────────────────────────────────────────────────────────────
// 📦 PLANS DATABASE
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = {
  starter:   { id:'starter',   emoji:E.seedling,   name_fa:'استارتر',   name_en:'Starter',   data_gb:1,    days:30, price:40000,  uuid:'7dd47c02-8dce-4b12-9dbc-7cdb95a9e10e', popular:false },
  basic:     { id:'basic',     emoji:E.phone,      name_fa:'بیسیک',     name_en:'Basic',     data_gb:2,    days:30, price:70000,  uuid:'92ebaa01-ec34-4601-a4dc-f6afdf822966', popular:false },
  standard:  { id:'standard',  emoji:E.briefcase,  name_fa:'استاندارد', name_en:'Standard',  data_gb:5,    days:30, price:130000, uuid:'3d5e3adf-0912-4c78-9ca9-b87db334ce71', popular:true  },
  plus:      { id:'plus',      emoji:E.plus_star,  name_fa:'پلاس',      name_en:'Plus',      data_gb:10,   days:30, price:220000, uuid:'e8eb3d74-8e8c-4903-b878-8feb656ebb0c', popular:false },
  pro:       { id:'pro',       emoji:E.pro_rocket, name_fa:'پرو',       name_en:'Pro',       data_gb:15,   days:30, price:300000, uuid:'b3540a54-67dd-452a-b5d8-45d6407b8da5', popular:false },
  elite:     { id:'elite',     emoji:E.elite,      name_fa:'الیت',      name_en:'Elite',     data_gb:20,   days:30, price:380000, uuid:'2680152c-0dc3-4fdb-b366-e936358b121f', popular:false },
  unlimited: { id:'unlimited', emoji:E.inf,        name_fa:'نامحدود',   name_en:'Unlimited', data_gb:null, days:30, price:500000, uuid:'89c0f294-3f94-4735-96cf-9c1aefdbcbb2', popular:false },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🌐 STRINGS / i18n
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  fa: {
    welcome: (name) => `
${E.sparkles} <b>سلام ${name ? name + ' عزیز' : ''}!</b>
${E.gem} به <b>دریم‌میکر</b> خوش آمدید

<i>سریع‌ترین و امن‌ترین سرویس VPN با پشتیبانی ۲۴/۷</i>

${E.zap} پروتکل VLESS+XHTTP | سرورهای اختصاصی
`,
    main_menu_desc: `${E.home} <b>منوی اصلی</b> — یکی از گزینه‌ها را انتخاب کنید:`,
    choose_lang:    `${E.globe} زبان خود را انتخاب کنید:`,
    lang_changed:   `${E.check} زبان به فارسی تغییر یافت.`,

    btn_buy:        `${E.cart} خرید سرویس`,
    btn_plans:      `${E.orders} مشاهده پلن‌ها`,
    btn_renew:      `${E.refresh} تمدید سرویس`,
    btn_services:   `${E.box} سرویس‌های من`,
    btn_usage:      `${E.gauge} مصرف و کانفیگ`,
    btn_support:    `${E.support} پشتیبانی`,
    btn_about:      `${E.info} درباره ما`,
    btn_lang:       `${E.globe} تغییر زبان`,
    btn_mini_app:   `${E.sparkles} فروشگاه هوشمند`,
    btn_compare:    `${E.chart} مقایسه پلن‌ها`,
    btn_share:      `${E.gift} معرفی به دوستان`,

    plans_title:    `${E.orders} <b>پلن‌های دریم‌میکر</b>`,
    plans_desc:     'برای انتخاب سریع‌تر، فروشگاه هوشمند را باز کنید یا از فهرست زیر پلن را انتخاب کنید:',
    compare_body:   `${E.chart} <b>مقایسه سریع پلن‌ها</b>
${divider()}
${E.seedling} Starter: سبک، تست و مصرف کم
${E.phone} Basic: پیام‌رسانی و وب‌گردی روزانه
${E.briefcase} Standard: تعادل قیمت و حجم
${E.plus_star} Plus: مصرف خانوادگی یا چند دستگاه
${E.pro_rocket} Pro: استریم، دانلود و کار حرفه‌ای
${E.elite} Elite: مصرف سنگین با پایداری بیشتر
${E.inf} Unlimited: استفاده بدون نگرانی از حجم
${divider()}
پیشنهاد عمومی: اگر مطمئن نیستید، Standard یا Plus را انتخاب کنید.`,
    plan_unlimited: 'نامحدود',
    plan_popular:   '🔥 پرفروش',
    btn_select:     `${E.check} انتخاب این پلن`,
    btn_back_plans: `${E.back} بازگشت به پلن‌ها`,
    btn_back_menu:  `${E.home} منوی اصلی`,
    btn_back_admin: `${E.back} پنل مدیریت`,

    preview_title:  `${E.pin} <b>پیش‌نمایش پلن انتخابی</b>`,
    preview_confirm:'آیا از این پلن مطمئن هستید؟',
    step_1_of_3:    `${E.info} مرحله ۱ از ۳ ●○○`,
    step_2_of_3:    `${E.info} مرحله ۲ از ۳ ●●○`,
    step_3_of_3:    `${E.check} مرحله ۳ از ۳ ●●●`,

    btn_confirm:    `${E.check} تایید و ادامه`,
    btn_cancel:     `${E.cancel} انصراف`,

    payment_title:  `${E.card} <b>اطلاعات پرداخت</b>`,
    payment_body: (orderId, price) => `
${divider()}
${E.card} <b>مرحله ۱ — واریز وجه</b>
مبلغ را به شماره کارت زیر واریز کنید:

<code>6037-9977-XXXX-XXXX</code>
به نام: <b>شرکت دریم‌میکر</b>

${E.money} مبلغ: <b>${fmt(price)} تومان</b>
${E.id} کد سفارش: <code>${orderId}</code>
${divider()}
${E.receipt} <b>مرحله ۲ — ارسال رسید</b>
عکس رسید پرداخت را اینجا ارسال کنید.
${divider()}
${E.clock} این سفارش تا ۲۴ ساعت معتبر است.
`,
    btn_send_receipt:   `${E.receipt} ارسال رسید پرداخت`,
    btn_contact_sup:    `${E.support} تماس با پشتیبانی`,

    awaiting_receipt:   `${E.receipt} عکس رسید پرداخت خود را ارسال کنید:`,
    receipt_sent:       `${E.check} رسید شما برای بررسی ارسال شد. در صورت تایید، سرویس شما فعال خواهد شد.`,
    order_pending:      `${E.pending} سفارش شما در صف تایید ادمین است.`,

    approved_title:     `${E.sparkles} <b>سرویس شما فعال شد!</b>`,
    approved_sub:       (link) => `${E.link} <b>لینک اشتراک:</b>\n<code>${link}</code>`,
    approved_cfg:       (cfg)  => `\n${E.lock} <b>کانفیگ مستقیم:</b>\n<code>${cfg}</code>`,
    approved_guide:     `\n${E.phone} <b>نحوه استفاده:</b>\nلینک اشتراک را در اپ V2Ray/Hiddify وارد کنید.`,

    rejected_title:     `${E.cancel} <b>سفارش رد شد</b>`,
    rejected_body:      'پرداخت تایید نشد. لطفاً با پشتیبانی تماس بگیرید.',

    no_services:        `${E.box} شما هنوز سرویس فعالی ندارید.`,
    services_title:     `${E.box} <b>سرویس‌های فعال شما</b>`,
    service_item: (s, i) => `${i}. ${E.green} <b>${s.planName}</b>\n   ${E.cal} فعال‌سازی: ${s.activatedAt}\n   ${E.link} <code>${s.subLink}</code>`,
    usage_title:        `${E.gauge} <b>مصرف و کانفیگ</b>`,
    usage_desc:         'برای نمودار مصرف، ابتدا نام/ایمیل اکانت پنل خود را وصل کنید.',
    btn_bind_account:   `${E.link} اتصال اکانت`,
    btn_usage_graph:    `${E.chart} نمودار مصرف`,
    btn_view_config:    `${E.lock} مشاهده کانفیگ`,
    btn_qr:             `${E.qr} QR کانفیگ`,
    btn_alerts:         `${E.bell} هشدار اتمام حجم`,
    bind_prompt:        `${E.link} نام/ایمیل اکانت 3X-UI خود را ارسال کنید:`,
    bind_done:          (email) => `${E.check} اکانت <code>${email}</code> به پروفایل شما وصل شد.`,
    usage_no_bind:      `${E.warn} هنوز اکانت پنل به پروفایل شما وصل نشده است.`,
    config_empty:       `${E.warn} کانفیگی برای نمایش پیدا نشد. اگر اکانت پنل دارید، ابتدا آن را وصل کنید.`,
    config_title:       `${E.lock} <b>کانفیگ شما</b>`,
    qr_title:           `${E.qr} <b>QR کانفیگ</b>\nبرای ساخت QR، متن کانفیگ زیر را در Hiddify/V2Ray یا QR generator وارد کنید:`,
    alert_enabled:      (gb) => `${E.bell} هشدار اتمام حجم فعال شد. وقتی کمتر از <b>${gb}GB</b> باقی بماند پیام می‌گیرید.`,
    alert_disabled:     `${E.bell} هشدار مصرف غیرفعال شد.`,
    alert_low:          (email, left) => `${E.warn} حجم اکانت <code>${email}</code> رو به اتمام است. باقی‌مانده: <b>${left}</b>`,

    renew_title:        `${E.refresh} <b>تمدید سرویس</b>`,
    renew_pick:         'سرویسی را که می‌خواهید تمدید کنید انتخاب نمایید:',
    renew_btn: (name)   => `${E.refresh} تمدید ${name}`,

    support_title:      `${E.support} <b>پشتیبانی</b>`,
    support_desc:       'پیام خود را تایپ و ارسال کنید. برای بررسی سریع‌تر، سیستم‌عامل، اپ مورد استفاده و خطای دقیق را هم بنویسید.',
    support_sent:       `${E.check} پیام شما به پشتیبانی ارسال شد.`,

    about_body: `
${E.rocket} <b>دریم‌میکر</b> — سرویس VPN پرسرعت
${divider()}
${E.sparkles} <b>ویژگی‌ها</b>
• پروتکل VLESS با XHTTP (کمترین تاخیر)
• مسیر Germany-only با Cloudflare CDN
• سرعت بالا، پایداری عالی
• پشتیبانی ۲۴/۷
• فروشگاه مینی‌اپ تلگرام با انتخاب سریع پلن
• نصب آسان با لینک اشتراک محافظت‌شده
${divider()}
${E.support} تلگرام: @DreamMakerSupport
🌐 وبسایت: dreammaker-groupsoft.ir
`,

    error_generic:      `${E.cancel} خطایی رخ داد. لطفاً دوباره تلاش کنید.`,
    error_no_plan:      `${E.cancel} پلن یافت نشد.`,
    error_no_order:     `${E.cancel} سفارش یافت نشد یا منقضی شده.`,
    error_unauth:       `🚫 دسترسی مجاز نیست.`,
    error_flood:        `${E.warn} کمی صبر کنید…`,

    // ── Admin ────────────────────────────────────────────────────────────────
    admin_welcome:      `${E.admin} <b>پنل مدیریت دریم‌میکر</b>`,
    btn_stats:          `${E.stats} آمار کلی`,
    btn_orders:         `${E.orders} سفارشات در انتظار`,
    btn_users:          `${E.users} کاربران`,
    btn_broadcast:      `${E.mega} ارسال همگانی`,
    btn_panel_status:   `${E.chart} وضعیت پنل`,
    btn_panel_create:   `${E.plus_star} ساخت اکانت`,
    btn_panel_online:   `${E.green} آنلاین‌ها`,
    btn_panel_lookup:   `${E.search || '🔎'} جستجوی اکانت`,
    btn_panel_delete:   `${E.cancel} حذف اکانت`,
    btn_back:           `${E.back} بازگشت`,

    stats_title:        `${E.stats} <b>آمار سیستم</b>`,
    stats_body: (s) => `
${divider()}
${E.users}  کاربران:          <b>${s.totalUsers}</b>
${E.orders} کل سفارشات:       <b>${s.totalOrders}</b>
${E.pending} در انتظار:        <b>${s.pendingOrders}</b>
${E.approved} تایید شده:       <b>${s.approvedOrders}</b>
${E.rejected} رد شده:          <b>${s.rejectedOrders}</b>
${E.money} درآمد کل:          <b>${fmt(s.totalRevenue)} تومان</b>
${divider()}
`,
    new_order_title:    `${E.bell} <b>سفارش جدید!</b>`,
    order_card: (o, planName) => `
${divider()}
${E.user}  کاربر:    ${o.username ? '@' + o.username : 'بدون نام'} (<code>${o.userId}</code>)
${E.box}   پلن:      <b>${planName}</b>
${E.money} مبلغ:     <b>${fmt(PLANS[o.planId]?.price ?? 0)} تومان</b>
${E.id}    سفارش:   <code>${o.id}</code>
${E.clock}  زمان:    ${new Date(o.createdAt).toLocaleString('fa-IR')}
${divider()}
`,
    btn_approve:        `${E.check} تایید سفارش`,
    btn_reject:         `${E.cancel} رد سفارش`,
    order_approved_adm: `${E.check} سفارش تایید و برای کاربر ارسال شد.`,
    order_rejected_adm: `${E.cancel} سفارش رد شد و کاربر مطلع شد.`,
    already_processed:  `${E.warn} این سفارش قبلاً پردازش شده.`,
    no_pending:         `${E.check} هیچ سفارش در انتظاری وجود ندارد.`,
    pending_list_title: (n) => `${E.orders} <b>سفارشات در انتظار (${n})</b>`,

    broadcast_prompt:   `${E.mega} متن پیام همگانی را ارسال کنید:`,
    broadcast_done: (ok, fail) => `${E.check} ارسال همگانی انجام شد.\n${E.green} موفق: ${ok} | ${E.red} ناموفق: ${fail}`,

    receipt_fwd: (o) => `${E.receipt} <b>رسید پرداخت جدید</b>\n${E.user} ${o.username ? '@'+o.username : 'بدون نام'} (<code>${o.userId}</code>)\n${E.id} سفارش: <code>${o.id}</code>`,

    msg_fwd: (username, userId, text) => `📨 <b>پیام از کاربر</b>\n${E.user} ${username ? '@' + username : 'بدون نام'} (<code>${userId}</code>)\n\n💬 ${text}`,
    reply_prompt:      (userId) => `پیام خود را برای کاربر <code>${userId}</code> ارسال کنید:`,
    reply_sent:         `${E.check} پیام برای کاربر ارسال شد.`,
    reply_admin: (adminName, text) => `${E.admin} <b>پیام از پشتیبانی:</b>\n\n${text}`,
    panel_missing:      `${E.warn} تنظیمات اتصال پنل کامل نیست. متغیرهای PANEL_NGINX_PROXY/PANEL_USER/PANEL_PASS را به Worker بدهید.`,
    panel_status_title: `${E.chart} <b>وضعیت پنل 3X-UI</b>`,
    panel_create_pick:  `${E.plus_star} پلن اکانت جدید را انتخاب کنید:`,
    panel_create_prompt:(plan) => `${E.plus_star} ساخت اکانت <b>${plan}</b>\n\nنام کاربری/ایمیل اکانت را بفرستید. فقط حروف، عدد، خط تیره، آندرلاین و نقطه مجاز است.`,
    panel_created:     (email, uuid, cfg) => `${E.check} <b>اکانت ساخته شد</b>\n${E.user} نام: <code>${email}</code>\n${E.id} UUID: <code>${uuid}</code>\n${E.link} کانفیگ مستقیم:\n<code>${cfg}</code>`,
    panel_lookup_prompt:`${E.search || '🔎'} نام/ایمیل اکانت را برای بررسی ترافیک بفرستید:`,
    panel_delete_prompt:`${E.cancel} نام/ایمیل اکانت را برای حذف بفرستید:`,
    panel_deleted:     (email) => `${E.check} اکانت <code>${email}</code> حذف شد.`,
    panel_not_found:   `${E.cancel} اکانت پیدا نشد.`,
    panel_online_title:(n) => `${E.green} <b>کاربران آنلاین (${n})</b>`,
    panel_error:       (msg) => `${E.cancel} خطای پنل: <code>${escapeHtml(msg)}</code>`,
  },

  en: {
    welcome: (name) => `
${E.sparkles} <b>Hello${name ? ' ' + name : ''}!</b>
${E.gem} Welcome to <b>DreamMaker VPN</b>

<i>Fastest & most secure VPN with 24/7 support</i>

${E.zap} VLESS+XHTTP Protocol | Dedicated Servers
`,
    main_menu_desc: `${E.home} <b>Main Menu</b> — Choose an option:`,
    choose_lang:    `${E.globe} Choose your language:`,
    lang_changed:   `${E.check} Language set to English.`,

    btn_buy:        `${E.cart} Buy Service`,
    btn_plans:      `${E.orders} View Plans`,
    btn_renew:      `${E.refresh} Renew Service`,
    btn_services:   `${E.box} My Services`,
    btn_usage:      `${E.gauge} Usage & Config`,
    btn_support:    `${E.support} Support`,
    btn_about:      `${E.info} About Us`,
    btn_lang:       `${E.globe} Change Language`,
    btn_mini_app:   `${E.sparkles} Smart Store`,
    btn_compare:    `${E.chart} Compare Plans`,
    btn_share:      `${E.gift} Share`,

    plans_title:    `${E.orders} <b>DreamMaker Plans</b>`,
    plans_desc:     'Open the Smart Store for a faster guided choice, or pick a plan below:',
    compare_body:   `${E.chart} <b>Quick Plan Comparison</b>
${divider()}
${E.seedling} Starter: light testing and low usage
${E.phone} Basic: daily messaging and browsing
${E.briefcase} Standard: balanced data and price
${E.plus_star} Plus: family or multi-device use
${E.pro_rocket} Pro: streaming, downloads and professional use
${E.elite} Elite: heavier use with more headroom
${E.inf} Unlimited: usage without data anxiety
${divider()}
General recommendation: choose Standard or Plus if you are not sure.`,
    plan_unlimited: 'Unlimited',
    plan_popular:   '🔥 Best Seller',
    btn_select:     `${E.check} Select This Plan`,
    btn_back_plans: `${E.back} Back to Plans`,
    btn_back_menu:  `${E.home} Main Menu`,
    btn_back_admin: `${E.back} Admin Panel`,

    preview_title:  `${E.pin} <b>Selected Plan Preview</b>`,
    preview_confirm:'Are you sure about this plan?',
    step_1_of_3:    `${E.info} Step 1 of 3 ●○○`,
    step_2_of_3:    `${E.info} Step 2 of 3 ●●○`,
    step_3_of_3:    `${E.check} Step 3 of 3 ●●●`,

    btn_confirm:    `${E.check} Confirm & Continue`,
    btn_cancel:     `${E.cancel} Cancel`,

    payment_title:  `${E.card} <b>Payment Instructions</b>`,
    payment_body: (orderId, price) => `
${divider()}
${E.card} <b>Step 1 — Transfer Funds</b>
Transfer the amount to the card below:

<code>6037-9977-XXXX-XXXX</code>
Name: <b>DreamMaker Company</b>

${E.money} Amount: <b>${fmt(price)} Toman</b>
${E.id} Order ID: <code>${orderId}</code>
${divider()}
${E.receipt} <b>Step 2 — Send Receipt</b>
Send a photo of your payment receipt here.
${divider()}
${E.clock} This order is valid for 24 hours.
`,
    btn_send_receipt:   `${E.receipt} Send Payment Receipt`,
    btn_contact_sup:    `${E.support} Contact Support`,

    awaiting_receipt:   `${E.receipt} Please send a photo of your payment receipt:`,
    receipt_sent:       `${E.check} Your receipt has been submitted for review. Your service will be activated upon approval.`,
    order_pending:      `${E.pending} Your order is pending admin approval.`,

    approved_title:     `${E.sparkles} <b>Service Activated!</b>`,
    approved_sub:       (link) => `${E.link} <b>Subscription Link:</b>\n<code>${link}</code>`,
    approved_cfg:       (cfg)  => `\n${E.lock} <b>Direct Config:</b>\n<code>${cfg}</code>`,
    approved_guide:     `\n${E.phone} <b>How to use:</b>\nImport the subscription link into your V2Ray/Hiddify app.`,

    rejected_title:     `${E.cancel} <b>Order Rejected</b>`,
    rejected_body:      'Your payment was not confirmed. Please contact support.',

    no_services:        `${E.box} You have no active services yet.`,
    services_title:     `${E.box} <b>Your Active Services</b>`,
    service_item: (s, i) => `${i}. ${E.green} <b>${s.planName}</b>\n   ${E.cal} Activated: ${s.activatedAt}\n   ${E.link} <code>${s.subLink}</code>`,
    usage_title:        `${E.gauge} <b>Usage & Config</b>`,
    usage_desc:         'Bind your 3X-UI account name/email first to show live usage graphs.',
    btn_bind_account:   `${E.link} Bind Account`,
    btn_usage_graph:    `${E.chart} Usage Graph`,
    btn_view_config:    `${E.lock} View Config`,
    btn_qr:             `${E.qr} Config QR`,
    btn_alerts:         `${E.bell} Low Usage Alert`,
    bind_prompt:        `${E.link} Send your 3X-UI account username/email:`,
    bind_done:          (email) => `${E.check} Account <code>${email}</code> is now linked to your profile.`,
    usage_no_bind:      `${E.warn} No panel account is linked to your profile yet.`,
    config_empty:       `${E.warn} No config found to show. If you have a panel account, bind it first.`,
    config_title:       `${E.lock} <b>Your Config</b>`,
    qr_title:           `${E.qr} <b>Config QR</b>\nUse the config below in Hiddify/V2Ray or any QR generator:`,
    alert_enabled:      (gb) => `${E.bell} Low usage alert enabled. You will be notified when less than <b>${gb}GB</b> remains.`,
    alert_disabled:     `${E.bell} Usage alert disabled.`,
    alert_low:          (email, left) => `${E.warn} Account <code>${email}</code> is running out of data. Remaining: <b>${left}</b>`,

    renew_title:        `${E.refresh} <b>Renew Service</b>`,
    renew_pick:         'Select the service you want to renew:',
    renew_btn: (name)   => `${E.refresh} Renew ${name}`,

    support_title:      `${E.support} <b>Support</b>`,
    support_desc:       'Type your message and include your device, app name, and exact error so support can check faster.',
    support_sent:       `${E.check} Your message has been sent to support.`,

    about_body: `
${E.rocket} <b>DreamMaker</b> — High-Speed VPN
${divider()}
${E.sparkles} <b>Features</b>
• VLESS with XHTTP transport (ultra-low latency)
• Germany-only backend behind Cloudflare CDN
• High speed & excellent stability
• 24/7 live support
• Telegram Mini App store with guided plan selection
• Protected one-click subscription delivery
${divider()}
${E.support} Telegram: @DreamMakerSupport
🌐 Website: dreammaker-groupsoft.ir
`,

    error_generic:      `${E.cancel} An error occurred. Please try again.`,
    error_no_plan:      `${E.cancel} Plan not found.`,
    error_no_order:     `${E.cancel} Order not found or expired.`,
    error_unauth:       `🚫 Unauthorized.`,
    error_flood:        `${E.warn} Slow down…`,

    // ── Admin ────────────────────────────────────────────────────────────────
    admin_welcome:      `${E.admin} <b>DreamMaker Admin Panel</b>`,
    btn_stats:          `${E.stats} Statistics`,
    btn_orders:         `${E.orders} Pending Orders`,
    btn_users:          `${E.users} Users`,
    btn_broadcast:      `${E.mega} Broadcast`,
    btn_panel_status:   `${E.chart} Panel Status`,
    btn_panel_create:   `${E.plus_star} Create Account`,
    btn_panel_online:   `${E.green} Online Users`,
    btn_panel_lookup:   `${E.search || '🔎'} Lookup Account`,
    btn_panel_delete:   `${E.cancel} Delete Account`,
    btn_back:           `${E.back} Back`,

    stats_title:        `${E.stats} <b>System Statistics</b>`,
    stats_body: (s) => `
${divider()}
${E.users}  Users:            <b>${s.totalUsers}</b>
${E.orders} Total Orders:     <b>${s.totalOrders}</b>
${E.pending} Pending:         <b>${s.pendingOrders}</b>
${E.approved} Approved:       <b>${s.approvedOrders}</b>
${E.rejected} Rejected:       <b>${s.rejectedOrders}</b>
${E.money} Total Revenue:     <b>${fmt(s.totalRevenue)} Toman</b>
${divider()}
`,
    new_order_title:    `${E.bell} <b>New Order!</b>`,
    order_card: (o, planName) => `
${divider()}
${E.user}  User:     ${o.username ? '@' + o.username : 'No username'} (<code>${o.userId}</code>)
${E.box}   Plan:     <b>${planName}</b>
${E.money} Amount:   <b>${fmt(PLANS[o.planId]?.price ?? 0)} Toman</b>
${E.id}    Order:   <code>${o.id}</code>
${E.clock}  Time:    ${new Date(o.createdAt).toLocaleString('en-GB')}
${divider()}
`,
    btn_approve:        `${E.check} Approve Order`,
    btn_reject:         `${E.cancel} Reject Order`,
    order_approved_adm: `${E.check} Order approved and delivered to user.`,
    order_rejected_adm: `${E.cancel} Order rejected; user notified.`,
    already_processed:  `${E.warn} This order was already processed.`,
    no_pending:         `${E.check} No pending orders.`,
    pending_list_title: (n) => `${E.orders} <b>Pending Orders (${n})</b>`,

    broadcast_prompt:   `${E.mega} Send the broadcast message text:`,
    broadcast_done: (ok, fail) => `${E.check} Broadcast complete.\n${E.green} Sent: ${ok} | ${E.red} Failed: ${fail}`,

    receipt_fwd: (o) => `${E.receipt} <b>New Payment Receipt</b>\n${E.user} ${o.username ? '@'+o.username : 'No username'} (<code>${o.userId}</code>)\n${E.id} Order: <code>${o.id}</code>`,

    msg_fwd: (username, userId, text) => `📨 <b>User Message</b>\n${E.user} ${username ? '@' + username : 'No username'} (<code>${userId}</code>)\n\n💬 ${text}`,
    reply_prompt:      (userId) => `Send your message to user <code>${userId}</code>:`,
    reply_sent:         `${E.check} Message delivered to user.`,
    reply_admin: (adminName, text) => `${E.admin} <b>Message from Support:</b>\n\n${text}`,
    panel_missing:      `${E.warn} Panel connection is not configured. Provide PANEL_NGINX_PROXY/PANEL_USER/PANEL_PASS to the Worker.`,
    panel_status_title: `${E.chart} <b>3X-UI Panel Status</b>`,
    panel_create_pick:  `${E.plus_star} Choose the plan for the new account:`,
    panel_create_prompt:(plan) => `${E.plus_star} Create <b>${plan}</b> account\n\nSend the account username/email. Use letters, numbers, dash, underscore, and dot only.`,
    panel_created:     (email, uuid, cfg) => `${E.check} <b>Account created</b>\n${E.user} Name: <code>${email}</code>\n${E.id} UUID: <code>${uuid}</code>\n${E.link} Direct config:\n<code>${cfg}</code>`,
    panel_lookup_prompt:`${E.search || '🔎'} Send account username/email to check traffic:`,
    panel_delete_prompt:`${E.cancel} Send account username/email to delete:`,
    panel_deleted:     (email) => `${E.check} Account <code>${email}</code> deleted.`,
    panel_not_found:   `${E.cancel} Account not found.`,
    panel_online_title:(n) => `${E.green} <b>Online Users (${n})</b>`,
    panel_error:       (msg) => `${E.cancel} Panel error: <code>${escapeHtml(msg)}</code>`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 🛠  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function divider() { return '━━━━━━━━━━━━━━━━━━━━━'; }

function fmt(n) { return Number(n).toLocaleString('en-US'); }

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function planName(plan, lang) {
  return lang === 'fa' ? plan.name_fa : plan.name_en;
}

function planDataStr(plan, lang) {
  const t = T[lang];
  return plan.data_gb ? `${plan.data_gb} GB` : t.plan_unlimited;
}

function planCard(plan, lang) {
  const t = T[lang];
  const pn = planName(plan, lang);
  const pop = plan.popular ? `  ${t.plan_popular}` : '';
  return `
${plan.emoji} <b>${pn}</b>${pop}
${divider()}
📊 حجم / Data:   <b>${planDataStr(plan, lang)}</b>
⏳ مدت / Days:   <b>${plan.days} روز</b>
💰 قیمت / Price: <b>${fmt(plan.price)} تومان</b>
`;
}

function buildSubLink(uuid) {
  return `${CONFIG.SUB_BASE}${uuid}`;
}

function buildVlessConfig(plan) {
  return buildClientVlessConfig(plan, plan.uuid, `DreamMaker-${plan.name_en}`);
}

function buildClientVlessConfig(plan, clientUuid, label = '') {
  const paths = {
    starter:'api/v1/ping', basic:'cdn/init', standard:'app/sync',
    plus:'api/v2/feed', pro:'static/bundle.js', elite:'media/stream', unlimited:'v2/content/live',
  };
  const path = paths[plan.id] || 'api/v1/ping';
  const host = CONFIG.CDN_DOMAIN || 'cdn.dreammaker-groupsoft.ir';
  const tag = encodeURIComponent(label || `DreamMaker-${plan.name_en}`);
  return `vless://${clientUuid}@${host}:443?encryption=none&security=tls&sni=${host}&type=xhttp&host=${host}&path=%2F${path}&mode=auto&fp=chrome&alpn=h2%2Chttp%2F1.1&x_padding_bytes=100-1000#${tag}`;
}

function normalizePanelBase(value) {
  if (!value) return '';
  return value.replace(/\/+$/, '');
}

function panelConfigured() {
  return !!(CONFIG.PANEL_API_BASE && CONFIG.PANEL_USER && CONFIG.PANEL_PASS);
}

function sanitizePanelEmail(value) {
  return String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^A-Za-z0-9_.-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

function bytesFromGb(gb) {
  return gb ? gb * 1024 * 1024 * 1024 : 0;
}

function humanBytes(bytes) {
  const n = Number(bytes || 0);
  if (n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / Math.pow(1024, i)).toFixed(i < 2 ? 0 : 2)} ${units[i]}`;
}

function usageBar(percent, width = 12) {
  const p = Math.max(0, Math.min(100, Number(percent || 0)));
  const filled = Math.round((p / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function usageSummary(stat) {
  const up = Number(stat?.up || 0);
  const down = Number(stat?.down || 0);
  const used = up + down;
  const total = Number(stat?.total || 0);
  const percent = total > 0 ? (used / total) * 100 : 0;
  const left = total > 0 ? Math.max(0, total - used) : 0;
  return { up, down, used, total, percent, left };
}

function usageGraphText(stat, lang) {
  const s = usageSummary(stat);
  const unlimited = lang === 'fa' ? 'نامحدود' : 'unlimited';
  const title = `${E.chart} <b>${escapeHtml(stat?.email || '-')}</b>`;
  const total = s.total ? humanBytes(s.total) : unlimited;
  const left = s.total ? humanBytes(s.left) : unlimited;
  const rate = s.total ? `${Math.min(100, s.percent).toFixed(1)}%` : humanBytes(s.used);
  return [
    title,
    divider(),
    `<code>${usageBar(s.total ? s.percent : 100)}</code> <b>${rate}</b>`,
    `${E.gauge} Used: <b>${humanBytes(s.used)}</b> / ${total}`,
    `${E.refresh} Remaining: <b>${left}</b>`,
    `${E.chart} Upload: ${humanBytes(s.up)} | Download: ${humanBytes(s.down)}`,
    `${E.green} Enabled: <b>${stat?.enable !== false}</b>`,
  ].join('\n');
}

async function panelRaw(path, options = {}, cookie = '') {
  const headers = new Headers(options.headers || {});
  if (cookie) headers.set('Cookie', cookie);
  const res = await fetch(`${CONFIG.PANEL_API_BASE}${path}`, {
    ...options,
    headers,
    redirect: 'manual',
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  return { res, text, json };
}

function panelCookieFrom(headers) {
  const setCookie = headers.get('Set-Cookie') || '';
  return setCookie.split(',').map(v => v.split(';')[0]).filter(Boolean).join('; ');
}

function panelCsrfFrom(html) {
  return String(html || '').match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i)?.[1] || '';
}

async function panelSessionSeed() {
  const { res, text } = await panelRaw('/', {
    method: 'GET',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  return {
    csrf: panelCsrfFrom(text),
    cookie: panelCookieFrom(res.headers),
  };
}

async function panelLogin() {
  if (!panelConfigured()) throw new Error('missing panel config');
  const seed = await panelSessionSeed();
  const body = new URLSearchParams({
    username: CONFIG.PANEL_USER,
    password: CONFIG.PANEL_PASS,
    twoFactorCode: '',
  });
  const headers = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
  });
  if (seed.csrf) headers.set('X-CSRF-Token', seed.csrf);
  if (seed.cookie) headers.set('Cookie', seed.cookie);
  const { res, json, text } = await panelRaw('/login', {
    method: 'POST',
    headers,
    body,
  });
  const cookie = panelCookieFrom(res.headers) || seed.cookie;
  if (!res.ok || !cookie) {
    const msg = json?.msg || json?.message || text.slice(0, 120) || `HTTP ${res.status}`;
    throw new Error(`login failed: ${msg}`);
  }
  return cookie;
}

async function panelApi(path, options = {}) {
  const cookie = await panelLogin();
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!headers.has('X-Requested-With')) headers.set('X-Requested-With', 'XMLHttpRequest');
  const { res, json, text } = await panelRaw(path, { ...options, headers }, cookie);
  if (!res.ok || json?.success === false) {
    const msg = json?.msg || json?.message || text.slice(0, 160) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json ?? text;
}

async function panelInbounds() {
  const data = await panelApi('/panel/api/inbounds/list', { method: 'GET' });
  return Array.isArray(data?.obj) ? data.obj : Array.isArray(data) ? data : [];
}

function panelInboundForPlan(inbounds, planId) {
  const portByPlan = {
    starter:11001, basic:11002, standard:11003, plus:11004, pro:11005, elite:11006, unlimited:11007,
  };
  const port = portByPlan[planId];
  return inbounds.find(i => Number(i.port) === port || String(i.remark || '').toLowerCase().includes(planId));
}

function parseClients(inbound) {
  try {
    const settings = typeof inbound.settings === 'string' ? JSON.parse(inbound.settings) : inbound.settings;
    return Array.isArray(settings?.clients) ? settings.clients : [];
  } catch (_) {
    return [];
  }
}

function clientTrafficLine(stat) {
  if (!stat) return '';
  const used = Number(stat.up || 0) + Number(stat.down || 0);
  const total = Number(stat.total || 0);
  const left = total > 0 ? ` | left ${humanBytes(Math.max(0, total - used))}` : '';
  return `${E.chart} <code>${escapeHtml(stat.email || '-')}</code> used ${humanBytes(used)} / ${total ? humanBytes(total) : 'unlimited'}${left}`;
}

async function panelCreateClient(planId, rawEmail, tgId = '') {
  const plan = PLANS[planId];
  if (!plan) throw new Error('unknown plan');
  const email = sanitizePanelEmail(rawEmail);
  if (!email) throw new Error('invalid account name');

  const inbounds = await panelInbounds();
  const inbound = panelInboundForPlan(inbounds, planId);
  if (!inbound) throw new Error(`inbound not found for ${planId}`);

  const uuid = crypto.randomUUID();
  const subId = shortId().toLowerCase();
  const client = {
    id: uuid,
    flow: '',
    email,
    limitIp: 0,
    totalGB: bytesFromGb(plan.data_gb),
    expiryTime: Date.now() + plan.days * 86400 * 1000,
    enable: true,
    tgId: String(tgId || ''),
    subId,
    reset: 0,
  };

  await panelApi('/panel/api/inbounds/addClient', {
    method: 'POST',
    body: JSON.stringify({ id: inbound.id, settings: JSON.stringify({ clients: [client] }) }),
  });

  return { email, uuid, inbound, config: buildClientVlessConfig(plan, uuid, `DM-${email}`) };
}

async function panelFindClient(email) {
  const needle = sanitizePanelEmail(email).toLowerCase();
  const inbounds = await panelInbounds();
  for (const inbound of inbounds) {
    const clients = parseClients(inbound);
    const client = clients.find(c => String(c.email || '').toLowerCase() === needle);
    if (client) return { inbound, client };
  }
  return null;
}

async function panelDeleteClient(email) {
  const found = await panelFindClient(email);
  if (!found) return false;
  await panelApi(`/panel/api/inbounds/${found.inbound.id}/delClient/${found.client.id}`, { method: 'POST' });
  return true;
}

async function panelClientTraffic(email) {
  const safe = encodeURIComponent(sanitizePanelEmail(email));
  const data = await panelApi(`/panel/api/inbounds/getClientTraffics/${safe}`, { method: 'GET' });
  return data?.obj || data;
}

async function panelOnlineUsers() {
  const data = await panelApi('/panel/api/inbounds/onlines', { method: 'POST' });
  return Array.isArray(data?.obj) ? data.obj : Array.isArray(data) ? data : [];
}

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

function nowFa() { return new Date().toLocaleString('fa-IR'); }
function nowEn() { return new Date().toLocaleString('en-GB'); }

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 KV HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const KV = {
  session: (uid) => `bot:session:${uid}`,
  user:    (uid) => `bot:user:${uid}`,
  order:   (oid) => `bot:order:${oid}`,
  stats:         () => `bot:stats:global`,
  rl:      (uid) => `bot:rl:${uid}`,
  cmdsSet:       () => `bot:cmds_set`,
};

// Sessions
async function getSession(kv, uid) {
  return (await kv.get(KV.session(uid), 'json')) || { lang: CONFIG.DEFAULT_LANG, state: 'idle', data: {} };
}
async function saveSession(kv, uid, s) {
  await kv.put(KV.session(uid), JSON.stringify(s), { expirationTtl: CONFIG.SESSION_TTL });
}
async function patchSession(kv, uid, patch) {
  const s = await getSession(kv, uid);
  Object.assign(s, patch);
  await saveSession(kv, uid, s);
}

// Users
async function getUser(kv, uid) {
  return (await kv.get(KV.user(uid), 'json')) || null;
}
async function saveUser(kv, uid, u) {
  await kv.put(KV.user(uid), JSON.stringify(u));
}
async function upsertUser(kv, uid, username, lang) {
  let u = await getUser(kv, uid);
  if (!u) {
    u = { id: uid, username: username || '', lang, joinedAt: Date.now(), orders: [], services: [] };
    await saveUser(kv, uid, u);
    const s = await getStats(kv);
    await saveStats(kv, { ...s, totalUsers: s.totalUsers + 1 });
  }
  return u;
}
async function getAllUserKeys(kv) {
  const list = await kv.list({ prefix: 'bot:user:' });
  return list.keys.map(k => k.name);
}

// Orders
async function getOrder(kv, oid) {
  return (await kv.get(KV.order(oid), 'json')) || null;
}
async function saveOrder(kv, oid, o) {
  await kv.put(KV.order(oid), JSON.stringify(o), { expirationTtl: CONFIG.ORDER_TTL });
}
async function deleteOrder(kv, oid) {
  await kv.delete(KV.order(oid));
}
async function getAllOrders(kv) {
  const list = await kv.list({ prefix: 'bot:order:' });
  const result = [];
  for (const k of list.keys) {
    const d = await kv.get(k.name, 'json');
    if (d) result.push(d);
  }
  return result;
}

// Stats
async function getStats(kv) {
  return (await kv.get(KV.stats(), 'json')) || { totalUsers:0, totalOrders:0, pendingOrders:0, approvedOrders:0, rejectedOrders:0, totalRevenue:0 };
}
async function saveStats(kv, s) {
  await kv.put(KV.stats(), JSON.stringify(s));
}
async function patchStats(kv, patch) {
  const s = await getStats(kv);
  await saveStats(kv, Object.assign(s, patch));
}

// Rate limiting
async function checkRateLimit(kv, uid) {
  const key = KV.rl(uid);
  const last = await kv.get(key);
  if (last && Date.now() - parseInt(last, 10) < CONFIG.RATE_LIMIT_S * 1000) return false;
  await kv.put(key, String(Date.now()), { expirationTtl: 5 });
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 📡 TELEGRAM API WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────

async function tg(method, params = {}) {
  const res = await fetch(`${tgAPI()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.ok) console.warn(`[tg:${method}] error:`, json.description);
  return json;
}

async function sendMsg(chatId, text, extra = {}) {
  return tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}

async function editMsg(chatId, msgId, text, extra = {}) {
  return tg('editMessageText', { chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML', ...extra });
}

async function answerCB(id, text = '', alert = false) {
  return tg('answerCallbackQuery', { callback_query_id: id, text, show_alert: alert });
}

async function forwardMsg(toChatId, fromChatId, msgId) {
  return tg('forwardMessage', { chat_id: toChatId, from_chat_id: fromChatId, message_id: msgId });
}

async function sendPhoto(chatId, photo, caption = '', extra = {}) {
  return tg('sendPhoto', { chat_id: chatId, photo, caption, parse_mode: 'HTML', ...extra });
}

async function typing(chatId) {
  return tg('sendChatAction', { chat_id: chatId, action: 'typing' });
}

async function setBotCommands() {
  return tg('setMyCommands', {
    commands: [
      { command: 'start',    description: '🏠 شروع / Start' },
      { command: 'plans',    description: '📋 پلن‌ها / Plans' },
      { command: 'buy',      description: '🛒 خرید / Buy' },
      { command: 'services', description: '📦 سرویس‌هام / My Services' },
      { command: 'usage',    description: '📈 مصرف و کانفیگ / Usage' },
      { command: 'compare',  description: '📈 مقایسه / Compare' },
      { command: 'support',  description: '💬 پشتیبانی / Support' },
      { command: 'panel',    description: '🛠 پنل ادمین / Admin Panel' },
      { command: 'language', description: '🌐 تغییر زبان / Change Language' },
    ],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎹 KEYBOARD BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

function kb(rows) { return { inline_keyboard: rows }; }

function miniAppButton(lang) {
  if (!CONFIG.MINI_APP_URL) return null;
  return { text: T[lang].btn_mini_app, web_app: { url: CONFIG.MINI_APP_URL } };
}

function mainMenuKb(lang) {
  const t = T[lang];
  const rows = [
    [{ text: t.btn_buy,      callback_data: 'menu:buy'      }, { text: t.btn_plans,    callback_data: 'menu:plans'    }],
    [{ text: t.btn_renew,    callback_data: 'menu:renew'    }, { text: t.btn_services, callback_data: 'menu:services' }],
    [{ text: t.btn_usage,    callback_data: 'menu:usage'    }],
    [{ text: t.btn_compare,  callback_data: 'menu:compare'  }, { text: t.btn_share,    callback_data: 'menu:share'    }],
    [{ text: t.btn_support,  callback_data: 'menu:support'  }, { text: t.btn_about,    callback_data: 'menu:about'    }],
    [{ text: t.btn_lang,     callback_data: 'menu:lang'     }],
  ];
  const appButton = miniAppButton(lang);
  if (appButton) rows.unshift([appButton]);
  return kb(rows);
}

function langKb() {
  return kb([[
    { text: `${E.flag_ir} فارسی`, callback_data: 'lang:fa' },
    { text: `${E.flag_gb} English`, callback_data: 'lang:en' },
  ]]);
}

function plansKb(lang) {
  const t = T[lang];
  const rows = [];
  const appButton = miniAppButton(lang);
  if (appButton) rows.push([appButton]);
  rows.push(...Object.values(PLANS)
    .filter(p => p.active !== false)
    .map(p => {
      const n = planName(p, lang);
      const badge = p.popular ? ' 🔥' : '';
      return [{ text: `${p.emoji} ${n} — ${fmt(p.price)}T${badge}`, callback_data: `plan:${p.id}` }];
    }));
  rows.push([{ text: t.btn_back_menu, callback_data: 'menu:main' }]);
  return kb(rows);
}

function planPreviewKb(lang, planId) {
  const t = T[lang];
  return kb([
    [{ text: t.btn_confirm, callback_data: `confirm:${planId}` }],
    [{ text: t.btn_cancel,  callback_data: 'menu:plans'        }],
  ]);
}

function paymentKb(lang) {
  const t = T[lang];
  return kb([
    [{ text: t.btn_send_receipt,  callback_data: 'pay:receipt'  }],
    [{ text: t.btn_contact_sup,   callback_data: 'menu:support' }],
    [{ text: t.btn_back_menu,     callback_data: 'menu:main'    }],
  ]);
}

function adminOrderKb(orderId) {
  return kb([[
    { text: `${E.check} تایید`, callback_data: `admin:approve:${orderId}` },
    { text: `${E.cancel} رد`,   callback_data: `admin:reject:${orderId}`  },
  ]]);
}

function adminMainKb(lang) {
  const t = T[lang];
  return kb([
    [{ text: t.btn_stats,     callback_data: 'admin:stats'     }, { text: t.btn_orders,    callback_data: 'admin:orders'    }],
    [{ text: t.btn_users,     callback_data: 'admin:users'     }, { text: t.btn_broadcast, callback_data: 'admin:broadcast' }],
    [{ text: t.btn_panel_status, callback_data: 'admin:panel_status' }, { text: t.btn_panel_create, callback_data: 'admin:panel_create' }],
    [{ text: t.btn_panel_online, callback_data: 'admin:panel_online' }, { text: t.btn_panel_lookup, callback_data: 'admin:panel_lookup' }],
    [{ text: t.btn_panel_delete, callback_data: 'admin:panel_delete' }],
    [{ text: t.btn_back_menu, callback_data: 'menu:main'       }],
  ]);
}

function backMenuKb(lang) {
  return kb([[{ text: T[lang].btn_back_menu, callback_data: 'menu:main' }]]);
}

function backAdminKb(lang) {
  return kb([[{ text: T[lang].btn_back_admin, callback_data: 'admin:main' }]]);
}

function renewKb(lang, services) {
  const rows = services.map((s, i) => ([{
    text: T[lang].renew_btn(s.planName),
    callback_data: `renew:${s.planId}`,
  }]));
  rows.push([{ text: T[lang].btn_back_menu, callback_data: 'menu:main' }]);
  return kb(rows);
}

function panelPlanKb(lang) {
  const rows = Object.values(PLANS).map(p => ([{
    text: `${p.emoji} ${planName(p, lang)} — ${planDataStr(p, lang)}`,
    callback_data: `admin:panel_tier:${p.id}`,
  }]));
  rows.push([{ text: T[lang].btn_back_admin, callback_data: 'admin:main' }]);
  return kb(rows);
}

function usageKb(lang, alertEnabled = false) {
  const t = T[lang];
  return kb([
    [{ text: t.btn_usage_graph, callback_data: 'usage:graph' }, { text: t.btn_view_config, callback_data: 'usage:config' }],
    [{ text: t.btn_qr, callback_data: 'usage:qr' }, { text: t.btn_alerts, callback_data: alertEnabled ? 'usage:alert_off' : 'usage:alert_on' }],
    [{ text: t.btn_bind_account, callback_data: 'usage:bind' }],
    [{ text: t.btn_back_menu, callback_data: 'menu:main' }],
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎯 HANDLERS — User Side
// ─────────────────────────────────────────────────────────────────────────────

async function handleStart(kv, uid, username, lang, startParam) {
  const t = T[lang];
  await upsertUser(kv, uid, username, lang);
  await patchSession(kv, uid, { state: 'idle', data: {} });

  // Handle referral deep-link (future expansion)
  if (startParam && startParam.startsWith('ref_')) {
    const refId = startParam.slice(4);
    console.log(`User ${uid} referred by ${refId}`);
  }

  const firstName = username || '';
  await sendMsg(uid, t.welcome(firstName), { reply_markup: mainMenuKb(lang) });
}

async function handleLangSelect(kv, uid, newLang) {
  await patchSession(kv, uid, { lang: newLang });
  const u = await getUser(kv, uid);
  if (u) { u.lang = newLang; await saveUser(kv, uid, u); }
  await sendMsg(uid, T[newLang].lang_changed, { reply_markup: mainMenuKb(newLang) });
}

async function handlePlans(kv, uid, lang) {
  const t = T[lang];
  await typing(uid);
  await sendMsg(uid, `${t.plans_title}\n\n${t.plans_desc}`, { reply_markup: plansKb(lang) });
}

async function handleComparePlans(kv, uid, lang) {
  await sendMsg(uid, T[lang].compare_body, { reply_markup: plansKb(lang) });
}

async function handleShare(kv, uid, lang) {
  const text = lang === 'fa'
    ? `${E.gift} لینک معرفی شما:\nhttps://t.me/${CONFIG.BOT_USERNAME || 'DreamMakerBot'}?start=ref_${uid}`
    : `${E.gift} Your referral link:\nhttps://t.me/${CONFIG.BOT_USERNAME || 'DreamMakerBot'}?start=ref_${uid}`;
  await sendMsg(uid, text, { reply_markup: backMenuKb(lang), disable_web_page_preview: true });
}

async function handlePlanPreview(kv, uid, lang, planId) {
  const t = T[lang];
  const plan = PLANS[planId];
  if (!plan) { await sendMsg(uid, t.error_no_plan); return; }

  const text = `${t.preview_title}\n${planCard(plan, lang)}\n${t.preview_confirm}\n\n${t.step_1_of_3}`;
  await sendMsg(uid, text, { reply_markup: planPreviewKb(lang, planId) });
}

async function handleConfirmPurchase(kv, uid, username, lang, planId) {
  const t = T[lang];
  const plan = PLANS[planId];
  if (!plan) { await sendMsg(uid, t.error_no_plan); return; }

  const orderId = `DM-${shortId()}`;
  const order = { id: orderId, userId: uid, username: username || '', planId, status: 'pending', createdAt: Date.now(), uuid: plan.uuid };
  await saveOrder(kv, orderId, order);

  const stats = await getStats(kv);
  await saveStats(kv, { ...stats, totalOrders: stats.totalOrders + 1, pendingOrders: stats.pendingOrders + 1 });

  // Tell user payment info
  const userText = `${t.payment_title}\n${t.payment_body(orderId, plan.price)}\n${t.step_2_of_3}`;
  await sendMsg(uid, userText, { reply_markup: paymentKb(lang) });

  // Set session to await receipt
  await patchSession(kv, uid, { state: 'awaiting_receipt', data: { orderId } });

  // Notify admin
  const pn = planName(plan, 'fa');
  const adminT = T['fa'];
  await sendMsg(CONFIG.ADMIN_ID,
    `${adminT.new_order_title}\n${adminT.order_card(order, pn)}`,
    { reply_markup: adminOrderKb(orderId) }
  );
}

async function handleReceiptPhoto(kv, uid, username, photo, lang) {
  // photo is the largest photo array element
  const t = T[lang];
  const session = await getSession(kv, uid);
  const orderId = session.data?.orderId;

  if (!orderId) {
    await sendMsg(uid, t.error_no_order);
    return;
  }

  // Forward photo to admin with context
  const order = await getOrder(kv, orderId);
  if (order) {
    const adminT = T['fa'];
    // Send caption+photo to admin
    await sendPhoto(CONFIG.ADMIN_ID, photo.file_id,
      adminT.receipt_fwd(order),
      { reply_markup: adminOrderKb(orderId) }
    );
  }

  await sendMsg(uid, t.receipt_sent, { reply_markup: backMenuKb(lang) });
  await patchSession(kv, uid, { state: 'idle', data: {} });
}

async function handleMyServices(kv, uid, lang) {
  const t = T[lang];
  const u = await getUser(kv, uid);
  const services = u?.services || [];

  if (services.length === 0) {
    await sendMsg(uid, t.no_services, { reply_markup: backMenuKb(lang) });
    return;
  }

  let text = `${t.services_title}\n${divider()}\n\n`;
  services.forEach((s, i) => { text += t.service_item(s, i + 1) + '\n\n'; });
  await sendMsg(uid, text, { reply_markup: backMenuKb(lang) });
}

async function handleUsageCenter(kv, uid, lang) {
  const u = await getUser(kv, uid);
  const alertEnabled = !!u?.usageAlert?.enabled;
  const email = u?.panelEmail ? `\n${E.link} ${lang === 'fa' ? 'اکانت متصل' : 'Linked account'}: <code>${escapeHtml(u.panelEmail)}</code>` : '';
  await sendMsg(uid, `${T[lang].usage_title}\n\n${T[lang].usage_desc}${email}`, { reply_markup: usageKb(lang, alertEnabled) });
}

async function handleBindAccountPrompt(kv, uid, lang) {
  await patchSession(kv, uid, { state: 'awaiting_bind_account', data: {} });
  await sendMsg(uid, T[lang].bind_prompt, { reply_markup: backMenuKb(lang) });
}

async function handleBindAccount(kv, uid, text, lang) {
  const email = sanitizePanelEmail(text);
  let u = await getUser(kv, uid);
  if (!u) u = { id: uid, username: '', lang, joinedAt: Date.now(), orders: [], services: [] };
  u.panelEmail = email;
  u.usageAlert = u.usageAlert || { enabled: false, thresholdGb: 1, lastAlertAt: 0 };
  await saveUser(kv, uid, u);
  await patchSession(kv, uid, { state: 'idle', data: {} });
  await sendMsg(uid, T[lang].bind_done(email), { reply_markup: usageKb(lang, u.usageAlert.enabled) });
}

async function resolveUserConfig(kv, uid) {
  const u = await getUser(kv, uid);
  const services = u?.services || [];
  const latest = services[services.length - 1];
  if (latest?.config) return latest.config;
  if (latest?.cfg) return latest.cfg;
  if (latest?.subLink) return latest.subLink;

  if (u?.panelEmail) {
    const found = await panelFindClient(u.panelEmail);
    if (found) {
      const planId = Object.entries({ starter:11001, basic:11002, standard:11003, plus:11004, pro:11005, elite:11006, unlimited:11007 })
        .find(([, port]) => Number(found.inbound.port) === port)?.[0] || 'standard';
      return buildClientVlessConfig(PLANS[planId], found.client.id, `DM-${u.panelEmail}`);
    }
  }
  return '';
}

async function handleUsageGraph(kv, uid, lang) {
  const u = await getUser(kv, uid);
  if (!u?.panelEmail) { await sendMsg(uid, T[lang].usage_no_bind, { reply_markup: usageKb(lang, false) }); return; }
  if (!panelConfigured()) { await sendMsg(uid, T[lang].panel_missing, { reply_markup: usageKb(lang, !!u.usageAlert?.enabled) }); return; }
  try {
    await typing(uid);
    const stat = await panelClientTraffic(u.panelEmail);
    if (!stat) await sendMsg(uid, T[lang].panel_not_found, { reply_markup: usageKb(lang, !!u.usageAlert?.enabled) });
    else await sendMsg(uid, usageGraphText(stat, lang), { reply_markup: usageKb(lang, !!u.usageAlert?.enabled) });
  } catch (err) {
    await sendMsg(uid, T[lang].panel_error(err.message), { reply_markup: usageKb(lang, !!u.usageAlert?.enabled) });
  }
}

async function handleViewConfig(kv, uid, lang, qrMode = false) {
  try {
    const cfg = await resolveUserConfig(kv, uid);
    if (!cfg) { await sendMsg(uid, T[lang].config_empty, { reply_markup: usageKb(lang, false) }); return; }
    const title = qrMode ? T[lang].qr_title : T[lang].config_title;
    const u = await getUser(kv, uid);
    await sendMsg(uid, `${title}\n\n<code>${escapeHtml(cfg)}</code>`, {
      reply_markup: usageKb(lang, !!u?.usageAlert?.enabled),
      protect_content: true,
    });
  } catch (err) {
    await sendMsg(uid, T[lang].panel_error(err.message), { reply_markup: usageKb(lang, false) });
  }
}

async function setUsageAlert(kv, uid, lang, enabled) {
  let u = await getUser(kv, uid);
  if (!u) u = { id: uid, username: '', lang, joinedAt: Date.now(), orders: [], services: [] };
  u.usageAlert = { enabled, thresholdGb: 1, lastAlertAt: 0 };
  await saveUser(kv, uid, u);
  await sendMsg(uid, enabled ? T[lang].alert_enabled(1) : T[lang].alert_disabled, { reply_markup: usageKb(lang, enabled) });
}

async function handleRenew(kv, uid, lang) {
  const t = T[lang];
  const u = await getUser(kv, uid);
  const services = u?.services || [];

  if (services.length === 0) {
    await sendMsg(uid, t.no_services, { reply_markup: backMenuKb(lang) });
    return;
  }

  await sendMsg(uid, `${t.renew_title}\n\n${t.renew_pick}`, { reply_markup: renewKb(lang, services) });
}

async function handleRenewSelect(kv, uid, username, lang, planId) {
  // Renewing = start a fresh purchase for same plan
  await handleConfirmPurchase(kv, uid, username, lang, planId);
}

async function handleSupport(kv, uid, lang) {
  const t = T[lang];
  await sendMsg(uid, `${t.support_title}\n\n${t.support_desc}`, { reply_markup: backMenuKb(lang) });
  await patchSession(kv, uid, { state: 'awaiting_support', data: {} });
}

async function handleSupportMsg(kv, uid, username, text, lang) {
  const t = T[lang];
  const adminT = T['fa'];
  // Forward to admin with reply button
  await sendMsg(CONFIG.ADMIN_ID,
    adminT.msg_fwd(username, uid, text),
    { reply_markup: kb([[{ text: `${E.support} پاسخ به کاربر`, callback_data: `admin:reply:${uid}` }]]) }
  );
  await sendMsg(uid, t.support_sent, { reply_markup: mainMenuKb(lang) });
  await patchSession(kv, uid, { state: 'idle', data: {} });
}

async function handleAbout(kv, uid, lang) {
  await sendMsg(uid, T[lang].about_body, { reply_markup: backMenuKb(lang) });
}

async function handleWebAppData(kv, uid, username, raw, lang) {
  let payload = null;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    await sendMsg(uid, T[lang].error_generic);
    return;
  }

  if (payload?.lang === 'fa' || payload?.lang === 'en') {
    lang = payload.lang;
    await patchSession(kv, uid, { lang });
    const u = await getUser(kv, uid);
    if (u) { u.lang = lang; await saveUser(kv, uid, u); }
  }

  if (payload?.action === 'preview' && payload.planId) {
    await handlePlanPreview(kv, uid, lang, payload.planId);
    return;
  }

  if (payload?.action === 'buy' && payload.planId) {
    await handleConfirmPurchase(kv, uid, username, lang, payload.planId);
    return;
  }

  await sendMsg(uid, T[lang].main_menu_desc, { reply_markup: mainMenuKb(lang) });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎯 HANDLERS — Admin Side
// ─────────────────────────────────────────────────────────────────────────────

function isAdmin(uid) { return uid.toString() === CONFIG.ADMIN_ID.toString(); }

async function handleAdminPanel(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  await sendMsg(uid, T[lang].admin_welcome, { reply_markup: adminMainKb(lang) });
}

async function handleAdminStats(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  const t = T[lang];
  const s = await getStats(kv);
  await sendMsg(uid, `${t.stats_title}${t.stats_body(s)}`, { reply_markup: backAdminKb(lang) });
}

async function handleAdminOrders(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  const t = T[lang];
  await typing(uid);
  const orders = await getAllOrders(kv);
  const pending = orders.filter(o => o.status === 'pending');

  if (pending.length === 0) {
    await sendMsg(uid, t.no_pending, { reply_markup: backAdminKb(lang) });
    return;
  }

  await sendMsg(uid, t.pending_list_title(pending.length));
  for (const o of pending.slice(0, 8)) {
    const plan = PLANS[o.planId];
    const pn = plan ? planName(plan, lang) : o.planId;
    await sendMsg(uid, T['fa'].order_card(o, pn), { reply_markup: adminOrderKb(o.id) });
  }
}

async function handleAdminUsers(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  await typing(uid);
  const keys = await getAllUserKeys(kv);
  let text = `${E.users} <b>کاربران ثبت‌شده: ${keys.length}</b>\n${divider()}\n`;
  const slice = keys.slice(0, 20);
  for (const key of slice) {
    const u = await kv.get(key, 'json');
    if (!u) continue;
    const uname = u.username ? `@${u.username}` : 'بدون نام';
    text += `• ${uname} (<code>${u.id}</code>) — ${(u.services||[]).length} سرویس\n`;
  }
  if (keys.length > 20) text += `\n…و ${keys.length - 20} کاربر دیگر`;
  await sendMsg(uid, text, { reply_markup: backAdminKb(lang) });
}

async function handlePanelStatus(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  const t = T[lang];
  if (!panelConfigured()) { await sendMsg(uid, t.panel_missing, { reply_markup: backAdminKb(lang) }); return; }
  try {
    await typing(uid);
    const inbounds = await panelInbounds();
    let totalClients = 0;
    let text = `${t.panel_status_title}\n${divider()}\n`;
    for (const inbound of inbounds) {
      const clients = parseClients(inbound);
      totalClients += clients.length;
      const up = humanBytes(inbound.up || 0);
      const down = humanBytes(inbound.down || 0);
      text += `\n${inbound.enable === false ? E.red : E.green} <b>${escapeHtml(inbound.remark || 'Inbound')}</b>\n`;
      text += `${E.link} Port: <code>${inbound.port}</code> | Clients: <b>${clients.length}</b>\n`;
      text += `${E.chart} Up: ${up} | Down: ${down}\n`;
    }
    text += `\n${divider()}\n${E.users} Total accounts: <b>${totalClients}</b>`;
    await sendMsg(uid, text, { reply_markup: backAdminKb(lang) });
  } catch (err) {
    await sendMsg(uid, t.panel_error(err.message), { reply_markup: backAdminKb(lang) });
  }
}

async function handlePanelCreatePick(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  if (!panelConfigured()) { await sendMsg(uid, T[lang].panel_missing, { reply_markup: backAdminKb(lang) }); return; }
  await sendMsg(uid, T[lang].panel_create_pick, { reply_markup: panelPlanKb(lang) });
}

async function handlePanelCreateTier(kv, uid, lang, planId) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  const plan = PLANS[planId];
  if (!plan) { await sendMsg(uid, T[lang].error_no_plan, { reply_markup: backAdminKb(lang) }); return; }
  await patchSession(kv, uid, { state: 'awaiting_panel_create_email', data: { planId } });
  await sendMsg(uid, T[lang].panel_create_prompt(planName(plan, lang)), { reply_markup: backAdminKb(lang) });
}

async function handlePanelCreateEmail(kv, uid, text, lang) {
  const t = T[lang];
  const session = await getSession(kv, uid);
  const planId = session.data?.planId;
  try {
    await typing(uid);
    const created = await panelCreateClient(planId, text, uid);
    await sendMsg(uid, t.panel_created(created.email, created.uuid, created.config), {
      reply_markup: adminMainKb(lang),
      protect_content: true,
    });
  } catch (err) {
    await sendMsg(uid, t.panel_error(err.message), { reply_markup: adminMainKb(lang) });
  }
  await patchSession(kv, uid, { state: 'idle', data: {} });
}

async function handlePanelOnline(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  const t = T[lang];
  if (!panelConfigured()) { await sendMsg(uid, t.panel_missing, { reply_markup: backAdminKb(lang) }); return; }
  try {
    await typing(uid);
    const users = await panelOnlineUsers();
    const list = users.slice(0, 60).map(v => `• <code>${escapeHtml(v)}</code>`).join('\n') || (lang === 'fa' ? 'کاربر آنلاینی گزارش نشده است.' : 'No online user reported.');
    await sendMsg(uid, `${t.panel_online_title(users.length)}\n${divider()}\n${list}`, { reply_markup: backAdminKb(lang) });
  } catch (err) {
    await sendMsg(uid, t.panel_error(err.message), { reply_markup: backAdminKb(lang) });
  }
}

async function handlePanelLookupPrompt(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  await patchSession(kv, uid, { state: 'awaiting_panel_lookup', data: {} });
  await sendMsg(uid, T[lang].panel_lookup_prompt, { reply_markup: backAdminKb(lang) });
}

async function handlePanelLookup(kv, uid, text, lang) {
  const t = T[lang];
  try {
    await typing(uid);
    const stat = await panelClientTraffic(text);
    if (!stat) await sendMsg(uid, t.panel_not_found, { reply_markup: adminMainKb(lang) });
    else await sendMsg(uid, `${E.user} <b>${escapeHtml(stat.email || sanitizePanelEmail(text))}</b>\n${divider()}\n${clientTrafficLine(stat)}\n${E.green} Enabled: <b>${stat.enable !== false}</b>`, { reply_markup: adminMainKb(lang) });
  } catch (err) {
    await sendMsg(uid, t.panel_error(err.message), { reply_markup: adminMainKb(lang) });
  }
  await patchSession(kv, uid, { state: 'idle', data: {} });
}

async function handlePanelDeletePrompt(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  await patchSession(kv, uid, { state: 'awaiting_panel_delete', data: {} });
  await sendMsg(uid, T[lang].panel_delete_prompt, { reply_markup: backAdminKb(lang) });
}

async function handlePanelDelete(kv, uid, text, lang) {
  const t = T[lang];
  try {
    await typing(uid);
    const email = sanitizePanelEmail(text);
    const ok = await panelDeleteClient(email);
    await sendMsg(uid, ok ? t.panel_deleted(email) : t.panel_not_found, { reply_markup: adminMainKb(lang) });
  } catch (err) {
    await sendMsg(uid, t.panel_error(err.message), { reply_markup: adminMainKb(lang) });
  }
  await patchSession(kv, uid, { state: 'idle', data: {} });
}

async function handleApproveOrder(kv, adminId, orderId, lang) {
  if (!isAdmin(adminId)) { await sendMsg(adminId, T[lang].error_unauth); return; }
  const t = T[lang];
  const order = await getOrder(kv, orderId);

  if (!order) { await sendMsg(adminId, t.error_no_order); return; }
  if (order.status !== 'pending') { await sendMsg(adminId, t.already_processed); return; }

  order.status = 'approved';
  order.approvedAt = Date.now();
  await saveOrder(kv, orderId, order);

  const plan = PLANS[order.planId];
  const stats = await getStats(kv);
  await saveStats(kv, {
    ...stats,
    pendingOrders: Math.max(0, stats.pendingOrders - 1),
    approvedOrders: stats.approvedOrders + 1,
    totalRevenue: stats.totalRevenue + (plan?.price ?? 0),
  });

  // Get user lang
  const userObj = await getUser(kv, order.userId);
  const uLang = userObj?.lang || CONFIG.DEFAULT_LANG;
  const ut = T[uLang];

  const subLink = buildSubLink(order.uuid);
  const cfg = buildVlessConfig(plan);

  // Send config to user (protected)
  const userText = [
    ut.approved_title,
    '',
    ut.approved_sub(subLink),
    ut.approved_cfg(cfg),
    ut.approved_guide,
    '',
    ut.step_3_of_3,
  ].join('\n');

  await sendMsg(order.userId, userText, { protect_content: true });

  // Save service to user profile
  if (userObj) {
    userObj.services = userObj.services || [];
    userObj.services.push({
      orderId,
      planId: order.planId,
      planName: planName(plan, uLang),
      subLink,
      config: cfg,
      activatedAt: uLang === 'fa' ? nowFa() : nowEn(),
    });
    await saveUser(kv, order.userId, userObj);
  }

  await deleteOrder(kv, orderId);
  await sendMsg(adminId, t.order_approved_adm);
}

async function handleRejectOrder(kv, adminId, orderId, lang) {
  if (!isAdmin(adminId)) { await sendMsg(adminId, T[lang].error_unauth); return; }
  const t = T[lang];
  const order = await getOrder(kv, orderId);

  if (!order) { await sendMsg(adminId, t.error_no_order); return; }
  if (order.status !== 'pending') { await sendMsg(adminId, t.already_processed); return; }

  order.status = 'rejected';
  order.rejectedAt = Date.now();
  await saveOrder(kv, orderId, order);

  const stats = await getStats(kv);
  await saveStats(kv, {
    ...stats,
    pendingOrders: Math.max(0, stats.pendingOrders - 1),
    rejectedOrders: stats.rejectedOrders + 1,
  });

  const userObj = await getUser(kv, order.userId);
  const uLang = userObj?.lang || CONFIG.DEFAULT_LANG;
  const ut = T[uLang];

  await sendMsg(order.userId, `${ut.rejected_title}\n\n${ut.rejected_body}`, { reply_markup: backMenuKb(uLang) });
  await deleteOrder(kv, orderId);
  await sendMsg(adminId, t.order_rejected_adm);
}

async function handleAdminBroadcast(kv, uid, lang) {
  if (!isAdmin(uid)) { await sendMsg(uid, T[lang].error_unauth); return; }
  await sendMsg(uid, T[lang].broadcast_prompt, { reply_markup: backAdminKb(lang) });
  await patchSession(kv, uid, { state: 'awaiting_broadcast', data: {} });
}

async function executeBroadcast(kv, adminId, text, lang) {
  const t = T[lang];
  const keys = await getAllUserKeys(kv);
  let ok = 0, fail = 0;
  for (const key of keys) {
    const u = await kv.get(key, 'json');
    if (!u || u.id.toString() === adminId.toString()) continue;
    const res = await sendMsg(u.id, text);
    if (res.ok) ok++; else fail++;
    // small delay to avoid flooding Telegram
    await new Promise(r => setTimeout(r, 40));
  }
  await sendMsg(adminId, t.broadcast_done(ok, fail), { reply_markup: adminMainKb(lang) });
  await patchSession(kv, adminId, { state: 'idle', data: {} });
}

async function handleAdminReplyInit(kv, adminId, targetUserId, lang) {
  if (!isAdmin(adminId)) { await sendMsg(adminId, T[lang].error_unauth); return; }
  await sendMsg(adminId, T[lang].reply_prompt(targetUserId));
  await patchSession(kv, adminId, { state: 'awaiting_reply', data: { targetUserId } });
}

async function handleAdminReplyMsg(kv, adminId, text, lang) {
  const session = await getSession(kv, adminId);
  const targetId = session.data?.targetUserId;
  if (!targetId) return;

  const targetUser = await getUser(kv, targetId);
  const tLang = targetUser?.lang || CONFIG.DEFAULT_LANG;
  await sendMsg(targetId, T[tLang].reply_admin('Support', text));
  await sendMsg(adminId, T[lang].reply_sent, { reply_markup: adminMainKb(lang) });
  await patchSession(kv, adminId, { state: 'idle', data: {} });
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎮 MAIN UPDATE HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function handleUpdate(update, kv) {
  // ── Callback queries ──────────────────────────────────────────────────────
  if (update.callback_query) {
    const q    = update.callback_query;
    const uid  = q.from.id;
    const uname = q.from.username || q.from.first_name || '';
    const data = q.data || '';

    await answerCB(q.id);

    if (!(await checkRateLimit(kv, uid))) {
      const s = await getSession(kv, uid);
      await answerCB(q.id, T[s.lang || CONFIG.DEFAULT_LANG].error_flood, true);
      return;
    }

    const session = await getSession(kv, uid);
    const lang = session.lang || CONFIG.DEFAULT_LANG;

    // ── Language ────────────────────────────────────────────────────────────
    if (data.startsWith('lang:')) {
      await handleLangSelect(kv, uid, data.split(':')[1]);
    }
    // ── Main menu actions ───────────────────────────────────────────────────
    else if (data.startsWith('menu:')) {
      const action = data.split(':')[1];
      if      (action === 'main')     await sendMsg(uid, T[lang].main_menu_desc, { reply_markup: mainMenuKb(lang) });
      else if (action === 'buy' || action === 'plans') await handlePlans(kv, uid, lang);
      else if (action === 'renew')    await handleRenew(kv, uid, lang);
      else if (action === 'services') await handleMyServices(kv, uid, lang);
      else if (action === 'usage')    await handleUsageCenter(kv, uid, lang);
      else if (action === 'compare')  await handleComparePlans(kv, uid, lang);
      else if (action === 'share')    await handleShare(kv, uid, lang);
      else if (action === 'support')  await handleSupport(kv, uid, lang);
      else if (action === 'about')    await handleAbout(kv, uid, lang);
      else if (action === 'lang')     await sendMsg(uid, T[lang].choose_lang, { reply_markup: langKb() });
    }
    // ── Plan selection ──────────────────────────────────────────────────────
    else if (data.startsWith('plan:')) {
      await handlePlanPreview(kv, uid, lang, data.split(':')[1]);
    }
    else if (data.startsWith('confirm:')) {
      await handleConfirmPurchase(kv, uid, uname, lang, data.split(':')[1]);
    }
    // ── Payment ─────────────────────────────────────────────────────────────
    else if (data === 'pay:receipt') {
      await sendMsg(uid, T[lang].awaiting_receipt);
      await patchSession(kv, uid, { ...session, state: 'awaiting_receipt' });
    }
    // ── Renew ────────────────────────────────────────────────────────────────
    else if (data.startsWith('renew:')) {
      await handleRenewSelect(kv, uid, uname, lang, data.split(':')[1]);
    }
    // ── Usage / config ──────────────────────────────────────────────────────
    else if (data.startsWith('usage:')) {
      const action = data.split(':')[1];
      if      (action === 'bind')      await handleBindAccountPrompt(kv, uid, lang);
      else if (action === 'graph')     await handleUsageGraph(kv, uid, lang);
      else if (action === 'config')    await handleViewConfig(kv, uid, lang, false);
      else if (action === 'qr')        await handleViewConfig(kv, uid, lang, true);
      else if (action === 'alert_on')  await setUsageAlert(kv, uid, lang, true);
      else if (action === 'alert_off') await setUsageAlert(kv, uid, lang, false);
    }
    // ── Admin actions ────────────────────────────────────────────────────────
    else if (data.startsWith('admin:')) {
      const parts  = data.split(':');
      const action = parts[1];
      if      (action === 'main')      await handleAdminPanel(kv, uid, lang);
      else if (action === 'stats')     await handleAdminStats(kv, uid, lang);
      else if (action === 'orders')    await handleAdminOrders(kv, uid, lang);
      else if (action === 'users')     await handleAdminUsers(kv, uid, lang);
      else if (action === 'broadcast') await handleAdminBroadcast(kv, uid, lang);
      else if (action === 'panel_status') await handlePanelStatus(kv, uid, lang);
      else if (action === 'panel_create') await handlePanelCreatePick(kv, uid, lang);
      else if (action === 'panel_tier')   await handlePanelCreateTier(kv, uid, lang, parts[2]);
      else if (action === 'panel_online') await handlePanelOnline(kv, uid, lang);
      else if (action === 'panel_lookup') await handlePanelLookupPrompt(kv, uid, lang);
      else if (action === 'panel_delete') await handlePanelDeletePrompt(kv, uid, lang);
      else if (action === 'approve')   await handleApproveOrder(kv, uid, parts[2], lang);
      else if (action === 'reject')    await handleRejectOrder(kv, uid, parts[2], lang);
      else if (action === 'reply')     await handleAdminReplyInit(kv, uid, parts[2], lang);
    }
    return;
  }

  // ── Regular messages ──────────────────────────────────────────────────────
  if (update.message) {
    const msg   = update.message;
    const uid   = msg.from.id;
    const uname = msg.from.username || msg.from.first_name || '';
    const text  = msg.text || '';

    if (!(await checkRateLimit(kv, uid))) return;

    const session = await getSession(kv, uid);
    const lang    = session.lang || CONFIG.DEFAULT_LANG;

    if (msg.web_app_data?.data) {
      await handleWebAppData(kv, uid, uname, msg.web_app_data.data, lang);
      return;
    }

    // ── Commands ────────────────────────────────────────────────────────────
    if (text.startsWith('/')) {
      const [cmd, ...args] = text.split(' ');
      const command = cmd.toLowerCase().split('@')[0]; // strip @botname

      if      (command === '/start')    await handleStart(kv, uid, uname, lang, args[0]);
      else if (command === '/plans')    await handlePlans(kv, uid, lang);
      else if (command === '/buy')      await handlePlans(kv, uid, lang);
      else if (command === '/services') await handleMyServices(kv, uid, lang);
      else if (command === '/usage')    await handleUsageCenter(kv, uid, lang);
      else if (command === '/compare')  await handleComparePlans(kv, uid, lang);
      else if (command === '/support')  await handleSupport(kv, uid, lang);
      else if (command === '/admin')    await handleAdminPanel(kv, uid, lang);
      else if (command === '/panel')    await handleAdminPanel(kv, uid, lang);
      else if (command === '/stats' && isAdmin(uid)) await handleAdminStats(kv, uid, lang);
      else if (command === '/language' || command === '/lang') {
        await sendMsg(uid, T[lang].choose_lang, { reply_markup: langKb() });
      }
      return;
    }

    // ── State machine ────────────────────────────────────────────────────────
    const state = session.state;

    // Receipt photo upload
    if (state === 'awaiting_receipt' && msg.photo) {
      const biggestPhoto = msg.photo[msg.photo.length - 1];
      await handleReceiptPhoto(kv, uid, uname, biggestPhoto, lang);
      return;
    }

    // Support message (text)
    if (state === 'awaiting_support') {
      await handleSupportMsg(kv, uid, uname, text, lang);
      return;
    }

    // Admin: broadcast text
    if (state === 'awaiting_broadcast' && isAdmin(uid)) {
      await executeBroadcast(kv, uid, text, lang);
      return;
    }

    // Admin: reply to user
    if (state === 'awaiting_reply' && isAdmin(uid)) {
      await handleAdminReplyMsg(kv, uid, text, lang);
      return;
    }

    if (state === 'awaiting_panel_create_email' && isAdmin(uid)) {
      await handlePanelCreateEmail(kv, uid, text, lang);
      return;
    }

    if (state === 'awaiting_panel_lookup' && isAdmin(uid)) {
      await handlePanelLookup(kv, uid, text, lang);
      return;
    }

    if (state === 'awaiting_panel_delete' && isAdmin(uid)) {
      await handlePanelDelete(kv, uid, text, lang);
      return;
    }

    if (state === 'awaiting_bind_account') {
      await handleBindAccount(kv, uid, text, lang);
      return;
    }

    // Awaiting receipt but got text instead of photo
    if (state === 'awaiting_receipt' && text) {
      await sendMsg(uid, T[lang].awaiting_receipt);
      return;
    }

    // Passthrough: forward non-command user messages to admin
    if (!isAdmin(uid)) {
      await sendMsg(CONFIG.ADMIN_ID,
        T['fa'].msg_fwd(uname, uid, text),
        { reply_markup: kb([[{ text: `${E.support} پاسخ`, callback_data: `admin:reply:${uid}` }]]) }
      );
    }
  }
}

function injectEnv(env, origin = '') {
  if (env.BOT_TOKEN_ENV || env.TELEGRAM_BOT_TOKEN) CONFIG.BOT_TOKEN = env.BOT_TOKEN_ENV || env.TELEGRAM_BOT_TOKEN;
  if (env.ADMIN_CHAT_ID || env.TELEGRAM_OWNER_ID || env.TELEGRAM_CHAT_ID) CONFIG.ADMIN_ID  = env.ADMIN_CHAT_ID || env.TELEGRAM_OWNER_ID || env.TELEGRAM_CHAT_ID;
  if (env.SUB_BASE_URL) CONFIG.SUB_BASE = env.SUB_BASE_URL;
  if (env.BRAND_NAME) CONFIG.BRAND_NAME = env.BRAND_NAME;
  if (env.BOT_USERNAME || env.TELEGRAM_BOT_USERNAME) CONFIG.BOT_USERNAME = env.BOT_USERNAME || env.TELEGRAM_BOT_USERNAME;
  if (env.SUPPORT_USERNAME) CONFIG.SUPPORT_USERNAME = env.SUPPORT_USERNAME;
  if (env.CDN_DOMAIN) CONFIG.CDN_DOMAIN = env.CDN_DOMAIN;
  CONFIG.PANEL_API_BASE = normalizePanelBase(env.PANEL_NGINX_PROXY || env.PANEL_BACKEND_URL || env.PANEL_URL || CONFIG.PANEL_API_BASE);
  if (env.PANEL_USER) CONFIG.PANEL_USER = env.PANEL_USER;
  if (env.PANEL_PASS) CONFIG.PANEL_PASS = env.PANEL_PASS;
  if (origin) CONFIG.MINI_APP_URL = env.MINI_APP_URL || `${origin}/mini-app`;
}

async function checkUsageAlerts(kv) {
  if (!panelConfigured()) return;
  const keys = await getAllUserKeys(kv);
  const now = Date.now();
  for (const key of keys) {
    const u = await kv.get(key, 'json');
    if (!u?.usageAlert?.enabled || !u.panelEmail) continue;
    if (u.usageAlert.lastAlertAt && now - u.usageAlert.lastAlertAt < 12 * 3600 * 1000) continue;
    try {
      const stat = await panelClientTraffic(u.panelEmail);
      const sum = usageSummary(stat);
      if (!sum.total) continue;
      const threshold = bytesFromGb(u.usageAlert.thresholdGb || 1);
      if (sum.left <= threshold) {
        const lang = u.lang || CONFIG.DEFAULT_LANG;
        await sendMsg(u.id, T[lang].alert_low(u.panelEmail, humanBytes(sum.left)), { reply_markup: usageKb(lang, true) });
        u.usageAlert.lastAlertAt = now;
        await saveUser(kv, u.id, u);
      }
    } catch (err) {
      console.warn('[usage-alert]', u.id, err.message);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 CLOUDFLARE WORKER ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // ── Inject environment variables into CONFIG (MUST be first) ────────────
    const url = new URL(request.url);
    injectEnv(env, url.origin);

    const kv = env.HEALTH_KV;

    if (request.method === 'GET' && url.pathname === '/mini-app') {
      return new Response(miniAppHtml(), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'Content-Security-Policy': "default-src 'self' https://telegram.org; script-src 'self' 'unsafe-inline' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.telegram.org",
        },
      });
    }

    // ── Health check ────────────────────────────────────────────────────────
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        ok: true,
        service: 'dreammaker-sales-bot',
        version: CONFIG.VERSION,
        mini_app_url: CONFIG.MINI_APP_URL,
        features: ['bilingual', 'mini-app', 'fullscreen-ui', 'cloud-storage', 'haptics', 'receipt-upload', 'my-services', 'usage-graph', 'config-view', 'qr-ready-config', 'low-usage-alerts', 'renew', 'broadcast', 'reply-to-user', 'rate-limit', 'deep-link', 'webhook-secret'],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (env.TELEGRAM_WEBHOOK_SECRET) {
      const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
        return new Response('unauthorized', { status: 401 });
      }
    }

    // ── Auto-register bot commands once ─────────────────────────────────────
    const cmdsSet = await kv.get(KV.cmdsSet());
    if (!cmdsSet) {
      await setBotCommands();
      await kv.put(KV.cmdsSet(), '1', { expirationTtl: 86400 * 30 });
    }

    // ── Process Telegram update ──────────────────────────────────────────────
    try {
      const update = await request.json();
      await handleUpdate(update, kv);
    } catch (err) {
      console.error('[bot] unhandled error:', err);
    }

    return new Response('ok', { status: 200 });
  },
  async scheduled(event, env, ctx) {
    injectEnv(env);
    ctx.waitUntil(checkUsageAlerts(env.HEALTH_KV));
  },
};
