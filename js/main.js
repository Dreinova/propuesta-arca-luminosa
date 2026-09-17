/* =========================================================
   ARCA LUMINOSA — MAIN JS
   Requires GSAP + ScrollTrigger (loaded via CDN in each page)
   ========================================================= */
(function(){
  "use strict";

  document.documentElement.classList.remove("no-js");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector(".site-header");
  function onScroll(){
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    var toTop = document.querySelector(".to-top");
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 700);
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav){
    var open = false;
    function setNav(state){
      open = state;
      navToggle.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (window.gsap){
        gsap.to(mobileNav, {
          y: open ? "0%" : "-100%",
          visibility: open ? "visible" : "hidden",
          duration: .5, ease: "power3.inOut"
        });
      } else {
        mobileNav.style.transform = open ? "translateY(0)" : "translateY(-100%)";
        mobileNav.style.visibility = open ? "visible" : "hidden";
      }
    }
    navToggle.addEventListener("click", function(){ setNav(!open); });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setNav(false); });
    });
  }

  /* ---------------- Back to top ---------------- */
  var toTopBtn = document.querySelector(".to-top");
  if (toTopBtn){
    toTopBtn.addEventListener("click", function(){
      window.scrollTo({ top:0, behavior:"smooth" });
    });
  }

  /* ---------------- Accordion ---------------- */
  document.querySelectorAll(".accordion-item").forEach(function(item){
    var trigger = item.querySelector(".accordion-trigger");
    var panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;
    trigger.setAttribute("aria-expanded","false");
    trigger.addEventListener("click", function(){
      var willOpen = !item.classList.contains("is-open");
      if (window.gsap){
        if (willOpen){
          gsap.set(panel, { height:"auto" });
          var h = panel.offsetHeight;
          gsap.fromTo(panel, { height:0 }, { height:h, duration:.45, ease:"power2.out",
            onComplete:function(){ panel.style.height = "auto"; } });
        } else {
          gsap.to(panel, { height:0, duration:.35, ease:"power2.inOut" });
        }
      } else {
        panel.style.height = willOpen ? "auto" : "0";
      }
      item.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  /* ---------------- Filter pills (adoption grid) ---------------- */
  document.querySelectorAll("[data-filter-group]").forEach(function(group){
    var targetSelector = group.getAttribute("data-filter-group");
    var targets = document.querySelectorAll(targetSelector);
    group.querySelectorAll(".filter-pill").forEach(function(pill){
      pill.addEventListener("click", function(){
        group.querySelectorAll(".filter-pill").forEach(function(p){ p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        var filter = pill.getAttribute("data-filter");
        targets.forEach(function(el){
          var match = filter === "all" || el.getAttribute("data-tags").indexOf(filter) > -1;
          if (window.gsap){
            gsap.to(el, {
              opacity: match ? 1 : 0,
              scale: match ? 1 : .92,
              duration:.3, ease:"power2.out",
              onStart:function(){ if(match) el.style.display=""; },
              onComplete:function(){ if(!match) el.style.display="none"; }
            });
          } else {
            el.style.display = match ? "" : "none";
          }
        });
      });
    });
  });

  /* ---------------- GSAP scroll reveals ---------------- */
  if (window.gsap && !reduceMotion){
    gsap.utils.toArray("[data-reveal]").forEach(function(el){
      gsap.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    gsap.utils.toArray("[data-reveal-group]").forEach(function(group){
      var items = group.children.length ? gsap.utils.toArray(group.children) : [group];
      gsap.fromTo(items, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: .8, ease: "power3.out", stagger: .12,
        scrollTrigger: { trigger: group, start: "top 85%" }
      });
    });

    /* Hero parallax */
    gsap.utils.toArray("[data-parallax]").forEach(function(el){
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.3;
      gsap.to(el, {
        yPercent: speed * 30,
        ease: "none",
        scrollTrigger: { trigger: el.closest("[data-parallax-wrap]") || el.parentElement, start:"top bottom", end:"bottom top", scrub: true }
      });
    });

    /* Marquee auto-scroll */
    document.querySelectorAll(".marquee__track").forEach(function(track){
      track.innerHTML += track.innerHTML;
      var w = track.scrollWidth / 2;
      gsap.to(track, { x: -w, duration: 26, ease: "none", repeat: -1 });
    });

    /* Counters */
    document.querySelectorAll("[data-counter]").forEach(function(el){
      var end = parseFloat(el.getAttribute("data-counter"));
      var obj = { val: 0 };
      var decimals = (el.getAttribute("data-counter").split(".")[1] || "").length;
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function(){
          gsap.to(obj, {
            val: end, duration: 2, ease: "power2.out",
            onUpdate: function(){
              el.textContent = obj.val.toLocaleString("es-CO", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
            }
          });
        }
      });
    });

    /* Hero intro timeline (elements with [data-hero-in]) */
    var heroItems = gsap.utils.toArray("[data-hero-in]");
    if (heroItems.length){
      gsap.timeline({ defaults:{ ease:"power3.out" } })
        .fromTo(heroItems, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .12, delay:.15 });
    }

    /* Magnetic buttons */
    document.querySelectorAll("[data-magnetic]").forEach(function(btn){
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width/2;
        var y = e.clientY - r.top - r.height/2;
        gsap.to(btn, { x: x*0.25, y: y*0.35, duration:.4, ease:"power3.out" });
      });
      btn.addEventListener("mouseleave", function(){
        gsap.to(btn, { x:0, y:0, duration:.5, ease:"elastic.out(1,0.4)" });
      });
    });

    /* Card grid stagger (generic) */
    gsap.utils.toArray("[data-stagger-grid]").forEach(function(grid){
      gsap.fromTo(grid.children, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: .7, ease: "power3.out", stagger: .1,
        scrollTrigger: { trigger: grid, start: "top 85%" }
      });
    });

  } else {
    /* No GSAP / reduced motion fallback: just show everything */
    document.querySelectorAll("[data-reveal], [data-reveal-group] > *, [data-hero-in]").forEach(function(el){
      el.style.opacity = 1;
    });
  }

  /* ---------------- Current nav link highlight ---------------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-nav a").forEach(function(a){
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")){
      a.classList.add("is-active");
    }
  });

})();
