const codeInput    = document.querySelector('.codeInput');
const codeBox      = document.querySelector('.codeBox');
const lineCounter  = document.querySelector('.lineCounter');
const playButton   = document.querySelector('.playButton');
const console      = document.querySelector('.console');
const consoleClose = document.querySelector('.consoleClose');
const sourceCode   = localStorage.getItem('sourceCode') || '';
const consoleOpen  = localStorage.getItem('consoleOpen') || false;
var lineCount = 1

loadSourceCode();
fixLines();
if (consoleOpen) {
  openConsole();
}

//Cada alteração que o usuário fizer no código, ajusto a contagem de linhas e guardo o código fonte no navegador
codeInput.addEventListener("keydown", function(event) {
  if (event.keyCode === 13) { //Enter
    appendLine();
  }
  storeSourceCode();
});

codeInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 8) { //Backspace
    fixLines();
  }
  storeSourceCode();
});

//Ao clicar no botão de play, será enviado o código fonte para compilação e o console do editor mostrará os resultados
playButton.addEventListener("click", function(event) {
  openConsole();

  //TODO FECTH
});

consoleClose.addEventListener("click", function(event) {
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
  console.style.display = "block";

  localStorage.setItem('consoleOpen', true);
}

function closeConsole() {
  console.style.display = "none";

  localStorage.setItem('consoleOpen', false);
}