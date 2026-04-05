/**
 * Hybrid Editor Component
 * Supports both WYSIWYG and Markdown editing with conversion between formats
 */
export class HybridEditor {
  /**
   * @param {HTMLElement} container - Container element for the editor
   * @param {Object} options - Editor configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableMarkdownPreview: options.enableMarkdownPreview ?? true,
      enableWysiwyg: options.enableWysiwyg ?? true,
      enableCommonMark: options.enableCommonMark ?? true,
      ...options
    };
    
    this.currentMode = 'wysiwyg'; // wysiwyg or markdown
    this.init();
  }
  
  init() {
    this.createToolbar();
    this.createEditorArea();
    this.setupEventListeners();
  }
  
  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'editor-toolbar';
    
    // Mode toggle button
    if (this.options.enableMarkdownPreview) {
      const modeToggle = document.createElement('button');
      modeToggle.type = 'button';
      modeToggle.textContent = 'Switch to Markdown';
      modeToggle.addEventListener('click', () => this.toggleMode());
      this.modeToggleBtn = modeToggle;
      this.toolbar.appendChild(modeToggle);
    }
    
    // Formatting buttons for WYSIWYG mode
    if (this.options.enableWysiwyg) {
      const formattingButtons = [
        { cmd: 'bold', label: 'B', title: 'Bold' },
        { cmd: 'italic', label: 'I', title: 'Italic' },
        { cmd: 'underline', label: 'U', title: 'Underline' },
        { cmd: 'insertUnorderedList', label: '• List', title: 'Bullet List' },
        { cmd: 'insertOrderedList', label: '1.', title: 'Numbered List' },
        { cmd: 'formatBlock', label: 'H', title: 'Heading', value: 'h2' },
        { cmd: 'createLink', label: '🔗', title: 'Insert Link' }
      ];
      
      formattingButtons.forEach(btn => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = btn.label;
        button.title = btn.title;
        button.dataset.cmd = btn.cmd;
        if (btn.value) button.dataset.value = btn.value;
        
        button.addEventListener('click', () => this.executeCommand(btn.cmd, btn.value));
        this.toolbar.appendChild(button);
      });
    }
    
    this.container.appendChild(this.toolbar);
  }
  
  createEditorArea() {
    this.editorWrapper = document.createElement('div');
    this.editorWrapper.className = 'editor-wrapper';
    
    // WYSIWYG editor
    this.wysiwygEditor = document.createElement('div');
    this.wysiwygEditor.contentEditable = true;
    this.wysiwygEditor.className = 'wysiwyg-editor';
    this.wysiwygEditor.placeholder = 'Start writing...';
    
    // Markdown editor
    this.markdownEditor = document.createElement('textarea');
    this.markdownEditor.className = 'markdown-editor';
    this.markdownEditor.placeholder = 'Write in Markdown...';
    
    // Preview pane (when in markdown mode)
    this.previewPane = document.createElement('div');
    this.previewPane.className = 'preview-pane';
    
    this.editorWrapper.appendChild(this.wysiwygEditor);
    this.editorWrapper.appendChild(this.markdownEditor);
    this.editorWrapper.appendChild(this.previewPane);
    
    this.container.appendChild(this.editorWrapper);
    
    // Initially show wysiwyg editor
    this.switchToWysiwyg();
  }
  
  setupEventListeners() {
    // Listen for input events in both editors
    this.wysiwygEditor.addEventListener('input', () => {
      if (this.currentMode === 'wysiwyg') {
        this.convertToMarkdown();
      }
    });
    
    this.markdownEditor.addEventListener('input', () => {
      if (this.currentMode === 'markdown') {
        this.convertToWysiwyg();
      }
    });
    
    // Listen for key events to handle shortcuts
    this.wysiwygEditor.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.markdownEditor.addEventListener('keydown', (e) => this.handleKeyDown(e, 'markdown'));
  }
  
  handleKeyDown(event, editorType = 'wysiwyg') {
    // Common shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          if (editorType === 'wysiwyg') {
            event.preventDefault();
            this.executeCommand('bold');
          }
          break;
        case 'i':
          if (editorType === 'wysiwyg') {
            event.preventDefault();
            this.executeCommand('italic');
          }
          break;
        case 'u':
          if (editorType === 'wysiwyg') {
            event.preventDefault();
            this.executeCommand('underline');
          }
          break;
        case 'h':
          if (editorType === 'wysiwyg') {
            event.preventDefault();
            this.executeCommand('formatBlock', 'h2');
          }
          break;
      }
    }
  }
  
  executeCommand(command, value = null) {
    document.execCommand(command, false, value);
    this.wysiwygEditor.focus();
  }
  
  toggleMode() {
    if (this.currentMode === 'wysiwyg') {
      this.switchToMarkdown();
    } else {
      this.switchToWysiwyg();
    }
  }
  
  switchToWysiwyg() {
    this.currentMode = 'wysiwyg';
    this.wysiwygEditor.style.display = 'block';
    this.markdownEditor.style.display = 'none';
    this.previewPane.style.display = 'none';
    
    if (this.modeToggleBtn) {
      this.modeToggleBtn.textContent = 'Switch to Markdown';
    }
    
    // Convert markdown content to wysiwyg if needed
    if (this.markdownEditor.value) {
      this.convertToWysiwyg();
    }
    
    this.wysiwygEditor.focus();
  }
  
  switchToMarkdown() {
    this.currentMode = 'markdown';
    this.wysiwygEditor.style.display = 'none';
    this.markdownEditor.style.display = 'block';
    this.previewPane.style.display = this.options.enableMarkdownPreview ? 'block' : 'none';
    
    if (this.modeToggleBtn) {
      this.modeToggleBtn.textContent = 'Switch to WYSIWYG';
    }
    
    // Convert wysiwyg content to markdown if needed
    if (this.wysiwygEditor.innerHTML) {
      this.convertToMarkdown();
    }
    
    this.markdownEditor.focus();
  }
  
  convertToMarkdown() {
    // Simplified conversion from HTML to Markdown
    // In a real implementation, we'd use a proper library like Turndown
    let html = this.wysiwygEditor.innerHTML;
    
    // Basic replacements
    html = html.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    html = html.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    html = html.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    html = html.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    html = html.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>'); // Underline doesn't have MD equivalent
    html = html.replace(/<h1>(.*?)<\/h1>/gi, '# $1');
    html = html.replace(/<h2>(.*?)<\/h2>/gi, '## $1');
    html = html.replace(/<h3>(.*?)<\/h3>/gi, '### $1');
    html = html.replace(/<ul>(.*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li>(.*?)<\/li>/g, '- $1');
    });
    html = html.replace(/<ol>(.*?)<\/ol>/gi, (match, content) => {
      return content.replace(/<li>(.*?)<\/li>/g, (m, item, idx) => {
        // Would need to track index properly in real implementation
        return `1. ${item}`;
      });
    });
    html = html.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    html = html.replace(/<(.*?)>/g, ''); // Remove any remaining tags
    
    this.markdownEditor.value = html.trim();
    
    // Update preview pane if enabled
    if (this.options.enableMarkdownPreview) {
      this.previewPane.innerHTML = this.renderMarkdown(html);
    }
  }
  
  convertToWysiwyg() {
    // Simplified conversion from Markdown to HTML
    // In a real implementation, we'd use a proper library like Marked
    let md = this.markdownEditor.value;
    
    // Basic replacements
    md = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.*?)\*/g, '<em>$1</em>');
    md = md.replace(/__(.*?)__/g, '<u>$1</u>');
    md = md.replace(/##### (.*?)(\n|$)/g, '<h5>$1</h5>');
    md = md.replace(/#### (.*?)(\n|$)/g, '<h4>$1</h4>');
    md = md.replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>');
    md = md.replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>');
    md = md.replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>');
    md = md.replace(/- (.*?)(\n|$)/g, '<li>$1</li>');
    md = md.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    md = md.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    md = md.replace(/\n\n/g, '</p><p>');
    md = md.replace(/\n/g, '<br>');
    
    // Wrap paragraphs
    if (!md.startsWith('<')) {
      md = `<p>${md}</p>`;
    }
    
    this.wysiwygEditor.innerHTML = md;
  }
  
  renderMarkdown(md) {
    // Simplified markdown rendering
    // In a real implementation, we'd use a proper library like Marked
    let html = md;
    
    // Basic replacements
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');
    html = html.replace(/##### (.*?)(\n|$)/g, '<h5>$1</h5>$2');
    html = html.replace(/#### (.*?)(\n|$)/g, '<h4>$1</h4>$2');
    html = html.replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>$2');
    html = html.replace(/## (.*?)(\n|$)/g, '<h2>$2</h2>$3'); // Fixed to capture properly
    html = html.replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>$2');
    html = html.replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>$2');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap paragraphs
    if (!html.startsWith('<') && html.trim()) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  }
  
  getContent() {
    if (this.currentMode === 'wysiwyg') {
      return {
        html: this.wysiwygEditor.innerHTML,
        text: this.wysiwygEditor.innerText
      };
    } else {
      return {
        html: this.previewPane.innerHTML,
        text: this.markdownEditor.value
      };
    }
  }
  
  setContent(content) {
    if (typeof content === 'string') {
      // Assume it's markdown/html content
      this.markdownEditor.value = content;
      this.wysiwygEditor.innerHTML = this.renderMarkdown(content);
    } else if (content.html) {
      // If it's an object with HTML content
      this.wysiwygEditor.innerHTML = content.html;
      // Convert HTML to markdown representation
      let html = content.html;
      html = html.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
      html = html.replace(/<b>(.*?)<\/b>/gi, '**$1**');
      html = html.replace(/<em>(.*?)<\/em>/gi, '*$1*');
      html = html.replace(/<i>(.*?)<\/i>/gi, '*$1*');
      html = html.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n');
      html = html.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n');
      html = html.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n');
      html = html.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
      html = html.replace(/<br\s*\/?>/gi, '\n');
      html = html.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
      html = html.replace(/<(.*?)>/g, '');
      
      this.markdownEditor.value = html.trim();
    }
    
    if (this.options.enableMarkdownPreview) {
      this.previewPane.innerHTML = this.renderMarkdown(this.markdownEditor.value);
    }
  }
}