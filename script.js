const body = document.body;
const cursorLight = document.querySelector(".cursor-light");
const menuButton = document.querySelector(".menu-button");
const header = document.querySelector(".header");
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeText = document.querySelector(".theme-text");
const navLinks = document.querySelectorAll(".nav a");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const magneticItems = document.querySelectorAll(".magnetic");
const tiltCards = document.querySelectorAll(".tilt");
const typedRole = document.querySelector(".typed-role");
const problemForm = document.querySelector(".problem-form");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const savedTheme = localStorage.getItem("portfolio-theme");
const roles = ["Web Developer", "AI Engineer", "MERN Stack Developer", "Java Programmer", "Problem Solver"];

function applyTheme(theme) {
  const isLight = theme === "light";
  body.classList.toggle("light-mode", isLight);
  themeToggle?.setAttribute("aria-pressed", String(isLight));
  themeToggle?.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");

  if (themeIcon) {
    themeIcon.textContent = isLight ? "☾" : "☀";
  }

  if (themeText) {
    themeText.textContent = isLight ? "Dark" : "Light";
  }
}

applyTheme(savedTheme || "dark");

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.classList.contains("light-mode") ? "dark" : "light";
  localStorage.setItem("portfolio-theme", nextTheme);
  applyTheme(nextTheme);
});

if (cursorLight && !prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    cursorLight.style.transform = `translate(${event.clientX - 210}px, ${event.clientY - 210}px)`;
  });
}

menuButton?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    const target = targetId && targetId.length > 1 ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(offset, 0), behavior: "smooth" });
  });
});

function updateScrollState() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  body.style.setProperty("--scroll-progress", progress.toFixed(4));
  header?.classList.toggle("scrolled", window.scrollY > 18);
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

if (typedRole) {
  if (prefersReducedMotion) {
    typedRole.textContent = roles.join(" • ");
  } else {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeNext = () => {
      const currentRole = roles[roleIndex];
      typedRole.textContent = currentRole.slice(0, charIndex);

      if (!deleting && charIndex < currentRole.length) {
        charIndex += 1;
        setTimeout(typeNext, 78);
        return;
      }

      if (!deleting && charIndex === currentRole.length) {
        deleting = true;
        setTimeout(typeNext, 1050);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        setTimeout(typeNext, 38);
        return;
      }

      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeNext, 220);
    };

    typeNext();
  }
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
  revealObserver.observe(item);
});

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const counter = entry.target;
      const target = Number(counter.dataset.count || 0);
      const duration = 1200;
      const start = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);

        if (counter.dataset.decimal === "true") {
          counter.textContent = `${(value / 10).toFixed(1)}`;
        } else if (counter.dataset.suffix) {
          counter.textContent = `${value}${counter.dataset.suffix}`;
        } else {
          counter.textContent = value;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.45 }
);

counters.forEach((counter) => counterObserver.observe(counter));

problemForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = problemForm.querySelector('button[type="submit"]');
  const status = problemForm.querySelector(".form-status");
  const formData = new FormData(problemForm);

  problemForm.classList.remove("is-success", "is-error");
  problemForm.classList.add("is-sending");

  if (submitButton) {
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;
  }

  if (status) {
    status.textContent = "Sending your request...";
  }

  try {
    const response = await fetch(problemForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    problemForm.reset();
    problemForm.classList.add("is-success");

    if (status) {
      status.textContent = "Request sent. I will reply soon.";
    }
  } catch (error) {
    problemForm.classList.add("is-error");

    if (status) {
      status.textContent = "Could not send. Please email me directly.";
    }
  } finally {
    problemForm.classList.remove("is-sending");

    if (submitButton) {
      submitButton.textContent = "Send Request";
      submitButton.disabled = false;
    }
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

if (!prefersReducedMotion) {
  magneticItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      const rotateY = ((x / rect.width) - 0.5) * 7;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".project-card, .skill-card, .timeline-item, .problem-form").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      item.style.setProperty("--mx", `${x}%`);
      item.style.setProperty("--my", `${y}%`);
    });
  });
}

const canvas = document.querySelector("#network");
const context = canvas?.getContext("2d");
let points = [];
let frameId;

function resizeNetwork() {
  if (!canvas || !context) {
    return;
  }

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(82, Math.floor(window.innerWidth / 15));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.7
  }));
}

function drawNetwork() {
  if (!canvas || !context || prefersReducedMotion) {
    return;
  }

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = "rgba(248, 250, 252, 0.72)";
  context.strokeStyle = "rgba(57, 214, 255, 0.2)";

  points.forEach((point, index) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > window.innerWidth) {
      point.vx *= -1;
    }

    if (point.y < 0 || point.y > window.innerHeight) {
      point.vy *= -1;
    }

    context.beginPath();
    context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    context.fill();

    for (let next = index + 1; next < points.length; next += 1) {
      const other = points[next];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);

      if (distance < 126) {
        context.globalAlpha = 1 - distance / 126;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.stroke();
        context.globalAlpha = 1;
      }
    }
  });

  frameId = requestAnimationFrame(drawNetwork);
}

if (canvas && context && !prefersReducedMotion) {
  resizeNetwork();
  drawNetwork();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(frameId);
    resizeNetwork();
    drawNetwork();
  });
}
