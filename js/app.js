function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// format "yyyy-mm"
function formatDate(str = "") {
  if (!str) return "";
  const [year, month] = str.split("-");
  if (!year || !month) return str;
  const date = new Date(+year, +month - 1); // month is 0-indexed in Date
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

// render function
function render(DATA) {
  document.getElementById("name").textContent = DATA.name || "";
  document.getElementById("title").textContent = DATA.title || "";
  document.getElementById("summary").textContent = DATA.summary || "";
  document.getElementById("note").textContent = DATA.note || "";

  const emailEl = document.getElementById("email");
  emailEl.textContent = DATA.email || "";
  emailEl.href = DATA.email ? "mailto:" + DATA.email : "#";

  const phoneEl = document.getElementById("phone");
  phoneEl.textContent = DATA.phone || "";
  phoneEl.href = DATA.phone ? "tel:" + DATA.phone : "#";

  document.getElementById("location").textContent = DATA.location || "";

  // show avatar image if provided, fall back to initials
  const avatarElement = document.getElementById("avatar");
  avatarElement.innerHTML = "";

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
      avatarElement.textContent = initials;
    };
    avatarElement.appendChild(img);
  } else {
    avatarElement.textContent = initials;
  }

  // skills rendered shields.io badge images
  const skillsElement = document.getElementById("skills");
  skillsElement.innerHTML = "";
  (DATA.skills || []).forEach((s) => {
    const img = document.createElement("img");
    img.src = s.badge;
    img.alt = s.name;
    img.title = s.name;
    skillsElement.appendChild(img);
  });

  const toolsElement = document.getElementById("tools");
  toolsElement.innerHTML = "";
  (DATA.tools || []).forEach((s) => {
    const img = document.createElement("img");
    img.src = s.badge;
    img.alt = s.name;
    img.title = s.name;
    toolsElement.appendChild(img);
  });

  // socials
  const socialsElement = document.getElementById("socials");
  socialsElement.innerHTML = "";
  (DATA.socials || []).forEach((s) => {
    const a = document.createElement("a");
    a.href = s.url || "#";
    a.target = "_blank";
    a.rel = "noopener";
    a.title = s.name;
    a.setAttribute("aria-label", s.name);

    if (s.icon) {
      // render iconify web component
      const iconEl = document.createElement("iconify-icon");
      iconEl.setAttribute("icon", s.icon);
      a.appendChild(iconEl);
    } else {
      // fall back to plain text if no icon
      a.textContent = s.name;
    }

    socialsElement.appendChild(a);
  });

  // logo at the bottom of sidebar
  const logoElement = document.getElementById("logo");
  logoElement.innerHTML = "";

  if (DATA.logoUrl) {
    const img = document.createElement("img");
    img.src = DATA.logoUrl;
    img.alt = "Logo";
    img.onerror = () => img.remove(); // hide image if fails to load
    logoElement.appendChild(img);
  }

  // experience
  const expElement = document.getElementById("experience");
  expElement.innerHTML = "";
  (DATA.experience || []).forEach((e) => {
    const div = document.createElement("div");
    div.className = "card-item";
    const end = e.employmentStatus ? "Present" : e.endDate || "";
    const dateRange = [formatDate(e.startDate), formatDate(end)]
      .filter(Boolean)
      .join(" - ");
    div.innerHTML = `
      <h3>${escapeHtml(e.role)}</h3>
      <div class="meta">${escapeHtml(e.company)}${e.employmentType ? " · " + escapeHtml(e.employmentType) : ""}</div>
      <div class="meta">${escapeHtml(dateRange)}</div>
      <div class="meta">${escapeHtml(e.location || "")}</div>
      <div class="meta">${escapeHtml(e.description || "")}</div>
    `;
    expElement.appendChild(div);
  });

  // education
  const eduElement = document.getElementById("education");
  eduElement.innerHTML = "";
  (DATA.education || []).forEach((e) => {
    const div = document.createElement("div");
    div.className = "card-item";
    const status = e.educationStatus ? "Present" : e.endDate || "";
    const dateRange = [formatDate(e.startDate), formatDate(status)]
      .filter(Boolean)
      .join(" - ");
    div.innerHTML = `
      <h3>${escapeHtml(e.school || "")}</h3>
      <div class="meta">${escapeHtml(e.degree || "")}${e.fieldOfStudy ? " · " + escapeHtml(e.fieldOfStudy) : ""}</div>
      <div class="meta">${escapeHtml(dateRange)}</div>
      <div class="meta">${e.grade !== undefined ? escapeHtml("GPA: " + e.grade) : ""}</div>
    `;
    eduElement.appendChild(div);
  });

  // projects
  const projElement = document.getElementById("projects");
  projElement.innerHTML = "";
  (DATA.projects || []).forEach((p) => {
    const d = document.createElement("div");
    d.className = "card-item";
    d.innerHTML = `
    <h4>
      <a href="${p.link || "#"}" target="_blank" rel="noopener" class="proj-link${p.link ? "" : " proj-link--disabled"}"">
        ${escapeHtml(p.title)}
      </a>
    </h4>
    <p>${escapeHtml(p.desc)}</p>`;
    projElement.appendChild(d);
  });

  window.PORTFOLIO = DATA;
}

// load data.json and render
async function loadData() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load data.json");
    const DATA = await res.json();
    render(DATA);
  } catch (err) {
    console.error(err);
  }
}

// theme toggle
function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  const ICONS = {
    light: "material-symbols:light-mode-rounded",
    dark: "material-symbols:dark-mode-rounded",
  };

  function updateIconForTheme(theme) {
    icon.setAttribute("icon", ICONS[theme] ?? ICONS.dark);
  }

  btn.addEventListener("click", () => {
    const next =
      document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", next);
    updateIconForTheme(next);
  });

  // sync icon with initial data-theme on the body
  updateIconForTheme(document.body.getAttribute("data-theme") ?? "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  loadData();
});
