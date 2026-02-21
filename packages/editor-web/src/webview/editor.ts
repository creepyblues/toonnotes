/**
 * WebView entry script.
 * Creates the TipTap editor inside the WebView and wires the bridge.
 */
import { Editor } from '@tiptap/core';
import { createEditorExtensions } from '../config/extensions';
import { initBridge } from '../bridge/handler';

// Create the editor targeting the #editor div
const editor = new Editor({
  element: document.getElementById('editor')!,
  extensions: createEditorExtensions({ placeholder: 'Start writing...' }),
  content: '',
  editorProps: {
    attributes: {
      class: 'ProseMirror',
    },
  },
});

// Initialize the bridge (starts listening for RN messages, sends editorReady)
initBridge(editor);
