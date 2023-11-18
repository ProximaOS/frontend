let petHunger = 50;
let petHappiness = 50;
let feedInterval;

document.addEventListener('DOMContentLoaded', function () {
  const feedButton = document.getElementById('feedButton');
  const playButton = document.getElementById('playButton');

  feedButton.addEventListener('click', feed);
  playButton.addEventListener('click', play);

  startFeedingInterval();
});

function updateStatus() {
  document.getElementById('status').innerText = `Hunger: ${petHunger} | Happiness: ${petHappiness}`;
}

function feed() {
  petHunger -= 10;
  if (petHunger < 0) petHunger = 0;
  petHappiness += 5;
  if (petHappiness > 100) petHappiness = 100;
  updateStatus();
  checkGameOver();
  animateMouth();
}

function play() {
  petHunger += 5;
  if (petHunger > 100) petHunger = 100;
  petHappiness += 10;
  if (petHappiness > 100) petHappiness = 100;
  updateStatus();
  checkGameOver();
  animateEye();
}

function checkGameOver() {
  if (petHunger === 100 || petHappiness === 0) {
    alert('Game Over! Your pet is not happy or too hungry.');
    resetGame();
  }
}

function resetGame() {
  petHunger = 50;
  petHappiness = 50;
  updateStatus();
}

function animateMouth() {
  const pet = document.getElementById('pet');
  const mouth = document.getElementById('mouth');
  pet.style.transform = 'scale(1.1, 0.9)';
  mouth.style.transform = 'scaleY(1.2)';
  new Audio(`/resources/sounds/boing${Math.round(Math.random() * 2)}.mp3`).play();
  setTimeout(() => {
    pet.style.transform = 'scale(0.9, 1.1) translateY(-10%)';
    mouth.style.transform = 'scaleY(1)';
    setTimeout(() => {
      pet.style.transform = 'scale(1)';
    }, 200);
  }, 200);
}

function animateEye() {
  const eye = document.getElementById('eye');
  eye.style.transform = 'scaleY(0)';
  setTimeout(() => {
    eye.style.transform = 'scaleY(1)';
  }, 200);
}

function animateLookAround() {
  const pet = document.getElementById('pet');
  const eye = document.getElementById('eye');
  const mouth = document.getElementById('mouth');
  pet.style.transform = 'scale(1.1, 0.9)';
  eye.style.transform = 'translateX(-5%)';
  mouth.style.transform = 'scaleY(1.2)';
  setTimeout(() => {
    pet.style.transform = 'scale(1.05, 0.95)';
    eye.style.transform = 'translateX(5%)';
    mouth.style.transform = 'scaleY(1)';
    setTimeout(() => {
      pet.style.transform = 'scale(1)';
      eye.style.transform = 'translateX(0)';
    }, 1000);
  }, 1000);
}

function animateJumpscare() {
  const pet = document.getElementById('pet');
  const eye = document.getElementById('eye');
  const mouth = document.getElementById('mouth');
  pet.style.transform = 'scale(1.1, 0.9)';
  eye.style.transform = 'translateY(5%)';
  mouth.style.transform = 'scaleY(0.9) translateY(5%)';
  new Audio('/resources/sounds/deathstare.mp3').play();
  setTimeout(() => {
    pet.style.transform = 'scale(5)';
    pet.style.opacity = 0;
    pet.style.filter = 'blur(20px)';
    eye.style.transform = 'translateX(5%)';
    mouth.style.transform = 'scaleY(1)';
    new Audio('/resources/sounds/jump.mp3').play();
    setTimeout(() => {
      pet.style.opacity = 0;
      pet.style.transform = 'scale(1) translateY(-100%)';
      eye.style.transform = 'translateX(0)';
      setTimeout(() => {
        pet.style.opacity = 1;
        pet.style.filter = 'blur(0px)';
        pet.style.transform = 'scale(1) translateY(-50%)';
        setTimeout(() => {
          pet.style.opacity = 1;
          pet.style.transform = 'scale(1) translateY(0)';
        }, 500);
      }, 300);
    }, 1000);
  }, 1000);
}

function startFeedingInterval() {
  feedInterval = setInterval(() => {
    petHunger += 5;
    if (petHunger > 100) petHunger = 100;
    updateStatus();
    checkGameOver();
    if (Math.random() >= 0.9) {
      animateJumpscare();
    } else if (Math.random() >= 0.5) {
      animateMouth();
    } else {
      animateLookAround();
    }
  }, 5000);
}

function stopFeedingInterval() {
  clearInterval(feedInterval);
}
