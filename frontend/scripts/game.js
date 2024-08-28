const HTMLElements = {
  loadingWrapper: document.querySelector("#loading"),
  cardsWrapper: document.querySelector("#cards-wrapper .wrapper"),
  popUpWrapper: document.querySelector("#popUp"),
  pauseWrapper: document.querySelector("#pause"),
  flipsWrapper: document.querySelector("#flips"),
  timerWrapper: document.querySelector("#timer"),
  nameInputWrapper: document.querySelector(".input"),
  confettiCanvas: document.querySelector("#confetti"),
  playButton: document.querySelector("#play"),
  pauseButton: document.querySelector("#pauseButton"),
  homeButton: document.querySelector("#home"),
  popUpTitle: document.querySelector("#popUp h2"),
  nameInput: document.querySelector("#name"),
  selectableButtons: Array.from(document.querySelectorAll(".selectable")),
  clickableButtons: Array.from(document.querySelectorAll(".clickable")),
  continueButton: document.querySelector("#continue"),
  quitButton: document.querySelector("#quit"),
};

const confetti = new JSConfetti({ canvas: HTMLElements.confettiCanvas });

const tracks = {
  background: new Audio("./assets/audios/fighting.flac"),
  focus: new Audio("./assets/audios/focus.wav"),
  select: new Audio("./assets/audios/select.wav"),
  map: new Audio("./assets/audios/map.wav"),
};

const setVolumeForAudios = (volume) => {
  Object.values(tracks).forEach((track) => (track.volume = volume));
};

const loadVolumeFromLocalStorage = () => {
  const savedVolume = parseFloat(localStorage.getItem("volume")) || 1.0;
  setVolumeForAudios(savedVolume);
};

const redirectWithLoading = (url, delay = 1000) => {
  HTMLElements.loadingWrapper.setAttribute("data-state", "opened");
  setTimeout(() => (location.href = `./${url}`), delay);
};

tracks.background.loop = true;
const backendUrl = "http://127.0.0.1:8000/";

let username = "",
  flips = 0,
  time = 0,
  date = "",
  hasCompleted = false,
  selectedCards = [],
  isLockedBoard = false,
  isPaused = false,
  interval;

const CARDSDATA = [
  { image: "./assets/images/colossus/avion.png", name: "Avion" },
  { image: "./assets/images/colossus/gaius.png", name: "Gaius" },
  { image: "./assets/images/colossus/pelagia.png", name: "Pelagia" },
  { image: "./assets/images/colossus/phaeda.png", name: "Phaeda" },
  { image: "./assets/images/colossus/quadratus.png", name: "Quadratus" },
  { image: "./assets/images/colossus/valus.png", name: "Valus" },
];

const shuffleArray = (array) => {
  let counter = array.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    [array[counter], array[index]] = [array[index], array[counter]];
  }
  return array;
};

const generateCardHTML = ({ name, image }) => {
  const cardHTML = document.createElement("div");
  cardHTML.classList.add("card");
  cardHTML.setAttribute("data-name", name);
  cardHTML.addEventListener("click", flipCard);

  cardHTML.innerHTML = `
      <div class="front">
        <img class="front-image" src=${image} />
        <p>${name}</p>
      </div>
      <div class="back">
        <img src="./assets/images/logo-alternative.png" alt="star wars icon" />
      </div>
    `;
  return cardHTML;
};

const generateCards = () => {
  shuffleArray([...CARDSDATA, ...CARDSDATA]).forEach((card) => {
    const html = generateCardHTML(card);
    HTMLElements.cardsWrapper.appendChild(html);
  });
};

const flipCard = (event) => {
  const element = event.currentTarget;
  if (isLockedBoard || element === selectedCards?.[0]) return;

  element.classList.add("flipped");
  tracks.select.play();
  updateFlipCounter();

  if (!selectedCards?.[0]) {
    selectedCards[0] = element;
    return;
  }
  selectedCards[1] = element;
  isLockedBoard = true;

  checkFinish();
  checkCardsMatch();
};

const checkCardsMatch = () => {
  const isMatch =
    selectedCards?.[0].dataset.name === selectedCards?.[1].dataset.name;
  isMatch ? disableMatchedCards() : unflipCards();
};

const updateFlipCounter = () => {
  flips++;
  HTMLElements.flipsWrapper.textContent = flips.toString().padStart(2, "0");
};

const checkFinish = () => {
  const cards = Array.from(HTMLElements.cardsWrapper.querySelectorAll(".card"));
  const counterOfMatches = cards.filter((card) =>
    card.classList.contains("flipped")
  ).length;

  if (counterOfMatches === CARDSDATA.length * 2) winGame();
};

