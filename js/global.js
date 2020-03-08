window.addEventListener("scroll", function () {
    //滚动后收回
    var nav = document.getElementById("navBar");
    if (window.scrollY > 0) {
        nav.classList.add("scrolled");
        nav.classList.remove("fixed");
    } else {
        nav.classList.add("fixed");
        nav.classList.remove("scrolled");
    }
});