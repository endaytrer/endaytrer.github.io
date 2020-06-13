$("document").ready(function () {
    var qrCode = new QRCode("qrCode", {
        text: "               " + "AC5BFE246FA1451C1BD85C6B2AEDCF" + "               ",
        width: 150,
        height: 150,
        colorDark: "#f97afb",
        correctLevel: QRCode.CorrectLevel.H
    });
})