/**
 * WebView-side bridge handler.
 * Runs inside the WebView, wiring TipTap editor events to RN messages
 * and dispatching incoming RN messages to editor commands.
 */
import type { Editor } from '@tiptap/core';
import type {
  RNToWebViewMessage,
  WebViewToRNMessage,
  ToolbarState,
  FormatType,
} from './types';
import { htmlToPlainText } from '@toonnotes/editor-core';

/** Send a message from WebView to React Native */
function postToRN(message: WebViewToRNMessage): void {
  if ((window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}

/** Get current toolbar state from editor */
function getToolbarState(editor: Editor): ToolbarState {
  return {
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    isUnderline: editor.isActive('underline'),
    isStrike: editor.isActive('strike'),
    isBulletList: editor.isActive('bulletList'),
    isTaskList: editor.isActive('taskList'),
  };
}

/** Apply a format toggle to the editor */
function applyFormat(editor: Editor, format: FormatType): void {
  const chain = editor.chain().focus();

  switch (format) {
    case 'bold':
      chain.toggleBold().run();
      break;
    case 'italic':
      chain.toggleItalic().run();
      break;
    case 'underline':
      chain.toggleUnderline().run();
      break;
    case 'strike':
      chain.toggleStrike().run();
      break;
    case 'bulletList':
      chain.toggleBulletList().run();
      break;
    case 'taskList':
      chain.toggleTaskList().run();
      break;
  }
}

/** Apply theme CSS custom properties */
function applyTheme(theme: {
  backgroundColor: string;
  textColor: string;
  placeholderColor: string;
  accentColor: string;
  fontFamily?: string;
}): void {
  const root = document.documentElement;
  root.style.setProperty('--editor-bg', theme.backgroundColor);
  root.style.setProperty('--editor-text', theme.textColor);
  root.style.setProperty('--editor-placeholder', theme.placeholderColor);
  root.style.setProperty('--editor-accent', theme.accentColor);
  document.body.style.backgroundColor = theme.backgroundColor;

  if (theme.fontFamily) {
    root.style.setProperty('--editor-font', theme.fontFamily);
    const proseMirror = document.querySelector('.ProseMirror') as HTMLElement;
    if (proseMirror) {
      proseMirror.style.fontFamily = theme.fontFamily;
    }
  }
}

/**
 * Initialize the bridge between TipTap editor and React Native.
 * Call this after the editor is created.
 */
export function initBridge(editor: Editor): void {
  // ---- Outgoing: Editor → RN ----

  // Notify RN on content changes
  editor.on('update', () => {
    const html = editor.getHTML();
    const plainText = htmlToPlainText(html);
    const cursorOffset = editor.state.selection.from;

    postToRN({
      type: 'contentChanged',
      html,
      plainText,
      cursorOffset,
    });

    // Also update height
    const editorEl = editor.view.dom;
    if (editorEl) {
      postToRN({ type: 'heightChanged', height: editorEl.scrollHeight });
    }
  });

  // Notify RN on selection/format changes
  editor.on('selectionUpdate', () => {
    postToRN({ type: 'toolbarStateChanged', state: getToolbarState(editor) });
  });

  // Notify RN on focus/blur
  editor.on('focus', () => {
    postToRN({
      type: 'editorStateChanged',
      state: { isFocused: true, isEmpty: editor.isEmpty },
    });
  });

  editor.on('blur', () => {
    postToRN({
      type: 'editorStateChanged',
      state: { isFocused: false, isEmpty: editor.isEmpty },
    });
  });

  // ---- Incoming: RN → Editor ----

  window.addEventListener('message', (event) => {
    let msg: RNToWebViewMessage;
    try {
      msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      return; // Ignore non-JSON messages
    }

    switch (msg.type) {
      case 'setContent':
        editor.commands.setContent(msg.html, { emitUpdate: false });
        // Send back initial toolbar state
        postToRN({ type: 'toolbarStateChanged', state: getToolbarState(editor) });
        // Send height after content set
        requestAnimationFrame(() => {
          const editorEl = editor.view.dom;
          if (editorEl) {
            postToRN({ type: 'heightChanged', height: editorEl.scrollHeight });
          }
        });
        break;

      case 'getContent': {
        const html = editor.getHTML();
        const plainText = htmlToPlainText(html);
        postToRN({
          type: 'contentChanged',
          html,
          plainText,
          cursorOffset: editor.state.selection.from,
        });
        break;
      }

      case 'toggleFormat':
        applyFormat(editor, msg.format);
        break;

      case 'focus':
        editor.commands.focus();
        break;

      case 'blur':
        editor.commands.blur();
        break;

      case 'setTheme':
        applyTheme(msg.theme);
        break;

      case 'insertImage':
        // For now, insert as an image tag (can extend with Image extension later)
        editor
          .chain()
          .focus()
          .insertContent(`<img src="${msg.src}" />`)
          .run();
        break;
    }
  });

  // Signal that the editor is ready
  postToRN({ type: 'editorReady' });
}
