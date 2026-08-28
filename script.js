/* NG5004 — hero constellation + scroll reveals
   Kept deliberately restrained; disabled when the user prefers reduced motion. */

(function () {
  "use strict";

  /* ---------- Session materials ----------
     One entry per week; each week holds any number of files. Put the file in
     slides/ and point `file` at it.
       kind   — what the file is, shown on the chip
       ext    — format badge (PPTX, PDF, …)
       size   — human-readable, so nobody is surprised by a big download
       action — "download" forces a save; "view" opens in a new tab (PDFs and
                images render natively in the browser, decks do not). */
  const MATERIALS = [
    {
      week: "Week 1",
      items: [
        { kind: "Slides", file: "slides/ng5004-week01.pptx", ext: "PPTX", size: "8.0 MB", action: "download" },
      ],
    },
    {
      week: "Week 2",
      items: [
        { kind: "Slides", file: "slides/ng5004-week02.pptx", ext: "PPTX", size: "8.0 MB", action: "download" },
        { kind: "Discussion notes", file: "slides/week02-notes-in-class_small.pdf", ext: "PDF", size: "4.0 MB", action: "view" },
      ],
    },
    {
      week: "Week 3",
      items: [
        { kind: "Slides", file: "slides/ng5004-week03-AutoCodeRover.pdf", ext: "PDF", size: "4.7 MB", action: "view" },
      ],
    },
  ];

  const ICON_DOWNLOAD =
    '<svg class="res__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/></svg>';
  const ICON_VIEW =
    '<svg class="res__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4 4 3-2 4 4"/></svg>';

  const materialsList = document.getElementById("slidesList");
  if (materialsList) {
    if (MATERIALS.length === 0) {
      materialsList.innerHTML =
        '<li class="slides__empty">Materials will be posted here after each session.</li>';
    } else {
      materialsList.innerHTML = MATERIALS.map(function (wk) {
        const chips = wk.items
          .map(function (it) {
            const isView = it.action === "view";
            const attrs = isView
              ? ' target="_blank" rel="noopener"'
              : " download";
            const hint = isView ? " (opens in a new tab)" : " (downloads)";
            return (
              '<a class="res' + (isView ? " res--secondary" : " res--primary") + '"' +
              ' href="' + it.file + '"' + attrs +
              ' title="' + it.kind + " — " + it.ext + ", " + it.size + hint + '">' +
              (isView ? ICON_VIEW : ICON_DOWNLOAD) +
              '<span class="res__kind">' + it.kind + "</span>" +
              '<span class="res__meta">' + it.ext + " · " + it.size + "</span>" +
              "</a>"
            );
          })
          .join("");
        return (
          '<li class="slide">' +
          '<span class="slide__wk">' + wk.week + "</span>" +
          '<span class="slide__res">' + chips + "</span>" +
          "</li>"
        );
      }).join("");
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    ".section__head, .about__lead, .person, .week"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ---------- Hero constellation ----------
     A sparse network of drifting nodes with links — a quiet nod to the
     research/innovation graph. Blue nodes, occasional orange "sparks". */
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height, nodes, dpr, raf;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    const count = Math.round(Math.min(70, Math.max(28, (width * height) / 22000)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 1,
      spark: Math.random() < 0.14, // ~14% orange
    }));
  }

  const LINK_DIST = 132;

  function frame() {
    ctx.clearRect(0, 0, width, height);

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.22;
          ctx.strokeStyle = `rgba(120, 165, 220, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      if (n.spark) {
        ctx.fillStyle = "rgba(255, 154, 51, 0.9)";
        ctx.shadowColor = "rgba(239, 124, 0, 0.8)";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "rgba(150, 190, 235, 0.7)";
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    raf = requestAnimationFrame(frame);
  }

  function init() {
    size();
    build();
    if (reduceMotion) {
      frame();               // draw a single static frame
      cancelAnimationFrame(raf);
    } else {
      cancelAnimationFrame(raf);
      frame();
    }
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });

  init();
})();
