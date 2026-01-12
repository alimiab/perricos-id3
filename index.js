// IMPORTS
// Import the getRandomDogImage function from the api.js file
import { getRandomDogImage } from './api.js';

//DOM ELEMENTS
// Get the HTML element where we will display the dog cards
const dogList = document.querySelector('#dog-list');
// Get the HTML element where we will display the filter buttons
const filtersDiv = document.querySelector('#filters');

//DATA
// Array of dog names - we will randomly pick from this list when adding dogs
const names = ['Coco', 'Rocky', 'Luna', 'Lola', 'Daisy', 'Max'];

// Empty array to store all the dogs (each dog has: id, name, image, votes)
let dogs = [];
// Variable to track which dog name is currently selected for filtering (null = no filter)
let selectedName = null;

//FUNCTIONS TO ADD AND MANAGE DOGS

/**
 * Add a specific number of dogs to the list
 * @param {number} amount - How many dogs to add
 */
async function addPerricos(amount) {
  // Loop the number of times specified (1 or 5 times)
  for (let i = 0; i < amount; i++) {
    // Get a random dog image URL from the API
    const image = await getRandomDogImage();
    // Pick a random name from the names array
    const name = names[Math.floor(Math.random() * names.length)];

    // Add the new dog to the dogs array with initial data
    dogs.push({
      id: crypto.randomUUID(),        // Unique ID for this dog
      name,                           // The dog's name
      image,                          // The dog's image URL
      votes: 0,                       // Start with 0 votes
    });
  }
  // Update the display after adding dogs
  render();
}

/**
 * Remove all dogs and reset the filter
 */
function resetDogs() {
  // Clear the dogs array
  dogs = [];
  // Clear the selected filter
  selectedName = null;
  // Update the display
  render();
}

//RENDERING FUNCTIONS

/**
 * Update the entire page (both filters and dog list)
 */
function render() {
  renderFilters();  // Update the filter buttons
  renderDogs();     // Update the dog cards
}

/**
 * Display all the dog cards on the page
 */
function renderDogs() {
  // Clear the dog list (remove all old cards)
  dogList.innerHTML = '';

  // If a name filter is selected, show only dogs with that name
  // Otherwise, show all dogs
  const filteredDogs = selectedName
    ? dogs.filter(d => d.name === selectedName)
    : dogs;

  // Show a message if there are no dogs to display
  if (filteredDogs.length === 0) {
    dogList.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; color: white; font-size: 1.2em;">No dogs yet. Add some to get started!</p>';
    return;
  }

  // Loop through each dog and create a card for it
  filteredDogs.forEach(dog => {
    // Create a new div element for the card
    const card = document.createElement('div');
    card.className = 'card';

    // Fill the card with HTML (image, name, votes, buttons)
    card.innerHTML = `
      <img src="${dog.image}" alt="${dog.name}" />
      <h3>${dog.name}</h3>
      <div class="votes">👍 ${dog.votes} votes</div>
      <div class="vote-buttons">
        <button class="vote-btn like-btn" title="Like this dog">👍</button>
        <button class="vote-btn dislike-btn" title="Dislike this dog">👎</button>
      </div>
    `;

    // Get the like and dislike buttons from the card
    const [likeBtn, dislikeBtn] = card.querySelectorAll('.vote-btn');

    // Set up the like button - increases votes when clicked
    likeBtn.onclick = () => {
      dog.votes++;        // Add 1 vote
      renderDogs();       // Refresh the display to show the new vote count
    };

    // Set up the dislike button - decreases votes when clicked
    dislikeBtn.onclick = () => {
      dog.votes--;        // Subtract 1 vote
      renderDogs();       // Refresh the display to show the new vote count
    };

    // Add the card to the page
    dogList.appendChild(card);
  });
}

/**
 * Display filter buttons for each dog name
 */
function renderFilters() {
  // Clear the filters area (remove old buttons)
  filtersDiv.innerHTML = '';

  // Loop through each name and create a filter button
  names.forEach(name => {
    // Create a new button element
    const btn = document.createElement('button');
    btn.textContent = name;           // Set the button text to the dog name
    btn.className = 'filter-btn';     // Give it the filter button styling

    // If this name is currently selected, add the 'selected' class (for styling)
    if (selectedName === name) {
      btn.classList.add('selected');
    }

    // When the button is clicked, toggle the filter for this name
    btn.onclick = () => {
      // If this name is already selected, deselect it
      // If it's not selected, select it
      selectedName = selectedName === name ? null : name;
      // Refresh the display
      render();
    };

    // Add the button to the page
    filtersDiv.appendChild(btn);
  });
}

//EVENT LISTENERS
// Wait for the page to fully load before setting up the buttons
document.addEventListener('DOMContentLoaded', () => {
  // When "Add 1 Dog" button is clicked, add 1 dog
  document.querySelector('#add-1').onclick = () => addPerricos(1);
  
  // When "Add 5 Dogs" button is clicked, add 5 dogs
  document.querySelector('#add-5').onclick = () => addPerricos(5);
  
  // When "Reset All" button is clicked, confirm and then reset
  document.querySelector('#reset').onclick = () => {
    // Ask the user to confirm before deleting all dogs
    if (confirm('Are you sure you want to reset all dogs?')) {
      resetDogs();  // Delete all dogs and clear filters
    }
  };
});
