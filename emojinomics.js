
// land (not shown, limits land use, relates to roaming livestock cap)
// mountains / earth
// -apple -earth +apple-tree +apple-cap
//  over time, apple trees yield apples up to the capacity
// -earth +seedling +livestock-cap
// -money +sheep
//   sheep follow logistic function, breeding until population approaches livestock cap

// population
//   -food per turn


// land
// appleTree
// apple
// appleCapacity = appleTree * 10
// population' = population 

// buttons:
//  

const updaters = [];

// const counts = {population: 0, apple: 0, appleCap: 10, appleTree: 0};
// const changers = {apple: {}, appleTree: {apple: 1}};
// const costs = {apple: {}, appleTree: {apple: 10}};

// const rules = {
//   appleTree: {
//     apple: -10,
//     appleTree: 1,
//     appleCap: 10,
//   }
// };

const magnitudes = ['', 'K', 'G', 'P'];

const human = n => {
  let i = 0;
  if (n < 1e3) {
    return n;
  }
  do {
    n = (n / 1e3);
    i++;
  } while (n > 1e3);
  if (n < 10) {
    n = n.toFixed(2);
  } else if (n < 100) {
    n = n.toFixed(1);
  }
  return n + magnitudes[i];
}

const resourceForElement = el => {
  do {
    const resource = el.dataset.resource;
    if (resource) {
      return resource;
    }
    el = el.parentElement;
  } while (el != null);
};

// const funded = resource => Object.entries(costs[resource])
//   .every(([resource, amount]) => counts[resource] > amount);

// const makeIncrementerUpdater = (resource, el) => {
//   return () => {
//     el.disabled = !funded(resource);
//   };
// };

// const hookupIncrementer = el => {
//   const product = resourceForElement(el);
//   el.addEventListener('click', () => {
//     if (funded(product)) {
//       for (const [resource, amount] of Object.entries(costs[product])) {
//         counts[resource] -= amount;
//       }
//       counts[product]++;
//       draw();
//     }
//   });
//   updaters.push(makeIncrementerUpdater(product, el));
// };

// for (const el of document.querySelectorAll(".incrementer")) {
//   hookupIncrementer(el);
// }

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const draw = () => {
  for (const update of updaters) {
    update();
  }
};

const round = n => {
  const min = Math.floor(n);
  const mid = n - min;
  const max = Math.ceil(n);
  return Math.random() > mid ? min : max;
};

const grow = (at, cap, damp) => round(Math.max(0, Math.min(cap, at + round(at * (cap - at) / cap * Math.pow(Math.random(), 8)))));

const consume = (creature, growth, food, foodPerCreature) => {
  const maxFoodEaten = Math.min(food, creature * growth * foodPerCreature);
  const maxCreature = Math.min(creature * growth, maxFoodEaten / foodPerCreature);
  const foodEaten = maxCreature * foodPerCreature;
  // TODO even out this rounding
  return [round(maxCreature), round(food - foodEaten)];
};

const generate = state => {
  const { land, mountain, pineTree, appleTree, apple, pineApple, worm, bird } = state;
  const availableLand = land - mountain - pineTree - appleTree;
  const mountainous = mountain / land;
  const pineTreeTarget = mountain * 2 * (land - mountain) / land;
  const appleTreeTarget = (land - mountain - pineTreeTarget) / 2;
  const [ worm2, apple2 ] = consume(worm, 1.2, apple, 0.5);
  const [ bird2, worm3 ] = consume(bird, 1.1, worm2, 3);
  const next = {
    land,
    mountain,
    pineTree: grow(pineTree, pineTreeTarget, 4),
    pineApple: grow(pineApple + 1, pineTree * 10, 8),
    appleTree: grow(appleTree, appleTreeTarget, 8),
    apple: Math.max(0, grow(apple2 + 1, appleTree * 10, 8)),
    worm: worm3,
    bird: bird2,
  };
  console.clear();
  console.table(next);
  return next;
};

const main = async () => {
  const makeCounterUpdater = el => {
    const resource = resourceForElement(el);
    return () => {
      el.innerText = human(state[resource]);
    };
  };

  for (const el of document.querySelectorAll(".counter")) {
    updaters.push(makeCounterUpdater(el));
  }

  const makeDisplayCounterUpdater = el => {
    const resource = resourceForElement(el);
    return () => {
      el.style.display = state[resource] ? 'block' : 'none';
    };
  };

  for (const el of document.querySelectorAll(".displayCounter")) {
    updaters.push(makeDisplayCounterUpdater(el));
  }

  let state = {
    land: 100,
    mountain: 10,
    pineTree: 1,
    pineApple: 0,
    appleTree: 1,
    apple: 20,
    worm: 10,
    bird: 1,
  };

  while (window.break === undefined) {
    state = generate(state);
    draw()
    await delay(1000);
  }
};

main();
