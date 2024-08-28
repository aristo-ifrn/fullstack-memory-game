const HTMLElements = {
  loadingWrapper: document.querySelector("#loading"),
  playersWrapper: document.querySelector("#players"),
  homeButton: document.querySelector("#home"),
  selectableButtons: Array.from(document.querySelectorAll(".selectable")),
  clickableButtons: Array.from(document.querySelectorAll(".clickable")),
};

const backendUrl = "http://127.0.0.1:8000/";
const HTMLTableError = `<tr class="error"><td colspan="6">Sem dados no momento</td></tr>`;

const tracks = {
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

HTMLElements.selectableButtons.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    tracks.focus.play();
  });
});

HTMLElements.clickableButtons.forEach((element) => {
  element.addEventListener("click", () => {
    tracks.select.play();
  });
});

const generatePlayerHTML = ({
  position,
  name,
  flips,
  time,
  date,
  has_completed,
}) => `
  <tr>
    <td>${position}</td>
    <td>${name}</td>
    <td>${flips}</td>
    <td>${time}${has_completed ? " segundos" : ""}</td>
    <td>${date}</td>
    <td title="${has_completed ? "completo" : "incompleto"}">
      <div class="dot ${has_completed ? "completed" : "uncompleted"}"></div>
    </td>
  </tr>
`;

const formatPlayerDate = (dateString) => {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} de ${day}/${month}/${year}`;
};

const generateRanking = (players) => {
  if (players.length !== 0) {
    players.forEach((player, index) => {
      const data = {
        position: (index + 1).toString().padStart(2, "0"),
        name: player.username,
        flips: player.flips_quantity,
        time: player.has_completed ? 30 - player.used_time : "Sem tempo",
        date: formatPlayerDate(player.date),
        has_completed: player.has_completed,
      };
      const playerRow = generatePlayerHTML(data);
      HTMLElements.playersWrapper.innerHTML += playerRow;
    });
  } else {
    HTMLElements.playersWrapper.innerHTML = HTMLTableError;
  }
};

const getPlayers = async () => {
  try {
    const response = await fetch(`${backendUrl}get/`);
    const players = await response.json();
    generateRanking(players);
  } catch (error) {
    HTMLElements.playersWrapper.innerHTML = HTMLTableError;
    console.error(`Erro ao carregar os dados: ${error}`);
  }
};

const redirectWithLoading = (url, delay) => {
  HTMLElements.loadingWrapper.setAttribute("data-state", "opened");

  setTimeout(() => {
    location.href = url;
  }, delay);
};

HTMLElements.homeButton.addEventListener("click", () => {
  redirectWithLoading("./index.html", 1000);
});


window.addEventListener("load", () => {
  HTMLElements.loadingWrapper.setAttribute("data-state", "closed");
  loadVolumeFromLocalStorage();
  getPlayers();
});
