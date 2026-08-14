const $ = (s) => document.querySelector(s),
  form = $("#searchForm"),
  input = $("#usernameInput"),
  searchButton = $("#searchButton"),
  clearButton = $("#clearButton"),
  retry = $("#retry"),
  welcome = $("#welcome"),
  loading = $("#loading"),
  error = $("#error"),
  dashboard = $("#dashboard");
let lastUsername = "",
  controller;
const show = (el) => {
    [welcome, loading, error, dashboard].forEach((x) =>
      x.classList.add("hidden"),
    );
    el.classList.remove("hidden");
  },
  num = (x) => new Intl.NumberFormat().format(x || 0),
  joined = (x) =>
    x
      ? `Joined ${new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(x))}`
      : "";
function fail(title, msg) {
  $("#errorTitle").textContent = title;
  $("#errorMessage").textContent = msg;
  show(error);
}
function clearState() {
  clearButton.classList.toggle("hidden", !input.value);
}
function render(p, repos) {
  $("#avatar").src = p.avatar_url;
  $("#avatar").alt = `${p.login} avatar`;
  $("#name").textContent = p.name || p.login;
  $("#username").textContent = `@${p.login}`;
  $("#username").href = p.html_url;
  $("#profileLink").href = p.html_url;
  $("#bio").textContent =
    p.bio || "This developer has not added a public bio yet.";
  $("#location").textContent = p.location ? `⌖ ${p.location}` : "";
  $("#company").textContent = p.company ? `▣ ${p.company}` : "";
  $("#joined").textContent = p.created_at ? `◷ ${joined(p.created_at)}` : "";
  ["repos", "followers", "following", "gists"].forEach(
    (id, i) =>
      ($("#" + id).textContent = num(
        [p.public_repos, p.followers, p.following, p.public_gists][i],
      )),
  );
  $("#repoTotal").textContent = `${repos.length} shown`;
  const grid = $("#repoGrid");
  grid.replaceChildren();
  if (!repos.length) {
    grid.innerHTML =
      '<div class="state"><div class="state-icon">◇</div><h2>No public repositories</h2><p>This profile has no public repositories to display.</p></div>';
    return;
  }
  repos.forEach((r) => {
    const card = document.createElement("article"),
      h = document.createElement("h3"),
      a = document.createElement("a"),
      d = document.createElement("p"),
      m = document.createElement("div");
    card.className = "repo-card";
    a.href = r.html_url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = r.name;
    h.append(a);
    d.textContent = r.description || "No repository description available.";
    m.className = "repo-meta";
    [
      ["●", r.language || "Unknown"],
      ["★", num(r.stargazers_count)],
      ["⑂", num(r.forks_count)],
    ].forEach(([i, v]) => {
      const s = document.createElement("span");
      s.textContent = `${i} ${v}`;
      m.append(s);
    });
    card.append(h, d, m);
    grid.append(card);
  });
}
async function getData(user) {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal,
    base = `https://api.github.com/users/${encodeURIComponent(user)}`,
    timer = setTimeout(() => controller.abort(), 10000);
  try {
    const pr = await fetch(base, { signal });
    if (pr.status === 404) throw Error("NOT_FOUND");
    if (pr.status === 403) throw Error("RATE_LIMIT");
    if (!pr.ok) throw Error("PROFILE");
    const p = await pr.json(),
      rr = await fetch(`${base}/repos?sort=updated&per_page=6`, { signal });
    if (rr.status === 403) throw Error("RATE_LIMIT");
    if (!rr.ok) throw Error("REPOS");
    return { p, repos: await rr.json() };
  } finally {
    clearTimeout(timer);
  }
}
async function search(raw) {
  const user = raw.trim();
  if (!user) {
    fail(
      "Username required",
      "Please enter a GitHub username before searching.",
    );
    input.focus();
    return;
  }
  lastUsername = user;
  show(loading);
  searchButton.disabled = true;
  searchButton.querySelector("span").textContent = "Searching...";
  try {
    const d = await getData(user);
    render(d.p, d.repos);
    show(dashboard);
  } catch (e) {
    const title =
        e.name === "AbortError"
          ? "Request timed out"
          : e.message === "NOT_FOUND"
            ? "Profile not found"
            : e.message === "RATE_LIMIT"
              ? "API limit reached"
              : "Something went wrong",
      msg =
        e.name === "AbortError"
          ? "The request took too long. Please try again."
          : e.message === "NOT_FOUND"
            ? `We could not find a public GitHub profile named "${user}".`
            : e.message === "RATE_LIMIT"
              ? "GitHub's public API limit has been reached. Please try again later."
              : "Please check your internet connection and try again.";
    fail(title, msg);
  } finally {
    searchButton.disabled = false;
    searchButton.querySelector("span").textContent = "Search profile";
  }
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  search(input.value);
});
input.addEventListener("input", clearState);
clearButton.addEventListener("click", () => {
  input.value = "";
  clearState();
  input.focus();
});
retry.addEventListener("click", () => search(lastUsername || input.value));
document.querySelectorAll(".example").forEach((b) =>
  b.addEventListener("click", () => {
    input.value = b.dataset.username;
    clearState();
    search(input.value);
  }),
);
clearState();
