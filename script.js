const converter = new showdown.Converter();
const reloadButton = document.querySelector( '.reload' );
const reloadSvg = document.querySelector( 'svg' );
const question = document.getElementById('question');
const support = document.querySelector('.support .btn');
const links = document.querySelector('.links');
const home = document.querySelector('.home');

let sub = '';
let lesson = '';
let sheet = {};

const mapping = {
  'interview12': {
    'gid': 165972876
  }, // grade 12, 10/60
  'monologue12': {
    'gid': 606603779
  } , // grade 12 120/300
  'dialogue9': {
    'gid': 361983600
  }, // grade 9 60/420
  'interview9': {
    'gid': 1311882750
  }, // grade 10/60
  'words': {
    'type': 'randomTwo',
    'gid': 1863447477,
    'range': 'A2:A'
  }, // grade 10/60
  'addition': {
    'type': 'maths',
    'gid': 730899168,
    'range': 'G:G'
  }, // grade 10/60
};

const levels = {
  'English B2-C1': [
    'interview12',
    'monologue12',
    'words'
  ],
  'English B1': [
    'dialogue9',
    'interview9',
    'words'
  ]
}

let array = [];
let rotation = 0;

// Functions
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

String.prototype.unquoted = function () {
  return this.replace (/(^")|("$)/g, '');
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

function reload() {
  reloadClick();
  pause(200).then(write);
}

function reloadClick() {
  rotation -= 180;

  reloadSvg.style.webkitTransform = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.MozTransform  = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.transform  = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  
  question.style.opacity = '0';
}

function fetchClass() {
  question.classList.add(lesson = hash() || 'home');
  if (this.className === 'home') {
    lesson = 'home';
  }

  if (Object.keys(mapping).includes(lesson)) {
    question.innerText = '🔭';
    fetchItem(sheet = mapping[lesson]);
    pause(1).then(() => reloadButton.classList.add('active'));

    links.style.display = 'none';
    links.innerHTML = '';
  } else {
    question.innerText = 'English Grooves';
    sub = '';
    makeLinks();
  }
}

function fetchItem(sheet) {
  if (sheet === null || typeof sheet !== 'object') {
    question.innerHTML = 'Izvēlies klasi...';
    return;
  }

  if (!hash().length) {
    return;
  }

  question.classList.toggle('home');

  let url = `https://docs.google.com/spreadsheets/d/1C8wqEI2iXL50fE3CwU5VDS_FZbvOeFy8UwQuhKD7jaQ/export?exportFormat=csv&single=true`;
  url += sheet.hasOwnProperty('gid') ? `&gid=${sheet.gid}` : '';
  url += sheet.hasOwnProperty('range') ? `&range=${sheet.range}` : '';

  fetch(url).then(function(response){
      return response.text();
    })
    .then(function(text){
      array = text.match(/[^\r\n]+/g).map(t => t.unquoted());
      write();
    })
    .catch(function(err){
      console.log(err);  
    });
}

function write() {
  let text = '';
  if (!array.length) {
    text = 'No groove found...'
  } else {
    let type = 'standard';
    if (sheet.hasOwnProperty('type')) {
      type = sheet.type;
    }

    switch(type) {
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
  }
  
  question.style.opacity = '1';
  question.innerHTML = text;
}

function makeLinks() {
  resetToInitialState();

  if (!hash()) {
    if (!sub.length) {
      ['English B2-C1', 'English B1'].forEach(i => {
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
        const human = key.match(/\D+/g).map(i => i.capitalize()).join(' ');
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
  links.innerHTML = '';
  question.className = 'home';

  if (!hash()) {
    reloadButton.classList.remove('active')
  }
}

function hash() {
  return window.location.hash.replace(/^#/, '');
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
  return indexes.map(i => array[i]).join('<span class="beetroot"></span>');
}

function pickText() {
  if (!hash()) {
    return;
  }

  const topics = array.filter(t => t.length && t.toUpperCase() === t);
  const questions = array.diff(topics);
  const randomQuestionIndex =  Math.floor(Math.random() * questions.length)
  
  let pickedLine = questions[randomQuestionIndex];
  if (isHash('dialogue9')) {
    pickedLine = pickedLine.replace(/\s\u2022\s/g, "\n- ");
  }

  if (topics.length) {
    const lookupPart = array.slice(0,array.indexOf(pickedLine)).reverse();
    const topicIndex = lookupPart.findIndex(isTopicName);
    const topic = lookupPart[topicIndex];

    pickedLine =  `**${topic.trim()}**<br>${pickedLine.trim()}`;
  }

  pickedLine += '<div class="breathe"></div>'

  return converter.makeHtml(pickedLine);
}

const pause = time => new Promise(resolve => setTimeout(resolve, time))
const isTopicName = t => t.toUpperCase() === t;

function updateGA() {
  gtag('config', 'UA-164652199-3', {
    'page_path': location.pathname + location.search + location.hash
  })
}

// Events
fetchClass();
window.addEventListener("hashchange", updateGA);
window.addEventListener("hashchange", fetchClass);
home.addEventListener("click", fetchClass, false);
reloadButton.addEventListener('click', reload);
support.addEventListener('click', (el) => {
    el.target.classList.add('expand')
    pause(7.5 * 1000).then(() => el.target.classList.remove('expand'))
});
