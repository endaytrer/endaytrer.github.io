window.onload = function(){
var sents = ["So live a live you will remember.", "Hello, world!","Talk is cheap. Show me the code.","Do not go gentle into that good night."];
var by = ["Tim Bergling","Ada Lovelace","Linus Torvalds","Dylan Thomas"]
frame = document.getElementById("welcome");
title = document.getElementById("startify");
author = document.getElementById("author");
var rand=Math.floor(Math.random()*sents.length);
title.innerHTML = sents[rand];
author.innerHTML = by[rand];
}