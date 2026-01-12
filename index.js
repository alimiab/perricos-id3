// IMPORTS
// Import the getRandomDogImage function from the api.js file
import { getRandomDogImage } from './api.js';

//DOM ELEMENTS
// Get the HTML element where we will display the dog cards
const dogList = document.querySelector('#dog-list');
// Get the HTML element where we will display the filter buttons
const filtersDiv = document.querySelector('#filters');
// Get the dog counter element
const dogCountEl = document.querySelector('#dog-count');
// Get the voting results element
const votingResultsDiv = document.querySelector('#voting-results');

//DATA
// Array of dog names - we will randomly pick from this list when adding dogs
const names = ['Coco', 'Rocky', 'Luna', 'Lola', 'Daisy', 'Max'];

// Empty array to store all the dogs (each dog has: id, name, image, votes)
let dogs = [];
// Variable to track which dog name is currently selected for filtering (null = no filter)
let selectedName = null;
// Variable to track which dog breed is currently selected for filtering (null = no filter)
let selectedBreed = null;
// Variable to track current filter type (name or breed)
let filterType = 'name';
// Initialize selectedNames as an empty array to track selected names
let selectedNames = [];

//FUNCTIONS TO ADD AND MANAGE DOGS

/**
 * Add a specific number of dogs to the list
 * @param {number} amount - How many dogs to add
 */
async function addPerricos(amount) {
  // Loop the number of times specified (1 or 5 times)
  for (let i = 0; i < amount; i++) {
    // Get a random dog image URL and breed from the API
    const dogData = await getRandomDogImage();
    // Pick a random name from the names array
    const name = names[Math.floor(Math.random() * names.length)];

    // Add the new dog to the dogs array with initial data
    dogs.push({
      id: crypto.randomUUID(),        // Unique ID for this dog
      name,                           // The dog's name
      image: dogData.image,           // The dog's image URL
      breed: dogData.breed,           // The dog's breed
      votes: 0,                       // Start with 0 votes
    });
  }
  // Update the display after adding dogs
  render();
}

/**
 * Remove a specific dog by ID
 * @param {string} dogId - The ID of the dog to remove
 */
function removeDog(dogId) {
  // Find the index of the dog with the given ID
  const index = dogs.findIndex(d => d.id === dogId);
  // If found, remove it from the array
  if (index !== -1) {
    dogs.splice(index, 1);
    render();
  }
}

/**
 * Clear the name filter
 */
function clearFilters() {
  selectedName = null;
  render();
}

/**
 * Submit voting results as a form
 */
function submitVotingResults() {
  // Check if there are any dogs
  if (dogs.length === 0) {
    alert('No dogs to submit votes for!');
    return;
  }

  // Create a summary of voting results
  const results = dogs.map(dog => ({
    name: dog.name,
    breed: dog.breed,
    votes: dog.votes
  }));

  // Display the results
  votingResultsDiv.innerHTML = `
    <div class="results-table">
      <h3>Voting Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Dog Name</th>
            <th>Breed</th>
            <th>Votes</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr>
              <td>${r.name}</td>
              <td>${r.breed}</td>
              <td>${r.votes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button id="download-results" class="btn btn-info">Download Results</button>
    </div>
  `;

  // Add download functionality
  document.querySelector('#download-results').onclick = () => {
    downloadResults(results);
  };
}

//RENDERING FUNCTIONS

/**
 * Update the entire page (both filters and dog list)
 */
function render() {
  renderFilters();  // Update the filter buttons
  renderDogs();     // Update the dog cards
  updateDogCounter();  // Update the dog counter
}

/**
 * Display all the dog cards on the page
 */
