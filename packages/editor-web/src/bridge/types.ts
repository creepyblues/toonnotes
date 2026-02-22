// ---- Format Types ----

export type FormatType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'bulletList'
  | 'taskList';

// ---- Theme Config ----

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  placeholderColor: string;
  accentColor: string;
  fontFamily?: string;
}

// ---- Toolbar State (WebView → RN) ----

export interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isBulletList: boolean;
  isTaskList: boolean;
}

// ---- Editor State (WebView → RN) ----

export interface EditorState {
  isFocused: boolean;
  isEmpty: boolean;
}

// ---- Messages: RN → WebView ----

export type RNToWebViewMessage =
  | { type: 'setContent'; html: string }
  | { type: 'getContent' }
  | { type: 'toggleFormat'; format: FormatType }
  | { type: 'focus' }
  | { type: 'blur' }
  | { type: 'setTheme'; theme: ThemeConfig }
  | { type: 'insertImage'; src: string };

// ---- Messages: WebView → RN ----

export type WebViewToRNMessage =
  | { type: 'editorReady' }
  | { type: 'contentChanged'; html: string; plainText: string; cursorOffset: number }
  | { type: 'toolbarStateChanged'; state: ToolbarState }
  | { type: 'editorStateChanged'; state: EditorState }
  | { type: 'heightChanged'; height: number };
