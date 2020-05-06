const converter = new showdown.Converter();
const reloadButton = document.querySelector( '.reload' );
const reloadSvg = document.querySelector( 'svg' );
const question = document.getElementById('question');
const support = document.querySelector('.support .btn');
const links = document.querySelector('.links');
const logo = document.getElementById('logo');

let showEjUz = getCookie('showEjUz');
let lesson = '';
let sheet = {};

const mapping = {
  'interview12': {
    'gid': 165972876,
    'ejuz' : 'vwhe'
  }, // grade 12, 10/60
  'monologue12': {
    'gid': 606603779,
    'ejuz' : 'fpua'
  } , // grade 12 120/300
  'dialogue9': {
    'gid': 361983600,
    'ejuz' : 'rikg'
  }, // grade 9 60/420
  'interview9': {
    'gid': 1311882750,
    'ejuz' : 'net7'
  }, // grade 10/60
  'words': {
    'type': 'randomTwo',
    'gid': 1863447477,
    'range': 'A2:A',
    'ejuz' : '5ugw'
  }, // grade 10/60
};

let array = [];
let rotation = 0;

logo.src = `./assets/logo-${getRandomInt(0, 3)}.png`;
logo.style.opacity = '1';

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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
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
  if (Object.keys(mapping).includes(hash())) {
    pause(1).then(() => reloadButton.classList.add('active'));

    question.innerText = '🔭';
    question.classList.add(lesson = hash() || 'home');
    fetchItem(sheet = mapping[lesson]);

    links.style.display = 'none';
    links.innerHTML = '';
  } else {
    question.innerText = 'Kabatas';
    makeLinks();
  }
}

function fetchItem(sheet) {
  if (sheet === null || typeof sheet !== 'object') {
    question.innerHTML = 'Izvēlies klasi...';
    return;
  }

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
    text = 'te nekā nav...'
  } else {
    let type = 'standard';
    if (sheet.hasOwnProperty('type')) {
      type = sheet.type;
    }

    switch(type) {
      case 'randomTwo':
        text = pickRandomWords(2);
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
    Object.keys(mapping).forEach(function (key) {
      const item = mapping[key];
      const human = key.match(/\d+|\D+/g).map(i => i.capitalize()).join(' ');
      const short = showEjUz && item.ejuz && `https://ej.uz/${item.ejuz}`;

      let copy = document.createElement('span');
      if (short) {
        copy.innerText = '🔗';
        copy.classList.add('copy');

        copy.addEventListener('click', (e) => {
          copyToClipboard(short)
          successCopy(e.target);
        });
      }

      let box = document.createElement('div');
      box.innerHTML = `
        <a href="#${key}" class="title">${human}</a><br>
        ${short || ''} 
      `

      box.append(copy);
      links.append(box)
    });

    links.style.display = 'block';
  }
}

function resetToInitialState() {
  links.innerHTML = '';
  question.className = '';

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

  if (pickedLine.length > 700) {
    pickedLine += '<div class="breathe"></div>'
  }

  return converter.makeHtml(pickedLine);
}

function successCopy(el) {
  let ok = document.createElement('span');
  ok.innerText = "👍 copied";
  ok.style.fontSize = '1em';

  el.after(ok);

  pause(1200).then(() => {
    ok.remove();
  });

}

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

const pause = time => new Promise(resolve => setTimeout(resolve, time))
const isTopicName = t => t.toUpperCase() === t;

// Events
if (isHash('ejuz-on')) {
  updateCookie('showEjUz', true);
  window.location.hash = '#';
}

if (isHash('ejuz-off')) {
  updateCookie('showEjUz', false);
  window.location.hash = '#';
}

fetchClass();
window.addEventListener("hashchange", fetchClass, false);
reloadButton.addEventListener('click', reload);
support.addEventListener('click', (el) => {
    el.target.classList.add('expand')
    pause(7.5 * 1000).then(() => el.target.classList.remove('expand'))
});


// Helpers
function updateCookie(cookie, value) {
  setCookie(cookie,true, value ? 180 : -1);
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
}

function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
