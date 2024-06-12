import("./bootstrap");

async function loadFonts() {
  if (window.location.hostname === "localhost") {
    await import("../src/assets/fonts/Poppins.css");
  } else {
    await import("../src/assets/fonts/Poppins-dev.css");
  }
}

//loadFonts();
