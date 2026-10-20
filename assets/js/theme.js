// Colour theme: "light" or "dark", toggled by the navbar button and remembered in localStorage.
// Until the visitor picks one, the theme follows the OS setting.
// Loaded without defer in <head>, so the theme is set before the page is drawn (no white flash).
(function () {
    // Site-specific key: localhost:3000 is shared with other dev projects (next-themes stores "theme" = "system")
    var KEY = "damien-le-quere:theme";
    var THEMES = ["light", "dark"];
    var root = document.documentElement;
    var dark = window.matchMedia("(prefers-color-scheme: dark)");

    // The stored theme, or null when none was picked (older "auto" values included)
    function stored() {
        try {
            var theme = localStorage.getItem(KEY);
            return THEMES.indexOf(theme) === -1 ? null : theme;
        } catch (e) {
            return null;
        }
    }

    function current() {
        return stored() || (dark.matches ? "dark" : "light");
    }

    function apply(theme) {
        root.setAttribute("data-bs-theme", theme); // also selects the navbar icon in style.css

        var label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
        var buttons = document.querySelectorAll("[data-theme-toggle]");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute("aria-label", label);
            buttons[i].setAttribute("title", label);
        }
    }

    apply(current());

    document.addEventListener("DOMContentLoaded", function () {
        apply(current()); // label the button, now that the navbar exists
    });

    dark.addEventListener("change", function () {
        if (!stored()) apply(current());
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest("[data-theme-toggle]")) return;
        var theme = current() === "dark" ? "light" : "dark";
        try {
            localStorage.setItem(KEY, theme);
        } catch (e) {}
        apply(theme);
    });

    // Always print in the light theme.
    window.addEventListener("beforeprint", function () {
        root.setAttribute("data-bs-theme", "light");
    });
    window.addEventListener("afterprint", function () {
        apply(current());
    });
})();
