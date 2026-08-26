(function () {
  "use strict";

  var LANG_KEY = "billys-lang-v2";
  var PAGES = ["home", "menu", "visit"];
  var MENU_CATS = ["pizza", "calzone", "peinirli", "baked", "breads"];

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

  var slides = document.querySelectorAll(".slide");
  var captions = document.querySelectorAll(".slide-caption");
  var dots = document.querySelectorAll(".dot");
  var slideIndex = 0;
  var slideTimer;

  function goToSlide(n) {
    if (!slides.length) return;
    slideIndex = (n + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var on = i === slideIndex;
      slide.classList.toggle("is-active", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });
    captions.forEach(function (caption, i) {
      caption.classList.toggle("is-active", i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      var on = i === slideIndex;
      dot.classList.toggle("is-active", on);
      if (on) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function nextSlide() {
    goToSlide(slideIndex + 1);
  }

  function prevSlide() {
    goToSlide(slideIndex - 1);
  }

  function startSlider() {
    stopSlider();
    slideTimer = setInterval(nextSlide, 6000);
  }

  function stopSlider() {
    if (slideTimer) clearInterval(slideTimer);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setLang(currentLang);
    applyHash(true);
    goToSlide(0);
    startSlider();

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

    var prev = document.getElementById("slider-prev");
    var next = document.getElementById("slider-next");
    if (prev) {
      prev.addEventListener("click", function () {
        prevSlide();
        startSlider();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        nextSlide();
        startSlider();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goToSlide(i);
        startSlider();
      });
    });

    var slider = document.getElementById("slider");
    if (slider) {
      slider.addEventListener("mouseenter", stopSlider);
      slider.addEventListener("mouseleave", startSlider);
    }
  });

  window.addEventListener("hashchange", function () {
    applyHash(false);
  });
})();
