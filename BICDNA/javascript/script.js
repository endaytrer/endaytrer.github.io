// constants
var nowEditor = -1;
var popupMinHeight = 300;
var popupMaxHeight = 900;
// nowEditor = 0:DNA, 1:RNA, 2:Protein, -1:Null
const base = {
  A: "A",
  T: "T",
  C: "C",
  G: "G",
};
const tm = {
  // transcript mode
  coding: 0,
  paring: 1,
};
// end of constants

// Classes: DNA String, etc.
function Base(name, type) {
  this.name = name;
  // re is used in transcription and translation;
  // scanRe means the representation of mixed bases;
  this.re = new RegExp(name);
  switch (name) {
    case "A":
      this.scanRe = this.re;
      if (type == 0) {
        this.anti = "T";
      } else {
        this.anti = "U";
      }
      break;
    case "C":
      this.scanRe = this.re;
      this.anti = "G";
      break;
    case "T":
      this.scanRe = this.re;
      this.anti = "A";
      break;
    case "U":
      this.scanRe = this.re;
      this.anti = "A";
      break;
    case "G":
      this.scanRe = this.re;
      this.anti = "C";
      break;
    case "V":
      this.scanRe = new RegExp("[VACG]");
      this.anti = "B";
      break;
    case "D":
      this.scanRe = new RegExp("[DATUG]");
      this.anti = "H";
      break;
    case "B":
      this.scanRe = new RegExp("[BTUCG]");
      this.anti = "V";
      break;
    case "H":
      this.scanRe = new RegExp("[HATUC]");
      this.anti = "D";
      break;
    case "W":
      this.scanRe = new RegExp("[WATU]");
      this.anti = "W";
      break;
    case "S":
      this.scanRe = new RegExp("[SCG]");
      this.anti = "S";
      break;
    case "K":
      this.scanRe = new RegExp("[KTUG]");
      this.anti = "M";
      break;
    case "M":
      this.scanRe = new RegExp("[MAC]");
      this.anti = "K";
      break;
    case "Y":
      this.scanRe = new RegExp("[YCTU]");
      this.anti = "R";
      break;
    case "R":
      this.scanRe = new RegExp("[RAG]");
      this.anti = "Y";
      break;
    case "N":
      this.scanRe = new RegExp("[NATUCG]");
      this.anti = "N";
    default:
      this.scanRe = this.re;
      this.anti = "?";
      break;
  }
}
var dnaBases = new Array(
  new Base("A", 0),
  new Base("T", 0),
  new Base("C", 0),
  new Base("G", 0),
  new Base("V", 0),
  new Base("D", 0),
  new Base("B", 0),
  new Base("H", 0),
  new Base("W", 0),
  new Base("S", 0),
  new Base("K", 0),
  new Base("M", 0),
  new Base("Y", 0),
  new Base("R", 0),
  new Base("N", 0)
);

var rnaBases = new Array(
  new Base("A", 1),
  new Base("U", 1),
  new Base("C", 1),
  new Base("G", 1),
  new Base("V", 1),
  new Base("D", 1),
  new Base("B", 1),
  new Base("H", 1),
  new Base("W", 1),
  new Base("S", 1),
  new Base("K", 1),
  new Base("M", 1),
  new Base("Y", 1),
  new Base("R", 1),
  new Base("N", 1)
);

function Nucleus(seq) {
  this.sequence = seq;
}

function DNAString(seq) {
  Nucleus.call(this, seq);
}

function RNAString(seq) {
  Nucleus.call(this, seq);
}
Nucleus.prototype.antiString = function (type) {
  ans = this.sequence;
  if (type == 0) {
    for (var i = 0; i < dnaBases.length; i++) {
      ans.replace(dnaBases[i].re, dnaBases[i].anti);
    }
    return new DNAString(ans);
  } else {
    for (var i = 0; i < rnaBases.length; i++) {
      ans.replace(rnaBases[i].re, rnaBases[i].anti);
    }
    return new RNAString(ans);
  }
};
DNAString.prototype = Object.create(Nucleus.prototype);
DNAString.prototype.constructor = DNAString;
DNAString.prototype.transcript = function (transcriptMode) {
  var ans = "";
  if (transcriptMode == tm.coding) {
    var re = new RegExp("T");
    ans = this.sequence;
    ans = ans.replace(re, "U");
    return new RNAString(ans);
  } else {
    var re = new RegExp("T");
    ans = this.antiString(0);
    ans = ans.replace(re, "U");
    return new RNAString(ans);
  }
};
//event listeners
var startY,
  startHeight,
  startTop,
  lastTop = "50vh",
  lastHeight = "50vh";

window.onload = function () {
  document
    .querySelector(".upAdjuster")
    .addEventListener("mousedown", startDrag);
};

function startDrag(e) {
  startY = e.clientY;
  startHeight = parseInt(
    window.getComputedStyle(document.querySelector(".popupMain")).height,
    10
  );
  startTop = parseInt(
    window.getComputedStyle(document.querySelector(".poped")).top,
    10
  );
  // alert(startHeight);
  document.documentElement.addEventListener("mousemove", onDrag);
  document.documentElement.addEventListener("mouseup", stopDrag);
}

function onDrag(e) {
  var newHeight = startHeight - e.clientY + startY;
  var newTop = startTop + e.clientY - startY;
  if (newHeight <= popupMinHeight) {
    newHeight = popupMinHeight;
    newTop = startTop + startHeight - popupMinHeight;
  }
  if (newHeight >= popupMaxHeight) {
    newHeight = popupMaxHeight;
    newTop = startTop + startHeight - popupMaxHeight;
  }
  console.log(newTop);
  document.querySelector(".popupMain").style.height = newHeight + "px";
  document.querySelector(".poped").style.top = newTop + "px";
}

function stopDrag(e) {
  lastHeight = document.querySelector(".popupMain").style.height;
  lastTop = document.querySelector(".poped").style.top;
  document.documentElement.removeEventListener("mousemove", onDrag);
  document.documentElement.removeEventListener("mouseup", stopDrag);
}
//end of listeners
// Functions

function emptyClick(event) {
  nowEditor = -1;
  checkBoxes = document.getElementsByClassName("checker");
  for (var i = 0; i < checkBoxes.length; i++) {
    checkBoxes[i].checked = false;
  }
}

function check(event, checkNum) {
  event.stopPropagation();
  checkBoxes = document.getElementsByClassName("checker");
  if (checkNum == nowEditor) {
    nowEditor = -1;
  } else {
    nowEditor = checkNum;
  }
  for (var i = 0; i < checkBoxes.length; i++) {
    if (i != checkNum) {
      checkBoxes[i].checked = false;
    }
  }
}

function dnaChange() {
  dnaSeq = document.getElementById("dna").innerHTML;
  // alert(dnaSeq);
  // TODO: Use regular expressions to recognize restriction sites.
}

function togglePopUp() {
  var popup = document.getElementsByClassName("popup")[0];
  document.querySelector(".popupMain").removeAttribute("style");
  document.querySelector(".popup").removeAttribute("style");
  if (popup.classList.contains("unpoped")) {
    popup.classList.add("poped");
    popup.classList.remove("unpoped");
  } else {
    popup.classList.add("unpoped");
    popup.classList.remove("poped");
  }
}

function addTemplate(event, tempNum) {
  event.stopPropagation();
  document.querySelector(".listSelector").appendChild()
}