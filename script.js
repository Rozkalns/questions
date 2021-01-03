const reloadButton = document.querySelector('.reload');
const reloadSvg = reloadButton.querySelector('svg');
const questionContainer = document.getElementById('question');
const question = document.getElementById('content');
const support = document.querySelector('.support .btn');
const links = document.querySelector('.links');
const home = document.querySelector('.home');
const initialTitle = question.innerText;

const converter = new showdown.Converter();

const subdomain =  window.location.host.split('.')[1] ? window.location.host.split('.')[0] : false;

let sub = '';
let lesson = '';
let sheet = {};

const mapping = {
  'conversation-sparks-1': {
    name: 'conversation-sparks-1',
    title: 'Conversation Sparks A1',
    time: {
      read: 1 / 4, // 15 sec
      execute: 1 // 60 sec
    }
  },
  'conversation-sparks-2': {
    name: 'conversation-sparks-2',
    title: 'Conversation Sparks A2',
    time: {
      read: 1 / 4, // 15 sec
      execute: 1 // 60 sec
    }
  },
  'imagine-if': {
    type: 'smaller no-repeat',
    name: 'imagine-if',
    title: 'Imagine If ...',
    time: {
      read: 1 / 2, // 30 sec
      execute: 1 / 2 // 30 sec
    }
  },
  'interview12': {
    name: 'interview12',
    time: {
      read: 1 / 4, // 15 sec
      execute: 1 // 60 sec
    }
  },
  'monologue12': {
    name: 'monologue12',
    time: {
      read: 2, // 120 sec
      execute: 5 // 300 sec
    }
  },
  'dialogue9': {
    name: 'dialogue9',
    time: {
      read: 1.5, // 90 sec
      execute: -1 // 420 sec
    }
  },
  'interview9': {
    name: 'interview9',
    time: {
      read: 1 / 4, // 15 sec
      execute: 1 // 60 sec
    }
  },
  'words': {
    type: 'randomTwo',
    name: 'words',
    range: 'A2:A'
  },
  'addition': {
    type: 'maths',
    name: 'addition',
    range: 'G:G',
    time: {
      read: 1 / 4, // 15 sec
      execute: 1 / 4 // 60 sec
    }
  },
};

let levelsFor = {};

levelsFor.english = {
  'English A1-A2': [
    'conversation-sparks-1',
    'conversation-sparks-2',
    // 'testing'
  ],
  'English B1': [
    'dialogue9',
    'interview9',
    'words'
  ],
  'English B2-C1': [
    'interview12',
    'monologue12',
    'words'
  ],
}

levelsFor.grooves = {
  'Games': [
    'imagine-if',
  ],
  'Chemistry': [
    // 'testing',
  ],
}

const levels = levelsFor[subdomain || 'english'];

let randomQuestionIndex = null;
let array = [];
let originalArray = [];
let rotation = 0;

// Functions
Array.prototype.diff = function (a) {
  return this.filter(function (i) { return a.indexOf(i) < 0; });
};

