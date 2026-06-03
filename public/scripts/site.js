// Site interactivity. Served as a static same-origin file from /public so it
// stays external (Astro doesn't process public/), keeping CSP script-src 'self'.

/* ---------- Nav: elevate on scroll, mobile menu, scroll-spy ---------- */
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

  const spyLinks = Array.from(document.querySelectorAll("[data-spy]"));
  if ("IntersectionObserver" in window && spyLinks.length) {
    const byId = new Map(
      spyLinks.map((l) => [l.getAttribute("data-spy").slice(1), l]),
    );
    const sections = spyLinks
      .map((l) => document.getElementById(l.getAttribute("data-spy").slice(1)))
      .filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            spyLinks.forEach((l) => l.removeAttribute("data-active"));
            byId.get(e.target.id)?.setAttribute("data-active", "");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => obs.observe(s));
  }
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
