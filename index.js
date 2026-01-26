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
// Get the Swiper container element
const swiperContainer = document.querySelector('#dog-swiper');
// Get the no-dogs message element
const noDogsMsgEl = document.querySelector('#no-dogs-message');

// Swiper instance - will be initialized when dogs are rendered
let swiperInstance = null;

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

// Cache all breeds from Dog CEO API for suggestions
let allBreedsList = [];
async function fetchAllBreeds() {
  try {
    const response = await fetch('https://dog.ceo/api/breeds/list/all');
    const data = await response.json();
    if (data.status === 'success') {
      allBreedsList = Object.keys(data.message).map(b => b.charAt(0).toUpperCase() + b.slice(1));
    }
  } catch (err) {
    allBreedsList = [];
  }
}

//FUNCTIONS TO ADD AND MANAGE DOGS

/**
 * Add a specific number of dogs to the list
 * @param {number} amount - How many dogs to add
 */
async function addPerricos(amount) {
  // If breedSearchTerm is set, only add dogs of that breed
  const breedTerm = breedSearchTerm.trim().toLowerCase();
  if (breedTerm === '') {
    // No breed search, add any breed
    const dogPromises = [];
    for (let i = 0; i < amount; i++) {
      dogPromises.push(getRandomDogImage());
    }
    const dogDatas = await Promise.all(dogPromises);
    for (let i = 0; i < dogDatas.length; i++) {
      const dogData = dogDatas[i];
      const name = names[Math.floor(Math.random() * names.length)];
      dogs.push({
        id: crypto.randomUUID(),
        name,
        image: dogData.image,
        breed: dogData.breed,
        votes: 0,
        lastInteraction: null,
      });
    }
  } else {
    // Breed search is set, add only dogs of that breed using the breed API endpoint
    // Convert breedTerm to API format (lowercase, hyphens for spaces)
    const apiBreed = breedTerm.replace(/\s+/g, '-');
    for (let i = 0; i < amount; i++) {
      // Fetch from breed-specific endpoint
      const url = `https://dog.ceo/api/breed/${apiBreed}/images/random`;
      let dogData;
      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.status === 'success') {
          dogData = {
            image: json.message,
            breed: breedSearchTerm.charAt(0).toUpperCase() + breedSearchTerm.slice(1)
          };
        } else {
          // fallback to random dog if breed not found
          dogData = await getRandomDogImage();
        }
      } catch {
        dogData = await getRandomDogImage();
      }
      const name = names[Math.floor(Math.random() * names.length)];
      dogs.push({
        id: crypto.randomUUID(),
        name,
        image: dogData.image,
        breed: dogData.breed,
        votes: 0,
        lastInteraction: null,
      });
    }
  }
  render();
}

/**
 * Remove a specific dog by ID
 * @param {string} dogId - The ID of the dog to remove
 */
