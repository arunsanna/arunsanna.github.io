// Site interactivity. Served as a static same-origin file from /public so it
// stays external (Astro doesn't process public/), keeping CSP script-src 'self'.

/* ---------- Nav: elevate on scroll, mobile menu ---------- */
(function nav() {
  const navEl = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-toggle]");
  const mobile = document.querySelector("[data-mobile]");

  if (navEl) {
    const onScroll = () => {
      if (window.scrollY > 24) navEl.setAttribute("data-scrolled", "");
      else navEl.removeAttribute("data-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const closeMenu = () => {
    toggle?.setAttribute("aria-expanded", "false");
    mobile?.removeAttribute("data-open");
    mobile?.setAttribute("hidden", "");
  };
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    if (open) {
      closeMenu();
    } else {
      toggle.setAttribute("aria-expanded", "true");
      mobile?.setAttribute("data-open", "");
      mobile?.removeAttribute("hidden");
    }
  });
  mobile
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
})();

/* ---------- Scroll-reveal (progressive enhancement) ---------- */
(function reveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return; // leave visible

  // Only now hide-then-reveal: without this class, CSS keeps content visible.
  document.documentElement.classList.add("reveal-ready");

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  els.forEach((el) => obs.observe(el));
})();

/* ---------- Count-up stats ---------- */
(function counters() {
  const nums = document.querySelectorAll("[data-count-to]");
  if (!nums.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const format = (n) => n.toLocaleString("en-US");

  const run = (el) => {
    const target = Number(el.dataset.countTo) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduce) {
      el.textContent = format(target) + suffix;
      return;
    }
    const dur = 1400;
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    nums.forEach(run);
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  nums.forEach((n) => obs.observe(n));
})();

/* ---------- Projects: keyboard-accessible tabs + tag filtering ---------- */
(function projects() {
  const root = document.querySelector("[data-projects]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll("[data-panel]"));

  const selectTab = (tab, focus) => {
    const id = tab.dataset.tab;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      if (p.dataset.panel === id) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = i;
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        next = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      selectTab(tabs[next], true);
    });
  });

  panels.forEach((panel) => {
    const chips = Array.from(panel.querySelectorAll(".chip"));
    const cards = Array.from(panel.querySelectorAll("[data-project]"));
    const groups = Array.from(panel.querySelectorAll("[data-group]"));
    const empty = panel.querySelector("[data-empty]");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.filter || "all";
        chips.forEach((c) =>
          c.setAttribute("aria-pressed", String(c === chip)),
        );

        let visible = 0;
        cards.forEach((card) => {
          const tags = (card.dataset.tags || "").split(/\s+/);
          const show = filter === "all" || tags.includes(filter);
          card.toggleAttribute("hidden", !show);
          if (show) visible++;
        });
        groups.forEach((g) => {
          g.toggleAttribute(
            "hidden",
            !g.querySelector("[data-project]:not([hidden])"),
          );
        });
        empty?.toggleAttribute("hidden", visible !== 0);
      });
    });
  });
})();
