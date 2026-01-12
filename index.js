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
let selectedName = null; // Deprecated, use selectedNames
// Variable to track which dog breed is currently selected for filtering (null = no filter)
let selectedBreed = null; // Deprecated, use selectedBreeds
let selectedBreeds = [];
// Variable to track current filter type (name or breed)
let filterType = 'name';
// Initialize selectedNames as an empty array to track selected names
let selectedNames = [];

// Variable to track breed search input
let breedSearchTerm = '';

//FUNCTIONS TO ADD AND MANAGE DOGS

/**
 * Add a specific number of dogs to the list
 * @param {number} amount - How many dogs to add
 */
async function addPerricos(amount) {
  // This function is async, so it returns a Promise automatically.
  // Use Promise.all to fetch all dog images in parallel, not one by one.
  const dogPromises = [];
  for (let i = 0; i < amount; i++) {
    // Each call returns a Promise
    dogPromises.push(getRandomDogImage());
  }
  // Wait for all Promises to resolve
  const dogDatas = await Promise.all(dogPromises);
  // Add each dog to the array
  for (let i = 0; i < dogDatas.length; i++) {
    const dogData = dogDatas[i];
    const name = names[Math.floor(Math.random() * names.length)];
    dogs.push({
      id: crypto.randomUUID(),
      name,
      image: dogData.image,
      breed: dogData.breed,
      votes: 0,
    });
  }
  // After all Promises resolve, update the display
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

//Clear the name filter
function clearFilters() {
  selectedName = null;
  render();
}

//Submit voting results as a form
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

//Update the entire page (both filters and dog list)
function render() {
  renderFilters();  // Update the filter buttons
  renderDogs();     // Update the dog cards
  updateDogCounter();  // Update the dog counter
}

//Display all the dog cards on the page
function renderDogs() {
  // Clear the dog list (remove all old cards)
  dogList.innerHTML = '';

  // Filter dogs based on filter type, selection, and breed search
  let filteredDogs = dogs;
  if (filterType === 'name' && selectedNames.length > 0) {
    filteredDogs = dogs.filter(d => selectedNames.includes(d.name));
  } else if (filterType === 'breed' && selectedBreeds.length > 0) {
    filteredDogs = dogs.filter(d => selectedBreeds.includes(d.breed));
  }
  // If breed search is active, filter by breed search term (case-insensitive, partial match)
  if (breedSearchTerm.trim() !== '') {
    filteredDogs = filteredDogs.filter(dog => dog.breed.toLowerCase().includes(breedSearchTerm.trim().toLowerCase()));
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

    // Set up the delete button - removes the dog when clickedW
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

//Update the dog counter display
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

//Display filter buttons for each dog name or breed
function renderFilters() {
  // Clear the filters area (remove old buttons)
  filtersDiv.innerHTML = '';

  if (filterType === 'name') {
    // Show filter buttons for dog names
    names.forEach(name => {
      // Count how many dogs have this name
      const count = dogs.filter(d => d.name === name).length;

      // Skip filters with zero count
      if (count === 0) {
        return;
      }

      // Create a new button element
      const btn = document.createElement('button');
      btn.textContent = `${name} (${count})`;  // Show name and count
      btn.className = 'filter-btn';  // Give it the filter button styling

      // If this name is currently selected, add the 'selected' class (for styling)
      if (selectedNames.includes(name)) {
        btn.classList.add('selected');
      }

      // When the button is clicked, toggle selection for this name
      btn.onclick = () => {
        if (selectedNames.includes(name)) {
          selectedNames = selectedNames.filter(n => n !== name);
        } else {
          selectedNames = [...selectedNames, name];
        }
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
      // Count how many dogs have this breed
      const count = dogs.filter(d => d.breed === breed).length;

      // Skip filters with zero count
      if (count === 0) {
        return;
      }

      // Create a new button element
      const btn = document.createElement('button');
      btn.textContent = `${breed} (${count})`;  // Set the button text to the dog breed with count
      btn.className = 'filter-btn';  // Give it the filter button styling

      // If this breed is currently selected, add the 'selected' class (for styling)
      if (selectedBreeds.includes(breed)) {
        btn.classList.add('selected');
      }

      // When the button is clicked, toggle selection for this breed
      btn.onclick = () => {
        if (selectedBreeds.includes(breed)) {
          selectedBreeds = selectedBreeds.filter(b => b !== breed);
        } else {
          selectedBreeds = [...selectedBreeds, breed];
        }
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
    // Breed search bar event listener
    const breedSearchInput = document.querySelector('#breed-search-input');
    if (breedSearchInput) {
      breedSearchInput.addEventListener('input', (event) => {
        breedSearchTerm = event.target.value;
        render();
      });
    }
  // Helper to disable/enable a button during async operation
  // Disables the button before running the async function, then re-enables it after
  function handleAsyncButton(selector, asyncFn) {
    const btn = document.querySelector(selector);
    btn.onclick = async (event) => {
      btn.disabled = true; // Disable button to prevent multiple rapid clicks
      try {
        await asyncFn(event); // Wait for the async function (returns a Promise)
      } finally {
        btn.disabled = false; // Re-enable button after async function completes
      }
    };
  }

  // Add 1 Dog button: disables while adding, then re-enables
  handleAsyncButton('#add-1', async () => await addPerricos(1)); 
  // Add 5 Dogs button: disables while adding, then re-enables
  handleAsyncButton('#add-5', async () => await addPerricos(5));
  // Reset All button: disables while resetting, then re-enables
  handleAsyncButton('#reset', async () => {
    dogs = [];
    selectedName = null;
    selectedNames = [];
    selectedBreed = null;
    votingResultsDiv.innerHTML = '';
    render();
  });
  // Clear Filters button: disables while clearing, then re-enables
  handleAsyncButton('#clear-filters', async () => {
    selectedName = null;
    selectedBreed = null;
    render();
  });
  // Submit Votes button: disables while submitting, then re-enables
  handleAsyncButton('#submit-votes', async () => {
    submitVotingResults();
  });
  // Filter type dropdown: disables while changing, then re-enables
  const filterTypeSelect = document.querySelector('#filter-type');
  filterTypeSelect.onchange = async (event) => { // Disable the select while processing
    filterTypeSelect.disabled = true;
    try {
      filterType = event.target.value;
      selectedName = null;
      selectedBreed = null;
      render();
    } finally { // Re-enable the select
      filterTypeSelect.disabled = false;
    }
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
