function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDate(str = "") {
  if (!str) return "";
  const [year, month] = str.split("-");
  if (!year || !month) return str;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(+year, +month - 1));
}

function dateRange(start, end, activeFlag) {
  const endLabel = activeFlag ? "Present" : end || "";
  return [formatDate(start), formatDate(endLabel)].filter(Boolean).join(" - ");
}

function renderBadges(elementId, items = []) {
  const el = document.getElementById(elementId);
  el.innerHTML = "";
  items.forEach(({ badge, name }) => {
    const img = document.createElement("img");
    img.src = badge;
    img.alt = name;
    img.title = name;
    el.appendChild(img);
  });
}

function render(DATA) {
  document.getElementById("name").textContent = DATA.name || "";
  document.getElementById("title").textContent = DATA.title || "";
  document.getElementById("summary").textContent = DATA.summary || "";
  document.getElementById("note").textContent = DATA.note || "";
  document.getElementById("location").textContent = DATA.location || "";

  const emailEl = document.getElementById("email");
  emailEl.textContent = DATA.email || "";
  emailEl.href = DATA.email ? "mailto:" + DATA.email : "#";

  const phoneEl = document.getElementById("phone");
  phoneEl.textContent = DATA.phone || "";
  phoneEl.href = DATA.phone ? "tel:" + DATA.phone : "#";

  // avatar: image if provided, else initials fallback
  const avatarEl = document.getElementById("avatar");
  avatarEl.innerHTML = "";
  const initials = (DATA.name || "")
    .split(" ")
    .map((s) => s[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (DATA.avatarUrl) {
    const img = document.createElement("img");
    img.src = DATA.avatarUrl;
    img.alt = DATA.name ? `${DATA.name} avatar` : "Avatar";
    img.onerror = () => {
      img.remove();
      avatarEl.textContent = initials;
    };
    avatarEl.appendChild(img);
  } else {
    avatarEl.textContent = initials;
  }

  // cover image behind upper-profile, falls back to plain background
  const upperProfile = document.querySelector(".upper-profile");
  if (DATA.coverUrl) {
    upperProfile.style.backgroundImage = `url(${DATA.coverUrl})`;
    upperProfile.style.backgroundSize = "cover";
    upperProfile.style.backgroundPosition = "center";
  }

  renderBadges("skills", DATA.skills);
  renderBadges("tools", DATA.tools);

  // socials
  const socialsEl = document.getElementById("socials");
  socialsEl.innerHTML = "";
  (DATA.socials || []).forEach(({ url, name, icon }) => {
    const a = document.createElement("a");
    a.href = url || "#";
    a.target = "_blank";
    a.rel = "noopener";
    a.title = name;
    a.setAttribute("aria-label", name);

    if (icon) {
      const iconEl = document.createElement("iconify-icon");
      iconEl.setAttribute("icon", icon);
      a.appendChild(iconEl);
    } else {
      a.textContent = name;
    }

    socialsEl.appendChild(a);
  });

  // logo
  const logoEl = document.getElementById("logo");
  logoEl.innerHTML = "";
  if (DATA.logoUrl) {
    const img = document.createElement("img");
    img.src = DATA.logoUrl;
    img.alt = "Logo";
    img.onerror = () => img.remove();
    logoEl.appendChild(img);
  }

  // experience
  const expEl = document.getElementById("experience");
  expEl.innerHTML = "";
  (DATA.experience || []).forEach((e) => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.innerHTML = `
      <h3>${escapeHtml(e.role)}</h3>
      <div class="meta">${escapeHtml(e.company)}${e.employmentType ? " · " + escapeHtml(e.employmentType) : ""}</div>
      <div class="meta">${escapeHtml(dateRange(e.startDate, e.endDate, e.employmentStatus))}</div>
      <div class="meta">${escapeHtml(e.location || "")}</div>
      <div class="meta">${escapeHtml(e.description || "")}</div>
    `;
    expEl.appendChild(div);
  });

  // education
  const eduEl = document.getElementById("education");
  eduEl.innerHTML = "";
  (DATA.education || []).forEach((e) => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.innerHTML = `
      <h3>${escapeHtml(e.school || "")}</h3>
      <div class="meta">${escapeHtml(e.degree || "")}${e.fieldOfStudy ? " · " + escapeHtml(e.fieldOfStudy) : ""}</div>
      <div class="meta">${escapeHtml(dateRange(e.startDate, e.endDate, e.educationStatus))}</div>
      <div class="meta">${e.grade !== undefined ? escapeHtml("GPA: " + e.grade) : ""}</div>
    `;
    eduEl.appendChild(div);
  });

  // projects
  const projEl = document.getElementById("projects");
  projEl.innerHTML = "";
  (DATA.projects || []).forEach((p) => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.innerHTML = `
      <h4>
        <a href="${p.link || "#"}" target="_blank" rel="noopener"
           class="proj-link${p.link ? "" : " proj-link--disabled"}">
          ${escapeHtml(p.title)}
        </a>
      </h4>
      <p>${escapeHtml(p.desc)}</p>
    `;
    projEl.appendChild(div);
  });

  window.PORTFOLIO = DATA;
}

async function loadData() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load data.json");
    render(await res.json());
  } catch (err) {
    console.error(err);
  }
}

function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  const ICONS = {
    light: "material-symbols:light-mode-rounded",
    dark: "material-symbols:dark-mode-rounded",
  };

  function setTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    icon.setAttribute("icon", ICONS[theme] ?? ICONS.dark);
  }

  btn.addEventListener("click", () => {
    setTheme(
      document.body.getAttribute("data-theme") === "light" ? "dark" : "light",
    );
  });

  setTheme(document.body.getAttribute("data-theme") ?? "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  loadData();
});
