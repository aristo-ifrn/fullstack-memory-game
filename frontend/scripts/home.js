const HTMLElements = {
  openOptionsButton: document.querySelector("#openOptions"),
  closeOptionsButton: document.querySelector("#closeOptions"),
  closeInformationButton: document.querySelector("#closeInformation"),
  rankingButton: document.querySelector("#ranking"),
  newGameButton: document.querySelector("#newGame"),
  copyrightButton: document.querySelector("#copyright"),
  selectableButtons: document.querySelectorAll(".selectable"),
  clickableButtons: document.querySelectorAll(".clickable"),
  informationsPopUp: document.querySelector("#informations"),
  optionsPopUp: document.querySelector("#options"),
  loadingPopUp: document.querySelector("#loading"),
  vibrationOnButton: document.querySelector("#vibration .on"),
  vibrationOffButton: document.querySelector("#vibration .off"),
  volumeRangeInputs: document.querySelectorAll("#volume .input"),
};

const tracks = {
  background: new Audio("./assets/audios/init.flac", { loop: true }),
  focus: new Audio("./assets/audios/focus.wav"),
  select: new Audio("./assets/audios/select.wav"),
};

const setVolumeForAudios = (volume) => {
  Object.values(tracks).forEach((track) => (track.volume = volume));
};

const loadVolumeFromLocalStorage = () => {
  const savedVolume = parseFloat(localStorage.getItem("volume")) || 1.0;
  setVolumeForAudios(savedVolume);
};

const saveVolumeToLocalStorage = (volume) => {
  localStorage.setItem("volume", volume);
  setVolumeForAudios(volume);
};

const redirectWithLoading = (url, delay = 1000) => {
  HTMLElements.loadingPopUp.setAttribute("data-state", "opened");
  setTimeout(() => (location.href = `./${url}`), delay);
};

const togglePopUp = (popUpElement, state) => {
  popUpElement.setAttribute("data-state", state);
};

const toggleVibration = (state) => {
  HTMLElements.vibrationOnButton.setAttribute(
    "data-state",
    state === "on" ? "active" : "inactive"
  );
  HTMLElements.vibrationOffButton.setAttribute(
    "data-state",
    state === "off" ? "active" : "inactive"
  );
  localStorage.setItem("vibration", state);
};

HTMLElements.openOptionsButton.addEventListener("click", () =>
  togglePopUp(HTMLElements.optionsPopUp, "opened")
);
HTMLElements.closeOptionsButton.addEventListener("click", () =>
  togglePopUp(HTMLElements.optionsPopUp, "closed")
);

HTMLElements.closeInformationButton.addEventListener("click", () => {
  togglePopUp(HTMLElements.informationsPopUp, "closed");
  tracks.background.play();
});

HTMLElements.copyrightButton.addEventListener("click", () =>
  togglePopUp(HTMLElements.informationsPopUp, "opened")
);

HTMLElements.rankingButton.addEventListener("click", () =>
  redirectWithLoading("ranking.html")
);
HTMLElements.newGameButton.addEventListener("click", () =>
  redirectWithLoading("game.html")
);

HTMLElements.selectableButtons.forEach((element) =>
  element.addEventListener("mouseenter", () => tracks.focus.play())
);
HTMLElements.clickableButtons.forEach((element) =>
  element.addEventListener("click", () => tracks.select.play())
);

HTMLElements.vibrationOnButton.addEventListener("click", () =>
  toggleVibration("on")
);
HTMLElements.vibrationOffButton.addEventListener("click", () =>
  toggleVibration("off")
);

HTMLElements.volumeRangeInputs.forEach((element, index) => {
  element.addEventListener("click", () => {
    const volume = index * 0.1;
    saveVolumeToLocalStorage(volume);
  });
});

window.addEventListener("load", loadVolumeFromLocalStorage);
