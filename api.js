//API CALLS FOR FETCHING DOG IMAGES

/**
 * Fetch a random dog image from the Dog CEO API
 * This function is async (uses await) because it makes a network request that takes time
 * @returns {Promise<string>} - The URL of a random dog image
 */
async function getRandomDogImage() {
  // The URL of the API that provides random dog images
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

    // Return the image URL (the "message" field contains the dog image URL)
    return json.message;
  } catch (error) {
    // If something goes wrong, log the error to the console
    console.error(error.message);
  }
}

//EXPORT FUNCTION
// Export the function so other files can use it
export { getRandomDogImage };
