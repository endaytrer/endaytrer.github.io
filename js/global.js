window.addEventListener("scroll", function () {
    var nav = document.getElementById("navBar");
    if (window.scrollY > 0) {
        nav.classList.add("scrolled");
        nav.classList.remove("fixed");
    } else {
        nav.classList.add("fixed");
        nav.classList.remove("scrolled");
    }
});