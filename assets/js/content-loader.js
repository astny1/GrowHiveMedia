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

  function newsSlug(item) {
    if (item && item.slug) {
      return String(item.slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    }
    var base = String((item && item.title) || "news")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    var datePart = toDateTimeAttr(item && item.date);
    return datePart ? base + "-" + datePart : base || "news";
  }

  function excerptText(text, limit) {
    var value = String(text || "").replace(/\s+/g, " ").trim();
    if (value.length <= limit) return value;
    return value.slice(0, limit).replace(/\s+\S*$/, "") + "...";
  }

  function formatBodyHtml(text) {
    var value = String(text || "").trim();
    if (!value) return "<p></p>";
    return value
      .split(/\n{2,}/)
      .map(function (paragraph) {
        return "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function newsFullText(item) {
    return (item && (item.details || item.body)) || "";
  }

  function newsBriefText(item) {
    if (item && item.summary) return item.summary;
    if (item && item.body) return excerptText(item.body, 160);
    return excerptText(item && item.details, 160);
  }

  function newsImageHtml(item, wrapClass) {
    var image = item && item.image ? String(item.image).trim() : "";
    if (!image) return "";
    return (
      '<div class="' +
      wrapClass +
      '"><img src="' +
      escapeHtml(image) +
      '" alt="' +
      escapeHtml((item && item.title) || "News") +
      '"></div>'
    );
  }
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
          var href = "news-details.html?item=" + encodeURIComponent(newsSlug(item));
          return (
            '<article class="news-item news-card" data-aos="fade-up">' +
            '<a class="news-item-link" href="' +
            href +
            '">' +
            newsImageHtml(item, "news-card-img") +
            '<div class="news-card-body">' +
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
            escapeHtml(newsBriefText(item)) +
            "</p>" +
            '<span class="news-read-more">Read full story <i class="bi bi-arrow-right"></i></span>' +
            "</div></a></article>"
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

  async function renderProjects() {
    var grid = document.querySelector("[data-project-grid]");
    if (!grid) return;

    try {
      var data = await fetchJson("data/projects.json");
      var items = Array.isArray(data.items) ? data.items.slice() : [];

      if (!items.length) {
        grid.innerHTML =
          '<div class="col-12" data-aos="fade-up">' +
          '<div class="project-empty">' +
          '<i class="bi bi-folder2-open"></i>' +
          "<h3>No new projects posted yet</h3>" +
          '<p>New client projects will appear here. <a href="index.html#portfolio">Back to portfolio</a></p>' +
          "</div></div>";
        return;
      }

      grid.innerHTML = items
        .map(function (item, index) {
          var delay = (index % 3) * 100 + 100;
          var image = item.image ? String(item.image).trim() : "";
          var imageHtml = image
            ? '<div class="project-img"><img src="' +
              escapeHtml(image) +
              '" class="img-fluid" alt="' +
              escapeHtml(item.title || "Project") +
              '"></div>'
            : "";

          var website = item.website ? String(item.website).trim() : "";
          if (website && !/^https?:\/\//i.test(website)) {
            website = "https://" + website;
          }
          var linkHtml = website
            ? '<a class="project-live-link" href="' +
              escapeHtml(website) +
              '" target="_blank" rel="noopener">' +
              '<span class="live-dot" aria-hidden="true"></span> Click here' +
              "</a>"
            : "";

          var description = String(item.description || "").trim();
          var brief = excerptText(description, 110);
          var needsMore = description.length > brief.length;
          var descHtml = needsMore
            ? '<p class="project-desc">' +
              '<span class="project-desc-brief">' +
              escapeHtml(brief) +
              "</span>" +
              '<span class="project-desc-full">' +
              escapeHtml(description) +
              "</span>" +
              '<button type="button" class="project-read-more">Read more</button>' +
              "</p>"
            : "<p>" + escapeHtml(description) + "</p>";

          return (
            '<div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="' +
            delay +
            '">' +
            '<article class="project-item">' +
            imageHtml +
            '<div class="project-body">' +
            '<span class="project-category">' +
            escapeHtml(item.category || "Project") +
            "</span>" +
            "<h2>" +
            escapeHtml(item.title) +
            "</h2>" +
            descHtml +
            linkHtml +
            "</div></article></div>"
          );
        })
        .join("");

      bindProjectReadMore(grid);
    } catch (error) {
      grid.innerHTML =
        '<div class="col-12"><div class="project-empty"><h3>Unable to load projects</h3><p>Please try again later.</p></div></div>';
      console.error(error);
    }
  }

  function bindProjectReadMore(grid) {
    grid.querySelectorAll(".project-read-more").forEach(function (button) {
      button.addEventListener("click", function () {
        var desc = button.closest(".project-desc");
        if (!desc) return;
        var expanded = desc.classList.toggle("is-expanded");
        button.textContent = expanded ? "Read less" : "Read more";
      });
    });
  }

  async function renderNewsDetail() {
    var article = document.querySelector("[data-news-detail]");
    if (!article) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("item") || "";

    try {
      var data = await fetchJson("data/news.json");
      var items = Array.isArray(data.items) ? data.items.slice() : [];
      var item = items.find(function (entry) {
        return newsSlug(entry) === slug;
      });

      if (!item) {
        article.innerHTML =
          '<div class="news-empty">' +
          "<h3>News story not found</h3>" +
          '<p><a href="news.html">Back to news</a></p>' +
          "</div>";
        return;
      }

      var titleEl = document.querySelector("[data-news-page-title]");
      var crumbEl = document.querySelector("[data-news-crumb]");
      if (titleEl) titleEl.textContent = item.title || "News";
      if (crumbEl) crumbEl.textContent = item.title || "News";
      document.title = (item.title || "News") + " - GrowHive Media";

      article.innerHTML =
        newsImageHtml(item, "news-detail-img") +
        '<div class="news-detail-content">' +
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
        '<div class="news-detail-body">' +
        formatBodyHtml(newsFullText(item)) +
        "</div>" +
        '<a class="news-back-link" href="news.html"><i class="bi bi-arrow-left"></i> Back to news</a>' +
        "</div>";
    } catch (error) {
      article.innerHTML =
        '<div class="news-empty"><h3>Unable to load this story</h3><p><a href="news.html">Back to news</a></p></div>';
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderNews();
    renderNewsDetail();
    renderBusinesses();
    renderProjects();
  });
})();
