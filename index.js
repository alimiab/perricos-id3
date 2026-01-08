// file for main JS code
import { getRandomDogImage } from './api.js';

const perricosArray = [Coco, Rocky, Luna, Lola, Daisy, Max]; // Imágenes de perros

// Ejemplo de acceso a los elementos del array
console.log(perricosArray[0]); // Coco
console.log(perricosArray[1]); // Rocky
console.log(perricosArray[2]); // Luna
console.log(perricosArray[3]); // Lola
console.log(perricosArray[4]); // Daisy
console.log(perricosArray[5]); // Max

// Ejemplo de objetos perro // Puedes expandir estos objetos según sea necesario
//example of dog objects //you can expand these objects as needed
const perro1 = {
  id: 1,
  name: "Coco",
  votes: 0
};
const perro2 = {
  id: 2,
  name: "Rocky",
  votes: 0
}; 
const perro3 = {
  id: 3,
  name: "Luna",
  votes: 0
};
const perro4 = {
  id: 4,
  name: "Lola",
  votes: 0
};
const perro5 = {
  id: 5,
  name: "Daisy",
  votes: 0
};
const perro6 = {
  id: 6,
  name: "Max",
  votes: 0
};

//gives a random name from the array and assigns it to randomName
const randomName = names[Math.floor(Math.random() * names.length)];

// addPerrico();

function renderPerricoArray() {
  const dogList = document.querySelector('#dog-list');
  dogList.innerHTML = '';

  perricosArray.forEach((dogImage, index) => {
    const htmlAdd = `<div class="card">
      <img src="${dogImage}" alt="Perro" />
      <br />
      <p>❤️ 🤮</p>
      <button>Preciosísimo</button> <button>Feísisimo</button>
    </div>`;

    console.log('innerHtml posición', index, dogList.innerHTML);

    dogList.innerHTML += htmlAdd;
  });
}

const addPerrico = async () => {
  const perricoImg = await getRandomDogImage();
  perricosArray.push(perricoImg);
  renderPerricoArray();
};

renderPerricoArray();

document.querySelector('#add-1-perrico').addEventListener('click', function () {
  addPerrico();
});
