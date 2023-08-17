export class Cursor {
  static getCaretPosition(element) {
    var selection = window.getSelection(),
      charCount = -1,
      node;
  
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
            if (node === null) break;
          }
        }
      }
    }
  
    return charCount;
  }
  
  static setCaretPositon(chars, element) {
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
  
  static createRange(node, chars, range) {
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
        for (var lp = 0; lp < node.childNodes.length; lp++) {
          range = createRange(node.childNodes[lp], chars, range);
  
          if (chars.count === 0) break;
        }
      }
    }
  
    return range;
  }
  
  static isChild(node, parentElement) {
    while (node !== null) {
        if (node === parentElement) {
            return true;
        }
        node = node.parentNode;
    }
  
    return false;
  }
}
