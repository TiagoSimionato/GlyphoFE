const codeInput      = document.querySelector('.codeInput');
const codeBox        = document.querySelector('.codeBox');
const lineCounter    = document.querySelector('.lineCounter');
const playButton     = document.querySelector('.playButton');
const consoleElement = document.querySelector('.console');
const consoleContent = document.querySelector('.consoleContent');
const consoleClose   = document.querySelector('.consoleClose');
const sourceCode     = localStorage.getItem('sourceCode') || '';
let consoleOpen      = JSON.parse(localStorage.getItem('consoleOpen')).value || false;
let lineCount = 1

loadSourceCode();
fixLines();
if (consoleOpen) {
  openConsole();
}

//Cada alteração que o usuário fizer no código, ajusto a contagem de linhas e guardo o código fonte no navegador
codeInput.addEventListener("keydown", event => {
  if (event.keyCode === 13) { //Enter
    appendLine();
  }
  storeSourceCode();
});

codeInput.addEventListener("keyup", event => {
  if (event.keyCode === 8) { //Backspace
    fixLines();
  }
  storeSourceCode();
});

//Ao clicar no botão de play, será enviado o código fonte para compilação e o console do editor mostrará os resultados
playButton.addEventListener("click", async function(event) {  
  //TODO FECTH
  consoleContent.innerHTML = 'Loading';
  try {
    const response = await fetch("http://glyphobe-production.up.railway.app:8080/compile", {
      method: 'GET',
      mode: 'cors',
      cache: "no-cache",
      credentials: 'omit',
      headers: {
        "Content-Type": "application/json",
        "code": JSON.stringify(codeInput.value),
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    })
    .then(response => response.json())

    consoleContent.innerHTML = response.result.replace(/[\n]/g, "<br>")
      + '<br>'
      + response.targetCode.replace(/[\n]/g, "<br>");
    openConsole();
    console.log(response);
  } catch (error) {
    consoleContent.innerHTML = "Unable to fetch compilation. " + error;
    openConsole();
    console.log(error);
  }
});

consoleClose.addEventListener("click", (event) => {
  closeConsole();
});

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

function loadSourceCode() {
  if (sourceCode) {
    codeInput.value = sourceCode;
  }
}

function storeSourceCode() {
  const code = codeInput.value;
  localStorage.setItem('sourceCode', code);
}

function openConsole() {
  consoleElement.style.display = "block";
  consoleOpen = true;
  localStorage.setItem('consoleOpen', JSON.stringify({'value': true}));
}

function closeConsole() {
  consoleElement.style.display = "none";
  consoleOpen = false;
  localStorage.setItem('consoleOpen', JSON.stringify({'value': false}));
}