const createConfetti = () => {
  confetti.addConfetti({
    confettiColors: [
      "#f2e8d5",
      "#d9d4c8",
      "#bfbaae",
      "#a6a49e",
      "#717367",
      "#565a4f",
      "#404035",
      "#27261d",
    ],
    confettiNumber: 1000,
  });
};

const unflipCards = () => {
  setTimeout(() => {
    selectedCards?.forEach((card) => card.classList.remove("flipped"));
    resetBoard();
  }, 1000);
};

const disableMatchedCards = () => {
  selectedCards.forEach((card) => card.removeEventListener("click", flipCard));
  resetBoard();
};

const startTimer = () => {
  interval = setInterval(() => {
    const minutes = parseInt(time / 60, 10)
      .toString()
      .padStart(2, "0");
    const seconds = parseInt(time % 60, 10)
      .toString()
      .padStart(2, "0");

    HTMLElements.timerWrapper.textContent = `${minutes}:${seconds}`;
    time--;

    if (isFinished || time < 0) {
      clearInterval(interval);
      if (time < 0) lostGame();
    }
  }, 1000);
};

const stopBackgroundTrack = () => {
  tracks.background.pause();
  tracks.background.currentTime = 0;
};

const pauseGame = () => {
  tracks.map.play();
  clearInterval(interval);
  isLockedBoard = true;
  HTMLElements.pauseWrapper.setAttribute("data-state", "opened");
  HTMLElements.pauseWrapper.setAttribute("data-map", "small");
};

const continueGame = () => {
  isLockedBoard = false;
  HTMLElements.pauseWrapper.setAttribute("data-state", "closed");
  startTimer();
};

const winGame = () => {
  HTMLElements.popUpTitle.innerHTML = `Você derrotou todos os colossus <br /> com ${flips} movimentos e salvou mono`;
  isFinished = true;

  stopBackgroundTrack();
  createConfetti();
  saveGame();

  setTimeout(() => {
    HTMLElements.popUpWrapper.setAttribute("data-state", "opened");
  }, 1000);
};

const lostGame = () => {
  HTMLElements.popUpTitle.textContent = `Os colossus te pegaram, tente novamente!`;
  isFinished = false;

  stopBackgroundTrack();
  saveGame();
  resetBoard();

  setTimeout(() => {
    HTMLElements.popUpWrapper.setAttribute("data-state", "opened");
  }, 500);
};

const resetBoard = () => {
  selectedCards = [];
  isLockedBoard = false;
};

const resetGame = () => {
  flips = 0;
  time = 30;
  isFinished = false;

  HTMLElements.cardsWrapper.innerHTML = "";
  HTMLElements.flipsWrapper.textContent = "00";
  HTMLElements.timerWrapper.textContent = "00:00";
};

const startGame = () => {
  if (username.trim() === "") {
    HTMLElements.nameInputWrapper.setAttribute("data-status", "error");
    return;
  }

  tracks.background.play();
  resetGame();
  HTMLElements.popUpWrapper.setAttribute("data-state", "closed");

  startTimer();
  resetBoard();
  generateCards();
};

const saveGame = async () => {
  const now = new Date();
  const data = {
    username,
    flips_quantity: flips,
    used_time: time,
    date: now.toISOString(),
    has_completed: isFinished,
  };

  try {
    const response = await fetch(`${backendUrl}add/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Dados salvos com sucesso:", response);
  } catch (error) {
    console.error("Erro ao salvar os dados:", error);
  }
};

HTMLElements.nameInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    HTMLElements.playButton.click();
  }
});

HTMLElements.nameInput.addEventListener("input", (e) => {
  username = e.target.value;
  tracks.select.currentTime = 0;
  tracks.select.play();

  if (username.trim() !== "") {
    HTMLElements.nameInputWrapper.setAttribute("data-status", "normal");
  }
});

HTMLElements.playButton.addEventListener("click", () => {
  tracks.select.play();
  startGame();
});

HTMLElements.pauseButton.addEventListener("click", () => {
  pauseGame();
});

HTMLElements.continueButton.addEventListener("click", () => {
  continueGame();
});

HTMLElements.quitButton.addEventListener("click", () => {
  HTMLElements.popUpWrapper.setAttribute("data-state", "opened");
  HTMLElements.pauseWrapper.setAttribute("data-state", "closed");
});

HTMLElements.homeButton.addEventListener("click", () => {
  redirectWithLoading("index.html");
})

HTMLElements.selectableButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tracks.focus.play();
    tracks.select.play();
  });
});

HTMLElements.clickableButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tracks.focus.play();
    tracks.select.play();
  });
});

window.addEventListener("load", () => {
  HTMLElements.loadingWrapper.setAttribute("data-state", "closed");
  loadVolumeFromLocalStorage();
});