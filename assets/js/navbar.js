// Hide the navbar when scrolling down, show it again when scrolling up.
(function () {
    var navbar = document.getElementById("navbar");
    var menu = document.getElementById("navbarSupportedContent");
    var lastY = scrollPosition();
    var ticking = false;

    // Clamped so iOS overscroll "bounce" at the top or bottom doesn't count as scrolling.
    function scrollPosition() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(Math.max(window.pageYOffset, 0), Math.max(max, 0));
    }

    function update() {
        var y = scrollPosition();
        var keepVisible =
            y < navbar.offsetHeight ||                   // near the top of the page
            menu.classList.contains("show") ||           // mobile menu open
            navbar.contains(document.activeElement);     // keyboard focus in the navbar
        if (keepVisible || y < lastY) {
            navbar.classList.remove("navbar-hidden");
        } else if (y > lastY) {
            navbar.classList.add("navbar-hidden");
        }
        lastY = y;
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    navbar.addEventListener("focusin", function () {
        navbar.classList.remove("navbar-hidden");
    });
})();
