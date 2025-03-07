const body           = document.querySelector('#body');
const codeInput      = document.querySelector('.codeInput');
const codeBox        = document.querySelector('.codeBox');
const lineCounter    = document.querySelector('.lineCounter');
const playButton     = document.querySelector('.playButton');
const langButton     = document.querySelector('.langButton');
const consoleElement = document.querySelector('.console');
const consoleContent = document.querySelector('.consoleContent');
const consoleClose   = document.querySelector('.consoleClose');
const sourceCode     = loadResource('sourceCode')  || '';
const consoleOpen    = loadResource('consoleOpen') || false;
let fetchURL         = "https://glyphobe.onrender.com/compile";
let lineCount        = 1;
let targetLang       = 'js';
let userTyping       = {};

/**SYNTAX HIGHLIGH PURPOSES */
const tokenObjList = {
  tokenModels: [
    {
      TOKENS: ["programa", "fimprog"],
      tokenClass: "minprog"
    },
    {
      TOKENS: ["INTEIRO", "REAL", "BOOLEANO"],
      tokenClass: "dataType"
    },
    {
      TOKENS: ["declare", "leia", "escreva", "se", "entao", "ou se", "senao", "enquanto"],
      tokenClass: "reservedWords"
    },
    {
      TOKENS: ["[0-9]+(\\.[0-9]+R?)?", "[0-9]+(\\.[0-9]+)?R"],
      tokenClass: "numberLiteral"
    },
    {
      TOKENS: ["VERDADEIRO", "FALSO"],
      tokenClass: "booleanLiteral"
    },
    {
      TOKENS: [`"[a-zA-Z0-9 \\t!-]*"`],
      tokenClass: "textLiteral"
    }
  ],
};

/************************************************************************
 ************************************************************************
 * MAIN
 ************************************************************************
************************************************************************/
loadSourceCode();
loadTargetLang();
fixLines();
highlight(tokenObjList, codeInput);
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
  if (!userTyping[event.keyCode]) userTyping[event.keyCode] = true;
  storeResource('sourceCode', codeInput.innerHTML);
});

codeInput.addEventListener("keyup", event => {
  if (event.keyCode === 8) { //Backspace
    fixLines();
  }

  delete userTyping[event.keyCode];


  const keyBoolean = (event.keyCode < 37 || event.keyCode > 40) && event.keyCode !== 13; //Setas do teclado e Enter
  //Highligh só é aplicado se o user não está digitando e digitou uma tecla válida
  if (Object.keys(userTyping).length === 0 && keyBoolean) highlight(tokenObjList, codeInput);

  storeResource('sourceCode', codeInput.innerHTML);
});

