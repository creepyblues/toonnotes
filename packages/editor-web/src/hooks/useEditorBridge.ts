/**
 * React Native hook for communicating with the TipTap WebView editor.
 * Manages message queuing (before editor is ready), state tracking,
 * and provides a clean API for the native side.
 */
import { useRef, useState, useCallback } from 'react';
import type { RefObject } from 'react';
import type {
  RNToWebViewMessage,
  WebViewToRNMessage,
  ToolbarState,
  EditorState,
  FormatType,
  ThemeConfig,
} from '../bridge/types';

// Minimal WebView type to avoid requiring react-native-webview as a dependency
interface WebViewLike {
  injectJavaScript: (script: string) => void;
}

// Matches the event shape from react-native-webview onMessage
interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}

export interface EditorBridgeAPI {
  webViewRef: RefObject<WebViewLike | null>;
  onMessage: (event: WebViewMessageEvent) => void;
  setContent: (html: string) => void;
  getContent: () => void;
  toggleFormat: (format: FormatType) => void;
  setTheme: (theme: ThemeConfig) => void;
  insertImage: (src: string) => void;
  focus: () => void;
  blur: () => void;
  toolbarState: ToolbarState;
  editorState: EditorState;
  isReady: boolean;
}

const DEFAULT_TOOLBAR_STATE: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isBulletList: false,
  isTaskList: false,
};

const DEFAULT_EDITOR_STATE: EditorState = {
  isFocused: false,
  isEmpty: true,
};

export interface UseEditorBridgeOptions {
  onContentChange?: (plainText: string, html: string, cursorOffset: number) => void;
  onEditorReady?: () => void;
  onFocusChange?: (focused: boolean) => void;
  onHeightChange?: (height: number) => void;
}

export function useEditorBridge(options?: UseEditorBridgeOptions): EditorBridgeAPI {
  const webViewRef = useRef<WebViewLike | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [toolbarState, setToolbarState] = useState<ToolbarState>(DEFAULT_TOOLBAR_STATE);
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);

  // Message queue for messages sent before editor is ready
  const messageQueueRef = useRef<RNToWebViewMessage[]>([]);
  // Store callbacks in ref to avoid stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  /** Send a message to the WebView */
  const sendMessage = useCallback((msg: RNToWebViewMessage) => {
    if (!isReady) {
      messageQueueRef.current.push(msg);
      return;
    }

    const webView = webViewRef.current;
    if (webView) {
      const script = `
        window.postMessage(${JSON.stringify(JSON.stringify(msg))}, '*');
        true;
      `;
      webView.injectJavaScript(script);
    }
  }, [isReady]);

  /** Flush queued messages after editor becomes ready */
  const flushQueue = useCallback(() => {
    const queue = messageQueueRef.current;
    messageQueueRef.current = [];

    const webView = webViewRef.current;
    if (!webView) return;

    for (const msg of queue) {
      const script = `
        window.postMessage(${JSON.stringify(JSON.stringify(msg))}, '*');
        true;
      `;
      webView.injectJavaScript(script);
    }
  }, []);

  /** Handle incoming messages from the WebView */
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    let msg: WebViewToRNMessage;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'editorReady':
        setIsReady(true);
        // Flush any queued messages
        // Use setTimeout to ensure state update has propagated
        setTimeout(() => {
          flushQueue();
          optionsRef.current?.onEditorReady?.();
        }, 0);
        break;

      case 'contentChanged':
        optionsRef.current?.onContentChange?.(msg.plainText, msg.html, msg.cursorOffset);
        break;

      case 'toolbarStateChanged':
        setToolbarState(msg.state);
        break;

      case 'editorStateChanged':
        setEditorState(msg.state);
        optionsRef.current?.onFocusChange?.(msg.state.isFocused);
        break;

      case 'heightChanged':
        optionsRef.current?.onHeightChange?.(msg.height);
        break;
    }
  }, [flushQueue]);

  // ---- Public API ----

  const setContent = useCallback((html: string) => {
    sendMessage({ type: 'setContent', html });
  }, [sendMessage]);

  const getContent = useCallback(() => {
    sendMessage({ type: 'getContent' });
  }, [sendMessage]);

  const toggleFormat = useCallback((format: FormatType) => {
    sendMessage({ type: 'toggleFormat', format });
  }, [sendMessage]);

  const setTheme = useCallback((theme: ThemeConfig) => {
    sendMessage({ type: 'setTheme', theme });
  }, [sendMessage]);

  const insertImage = useCallback((src: string) => {
    sendMessage({ type: 'insertImage', src });
  }, [sendMessage]);

  const focus = useCallback(() => {
    sendMessage({ type: 'focus' });
  }, [sendMessage]);

  const blur = useCallback(() => {
    sendMessage({ type: 'blur' });
  }, [sendMessage]);

  return {
    webViewRef,
    onMessage,
    setContent,
    getContent,
    toggleFormat,
    setTheme,
    insertImage,
    focus,
    blur,
    toolbarState,
    editorState,
    isReady,
  };
}
