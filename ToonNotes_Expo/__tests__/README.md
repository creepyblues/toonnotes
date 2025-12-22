# ToonNotes Unit Tests

Comprehensive unit tests for the ToonNotes Expo app covering stores, services, utilities, and integration flows.

## Test Structure

```
__tests__/
├── stores/
│   ├── noteStore.test.ts       # Note CRUD, labels, queries
│   ├── designStore.test.ts     # Design CRUD, queries
│   └── userStore.test.ts       # Economy, settings, affordability
├── services/
│   └── designEngine.test.ts    # Style composition, borders, contexts
├── utils/
│   └── uuid.test.ts            # UUID generation
├── integration/
│   └── designCreationFlow.test.ts  # Navigation flow tests
└── README.md                   # This file
```

## Running Tests

### Install Dependencies

First, ensure all test dependencies are installed:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

Automatically re-run tests when files change:

```bash
npm run test:watch
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Run Specific Test Files

```bash
# Run only noteStore tests
npm test noteStore

# Run only designEngine tests
npm test designEngine

# Run integration tests
npm test designCreationFlow
```

## Test Coverage

### Zustand Stores (stores/)

**noteStore.test.ts** (215 tests)
- Note CRUD: addNote, updateNote, deleteNote, restoreNote, permanentlyDeleteNote
- Archive: archiveNote, unarchiveNote
- Pin: pinNote, unpinNote
- Labels: addLabel, deleteLabel, renameLabel (case-insensitive, duplicate handling)
- Queries: getNoteById, getActiveNotes, getArchivedNotes, getDeletedNotes, getNotesByLabel, searchNotes
- Edge cases: empty values, multiple labels, note-label relationships

**designStore.test.ts** (30 tests)
- Design CRUD: addDesign, deleteDesign, updateDesign
- Queries: getDesignById
- Design properties: all border templates, thicknesses, background styles
- Edge cases: duplicate designs, missing fields, lucky designs

**userStore.test.ts** (43 tests)
- Economy: free design usage, coin spending, balance management
- Affordability: canAffordDesign, getDesignCost
- Settings: dark mode toggle, default note color, Gemini API key
- Integration: full purchase flows, coin exhaustion
- Edge cases: negative coins, large amounts, state persistence

### Services (services/)

**designEngine.test.ts** (47 tests)
- composeStyle: gradient/solid/image/pattern backgrounds
- Border configs: all 12 border templates, 3 thicknesses
- Context-based rendering: grid, list, detail, share
- Sticker configuration: position, scale, visibility
- composeBasicStyle: fallback styling, dark mode
- Utility functions: getBorderColor, getPopShadowColor
- Edge cases: null design, missing properties, all contexts

### Utilities (utils/)

**uuid.test.ts** (10 tests)
- UUID format validation (v4)
- Uniqueness verification
- Version and variant checks
- Length and character validation

### Integration Tests (integration/)

**designCreationFlow.test.ts** (18 tests)
- Flow: returnTo=note with noteId (apply to existing note)
- Flow: returnTo=designs (create new note)
- Economy integration: free design, coin spending
- Design store integration: retrieval, deletion, orphaned references
- Edge cases: non-existent notes/designs, removing designs

## Test Patterns

### Setup/Teardown

All store tests include a `beforeEach` hook that resets state:

```typescript
beforeEach(() => {
  const { result } = renderHook(() => useNoteStore());
  act(() => {
    result.current.notes = [];
    result.current.labels = [];
  });
});
```

### Mocking

- **AsyncStorage**: Mocked in `jest.setup.js`
- **expo-router**: Mocked navigation functions
- **expo-image-picker**: Mocked image selection
- **UUID generation**: Mocked for predictable IDs

### Testing Zustand Stores

Uses `@testing-library/react-hooks` for testing hooks:

```typescript
const { result } = renderHook(() => useNoteStore());

act(() => {
  result.current.addNote({...});
});

expect(result.current.notes).toHaveLength(1);
```

### Testing Pure Functions

Direct function calls with assertions:

```typescript
const style = composeStyle(design, NoteColor.White, 'detail', false);
expect(style.backgroundColor).toBe('#FFFFFF');
```

## Debugging Tests

### View Test Output

```bash
npm test -- --verbose
```

### Run Single Test

```bash
npm test -- -t "should add a new note"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Common Issues

### AsyncStorage Errors

If you see AsyncStorage-related errors, ensure `jest.setup.js` is properly configured in `jest.config.js`:

```javascript
setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
```

### Module Resolution

If imports fail, verify the path alias in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Transform Errors

If you see transform errors with `node_modules`, ensure the correct patterns are in `transformIgnorePatterns` in `jest.config.js`.

## Adding New Tests

### 1. Create Test File

```bash
touch __tests__/stores/myNewStore.test.ts
```

### 2. Follow Pattern

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useMyStore } from '@/stores/myStore';

describe('myStore', () => {
  beforeEach(() => {
    // Reset state
  });

  it('should do something', () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.doSomething();
    });

    expect(result.current.state).toBe(expectedValue);
  });
});
```

### 3. Run New Tests

```bash
npm test myNewStore
```

## CI/CD Integration

To run tests in CI pipelines:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm test -- --ci --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Further Reading

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Zustand Testing Guide](https://docs.pmnd.rs/zustand/guides/testing)
- [Expo Testing](https://docs.expo.dev/develop/unit-testing/)