function removeDog(dogId) {
  // Find the index of the dog with the given ID
  const index = dogs.findIndex(d => d.id === dogId);
  // If found, update lastInteraction before removing
  if (index !== -1) {
    dogs[index].lastInteraction = new Date().toISOString();
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

/**
 * Initialize or reinitialize the Swiper slider
 * Destroys existing instance before creating new one to prevent memory leaks
 */
function initSwiper() {
  // Destroy existing Swiper instance if it exists
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }

  // Create new Swiper instance with configuration
  swiperInstance = new Swiper('#dog-swiper', {
    // Number of slides visible at once (responsive)
    slidesPerView: 1,
    // Space between slides in pixels
    spaceBetween: 20,
    // Disable infinite loop - slides stop at ends
    loop: false,
    // Center slides when there are fewer than slidesPerView
    centeredSlides: false,
    // Pagination dots configuration
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    // Navigation arrows configuration
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    // Responsive breakpoints - adjust slides per view based on screen width
    breakpoints: {
      // When screen width >= 320px
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      // When screen width >= 640px
      640: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
      // When screen width >= 1024px
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
}

//Update the entire page (both filters and dog list)
function render() {
  renderFilters();  // Update the filter buttons
  renderDogs();     // Update the dog cards
  updateDogCounter();  // Update the dog counter
}

//Display all the dog cards on the page as Swiper slides
function renderDogs() {
  // Clear the dog list (remove all old cards)
  dogList.innerHTML = '';

  // Filter dogs based on filter type, selection, and breed search
  let filteredDogs = dogs;
  // Filter by both names and breeds if both are selected
  if (selectedNames.length > 0 && selectedBreeds.length > 0) {
    filteredDogs = filteredDogs.filter(d => selectedNames.includes(d.name) && selectedBreeds.includes(d.breed));
  } else if (selectedNames.length > 0) {
    filteredDogs = filteredDogs.filter(d => selectedNames.includes(d.name));
  } else if (selectedBreeds.length > 0) {
    filteredDogs = filteredDogs.filter(d => selectedBreeds.includes(d.breed));
  }
  // If breed search is active, filter by breed search term (case-insensitive, partial match)
  if (breedSearchTerm.trim() !== '') {
    filteredDogs = filteredDogs.filter(dog => dog.breed.toLowerCase().includes(breedSearchTerm.trim().toLowerCase()));
  }

  // Show/hide swiper container and no-dogs message based on whether there are dogs
  if (filteredDogs.length === 0) {
    // Hide swiper, show no-dogs message
    swiperContainer.style.display = 'none';
    noDogsMsgEl.style.display = 'block';
    // Destroy swiper instance when no dogs
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
    return;
  } else {
    // Show swiper, hide no-dogs message
    swiperContainer.style.display = 'block';
    noDogsMsgEl.style.display = 'none';
  }

  // Loop through each dog and create a card for it
  filteredDogs.forEach(dog => {
    // Create a new div element for the card (as a swiper slide)
    const card = document.createElement('div');
    // Add both swiper-slide class (for Swiper) and card class (for styling)
    card.className = 'swiper-slide card';

    // Format last interaction date
    let lastInteractionText = '';
    if (dog.lastInteraction) {
      const date = new Date(dog.lastInteraction);
      lastInteractionText = `Last interaction: ${date.toLocaleString()}`;
    } else {
      lastInteractionText = '';
    }

    // Fill the card with HTML (image, name, breed, votes, buttons, last interaction)
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
      <div class="last-interaction" style="margin-top:10px; font-size:0.9em; color:#888;">${lastInteractionText}</div>
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
      dog.votes++;
      dog.lastInteraction = new Date().toISOString();
      renderDogs();
    };

    // Set up the dislike button - decreases votes when clicked
    dislikeBtn.onclick = () => {
      if (dog.votes > 0) dog.votes--;
      dog.lastInteraction = new Date().toISOString();
      renderDogs();
    };

    // Add the card to the swiper wrapper
    dogList.appendChild(card);
  });

  // Initialize or reinitialize Swiper after cards are added
  initSwiper();
  // Reset to first slide when filtering or re-rendering
  if (swiperInstance) {
    swiperInstance.slideTo(0, 0);
  }
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
    // Get all unique breeds from the dogs and sort alphabetically
    const breeds = [...new Set(dogs.map(d => d.breed))].sort((a, b) => a.localeCompare(b));
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
      // Fetch all breeds for suggestions on page load
      fetchAllBreeds();
    // Breed search bar event listener
    const breedSearchInput = document.querySelector('#breed-search-input');
      // Breed search bar event listener and suggestions
      const breedSuggestionsDiv = document.getElementById('breed-suggestions');
      function showBreedSuggestions(value) {
        breedSuggestionsDiv.innerHTML = '';
        if (!value) return;
        // Use all breeds from API for suggestions
        const breeds = allBreedsList.length > 0
          ? allBreedsList.sort((a, b) => a.localeCompare(b))
          : [...new Set(dogs.map(d => d.breed))].sort((a, b) => a.localeCompare(b));
        const matches = breeds.filter(breed => breed.toLowerCase().includes(value.toLowerCase()));
        if (matches.length === 0) return;
        const list = document.createElement('ul');
        list.className = 'breed-suggestions-list';
        list.style.width = breedSearchInput.offsetWidth + 'px';
        matches.forEach(breed => {
          const item = document.createElement('li');
          item.textContent = breed;
          item.className = 'breed-suggestion-item';
          item.onmousedown = () => {
            breedSearchInput.value = breed;
            breedSearchTerm = breed;
            breedSuggestionsDiv.innerHTML = '';
            render();
          };
          list.appendChild(item);
        });
        breedSuggestionsDiv.appendChild(list);
      }
      if (breedSearchInput) {
        breedSearchInput.addEventListener('input', (event) => {
          breedSearchTerm = event.target.value;
          showBreedSuggestions(event.target.value);
          render();
        });
        breedSearchInput.addEventListener('blur', () => {
          setTimeout(() => { breedSuggestionsDiv.innerHTML = ''; }, 100);
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
  // Custom modal logic for reset confirmation
  const resetModal = document.getElementById('reset-modal');
  const modalConfirm = document.getElementById('modal-confirm');
  const modalCancel = document.getElementById('modal-cancel');
  let resetResolve;
  function showResetModal() {
    resetModal.style.display = 'flex';
    return new Promise((resolve) => {
      resetResolve = resolve;
    });
  }
  function hideResetModal() {
    resetModal.style.display = 'none';
  }
  modalConfirm.onclick = () => {
    hideResetModal();
    if (resetResolve) resetResolve(true);
  };
  modalCancel.onclick = () => {
    hideResetModal();
    if (resetResolve) resetResolve(false);
  };

  handleAsyncButton('#reset', async () => {
    const confirmed = await showResetModal();
    if (!confirmed) return;
    dogs = [];
    selectedName = null;
    selectedNames = [];
    selectedBreed = null;
    selectedBreeds = [];
    votingResultsDiv.innerHTML = '';
    render();
  });
  // Clear Filters button: disables while clearing, then re-enables
  handleAsyncButton('#clear-filters', async () => {
    selectedName = null;
    selectedNames = [];
    selectedBreed = null;
    selectedBreeds = [];
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
