// Shared TipTap configuration
export { createEditorExtensions } from './config/extensions';
export type { EditorExtensionOptions } from './config/extensions';

// Bridge protocol types
export type {
  FormatType,
  ThemeConfig,
  ToolbarState,
  EditorState,
  RNToWebViewMessage,
  WebViewToRNMessage,
} from './bridge/types';

// useEditorBridge is exported from '@toonnotes/editor-web/hooks' subpath (React Native only)
