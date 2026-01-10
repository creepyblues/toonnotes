import { useMemo, useState, useCallback } from 'react';
import { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { ParsedLine } from './useEditorContent';

export interface CheckboxPosition {
  lineIndex: number;
  y: number;
  height: number;
  isChecked: boolean;
  charStart: number;
  charEnd: number;
}

export interface TextLayoutLine {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
}

/**
 * Hook to calculate checkbox overlay positions based on text layout
 */
export function useCheckboxPositions(
  parsedLines: ParsedLine[],
  defaultLineHeight: number = 24
) {
  // Store layout lines from onTextLayout event
  const [textLayoutLines, setTextLayoutLines] = useState<TextLayoutLine[]>([]);

  // Handle text layout event from TextInput
  const handleTextLayout = useCallback((
    event: NativeSyntheticEvent<TextLayoutEventData>
  ) => {
    const { lines } = event.nativeEvent;
    setTextLayoutLines(lines as TextLayoutLine[]);
  }, []);

  // Calculate checkbox positions
  const checkboxPositions = useMemo((): CheckboxPosition[] => {
    const positions: CheckboxPosition[] = [];

    // Map parsed lines to layout lines
    // Note: TextInput may wrap long lines, so layoutLines.length >= parsedLines.length
    let layoutLineIndex = 0;
    let accumulatedY = 0;

    for (const parsedLine of parsedLines) {
      if (parsedLine.type === 'checkbox-unchecked' || parsedLine.type === 'checkbox-checked') {
        // Find the Y position for this line
        let y = accumulatedY;
        let height = defaultLineHeight;

        if (textLayoutLines.length > layoutLineIndex) {
          const layoutLine = textLayoutLines[layoutLineIndex];
          y = layoutLine.y;
          height = layoutLine.height;
        }

        positions.push({
          lineIndex: parsedLine.index,
          y,
          height,
          isChecked: parsedLine.type === 'checkbox-checked',
          charStart: parsedLine.startIndex,
          charEnd: parsedLine.endIndex,
        });
      }

      // Calculate how many layout lines this parsed line spans
      // For simplicity, assume 1:1 mapping (no wrapping for checkbox lines)
      if (textLayoutLines.length > layoutLineIndex) {
        accumulatedY = textLayoutLines[layoutLineIndex].y + textLayoutLines[layoutLineIndex].height;
        layoutLineIndex++;
      } else {
        accumulatedY += defaultLineHeight;
      }
    }

    return positions;
  }, [parsedLines, textLayoutLines, defaultLineHeight]);

  // Calculate bullet positions (similar structure)
  const bulletPositions = useMemo(() => {
    const positions: { lineIndex: number; y: number; height: number }[] = [];

    let layoutLineIndex = 0;
    let accumulatedY = 0;

    for (const parsedLine of parsedLines) {
      if (parsedLine.type === 'bullet') {
        let y = accumulatedY;
        let height = defaultLineHeight;

        if (textLayoutLines.length > layoutLineIndex) {
          const layoutLine = textLayoutLines[layoutLineIndex];
          y = layoutLine.y;
          height = layoutLine.height;
        }

        positions.push({
          lineIndex: parsedLine.index,
          y,
          height,
        });
      }

      if (textLayoutLines.length > layoutLineIndex) {
        accumulatedY = textLayoutLines[layoutLineIndex].y + textLayoutLines[layoutLineIndex].height;
        layoutLineIndex++;
      } else {
        accumulatedY += defaultLineHeight;
      }
    }

    return positions;
  }, [parsedLines, textLayoutLines, defaultLineHeight]);

  // Check if any line has a checkbox or bullet (for padding calculation)
  const hasListItems = useMemo(() =>
    parsedLines.some(line =>
      line.type === 'checkbox-unchecked' ||
      line.type === 'checkbox-checked' ||
      line.type === 'bullet'
    ),
    [parsedLines]
  );

  return {
    checkboxPositions,
    bulletPositions,
    handleTextLayout,
    hasListItems,
    textLayoutLines,
  };
}

/**
 * Calculate approximate positions without onTextLayout
 * Used as fallback or for initial render
 */
export function calculateApproximatePositions(
  parsedLines: ParsedLine[],
  lineHeight: number = 24
): CheckboxPosition[] {
  return parsedLines
    .filter(line =>
      line.type === 'checkbox-unchecked' || line.type === 'checkbox-checked'
    )
    .map(line => ({
      lineIndex: line.index,
      y: line.index * lineHeight,
      height: lineHeight,
      isChecked: line.type === 'checkbox-checked',
      charStart: line.startIndex,
      charEnd: line.endIndex,
    }));
}
