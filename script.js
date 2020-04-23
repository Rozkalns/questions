const converter = new showdown.Converter();
const reloadButton = document.querySelector( '.reload' );
const reloadSvg = document.querySelector( 'svg' );
const question = document.getElementById('question');

const mapping = {
  'interview12': 165972876, // grade 12, 10/60
  'monologue12': 606603779, // grade 12 120/300
  'dialogue9': 361983600, // grade 9 60/420
  'interview9': 1311882750, // grade 10/60
  //'D': 730899168
}

// https://questions-lake.now.sh/#interview12 = https://ej.uz/g4et
// https://questions-lake.now.sh/#monologue12 = https://ej.uz/i5gp
// https://questions-lake.now.sh/#dialogue9 = https://ej.uz/pzzm
// https://questions-lake.now.sh/#interview9 = https://ej.uz/y2ex

let array = [];

var rotation = 0;
var palettes = [
  "#B3CC57",
  "#ECF081",
  "#FFBE40",
  "#EF746F",
  "#AB3E5B"
]
var currentPalette = 0;

// Functions

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

String.prototype.unquoted = function () {
  return this.replace (/(^")|("$)/g, '');
}

function reload() {
  reloadClick();
  pause(200).then(write);
}

function reloadClick() {

  reloadEnabled = false;
  rotation -= 180;
  
  // Eh, this works.
  reloadSvg.style.webkitTransform = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.MozTransform  = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  reloadSvg.style.transform  = 'translateZ(0px) rotateZ( ' + rotation + 'deg )';
  
  currentPalette = currentPalette + 1;
  currentPalette = currentPalette % palettes.length;
  document.body.style.background = palettes[currentPalette];
  
  question.style.opacity = 0;
}

function fetchItem(id) {
  if (id === null || id === undefined) {
    question.innerHTML = 'Izvēlies klasi...';
    return;
  }
    
  let url = `https://docs.google.com/spreadsheets/d/1C8wqEI2iXL50fE3CwU5VDS_FZbvOeFy8UwQuhKD7jaQ/export?exportFormat=csv&single=true&gid=${id}`;
  
  fetch(url).then(function(response){
      return response.text();
    })
    .then(function(text){
      if (!text.length) {
        write();
        return;
      }
      array = text.match(/[^\r\n]+/g);
      write();
    })
    .catch(function(err){
      console.log(err);  
    });
}

function write()
{
  let text = '';
  if (!array.length) {
    text = 'te nekā nav...'
  } else {
    text = pickText(); 
  }
  
  question.style.opacity = 1;
  question.innerHTML = text;
}

function hash() {
  return window.location.hash.replace(/^#/, '');
}

function qs(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param)
}

function pickText() { 
  const topics = array.filter(t => t.length && t.toUpperCase() === t);
  const questions = array.diff(topics);
  const randomQuestionIndex =  Math.floor(Math.random() * questions.length)
  
  let pickedLine = questions[randomQuestionIndex].unquoted();
  if (pickedLesson === 'dialogue9') {
    pickedLine = pickedLine.replace(/\s\u2022\s/g, "\n- ");
  }
  
  if (topics.length) {
    const lookupPart = array.slice(0,array.indexOf(pickedLine)).reverse();
    const topicIndex = lookupPart.findIndex(isTopicName);
    const topic = lookupPart[topicIndex];

    pickedLine =  `**${topic}**<br>${pickedLine}`;
  }

  return converter.makeHtml(pickedLine);
}

const pause = time => new Promise(resolve => setTimeout(resolve, time))
const isTopicName = t => t.toUpperCase() === t;

let pickedLesson = hash() || 'interview12';
question.classList.add(pickedLesson);
fetchItem(mapping[pickedLesson]);

// Events
reloadButton.addEventListener('click', reload);

// Show button.
setTimeout(function() {
  reloadButton.classList.add('active');
}, 1);
