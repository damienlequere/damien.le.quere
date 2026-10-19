// Colour theme: "light", "dark" or "auto" (follow the OS setting), remembered in localStorage.
// Loaded without defer in <head>, so the theme is set before the page is drawn (no white flash).
(function () {
    // Site-specific key: localhost:3000 is shared with other dev projects (next-themes stores "theme" = "system")
    var KEY = "damien-le-quere:theme";
    var CHOICES = ["light", "dark", "auto"];
    var root = document.documentElement;
    var dark = window.matchMedia("(prefers-color-scheme: dark)");

    function stored() {
        try {
            var choice = localStorage.getItem(KEY);
            return CHOICES.indexOf(choice) === -1 ? "auto" : choice;
        } catch (e) {
            return "auto";
        }
    }

    function apply(choice) {
        var theme = choice === "auto" ? (dark.matches ? "dark" : "light") : choice;
        root.setAttribute("data-bs-theme", theme);
        root.setAttribute("data-theme-choice", choice); // selects the navbar icon in style.css

        var items = document.querySelectorAll("[data-theme-value]");
        for (var i = 0; i < items.length; i++) {
            var active = items[i].getAttribute("data-theme-value") === choice;
            items[i].classList.toggle("active", active);
            items[i].setAttribute("aria-pressed", active);
        }
    }

    apply(stored());

    document.addEventListener("DOMContentLoaded", function () {
        apply(stored()); // mark the active menu item, now that the navbar exists
    });

    dark.addEventListener("change", function () {
        if (stored() === "auto") apply("auto");
    });

    document.addEventListener("click", function (event) {
        var item = event.target.closest("[data-theme-value]");
        if (!item) return;
        var choice = item.getAttribute("data-theme-value");
        try {
            localStorage.setItem(KEY, choice);
        } catch (e) {}
        apply(choice);
    });

    // Always print in the light theme.
    window.addEventListener("beforeprint", function () {
        root.setAttribute("data-bs-theme", "light");
    });
    window.addEventListener("afterprint", function () {
        apply(stored());
    });
})();
