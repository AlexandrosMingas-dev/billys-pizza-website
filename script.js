(function () {
  "use strict";

  var LANG_KEY = "billys-lang-v2";
  var PAGES = ["home", "menu", "visit"];
  var MENU_CATS = ["pizza", "calzone", "peinirli", "baked", "breads", "salads", "drinks"];

  /* The shop keeps one schedule: Monday to Friday, 18:30 to 23:30, Greek time. */
  var OPEN_MIN = 18 * 60 + 30;
  var CLOSE_MIN = 23 * 60 + 30;

  var currentLang = "el";
  try {
    currentLang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "el";
  } catch (e) {
    currentLang = "el";
  }

  function setLang(lang) {
    currentLang = lang === "en" ? "en" : "el";
    document.documentElement.lang = currentLang;
    try {
      localStorage.setItem(LANG_KEY, currentLang);
    } catch (e) {
      /* private mode */
    }
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang-btn") === currentLang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------------------------------------------------------- open state --
     Read against Athens, not the visitor's clock: someone checking from
     another timezone still wants to know whether the oven is on now. */

  function athensNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Athens",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .forEach(function (p) {
        parts[p.type] = p.value;
      });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: days[parts.weekday],
      mins: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
    };
  }

  function statusCopy() {
    var now = athensNow();
    var weekday = now.day >= 1 && now.day <= 5;

    if (weekday && now.mins >= OPEN_MIN && now.mins < CLOSE_MIN) {
      return { open: true, el: "Ανοιχτά τώρα", en: "Open now" };
    }
    if (weekday && now.mins < OPEN_MIN) {
      return { open: false, el: "Ανοίγουμε στις 18:30", en: "Opens at 18:30" };
    }
    /* Friday night, Saturday and Sunday all point at Monday */
    var toMonday = now.day === 5 || now.day === 6 || now.day === 0;
    if (toMonday) {
      return {
        open: false,
        el: "Κλειστά. Δευτέρα στις 18:30",
        en: "Closed. Back Monday at 18:30",
      };
    }
    return {
      open: false,
      el: "Κλειστά. Αύριο στις 18:30",
      en: "Closed. Back tomorrow at 18:30",
    };
  }

  function renderStatus() {
    var box = document.getElementById("status");
    if (!box) return;
    var copy;
    try {
      copy = statusCopy();
    } catch (e) {
      box.hidden = true; /* no Intl time zones: say nothing rather than guess */
      return;
    }
    var text = box.querySelector(".status-text");
    text.textContent = "";

    var el = document.createElement("span");
    el.setAttribute("data-lang", "el");
    el.textContent = copy.el;
    var en = document.createElement("span");
    en.setAttribute("data-lang", "en");
    en.textContent = copy.en;

    text.appendChild(el);
    text.appendChild(en);
    box.classList.toggle("is-open", copy.open);
    box.hidden = false;
  }

  /* ------------------------------------------------------------ routing -- */

  function parseHash() {
    var hash = (window.location.hash || "#home").replace(/^#/, "");
    if (PAGES.indexOf(hash) !== -1) {
      return { page: hash, scroll: null };
    }
    if (MENU_CATS.indexOf(hash) !== -1) {
      return { page: "menu", scroll: hash };
    }
    return { page: "home", scroll: null };
  }

  function showPage(id, options) {
    options = options || {};
    if (PAGES.indexOf(id) === -1) id = "home";

    document.querySelectorAll(".page").forEach(function (page) {
      page.classList.toggle("is-active", page.id === id);
    });
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-nav") === id);
    });

    if (options.scroll) {
      var el = document.getElementById(options.scroll);
      if (el) {
        window.requestAnimationFrame(function () {
          el.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "start" });
        });
      }
    } else if (!options.keepScroll) {
      window.scrollTo(0, 0);
    }

    if (!options.keepHash && history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
  }

  function applyHash(instant) {
    var parsed = parseHash();
    showPage(parsed.page, {
      scroll: parsed.scroll,
      keepHash: true,
      instant: instant,
    });
  }

  /* ------------------------------------------------------------- drawer -- */

  var drawer = document.getElementById("drawer");
  var overlay = document.getElementById("overlay");
  var menuBtn = document.getElementById("menu-btn");

  function openDrawer() {
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    overlay.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function toggleDrawer() {
    if (drawer.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  }

  /* ------------------------------------------------------------ hero --
     Three slides on a timer, with arrows and dots for anyone who would
     rather drive. The timer stops while a pointer or the keyboard is in
     the hero, so it never pulls the words away mid-read. */

  function initHeroSlider() {
    var hero = document.getElementById("hero");
    if (!hero) return;
    var slides = hero.querySelectorAll("[data-slide]");
    var shots = hero.querySelectorAll("[data-shot]");
    var dots = hero.querySelectorAll("[data-dot]");
    if (slides.length < 2) return;

    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;

    function show(n) {
      index = (n + slides.length) % slides.length;
      [slides, shots, dots].forEach(function (set) {
        set.forEach(function (el, i) {
          el.classList.toggle("is-active", i === index);
        });
      });
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function start() {
      stop();
      if (reduced) return; /* no unattended movement */
      timer = setInterval(function () { show(index + 1); }, 4000);
    }

    function go(n) { show(n); start(); }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { go(i); });
    });
    var prev = document.getElementById("hero-prev");
    var next = document.getElementById("hero-next");
    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });

    /* The edge arrows are hidden on a phone, so the slides take a swipe
       instead. Vertical drags are left alone — that is the page scrolling. */
    var swipeX = null;
    var swipeY = null;

    hero.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      swipeX = e.touches[0].clientX;
      swipeY = e.touches[0].clientY;
    }, { passive: true });

    hero.addEventListener("touchend", function (e) {
      if (swipeX === null) return;
      var touch = e.changedTouches[0];
      var dx = touch.clientX - swipeX;
      var dy = touch.clientY - swipeY;
      swipeX = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? index + 1 : index - 1);
      }
    }, { passive: true });

    /* No pause on hover: the hero is the whole screen, so the pointer rests
       inside it almost always and the slider would simply never advance.
       Keyboard focus still pauses, since that means someone is using it. */
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    show(0);
    start();
  }

  /* -------------------------------------------------------------- reel --
     Driven by its arrows alone. It used to advance on scroll position, which
     meant you could not look at one pizza without the page taking it away. */

  function initReel() {
    var items = document.querySelectorAll("[data-reel-item]");
    var ticks = document.querySelectorAll("[data-reel-tick]");
    if (items.length < 2) return;

    var active = 0;

    function show(n) {
      active = (n + items.length) % items.length;
      items.forEach(function (item, i) {
        item.classList.toggle("is-active", i === active);
      });
      ticks.forEach(function (tick, i) {
        tick.classList.toggle("is-on", i === active);
      });
    }

    var prev = document.getElementById("reel-prev");
    var next = document.getElementById("reel-next");
    if (prev) prev.addEventListener("click", function () { show(active - 1); });
    if (next) next.addEventListener("click", function () { show(active + 1); });

    ticks.forEach(function (tick, i) {
      tick.addEventListener("click", function () { show(i); });
    });

    show(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setLang(currentLang);
    applyHash(true);
    renderStatus();
    initHeroSlider();

    /* the menu's vegetables are cut from the shop's own menu-cover photo; any
       that is not on disk yet simply steps out of the way */
    document.querySelectorAll("[data-veg]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.remove();
      });
    });
    initReel();

    /* the line goes stale on its own, so keep it honest while the tab is open */
    setInterval(renderStatus, 60000);

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        setLang(btn.getAttribute("data-lang-btn"));
      });
    });

    document.querySelectorAll("[data-nav]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showPage(link.getAttribute("data-nav"));
        closeDrawer();
      });
    });

    menuBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDrawer();
    });

    overlay.addEventListener("click", closeDrawer);
    document.getElementById("drawer-close").addEventListener("click", closeDrawer);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  });

  window.addEventListener("hashchange", function () {
    applyHash(false);
  });
})();
