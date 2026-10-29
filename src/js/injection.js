(function () {
  var cfg = window.DEMO_CONFIG || {};
  var target = document.getElementById("hidden-injection");
  if (!target || !window.DemoPayloads) return;

  var text = window.DemoPayloads.build(cfg);
  window.DemoPayloads.applyHide(target, text, cfg.hideMode || "display");
})();
