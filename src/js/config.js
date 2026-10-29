(function () {
  var defaults = {
    callbackUrl: "https://webhook.site/YOUR-UNIQUE-ID",
    hideMode: "display",
    phrasing: "integrity",
  };

  var stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("demoConfig") || "{}");
  } catch (e) {
    stored = {};
  }

  window.DEMO_CONFIG = Object.assign({}, defaults, stored);
})();
