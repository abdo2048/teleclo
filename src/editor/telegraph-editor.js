/**
 * Telegraph-like Editor Component
 * Mimics the design and functionality of telegra.ph editor
 */
export class TelegraphEditor {
  /**
   * @param {HTMLElement} container - Container element for the editor
   * @param {Object} options - Editor configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableRTL: options.enableRTL ?? true,
      enableMarkdown: options.enableMarkdown ?? true,
      enableCommonMark: options.enableCommonMark ?? true,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.createEditor();
    this.setupEventListeners();
    this.addDefaultContent();
  }
  
  createEditor() {
    // Create the main editor container similar to telegra.ph
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'telegraph-editor';
    
    // Create the title input (similar to telegra.ph)
    this.titleInput = document.createElement('input');
    this.titleInput.type = 'text';
    this.titleInput.placeholder = 'Title';
    this.titleInput.className = 'editor-title';
    this.titleInput.maxLength = 100;
    
    // Create the content editor area
    this.contentEditable = document.createElement('div');
    this.contentEditable.contentEditable = true;
    this.contentEditable.className = 'editor-content';
    this.contentEditable.placeholder = 'Write your story...';
    this.contentEditable.setAttribute('spellcheck', 'false');
    
    // Add direction detection for RTL support
    this.contentEditable.addEventListener('input', () => {
      this.detectAndSetDirection();
    });
    
    // Add direction attribute for RTL support
    this.contentEditable.dir = 'auto'; // Auto-detect text direction
    
    this.editorContainer.appendChild(this.titleInput);
    this.editorContainer.appendChild(this.contentEditable);
    
    this.container.appendChild(this.editorContainer);
  }
  
  setupEventListeners() {
    // Handle keyboard shortcuts for formatting
    this.contentEditable.addEventListener('keydown', (e) => {
      // Ctrl+B for bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false, null);
      }
      // Ctrl+I for italic
      else if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false, null);
      }
      // Ctrl+U for underline
      else if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline', false, null);
      }
      // Tab for indentation
      else if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('indent', false, null);
      }
      // Shift+Tab for outdent
      else if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('outdent', false, null);
      }
      
      // Detect text direction changes
      if (['ArrowRight', 'ArrowLeft', 'Backspace', 'Delete'].includes(e.key)) {
        setTimeout(() => this.detectAndSetDirection(), 0);
      }
    });
    
    // Listen for input events to handle markdown-like shortcuts
    this.contentEditable.addEventListener('input', (e) => {
      if (e.inputType === 'insertParagraph') {
        this.handleNewLine();
      } else if (e.inputType === 'insertText') {
        this.handleTextInput(e);
      }
    });
  }
  
  detectAndSetDirection() {
    // Get current selection/cursor position
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent.substring(0, range.startOffset);
      const lastChar = text.charAt(text.length - 1);
      
      // Simple heuristic for RTL detection
      if (this.isRTLCharacter(lastChar)) {
        this.contentEditable.dir = 'rtl';
      } else {
        this.contentEditable.dir = 'ltr';
      }
    }
  }
  
  isRTLCharacter(char) {
    // Check if character is from RTL script
    const rtlPattern = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;
    return rtlPattern.test(char);
  }
  
  handleNewLine() {
    // Get the current paragraph
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const pNode = this.findParentParagraph(range.commonAncestorContainer);
    
    if (pNode) {
      const text = pNode.textContent || '';
      
      // Check for markdown-like shortcuts
      if (text.startsWith('# ') && pNode.tagName !== 'H1') {
        this.formatAsHeader(pNode, 'H1');
      } else if (text.startsWith('## ') && pNode.tagName !== 'H2') {
        this.formatAsHeader(pNode, 'H2');
      } else if (text.startsWith('### ') && pNode.tagName !== 'H3') {
        this.formatAsHeader(pNode, 'H3');
      } else if (text.match(/^\s*\d+\.\s/) && pNode.tagName !== 'LI') {
        this.formatAsOrderedList(pNode);
      } else if (text.match(/^\s*[-*]\s/) && pNode.tagName !== 'LI') {
        this.formatAsUnorderedList(pNode);
      } else if (text.startsWith('> ') && pNode.tagName !== 'BLOCKQUOTE') {
        this.formatAsBlockquote(pNode);
      } else if (text.startsWith('---') || text.startsWith('___')) {
        this.insertHorizontalRule(pNode);
      }
    }
  }
  
  handleTextInput(e) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent.substring(0, range.startOffset);
      const pNode = this.findParentParagraph(textNode);
      
      if (pNode) {
        // Check for bold: **text**
        const boldMatch = text.match(/\*\*(.*?)\*\*$/);
        if (boldMatch && boldMatch[0] === text) {
          this.formatInline(pNode, 'bold', boldMatch[1]);
        }
        
        // Check for italic: *text* or _text_
        const italicMatch = text.match(/(?:\*|_)(.*?)\1$/);
        if (italicMatch && italicMatch[0] === text) {
          this.formatInline(pNode, 'italic', italicMatch[1]);
        }
      }
    }
  }
  
  findParentParagraph(node) {
    let current = node;
    while (current && current !== this.contentEditable) {
      if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV'].includes(current.tagName)) {
        return current;
      }
      current = current.parentNode;
    }
    return this.contentEditable.querySelector('p:last-of-type') || this.contentEditable;
  }
  
  formatAsHeader(pNode, headerTag) {
    const newHeader = document.createElement(headerTag);
    newHeader.innerHTML = pNode.innerHTML.replace(/^#+\s*/, '');
    pNode.parentNode.replaceChild(newHeader, pNode);
  }
  
  formatAsBlockquote(pNode) {
    const blockquote = document.createElement('blockquote');
    blockquote.innerHTML = pNode.innerHTML.replace(/^>\s*/, '');
    pNode.parentNode.replaceChild(blockquote, pNode);
  }
  
  formatAsOrderedList(pNode) {
    // Find or create the parent OL element
    let olElement = pNode.previousSibling;
    if (!olElement || olElement.tagName !== 'OL') {
      olElement = document.createElement('ol');
      pNode.parentNode.insertBefore(olElement, pNode);
    }
    
    const li = document.createElement('li');
    li.innerHTML = pNode.innerHTML.replace(/^\s*\d+\.\s*/, '');
    olElement.appendChild(li);
    pNode.remove();
  }
  
  formatAsUnorderedList(pNode) {
    // Find or create the parent UL element
    let ulElement = pNode.previousSibling;
    if (!ulElement || ulElement.tagName !== 'UL') {
      ulElement = document.createElement('ul');
      pNode.parentNode.insertBefore(ulElement, pNode);
    }
    
    const li = document.createElement('li');
    li.innerHTML = pNode.innerHTML.replace(/^\s*[-*]\s*/, '');
    ulElement.appendChild(li);
    pNode.remove();
  }
  
  insertHorizontalRule(pNode) {
    const hr = document.createElement('hr');
    pNode.parentNode.insertBefore(hr, pNode.nextSibling);
    pNode.innerHTML = '';
  }
  
  formatInline(pNode, format, text) {
    const range = document.createRange();
    range.selectNodeContents(pNode);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (format === 'bold') {
      document.execCommand('bold', false, null);
    } else if (format === 'italic') {
      document.execCommand('italic', false, null);
    }
  }
  
  addDefaultContent() {
    // Add sample content to demonstrate the editor
    this.contentEditable.innerHTML = '<p>Start writing your story here...</p>';
  }
  
  getContent() {
    return {
      title: this.titleInput.value.trim(),
      contentHtml: this.contentEditable.innerHTML,
      contentText: this.contentEditable.innerText
    };
  }
  
  setTitle(title) {
    this.titleInput.value = title || '';
  }
  
  setContent(content) {
    if (typeof content === 'string') {
      this.contentEditable.innerHTML = content;
    } else if (content && content.html) {
      this.contentEditable.innerHTML = content.html;
    } else if (content && content.text) {
      this.contentEditable.innerText = content.text;
    }
  }
  
  setDirection(direction) {
    this.contentEditable.dir = direction || 'auto';
  }
}