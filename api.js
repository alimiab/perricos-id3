//API CALLS FOR FETCHING DOG IMAGES AND BREED

/**
 * Fetch a random dog image and breed from the Dog CEO API
 * This function is async (uses await) because it makes a network request that takes time
 * @returns {Promise<{image: string, breed: string}>} - The URL of a random dog image and its breed
 */
async function getRandomDogImage() {
  // The URL of the API that provides random dog images with breed info
  const url = 'https://dog.ceo/api/breeds/image/random';
  
  try {
    // Make a request to the API and wait for the response
    const response = await fetch(url);
    
    // Check if the response was successful (status 200-299)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    // Convert the response to JSON format
    const json = await response.json();

    // Extract image URL and breed from the response
    const imageUrl = json.message;
    // Parse the URL to get the breed (e.g., "https://images.dog.ceo/breeds/akita/An_Akita_Inu_resting.jpg" -> "akita")
    const breed = imageUrl.split('/')[4] || 'Unknown';
    
    // Return both the image URL and the breed
    return {
      image: imageUrl,
      breed: breed.charAt(0).toUpperCase() + breed.slice(1) // Capitalize breed name
    };
  } catch (error) {
    // If something goes wrong, log the error to the console
    console.error(error.message);
    // Return a default object if there's an error
    return {
      image: '',
      breed: 'Unknown'
    };
  }
}

//EXPORT FUNCTION
// Export the function so other files can use it
export { getRandomDogImage };
