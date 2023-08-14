const body           = document.querySelector('#body');
const codeInput      = document.querySelector('.codeInput');
const codeBox        = document.querySelector('.codeBox');
const lineCounter    = document.querySelector('.lineCounter');
const playButton     = document.querySelector('.playButton');
const langButton     = document.querySelector('.langButton');
const consoleElement = document.querySelector('.console');
const consoleContent = document.querySelector('.consoleContent');
const consoleClose   = document.querySelector('.consoleClose');
const sourceCode     = loadResource('sourceCode') || '';
const consoleOpen    = loadResource('consoleOpen') || false;
let fetchURL         = "https://glyphobe-production.up.railway.app/compile";
let lineCount        = 1;
let targetLang       = 'js';

/************************************************************************
 ************************************************************************
 * MAIN
 ************************************************************************
************************************************************************/

loadSourceCode();
loadTargetLang();
fixLines();
loadResponse();
if (consoleOpen) openConsole();

/************************************************************************
 ************************************************************************
 * EVENT LISTENERS
 ************************************************************************
************************************************************************/

//Cada alteração que o usuário fizer no código, ajusto a contagem de linhas e guardo o código fonte no navegador
codeInput.addEventListener("keydown", event => {
  if (event.keyCode === 13) { //Enter
    appendLine();
  }
  storeResource('sourceCode', codeInput.value);
});

codeInput.addEventListener("keyup", event => {
  if (event.keyCode === 8) { //Backspace
    fixLines();
  }
  storeResource('sourceCode', codeInput.value);
});

//Ao clicar no botão de play, será enviado o código fonte para compilação e o console do editor mostrará os resultados
playButton.addEventListener("click", async function(event) {  
  consoleContent.innerHTML = 'Loading';

  try {
    const response = await fetch(fetchURL, {
      method: 'GET',
      mode: 'cors',
      cache: "no-cache",
      credentials: 'omit',
      headers: {
        "Content-Type": "application/json",
        "code": JSON.stringify(codeInput.value),
        "targetLang": JSON.stringify(targetLang),
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    })
    .then(response => response.json())

    const responseDisplay = response.result //Compilation Status
      .replace(/[\n]/gm, "<br>")
      + '<br>' +
      response.targetCode
      .replace(/[\n]/g, "<br>")
      .replace(/[\s]/gm, "&nbsp;")
    ;
    consoleContent.innerHTML = responseDisplay;
    openConsole();
    storeResource('response', responseDisplay);

    console.log(response);
    console.log(responseDisplay);
  } catch (error) {
    consoleContent.innerHTML = "Unable to fetch compilation. " + error;
    openConsole();
    console.log(error);
  }
});

consoleClose.addEventListener("click", event => {
  closeConsole();
});

//Para propósitos de testes locais
body.addEventListener("keydown", event => {
  if (event.target.className !== "codeInput" && event.keyCode === 110) {
    if (fetchURL.match(/localhost/g)) {
      fetchURL = "https://glyphobe-production.up.railway.app/compile";
    } else {
      fetchURL = "http://localhost:8080/compile";
    }
    console.log(fetchURL);
  }
  if (event.keyCode === 106) {
    if (targetLang === 'js') {
      changeLanguage('java');
    } else if (targetLang === 'java') {
      changeLanguage('py');
    } else {
      changeLanguage('js');
    }
  }
});

langButton.addEventListener("click", event => {
  if (event.target.attributes.value != null) {
    changeLanguage(event.target.attributes.value.value);
  }
});

/************************************************************************
 ************************************************************************
 * FUNCTIONS
 ************************************************************************
************************************************************************/

//É necessário adicionar ou remover elementos do flex conforme o usuário vai editando
function fixLines() {
  const codeString = codeInput.value;

  var lines = 1;
  //Conto quantas quebras de linha há no código fonte
  for (var i = 0; i < codeString.length; i++) {
    if (codeString[i] == '\n') {
      lines++;
    };
  }

  if (lineCount > lines) {
    for (var i = lineCount; i > lines; i--) {
      const extraCounter = document.querySelector('#li' + i);
      lineCounter.removeChild(extraCounter);
    }
  } else if (lines > lineCount) {
    for (var i = lineCount; i < lines; i++) {
      appendLine();
    }
  }
  lineCount = lines;
}

//Crio um item na minha listagem com a quantidade de linhas e adiciono no flex
function appendLine() {
  lineCount++;
  var li = document.createElement("li");
  li.innerHTML = lineCount;
  li.id = 'li' + lineCount;
  lineCounter.appendChild(li);
}

function changeLanguage(lang) {
  const langSelected = document.querySelector('#langSelected');
  const langText     = document.querySelector('#' + lang);
  langSelected.innerText = langText.innerText;
  targetLang = lang;
  storeResource('targetLang', targetLang);
}

function loadResource(resourceName) {
  return JSON.parse(localStorage.getItem(resourceName));
}

function storeResource(resourceName, value) {
  localStorage.setItem(resourceName, JSON.stringify(value));
}

function loadSourceCode() {
  if (sourceCode) {
    codeInput.value = sourceCode;
  }
}

function loadTargetLang() {
  targetLang = loadResource('targetLang');
  const selectedLang = document.querySelector('#langSelected');
  const langItem = document.querySelector('#' + targetLang);
  if (selectedLang && langItem) {
    selectedLang.innerText = langItem.innerText;
  }
}

function loadResponse() {
  const response = loadResource('response');
  if (response) {
    consoleContent.innerHTML = response;
  }
}

function openConsole() {
  consoleElement.style.display = "block";
  localStorage.setItem('consoleOpen', true);
}

function closeConsole() {
  consoleElement.style.display = "none";
  localStorage.setItem('consoleOpen', false);
}
