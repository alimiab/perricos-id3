// file for main JS code
import { getRandomDogImage } from './api.js';

const dogList = document.querySelector('#dog-list');
const filtersDiv = document.querySelector('#filters');

const names = ['Coco', 'Rocky', 'Luna', 'Lola', 'Daisy', 'Max'];

let dogs = [];
let selectedName = null;

//ADD DOGS
async function addPerricos(amount) {
  for (let i = 0; i < amount; i++) {
    const image = await getRandomDogImage();
    const name = names[Math.floor(Math.random() * names.length)];

    dogs.push({
      id: crypto.randomUUID(),
      name,
      image,
      votes: 0,
    });
  }
  render();
}

//RENDER
function render() {
  renderFilters();
  renderDogs();
}

function renderDogs() {
  dogList.innerHTML = '';

  const filteredDogs = selectedName
    ? dogs.filter(d => d.name === selectedName)
    : dogs;

  filteredDogs.forEach(dog => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${dog.image}" />
      <h3>${dog.name}</h3>
      <div class="votes">❤️ ${dog.votes}</div>
      <button class="vote-btn">❤️</button>
      <button class="vote-btn">🤮</button>
    `;

    const [likeBtn, hateBtn] = card.querySelectorAll('.vote-btn');

    likeBtn.onclick = () => {
      dog.votes++;
      renderDogs();
    };

    hateBtn.onclick = () => {
      dog.votes--;
      renderDogs();
    };

    dogList.appendChild(card);
  });
}

//FILTERS
function renderFilters() {
  filtersDiv.innerHTML = '';

  names.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.className = 'filter-btn';

    if (selectedName === name) {
      btn.classList.add('selected');
    }

    btn.onclick = () => {
      selectedName = selectedName === name ? null : name;
      render();
    };

    filtersDiv.appendChild(btn);
  });
}

//EVENTS
document.querySelector('#add-1').onclick = () => addPerricos(1);
document.querySelector('#add-5').onclick = () => addPerricos(5);
