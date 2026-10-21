/* Setzt Kopf, Navigation und Fusszeile ein und füllt die Jahresdaten aus daten.js.
   Muss normalerweise nicht angepasst werden. Neue Seite im Menü: Eintrag in MENU ergänzen. */
(function () {
  var D = window.DATEN || {};
  // Ab dem Anmeldedatum den Hinweis "Anmeldung ab ..." ausblenden und die Anmeldung zeigen
  if (D.anmeldungAbDatum) {
    var t = new Date(), heute = t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2);
    if (heute >= D.anmeldungAbDatum) D.anmeldungAb = "";
  }
  var MENU = [
    ["ueber-uns.html", "Über uns"],
    ["hausbesuche.html", "Hausbesuche"],
    ["chlaushuesli.html", "Chlaushüsli"],
    ["anmeldung.html", "Anmeldung"],
    ["fa.html", "F&A"],
    ["kontakt.html", "Kontakt"]
  ];
  var aktuell = location.pathname.split("/").pop() || "index.html";

  var nav = MENU.map(function (m) {
    var cur = aktuell === m[0] ? ' aria-current="page"' : "";
    return '<li><a href="' + m[0] + '"' + cur + ">" + m[1] + "</a></li>";
  }).join("");

  document.documentElement.classList.add("js");
  var kopf = document.getElementById("kopf");
  if (kopf) {
    kopf.className = "kopf";
    kopf.innerHTML =
      '<div class="wrap"><a class="logolink" href="index.html"><img class="logo" src="img/logo.jpg" alt="Samichlausfründe Wädi – Startseite"></a>' +
      '<button type="button" class="menueknopf" aria-expanded="false" aria-controls="hauptmenue"><span class="balken" aria-hidden="true"></span><span class="menuetext">Menü</span></button>' +
      '<nav id="hauptmenue" aria-label="Hauptmenü"><ul>' + nav + "</ul></nav></div>";
    var knopf = kopf.querySelector(".menueknopf");
    var menue = kopf.querySelector("nav");
    var setze = function (offen) {
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      menue.classList.toggle("offen", offen);
    };
    knopf.addEventListener("click", function () { setze(knopf.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setze(false); knopf.focus(); } });
  }

  var fuss = document.getElementById("fuss");
  if (fuss) {
    fuss.innerHTML =
      '<div class="wrap"><span>© ' + (D.jahr || "") + " Samichlausfründe Wädi</span>" +
      '<span><a href="datenschutz.html">Datenschutz</a></span></div>';
  }

  // data-feld="name" -> Text ersetzen; data-link="name" -> href setzen
  document.querySelectorAll("[data-feld]").forEach(function (el) {
    var v = D[el.getAttribute("data-feld")];
    if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var v = D[el.getAttribute("data-link")];
    if (v) { el.href = v; } else { el.hidden = true; }
  });
  document.querySelectorAll("[data-mail]").forEach(function (el) {
    var v = D[el.getAttribute("data-mail")];
    if (v) { el.href = "mailto:" + v; el.textContent = v; }
  });
  document.querySelectorAll("[data-tel]").forEach(function (el) {
    if (D.telefon) { el.href = "tel:" + D.telefon.replace(/\s/g, ""); el.textContent = D.telefon; }
  });
  // Elemente nur zeigen, wenn die Anmeldung noch nicht läuft / ein Link existiert
  document.querySelectorAll("[data-nur-wenn-leer]").forEach(function (el) {
    if (D[el.getAttribute("data-nur-wenn-leer")]) el.hidden = true;
  });
  document.querySelectorAll("[data-nur-wenn]").forEach(function (el) {
    if (!D[el.getAttribute("data-nur-wenn")]) el.hidden = true;
  });

  // Fotogalerien: Pfeile für den Computer (auf dem Handy wird gewischt)
  document.querySelectorAll(".galerie").forEach(function (g) {
    var wrap = document.createElement("div");
    wrap.className = "galerie-wrap";
    g.parentNode.insertBefore(wrap, g);
    wrap.appendChild(g);
    var mk = function (cls, text, label) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "gal-pfeil " + cls; b.textContent = text; b.setAttribute("aria-label", label);
      wrap.appendChild(b); return b;
    };
    var zu = mk("gal-zurueck", "\u2039", "Vorheriges Foto");
    var vor = mk("gal-weiter", "\u203A", "Nächstes Foto");
    var schritt = function () { var f = g.querySelector("figure"); return f ? f.offsetWidth + 10 : 300; };
    zu.addEventListener("click", function () { g.scrollBy({ left: -schritt(), behavior: "smooth" }); });
    vor.addEventListener("click", function () { g.scrollBy({ left: schritt(), behavior: "smooth" }); });
    var pruefe = function () {
      var max = g.scrollWidth - g.clientWidth - 2;
      zu.classList.toggle("aktiv", g.scrollLeft > 2);
      vor.classList.toggle("aktiv", g.scrollLeft < max);
    };
    g.addEventListener("scroll", pruefe, { passive: true });
    window.addEventListener("resize", pruefe);
    window.addEventListener("load", pruefe);
    pruefe();
  });

  // Karte erst laden, wenn sie im Sichtfeld ist. So springt die Seite nicht,
  // weil die eingebettete Karte den Fokus an sich zieht.
  document.querySelectorAll("iframe[data-src]").forEach(function (f) {
    function laden() { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); }
    if (!("IntersectionObserver" in window)) { laden(); return; }
    var io = new IntersectionObserver(function (eintraege) {
      if (eintraege[0].isIntersecting) { io.disconnect(); laden(); }
    }, { rootMargin: "0px" });
    io.observe(f);
  });
})();
