/* Custom admin behaviors: Chart.js init, live clock, and periodic refresh. */
(function () {
  function isProtectedAdminPage() {
    var body = document.body;
    if (!body) {
      return false;
    }
    if (body.classList.contains("login")) {
      return false;
    }
    return Boolean(document.querySelector(".main-sidebar"));
  }

  function parseAnalyticsData() {
    var node = document.getElementById("ct-admin-analytics-data");
    if (!node) {
      return null;
    }

    try {
      return JSON.parse(node.textContent || "{}");
    } catch (_error) {
      return null;
    }
  }

  function initMonthlyChart() {
    var canvas = document.getElementById("ct-monthly-trends");
    if (!canvas || typeof Chart === "undefined") {
      return;
    }

    var payload = parseAnalyticsData();
    if (!payload || !payload.labels || !payload.datasets) {
      return;
    }

    new Chart(canvas, {
      type: "line",
      data: {
        labels: payload.labels,
        datasets: payload.datasets.map(function (dataset) {
          return {
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.borderColor,
            backgroundColor: dataset.backgroundColor,
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2.5,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutCubic",
        },
        plugins: {
          legend: {
            labels: {
              color: "#eef2f5",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(238,242,245,0.75)" },
            grid: { color: "rgba(255,255,255,0.08)" },
          },
          y: {
            ticks: { color: "rgba(238,242,245,0.75)" },
            grid: { color: "rgba(255,255,255,0.08)" },
            beginAtZero: true,
          },
        },
      },
    });
  }

  function attachLiveClock() {
    var navbar = document.querySelector(".main-header .navbar-nav.ml-auto");
    if (!navbar || document.getElementById("ct-live-clock")) {
      return;
    }

    var item = document.createElement("li");
    item.className = "nav-item";
    item.style.marginLeft = "10px";

    var clock = document.createElement("span");
    clock.id = "ct-live-clock";
    clock.style.display = "inline-flex";
    clock.style.alignItems = "center";
    clock.style.padding = "6px 10px";
    clock.style.borderRadius = "999px";
    clock.style.background = "rgba(255,255,255,0.08)";
    clock.style.color = "#e5e7eb";
    clock.style.fontSize = "12px";
    clock.style.fontWeight = "600";
    clock.style.letterSpacing = "0.04em";
    item.appendChild(clock);
    navbar.appendChild(item);

    function updateClock() {
      var now = new Date();
      clock.textContent = now.toLocaleString("en-MW", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    updateClock();
    window.setInterval(updateClock, 1000);
  }

  function pollNotificationBadge() {
    if (!isProtectedAdminPage()) {
      return;
    }

    if (document.getElementById("admin-notif-link")) {
      return;
    }

    var navbar = document.querySelector(".navbar-nav.ml-auto") || document.querySelector(".navbar-nav");
    if (!navbar) {
      return;
    }

    var item = document.createElement("li");
    item.className = "nav-item";
    item.innerHTML =
      '<a id="admin-notif-link" class="nav-link" href="/admin/api/adminnotification/" title="Notifications" style="position:relative;padding-right:18px">' +
      '<i class="fas fa-bell" style="font-size:16px"></i>' +
      '<span id="admin-notif-badge" style="position:absolute;top:6px;right:2px;background:#E07065;color:#fff;font-size:9px;font-weight:700;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;opacity:0;transform:scale(0);transition:opacity .2s,transform .3s">0</span>' +
      "</a>";
    navbar.prepend(item);

    function updateBadge(count) {
      var badge = document.getElementById("admin-notif-badge");
      if (!badge) {
        return;
      }
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : String(count);
        badge.style.opacity = "1";
        badge.style.transform = "scale(1)";
      } else {
        badge.style.opacity = "0";
        badge.style.transform = "scale(0)";
      }
    }

    function fetchCount() {
      fetch("/api/notifications/unread-count/", { credentials: "include" })
        .then(function (response) {
          if (!response.ok) {
            return { count: 0 };
          }
          return response.json();
        })
        .then(function (data) {
          updateBadge(Number(data.count || 0));
        })
        .catch(function () {});
    }

    fetchCount();
    window.setInterval(fetchCount, 30000);
  }

  function enableAutoRefresh() {
    window.setInterval(function () {
      if (document.hasFocus()) {
        window.location.reload();
      }
    }, 5 * 60 * 1000);
  }

  function initJazzminTabFallback() {
    var tabLists = Array.prototype.slice.call(document.querySelectorAll("ul.nav.nav-tabs"));
    if (!tabLists.length) {
      return;
    }

    function forceActivate(link) {
      if (!link) {
        return;
      }
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") {
        return;
      }

      var tabList = link.closest("ul.nav.nav-tabs");
      if (!tabList) {
        return;
      }

      var targetPane = document.querySelector(href);
      if (!targetPane) {
        return;
      }

      var links = Array.prototype.slice.call(tabList.querySelectorAll('a.nav-link[href^="#"]'));
      links.forEach(function (candidate) {
        var isActive = candidate === link;
        candidate.classList.toggle("active", isActive);
        candidate.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      var content = targetPane.closest(".tab-content");
      var panes = content
        ? Array.prototype.slice.call(content.querySelectorAll(".tab-pane"))
        : Array.prototype.slice.call(document.querySelectorAll(".tab-content .tab-pane"));
      panes.forEach(function (pane) {
        var isPaneActive = pane === targetPane;
        pane.classList.toggle("active", isPaneActive);
        pane.classList.toggle("show", isPaneActive);
        pane.style.display = isPaneActive ? "block" : "none";
      });
    }

    tabLists.forEach(function (tabList) {
      var links = Array.prototype.slice.call(tabList.querySelectorAll('a.nav-link[href^="#"]'));
      links.forEach(function (link) {
        link.classList.remove("disabled");
        link.removeAttribute("disabled");
        link.setAttribute("data-toggle", "pill");
        link.setAttribute("data-bs-toggle", "pill");
      });

      var activeLink = tabList.querySelector('a.nav-link.active[href^="#"]') || links[0];
      if (activeLink) {
        forceActivate(activeLink);
      }
    });

    document.addEventListener("click", function (event) {
      var link = event.target.closest("ul.nav.nav-tabs a.nav-link[href^='#']");
      if (!link) {
        return;
      }
      event.preventDefault();

      if (window.bootstrap && window.bootstrap.Tab) {
        try {
          var tab = window.bootstrap.Tab.getOrCreateInstance(link);
          tab.show();
        } catch (_error) {}
      }

      if (window.jQuery && typeof window.jQuery.fn.tab === "function") {
        try {
          window.jQuery(link).tab("show");
        } catch (_error) {}
      }

      forceActivate(link);
    });
  }

  function activateTabFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var target = params.get("tab");
    if (!target) {
      return;
    }

    var links = Array.prototype.slice.call(
      document.querySelectorAll("ul.nav.nav-tabs a.nav-link[href^='#']")
    );
    if (!links.length) {
      return;
    }

    var match = null;
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") {
        return;
      }
      var id = href.slice(1);
      var key = id.replace(/^tab-/, "");
      if (id === target || key === target) {
        match = link;
      }
    });

    if (match) {
      match.click();
    }
  }

  function attachInlineTabs() {
    var body = document.body;
    if (!body || !body.classList.contains("model-aboutus")) {
      return;
    }

    var tabList = document.querySelector("ul.nav.nav-tabs");
    var tabContent = document.querySelector(".tab-content");
    if (!tabList || !tabContent) {
      return;
    }

    function moveInline(headingText, tabId) {
      var inlineGroups = Array.prototype.slice.call(document.querySelectorAll(".inline-group"));
      var targetInline = inlineGroups.find(function (group) {
        var heading = group.querySelector("h2");
        if (!heading) {
          return false;
        }
        return heading.textContent.toLowerCase().indexOf(headingText) !== -1;
      });

      if (!targetInline) {
        return;
      }

      var pane = document.getElementById(tabId);
      if (pane) {
        pane.appendChild(targetInline);
      }
    }

    moveInline("services", "tab-services");
    moveInline("gallery", "tab-gallery");
    moveInline("our team", "tab-team");
  }

  function showExtensionNoticeBanner() {
    if (!isProtectedAdminPage()) {
      return;
    }

    var host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1" && host !== "0.0.0.0") {
      return;
    }

    var storageKey = "ct_admin_ext_notice_dismissed";
    try {
      if (window.localStorage.getItem(storageKey) === "1") {
        return;
      }
    } catch (_error) {}

    if (document.querySelector(".ct-extension-notice")) {
      return;
    }

    var target =
      document.querySelector(".content-wrapper") ||
      document.querySelector("#content") ||
      document.querySelector(".content") ||
      document.body;
    if (!target) {
      return;
    }

    var banner = document.createElement("div");
    banner.className = "ct-extension-notice";

    var text = document.createElement("div");
    text.className = "ct-extension-notice__text";
    text.textContent =
      "Seeing console errors like 'Cannot find menu item …' or 'addListener' undefined? Those usually come from browser extensions injected into localhost. Try disabling extensions for this site or using an incognito window.";

    var actions = document.createElement("div");
    actions.className = "ct-extension-notice__actions";

    var dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "ct-extension-notice__dismiss";
    dismiss.textContent = "Dismiss";
    dismiss.addEventListener("click", function () {
      try {
        window.localStorage.setItem(storageKey, "1");
      } catch (_error) {}
      banner.remove();
    });

    actions.appendChild(dismiss);
    banner.appendChild(text);
    banner.appendChild(actions);

    if (target.firstChild) {
      target.insertBefore(banner, target.firstChild);
    } else {
      target.appendChild(banner);
    }
  }

  function boot() {
    initMonthlyChart();
    attachLiveClock();
    pollNotificationBadge();
    initJazzminTabFallback();
    activateTabFromQuery();
    attachInlineTabs();
    showExtensionNoticeBanner();
    enableAutoRefresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
