// Main JavaScript code for the dog voting app
import { getRandomDogImage } from './api.js';

const dogList = document.querySelector('#dog-list');
const filtersDiv = document.querySelector('#filters');

// List of dog names for random assignment
const names = ['Coco', 'Rocky', 'Luna', 'Lola', 'Daisy', 'Max'];

let dogs = [];
let selectedName = null;

// Add dogs to the list
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

// Reset all dogs
function resetDogs() {
  dogs = [];
  selectedName = null;
  render();
}

// Render the entire page
function render() {
  renderFilters();
  renderDogs();
}

// Render all dog cards
function renderDogs() {
  dogList.innerHTML = '';

  // Filter dogs by selected name
  const filteredDogs = selectedName
    ? dogs.filter(d => d.name === selectedName)
    : dogs;

  // Display message if no dogs
  if (filteredDogs.length === 0) {
    dogList.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; color: white; font-size: 1.2em;">No dogs yet. Add some to get started!</p>';
    return;
  }

  // Create card for each dog
  filteredDogs.forEach(dog => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${dog.image}" alt="${dog.name}" />
      <h3>${dog.name}</h3>
      <div class="votes">👍 ${dog.votes} votes</div>
      <div class="vote-buttons">
        <button class="vote-btn like-btn" title="Like this dog">👍</button>
        <button class="vote-btn dislike-btn" title="Dislike this dog">👎</button>
      </div>
    `;

    const [likeBtn, dislikeBtn] = card.querySelectorAll('.vote-btn');

    // Like button
    likeBtn.onclick = () => {
      dog.votes++;
      renderDogs();
    };

    // Dislike button
    dislikeBtn.onclick = () => {
      dog.votes--;
      renderDogs();
    };

    dogList.appendChild(card);
  });
}

// Render filter buttons
function renderFilters() {
  filtersDiv.innerHTML = '';

  names.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.className = 'filter-btn';

    // Add selected class if this name is selected
    if (selectedName === name) {
      btn.classList.add('selected');
    }

    // Toggle filter on click
    btn.onclick = () => {
      selectedName = selectedName === name ? null : name;
      render();
    };

    filtersDiv.appendChild(btn);
  });
}

// Event listeners for buttons
document.querySelector('#add-1').onclick = () => addPerricos(1);
document.querySelector('#add-5').onclick = () => addPerricos(5);
document.querySelector('#reset').onclick = () => {
  if (confirm('Are you sure you want to reset all dogs?')) {
    resetDogs();
  }
};
