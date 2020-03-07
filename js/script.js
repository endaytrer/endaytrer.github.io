window.onload = function () {
    var sents = ["So live a live you will remember.", "Hello, world!", "Talk is cheap. Show me the code.", "Do not go gentle into that good night."];
    var by = ["Tim Bergling", "Ada Lovelace", "Linus Torvalds", "Dylan Thomas"];
    frame = document.getElementById("welcome");
    title = document.getElementById("startify");
    author = document.getElementById("author");
    titleBlank = document.getElementById("titleBlank");
    var rand = Math.floor(Math.random() * sents.length);
    title.innerHTML = sents[rand];
    author.innerHTML = by[rand];
    var rand2 = Math.floor(Math.random() * 3);
    switch (rand2) {
        case 0:
            frame.style.backgroundImage = 'url("../images/waterpaint.jpg")';
            titleBlank.classList.add("waterpaint");
            titleBlank.classList.remove("dawn");
            break;
        case 1:
            frame.style.backgroundImage = 'url("../images/leaves.jpg")';
            titleBlank.classList.add("leaves");
            titleBlank.classList.remove("dawn");
            break;
        default:
            // ???
            frame.style.backgroundImage = 'url("../images/midnight.jpg")';
            titleBlank.classList.add("midnight");
            titleBlank.classList.remove("dawn");
            break;
    }
};