String.prototype.unquoted = function () {
  return this.replace(/(^")|("$)/g, '');
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

function reload() {
  reloadClick();
  pause(500).then(write);
}

function reloadClick() {
  rotation -= 180;

  reloadSvg.style.webkitTransform = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.MozTransform = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.transform = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';

  questionContainer.style.opacity = '0';
}

function fetchClass() {
  if (!hash()) {
    makeLinks();
    return;
  }

  if (Object.keys(mapping).includes(lesson = hash())) {
    question.innerText = '🔭';

    fetchItem(sheet = mapping[lesson])
      .then(() => {
        if (hash()) {
          questionContainer.className = lesson
        }
      });
    pause(1).then(() => reloadButton.classList.add('active'));
    links.style.display = 'none';
    links.innerHTML = '';
  }
}

function fetchItem(sheet) {
  if (sheet === null || typeof sheet !== 'object') {
    question.innerHTML = 'Izvēlies klasi...';
    return;
  }

  if (!hash()) {
    return;
  }

  let range = `${sheet.name}`
  range += '!' + (sheet.hasOwnProperty('range') ? `${sheet.range}` : 'A:A');

  return fetch(`/api/sheets/?range=${range}`).then(function (response) {
    return response.json();
  })
    .then(function (content) {
      if (!hash()) {
        return;
      }
      originalArray = array = content;
      write();
    })
    .catch(function (err) {
      question.innerHTML = 'Unfortunately an error occurred...';
      console.log(err);
    });
}

function humanTime(time) {
  if (time < 0) {
    return '∞';
  }

  if (time < 60) {
    return `${time} s`;
  }

  const min = Math.floor(time / 60);
  const sec = time - (60 * min);
  const secHuman = sec !== 0 ? humanTime(sec) : '';

  return `${min} min ${secHuman}`;
}

function startTimer() {
  const el = document.querySelector('.timer');
  if (!sheet.hasOwnProperty('time')) {
    el.style.display = 'none';
    return;
  }
  el.style.removeProperty('display');

  const parent = el.parentNode;
  const cloned = el.cloneNode(true);
  parent.replaceChild(cloned, el);

  let read = sheet.time.read * 60;
  let exec = sheet.time.execute * 60;

  cloned.dataset.read = humanTime(read);
  cloned.dataset.execute = humanTime(exec);

  if (sheet.time.execute < 0) {
    exec = 3;
  }

  cloned.style.setProperty('--read', read + 's');
  cloned.style.setProperty('--execute', exec + 's');

  const beetRootCl = cloned.querySelector('.beetroot').classList;
  const clonedCl = cloned.classList;

  clonedCl.remove(...['execute', 'read']);
  beetRootCl.remove(...['shake', 'fade']);

  pause(100).then(() => clonedCl.add('read'));
  pause(read * 1000).then(() => {
    clonedCl.replace('read', 'execute')
    if (sheet.time.execute < 0) {
      beetRootCl.add('fade');
    }
  });
  pause((read + exec) * 1000).then(() => beetRootCl.add('shake'));
}

function write() {
  let text = '';
  if (!array.length) {
    text = 'No groove found...'
    pause(5000).then(() => {
      window.location.hash = '#';
      sub = '';
      makeLinks()
    });
  } else {
    let type = 'standard';
    if (sheet.hasOwnProperty('type')) {
      type = sheet.type;
    }

    switch (type) {
      case 'randomTwo':
        text = pickRandomWords(2);
        break;
      case 'maths':
        text = pickRandom();
        break;
      case 'standard':
      default:
        text = pickText();
        break;
    }

    if (type.includes('no-repeat')) {
      array = array.filter((text, index) => index !== randomQuestionIndex)
      if (!array.length) {
        array = originalArray
      }
    }

    question.className = type;
  }

  startTimer();

  questionContainer.style.opacity = '1';
  question.innerHTML = text;
}

function makeLinks(e) {
  resetToInitialState();

  if (e && e.target) {
    sub = '';
  }

  if (!hash()) {
    if (!sub.length) {
      Object.keys(levels).forEach(i => {
        let box = document.createElement('div');
        box.addEventListener('click', e => {
          sub = e.target.id;
          makeLinks();
        })
        box.innerHTML = `<a id="${i}" class="title">${i}</a>`
        links.append(box)
      });
    } else {
      levels[sub].forEach(function (key) {
        let human = '';
        if (mapping.hasOwnProperty(key) && mapping[key].title) {
          human = mapping[key].title;
        } else {
          human = key.match(/\D+/g).map(i => i.capitalize()).join(' ');
        }

        let copy = document.createElement('span');

        let box = document.createElement('div');
        box.innerHTML = `<a href="#${key}" class="title">${human}</a>`;

        box.append(copy);
        links.append(box)
      });

    }

    links.style.display = 'flex';
  }
}

function resetToInitialState() {
  questionContainer.className = 'home';
  question.innerText = initialTitle;
  links.innerHTML = '';

  if (!hash()) {
    reloadButton.classList.remove('active')
  }
}

function hash() {
  const hash = window.location.hash.replace(/^#/, '');
  return !!hash.length && hash;
}

function isHash(value) {
  return hash() === value;
}

function pickRandom() {
  const wordCount = array.length;
  const index = Math.floor(Math.random() * wordCount);
  return array[index];
}

function pickRandomWords(words) {
  const wordCount = array.length;
  let indexes = [];
  for (let i = 0; words > i; i++) {
    indexes.push(Math.floor(Math.random() * wordCount));
  }
  return indexes.map(i => array[i]).join('<span class="words beetroot"></span>');
}

function pickText() {
  if (!hash()) {
    return;
  }

  const topics = array.filter(t => t.length && t.toUpperCase() === t);
  const questions = array.diff(topics);
  randomQuestionIndex = Math.floor(Math.random() * questions.length)

  let pickedLine = questions[randomQuestionIndex];
  if (isHash('dialogue9')) {
    pickedLine = pickedLine.replace(/\s\u2022\s/g, "\n- ");
  }

  if (topics.length) {
    const lookupPart = array.slice(0, array.indexOf(pickedLine)).reverse();
    const topicIndex = lookupPart.findIndex(isTopicName);
    const topic = lookupPart[topicIndex];

    pickedLine = `**${topic.trim()}**<br>${pickedLine.trim()}`;
  }

  pickedLine += '<div class="breathe"></div>'

  return converter.makeHtml(pickedLine);
}


const makeCancelable = promise => {
  let rejectFn;

  const wrappedPromise = new Promise((resolve, reject) => {
    rejectFn = reject;

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject);
  });

  wrappedPromise.cancel = () => {
    rejectFn({ canceled: true });
  };

  return wrappedPromise;
};

const pause = time => new Promise(resolve => setTimeout(resolve, time))
const debounce = (f, interval) => {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(
        () => resolve(f(...args)),
        interval,
      );
    });
  };
}
const isTopicName = t => t.toUpperCase() === t;

function updateGA() {
  gtag('config', 'UA-164652199-3', {
    'page_path': location.pathname + location.search + location.hash
  })
}

// Events
if (hash()) {
  fetchClass();
} else {
  makeLinks();
}
window.addEventListener("hashchange", updateGA);
window.addEventListener("hashchange", fetchClass);
home.addEventListener("click", makeLinks, false);
reloadButton.addEventListener('click', reload);
support.addEventListener('click', (el) => {
  el.target.classList.add('expand')
  pause(7.5 * 1000).then(() => el.target.classList.remove('expand'))
});