//Ao clicar no botão de play, será enviado o código fonte para compilação e o console do editor mostrará os resultados
playButton.addEventListener("click", async function(event) {  
  consoleContent.innerHTML = 'Loading';

  const code = codeInput.innerText
    .replace(/ /gm, " ") //Por algum motivo innerText tras esse espaço estranho
  ;

  try {
    //Fetch que manda o programa que está salvo no browser para o back end, que retorna para o front o status da compilação e o código
    const response = await fetch(fetchURL, {
      method: 'GET',
      mode: 'cors',
      cache: "no-cache",
      credentials: 'omit',
      headers: {
        "Content-Type": "application/json",
        "code": JSON.stringify(code),
        "targetLang": JSON.stringify(targetLang),
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    })
    .then(response => response.json())

    //É necessário substituir os espacos e as quebra de linha para que seja exibido corretamente a resposta
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
      fetchURL = "https://glyphobe.onrender.com/compile";
    } else {
      fetchURL = "http://localhost:8080/compile";
    }
    console.log(fetchURL);
  }
  if (event.keyCode === 106) { //numpad *
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

//É necessário adicionar ou remover elementos do flex com a contagem de linhas conforme o usuário vai editando
function fixLines() {
  //input é salvo com div para separar as linhas
  const codeString = codeInput.innerHTML.replace(/<div>/g, '\n');

  var lines = 1;
  for (let i = 0; codeString.charAt(i) === '\n' ; i++) lines--; //Para não contar linha a mais

  //Conto quantas quebras de linha há no código fonte
  for (var i = 0; i < codeString.length; i++) {
    if (codeString[i] == '\n') {
      lines++;
    };
  }

  //Ajusto o numero de linhas 
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

//Crio um item na minha listagem com a quantidade de linhas e adiciono no flex com a contagem de linhas
function appendLine() {
  lineCount++;
  var li = document.createElement("li");
  li.innerHTML = lineCount;
  li.id = 'li' + lineCount;
  lineCounter.appendChild(li);
}

//Muda a linguagem alvo que será solicitada para o compilador no servidor
function changeLanguage(lang) {
  const langSelected = document.querySelector('#langSelected');
  const langText     = document.querySelector('#' + lang);
  langSelected.innerText = langText.innerText;
  targetLang = lang;
  storeResource('targetLang', targetLang);
}

function loadResource(resourceName) {
  const resource = localStorage.getItem(resourceName);
  if (resource === "undefined") {
    return "";
  }
  else {
    return JSON.parse(resource);
  }
}

function storeResource(resourceName, value) {
  localStorage.setItem(resourceName, JSON.stringify(value));
}

function loadSourceCode() {
  if (sourceCode) {
    codeInput.innerHTML = sourceCode;
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

/**NOME DAS CLASSES NAO PODE SER IGUAL A NENHUM TOKEN */
//Aplica o highight no código do elemento passado como parametro de acordo com os tokens definidos no primeiro objeto
function highlight(tokenObjList, codeHolder) {
  let codeString = codeHolder.innerHTML;

  const caretPos = getCaretPosition(codeHolder);

  codeString = decolor(codeString);

  tokenObjList.tokenModels.forEach((model) => {
    codeString = color(codeString, model.TOKENS, model.tokenClass);
  });

  codeHolder.innerHTML = codeString;
  setCaretPositon(caretPos, codeHolder);
}

//Utiliza a regex para trocar matches de tokens no código fonte
function color(code, TOKENLIST, tokenClass) {
  TOKENLIST.forEach((token) => {
    //pequeno hardcode para algumas classes de token especificas serem aceitas com alguns caracteres a mais, i.e. escreva()
    //porem sem colorir o parenteses!!
    const parenthesis1 = (
      tokenClass === "reservedWords"  |
      tokenClass === "numberLiteral"  |
      tokenClass === "booleanLiteral" |
      tokenClass === "textLiteral"
    ) ? '(?=\\()|' : '' ;
    const parenthesis2 = (
      tokenClass === "reservedWords"  |
      tokenClass === "numberLiteral"  |
      tokenClass === "booleanLiteral" |
      tokenClass === "textLiteral"
    ) ? '(?=\\))|' : '' ;
    const dotcomma = (
      tokenClass === "minprog"        |
      tokenClass === "numberLiteral"  |
      tokenClass === "booleanLiteral"
    ) ? '(?=[\\.\\,])|' : '' ;
    const empty = (
      tokenClass === "minprog"
    ) ? '(?=)|(?=<div>)|' : '' ;

    re = new RegExp(`(${parenthesis1.replace("?", "?<") + empty.replace("?", "?<")}(?<=\\s)|(?<=<div>)|(?<=&nbsp;))(${token})(${parenthesis1 + parenthesis2 + dotcomma + empty}(?=\\s)|(?=<\\/div>)|(?=&nbsp;))`, "gm");
    code = code.replace(re, `<span class="${tokenClass}">$2</span>`);
  });
  return code;
}

//Simplesmente remove todas as marcações de span do código fonte para que fiquem sem cores personalizadas
function decolor(code) {
  //Regex para limpar o código. As vezes quando código é colado de outro lugar na div, os navegadores colocam divs com estilo ou tags de font que devem ser limpadas nesse momento
  const re = new RegExp("(<span[^>]*>|<\\/span>)", "gm");
  const font = new RegExp("(<font[^>]*>|<\\/font>)", "gm");
  const divStyle = new RegExp("<div[^>]+>", "gm");
  return code.replace(divStyle, '<div>').replace(font, '').replace(re, '');
}

//Encontra a posição do 'cursor de texto' no código fonte
function getCaretPosition(element) {
  var selection = window.getSelection(),
    charCount = -1,
    node
  ;

  if (selection.focusNode) {
    if (isChild(selection.focusNode, element)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node === element) break;

        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
        }
      }
    }
  }
  return charCount;
}

//Ajusta a posição do caret, necessário após ser feito o highlight pois o caret volta ao começo do código
function setCaretPositon(chars, element) {
  if (chars >= 0) {
    var selection = window.getSelection();

    let range = createRange(element, { count: chars });

    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange()
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (var i = 0; i <= node.childNodes.length; i++) {
        range = createRange(node.childNodes[i], chars, range);

        if (chars.count === 0) break;
      }
    }
  }

  return range;
}

function isChild(node, parentElement) {
  while (node !== null) {
      if (node === parentElement) {
          return true;
      }
      node = node.parentNode;
  }

  return false;
}
