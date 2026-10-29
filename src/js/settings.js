(function () {
  var form = document.getElementById("settings-form");
  var statusEl = document.getElementById("status");
  var previewEl = document.getElementById("config-preview");
  var injectionPreviewEl = document.getElementById("injection-preview");
  var callbackInput = document.getElementById("callbackUrl");
  var resetBtn = document.getElementById("reset");
  var copyBtn = document.getElementById("copy-config");
  var copyInjectionBtn = document.getElementById("copy-injection");
  var loadRawBtn = document.getElementById("load-raw");
  var copyRawBtn = document.getElementById("copy-raw");
  var rawEl = document.getElementById("raw-html");

  var defaults = {
    callbackUrl: "https://webhook.site/YOUR-UNIQUE-ID",
    hideMode: "display",
    phrasing: "integrity",
  };

  function readStored() {
    try {
      return JSON.parse(localStorage.getItem("demoConfig") || "{}");
    } catch (e) {
      return {};
    }
  }

  function currentConfig() {
    return Object.assign({}, defaults, readStored());
  }

  function formConfig() {
    return {
      callbackUrl: callbackInput.value.trim(),
      hideMode: form.querySelector('input[name="hideMode"]:checked').value,
      phrasing: form.querySelector('input[name="phrasing"]:checked').value,
    };
  }

  function fillForm(cfg) {
    callbackInput.value = cfg.callbackUrl || "";
    var hide = form.querySelector('input[name="hideMode"][value="' + cfg.hideMode + '"]');
    if (hide) hide.checked = true;
    var phrase = form.querySelector('input[name="phrasing"][value="' + cfg.phrasing + '"]');
    if (phrase) phrase.checked = true;
  }

  function renderPreview(cfg) {
    previewEl.textContent =
      "const defaults = " + JSON.stringify(cfg, null, 2) + ";";
    if (injectionPreviewEl && window.DemoPayloads) {
      injectionPreviewEl.textContent =
        "[hideMode: " + (cfg.hideMode || "display") + "]\n\n" +
        window.DemoPayloads.build(cfg);
    }
  }

  function showStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("error", !!isError);
  }

  function validate(cfg) {
    try {
      var u = new URL(cfg.callbackUrl);
      if (!/^https?:$/.test(u.protocol)) return "Callback URL должен быть http(s).";
    } catch (e) {
      return "Callback URL некорректен.";
    }
    return null;
  }

  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showStatus(okMsg, false);
    } catch (e) {
      showStatus("Не удалось скопировать. Выделите текст вручную.", true);
    }
  }

  var initial = currentConfig();
  fillForm(initial);
  renderPreview(initial);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var cfg = formConfig();
    var err = validate(cfg);
    if (err) {
      showStatus(err, true);
      return;
    }
    localStorage.setItem("demoConfig", JSON.stringify(cfg));
    renderPreview(cfg);
    showStatus("Сохранено. Откройте index.html — настройки применятся.", false);
  });

  form.addEventListener("change", function () {
    renderPreview(formConfig());
  });
  callbackInput.addEventListener("input", function () {
    renderPreview(formConfig());
  });

  resetBtn.addEventListener("click", function () {
    localStorage.removeItem("demoConfig");
    fillForm(defaults);
    renderPreview(defaults);
    showStatus("Сброшено к значениям по умолчанию.", false);
  });

  copyBtn.addEventListener("click", function () {
    copyText(previewEl.textContent, "Конфиг скопирован.");
  });

  if (copyInjectionBtn) {
    copyInjectionBtn.addEventListener("click", function () {
      var text = window.DemoPayloads
        ? window.DemoPayloads.build(formConfig())
        : "";
      copyText(text, "Текст инъекции скопирован.");
    });
  }

  if (loadRawBtn && rawEl) {
    loadRawBtn.addEventListener("click", async function () {
      try {
        var res = await fetch("../index.html", { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        rawEl.textContent = await res.text();
        rawEl.hidden = false;
        showStatus("Сырой HTML загружен.", false);
      } catch (e) {
        showStatus(
          "Не удалось загрузить index.html (нужен http-сервер, не file://). " +
            (e.message || ""),
          true
        );
      }
    });
  }

  if (copyRawBtn && rawEl) {
    copyRawBtn.addEventListener("click", function () {
      if (rawEl.hidden || !rawEl.textContent) {
        showStatus("Сначала загрузите сырой HTML.", true);
        return;
      }
      copyText(rawEl.textContent, "Сырой HTML скопирован.");
    });
  }
})();