function renderDogs() {
  // Clear the dog list (remove all old cards)
  dogList.innerHTML = '';

  // Filter dogs based on the current filter type and selection
  let filteredDogs = dogs;
  
  if (filterType === 'name' && selectedName) {
    // Filter by name
    filteredDogs = dogs.filter(d => d.name === selectedName);
  } else if (filterType === 'breed' && selectedBreed) {
    // Filter by breed
    filteredDogs = dogs.filter(d => d.breed === selectedBreed);
  }

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

    // Fill the card with HTML (image, name, breed, votes, buttons)
    card.innerHTML = `
      <button class="delete-btn" title="Remove this dog">✕</button>
      <img src="${dog.image}" alt="${dog.name}" />
      <h3>${dog.name}</h3>
      <p class="breed">Breed: ${dog.breed}</p>
      <div class="votes">👍 ${dog.votes} votes</div>
      <div class="vote-buttons">
        <button class="vote-btn like-btn" title="Like this dog">👍</button>
        <button class="vote-btn dislike-btn" title="Dislike this dog">👎</button>
      </div>
    `;

    // Get all buttons from the card
    const deleteBtn = card.querySelector('.delete-btn');
    const [likeBtn, dislikeBtn] = card.querySelectorAll('.vote-btn');

    // Set up the delete button - removes the dog when clicked
    deleteBtn.onclick = () => {
      removeDog(dog.id);
    };

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
 * Update the dog counter display
 */
function updateDogCounter() {
  // Get the number of filtered dogs (respecting any active filter)
  let filteredDogs = dogs;
  
  if (filterType === 'name' && selectedName) {
    filteredDogs = dogs.filter(d => d.name === selectedName);
  } else if (filterType === 'breed' && selectedBreed) {
    filteredDogs = dogs.filter(d => d.breed === selectedBreed);
  }
  
  // Update the counter element
  dogCountEl.textContent = filteredDogs.length;
}

/**
 * Display filter buttons for each dog name or breed
 */
function renderFilters() {
  // Clear the filters area (remove old buttons)
  filtersDiv.innerHTML = '';

  if (filterType === 'name') {
    // Show filter buttons for dog names
    names.forEach(name => {
      // Count how many dogs have this name
      const count = dogs.filter(d => d.name === name).length;

      // Create a new button element
      const btn = document.createElement('button');
      btn.textContent = `${name} (${count})`;  // Show name and count
      btn.className = 'filter-btn';  // Give it the filter button styling

      // If this name is currently selected, add the 'selected' class (for styling)
      if (selectedNames.includes(name)) {
        btn.classList.add('selected');
      }

      // When the button is clicked, toggle the filter for this name
      btn.onclick = () => {
        // Toggle selection
        if (selectedNames.includes(name)) {
          selectedNames = selectedNames.filter(n => n !== name);
        } else {
          selectedNames.push(name);
        }
        // Refresh the display
        render();
      };

      // Add the button to the page
      filtersDiv.appendChild(btn);
    });
  } else if (filterType === 'breed') {
    // Get all unique breeds from the dogs
    const breeds = [...new Set(dogs.map(d => d.breed))];
    // Show filter buttons for dog breeds
    breeds.forEach(breed => {
      // Create a new button element
      const btn = document.createElement('button');
      btn.textContent = breed;  // Set the button text to the dog breed
      btn.className = 'filter-btn';  // Give it the filter button styling

      // If this breed is currently selected, add the 'selected' class (for styling)
      if (selectedBreed === breed) {
        btn.classList.add('selected');
      }

      // When the button is clicked, toggle the filter for this breed
      btn.onclick = () => {
        selectedBreed = selectedBreed === breed ? null : breed;
        render();
      };

      // Add the button to the page
      filtersDiv.appendChild(btn);
    });
  }
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
      // Clear the dogs array
      dogs = [];
      // Clear the selected filter
      selectedName = null;
      selectedBreed = null;
      // Clear voting results
      votingResultsDiv.innerHTML = '';
      // Update the display
      render();
    }
  };

  // When "Clear Filters" button is clicked, clear the name or breed filter
  document.querySelector('#clear-filters').onclick = () => {
    selectedName = null;
    selectedBreed = null;
    render();
  };

  // When "Submit Votes" button is clicked, submit the voting results
  document.querySelector('#submit-votes').onclick = () => {
    submitVotingResults();
  };

  // When filter type dropdown changes, update the filters
  document.querySelector('#filter-type').onchange = (event) => {
    filterType = event.target.value;  // Update the filter type (name or breed)
    selectedName = null;  // Clear name filter
    selectedBreed = null;  // Clear breed filter
    render();  // Re-render with new filter type
  };
});

/**
 * Download voting results as a JSON file
 * @param {Array} results - The voting results to download
 */
function downloadResults(results) {
  // Convert results to JSON format
  const jsonString = JSON.stringify(results, null, 2);
  // Create a blob from the JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });
  // Create a download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Set the filename with the current date
  a.download = `dog-votes-${new Date().toISOString().split('T')[0]}.json`;
  // Trigger the download
  a.click();
  // Clean up the URL
  URL.revokeObjectURL(url);
}
