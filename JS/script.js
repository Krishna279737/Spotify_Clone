let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");

let currentSong = new Audio();
let songs;
let curFolder;
play.src = "img/play.svg";

function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

let getSongs = async (folder) => {
  curFolder = folder;
  let a = await fetch(`${curFolder}`);

  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${curFolder}/`)[1]);
    }
  }

  //Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
    <div class="info">
    <img class="invert" src="img/music.svg" alt="">
    <div>${song.replaceAll("%20", " ")}</div>
    </div>
    <div class="playnow">
    <span>Play Now</span>
    <img class="invert" src="img/play.svg" alt="">
    </div> </li>`;
  }

  // Attach an event listener to a song.
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info>div").innerHTML, true);
      play.src = "img/pause.svg";
    });
  });

  return songs;
};

const playMusic = async (track, pause = false) => {
  if (pause) {
    // currentSong.paused()
    currentSong.src = `/${curFolder}/` + track;
    currentSong.play();
  }
  document.querySelector(".circle").style.left = "0";
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

let displayAlbums = async () => {
  let a = await fetch(`songs`);

  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  let cardContainer = document.querySelector(".cardContainer");

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      // Get the metadata of the folder
      let a = await fetch(`songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
          <img class="playButton" src="img/playButton.svg" alt="">
          <img class="cardImg" src="/songs/${folder}/cover.jpeg"
          alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
          </div>`;
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.querySelectorAll(".card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      await playMusic(songs[0], (pause = true));
      currentSong.pause();
      play.src = "img/play.svg";
    });
  });
};

async function main() {
  //Get the list of all Songs

  let songs = await getSongs(`songs/ncs`);
  await playMusic(songs[0], (pause = true));

  // Display all the album on the stage

  displayAlbums();

  // Attach to event listener to play, previous, next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(
      currentSong.currentTime
    )} / ${convertSecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    document.querySelector(".currSeekbar").style.width =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    if (currentSong.duration === currentSong.currentTime) {
      play.src = "img/play.svg";
    }
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    console.log(e.target);
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener to currSeekbar
  document.querySelector(".currSeekbar").addEventListener("click", (e) => {
    let seekbarWidth = document.querySelector(".seekbar").offsetWidth;
    let percent2 = (e.offsetX / seekbarWidth) * 100;
    document.querySelector(".circle").style.left = percent2 + "%";
    currentSong.currentTime = (currentSong.duration * percent2) / 100;
  });

  // Add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener to closehamburger
  document
    .querySelector(".close")
    .firstElementChild.addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%";
    });

  //Add an event listener to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log("previous ", index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1], true);
      play.src = "img/pause.svg";
    }
  });

  //Add an event listener to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log("next ", index);
    if (index + 1 < songs.length - 1) {
      playMusic(songs[index + 1], true);
      play.src = "img/pause.svg";
    }
  });

  // Add an event to volume
  let range = document
    .querySelector(".volume")
    .getElementsByTagName("input")[0];
  range.addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume > img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      range.value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      range.value = 10;
    }
  });
}

main();
