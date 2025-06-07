const includes = {
  "include-head":           "/main_html_files/head.html",
  "include-header":         "/main_html_files/header.html",
  "include-login-form":     "/main_html_files/login-form.html",
  "include-admin-view":     "/main_html_files/admin-view.html",
  "include-create-job-modal": "/main_html_files/create-job-modal.html",
  "include-contractor-view": "/main_html_files/contractor-view.html",
  "include-tech-view":       "/main_html_files/tech-view.html",
  "include-logout-form":     "/main_html_files/logout-form.html",
  "include-footer":          "/main_html_files/footer.html"
};

for (const [id, file] of Object.entries(includes)) {
  const container = document.getElementById(id);
  if (container) {
    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        return res.text();
      })
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((err) => {
        console.error(err);
        container.innerHTML = `<p style="color:red;">Error loading ${file}</p>`;
      });
  }
}
