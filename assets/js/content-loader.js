(function () {
  "use strict";

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function toDateTimeAttr(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function iconClass(icon) {
    var allowed = {
      shop: "bi-shop",
      building: "bi-building",
      briefcase: "bi-briefcase",
      gear: "bi-gear",
      "heart-pulse": "bi-heart-pulse",
      truck: "bi-truck",
      laptop: "bi-laptop",
      people: "bi-people"
    };
    return allowed[icon] || "bi-shop";
  }

  async function fetchJson(path) {
    var response = await fetch(path + "?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load " + path);
    return response.json();
  }

  async function renderNews() {
    var list = document.querySelector("[data-news-list]");
    if (!list) return;

    try {
      var data = await fetchJson("data/news.json");
      var items = Array.isArray(data.items) ? data.items.slice() : [];

      items.sort(function (a, b) {
        return new Date(b.date || 0) - new Date(a.date || 0);
      });

      if (!items.length) {
        list.innerHTML =
          '<div class="news-empty" data-aos="fade-up">' +
          '<i class="bi bi-newspaper"></i>' +
          "<h3>No news posted yet</h3>" +
          "<p>New partnerships, clients, and company milestones will appear here.</p>" +
          "</div>";
        return;
      }

      list.innerHTML = items
        .map(function (item) {
          return (
            '<article class="news-item" data-aos="fade-up">' +
            '<div class="news-meta">' +
            '<span class="news-badge"><i class="bi bi-newspaper"></i> News</span>' +
            '<time datetime="' +
            escapeHtml(toDateTimeAttr(item.date)) +
            '">' +
            escapeHtml(formatDate(item.date)) +
            "</time>" +
            "</div>" +
            "<h2>" +
            escapeHtml(item.title) +
            "</h2>" +
            "<p>" +
            escapeHtml(item.body) +
            "</p>" +
            "</article>"
          );
        })
        .join("");
    } catch (error) {
      list.innerHTML =
        '<div class="news-empty"><h3>Unable to load news</h3><p>Please try again later.</p></div>';
      console.error(error);
    }
  }

  async function renderBusinesses() {
    var grid = document.querySelector("[data-business-grid]");
    if (!grid) return;

    try {
      var data = await fetchJson("data/businesses.json");
      var items = Array.isArray(data.items) ? data.items.slice() : [];

      if (!items.length) {
        grid.innerHTML =
          '<div class="col-12" data-aos="fade-up">' +
          '<div class="business-empty">' +
          '<i class="bi bi-buildings"></i>' +
          "<h3>No businesses featured yet</h3>" +
          '<p>Client businesses we promote will appear here. Want your business listed? <a href="index.html#contact">Contact us</a>.</p>' +
          "</div></div>";
        return;
      }

      grid.innerHTML = items
        .map(function (item, index) {
          var delay = (index % 3) * 100 + 100;
          var website = item.website ? String(item.website).trim() : "";
          var linkHtml = "";
          if (website) {
            linkHtml =
              '<a href="' +
              escapeHtml(website) +
              '" class="business-link" target="_blank" rel="noopener">Visit website <i class="bi bi-arrow-right"></i></a>';
          }

          return (
            '<div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="' +
            delay +
            '">' +
            '<article class="business-item">' +
            '<div class="business-icon"><i class="bi ' +
            iconClass(item.icon) +
            '"></i></div>' +
            '<span class="business-category">' +
            escapeHtml(item.category || "Business") +
            "</span>" +
            "<h2>" +
            escapeHtml(item.name) +
            "</h2>" +
            '<p class="business-location"><i class="bi bi-geo-alt"></i> ' +
            escapeHtml(item.location || "Zambia") +
            "</p>" +
            "<p>" +
            escapeHtml(item.description) +
            "</p>" +
            linkHtml +
            "</article></div>"
          );
        })
        .join("");
    } catch (error) {
      grid.innerHTML =
        '<div class="col-12"><div class="business-empty"><h3>Unable to load businesses</h3><p>Please try again later.</p></div></div>';
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderNews();
    renderBusinesses();
  });
})();
