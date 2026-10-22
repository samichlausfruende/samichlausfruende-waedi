/* Setzt Kopf, Navigation und Fusszeile ein und füllt die Jahresdaten aus daten.js.
   Muss normalerweise nicht angepasst werden. */
(function () {
  var D = window.DATEN || {};
  // Ab dem Anmeldedatum den Hinweis "Anmeldung ab ..." ausblenden und die Anmeldung zeigen
  if (D.anmeldungAbDatum) {
    var t = new Date(), heute = t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2);
    if (heute >= D.anmeldungAbDatum) D.anmeldungAb = "";
  }
  document.documentElement.classList.add("js");
  // Kopf und Fusszeile stehen fest in jeder Seite (Menü funktioniert so auch ohne JavaScript).
  // Hier kommt nur der Menüknopf für das Handy dazu.
  var kopf = document.getElementById("kopf");
  var menue = kopf && kopf.querySelector("nav");
  if (menue) {
    var knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "menueknopf";
    knopf.setAttribute("aria-expanded", "false");
    knopf.setAttribute("aria-controls", "hauptmenue");
    knopf.innerHTML = '<span class="balken" aria-hidden="true"></span><span class="menuetext">Menü</span>';
    menue.parentNode.insertBefore(knopf, menue);
    var setze = function (offen) {
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      menue.classList.toggle("offen", offen);
    };
    knopf.addEventListener("click", function () { setze(knopf.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setze(false); knopf.focus(); } });
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

  // Weiterleitung nach dem Absenden: Web3Forms (Gratis-Version) erlaubt nur Seiten derselben Domain.
  // Darum wird die Adresse der Dankeseite aus der aktuellen Adresse gebildet.
  document.querySelectorAll("input[data-seite]").forEach(function (el) {
    try { el.value = new URL(el.getAttribute("data-seite"), location.href).href; } catch (e) {}
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
