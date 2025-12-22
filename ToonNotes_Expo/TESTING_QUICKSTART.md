# ToonNotes Testing - Quick Start Guide

Get up and running with tests in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

This installs all required test dependencies:
- jest
- jest-expo
- @testing-library/react-hooks
- @types/jest

## 2. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (auto-rerun on file changes)
npm run test:watch
```

## 3. Test a Specific Feature

```bash
# Test note store
npm test noteStore

# Test design engine
npm test designEngine

# Test user store (economy)
npm test userStore

# Test design creation flow
npm test designCreationFlow
```

## 4. View Coverage Report

After running `npm run test:coverage`, open:
```
coverage/lcov-report/index.html
```

## Test Structure

```
__tests__/
├── stores/                 # Zustand store tests
│   ├── noteStore.test.ts   # 200+ tests
│   ├── designStore.test.ts # 30+ tests
│   └── userStore.test.ts   # 40+ tests
├── services/               # Business logic tests
│   └── designEngine.test.ts # 50+ tests
├── utils/                  # Utility function tests
│   └── uuid.test.ts        # 10+ tests
├── constants/              # Constants tests
│   ├── patterns.test.ts    # 40+ tests
│   └── themes.test.ts      # 60+ tests
└── integration/            # Integration tests
    └── designCreationFlow.test.ts # 20+ tests
```

## What's Tested?

✅ **Note Management** - CRUD, archive, delete, pin, labels, search
✅ **Design System** - 12 border templates, 4 contexts, backgrounds, stickers
✅ **Economy** - Free design, coins, affordability
✅ **Settings** - Dark mode, API key, default colors
✅ **Navigation** - Design creation flows
✅ **Patterns** - 11 patterns across 5 categories
✅ **Themes** - 7 anime/manga themes

## Common Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run a single test file
npm test noteStore.test.ts

# Run tests matching a pattern
npm test -- -t "should add a new note"

# Update snapshots
npm test -- -u

# Run tests in CI mode (no watch)
npm test -- --ci

# Clear test cache
npm test -- --clearCache
```

## Debugging Tests

### VS Code
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

### Console Logs
Uncomment this in `jest.setup.js` to see console output:
```javascript
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };
```

## Example Test

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNoteStore } from '@/stores/noteStore';
import { NoteColor } from '@/types';

describe('noteStore', () => {
  it('should add a new note', () => {
    const { result } = renderHook(() => useNoteStore());

    act(() => {
      result.current.addNote({
        title: 'Test Note',
        content: 'Test content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].title).toBe('Test Note');
  });
});
```

## Writing New Tests

1. Create test file: `__tests__/[category]/[feature].test.ts`
2. Import dependencies
3. Add describe block
4. Add beforeEach for setup
5. Write test cases with it()
6. Run: `npm test [feature]`

## Troubleshooting

### "Cannot find module '@/...'"
- Check `jest.config.js` has correct `moduleNameMapper`
- Ensure path aliases match `tsconfig.json`

### "AsyncStorage is not defined"
- Verify `jest.setup.js` is loaded in `jest.config.js`
- Check `setupFilesAfterEnv` configuration

### "Transform errors"
- Update `transformIgnorePatterns` in `jest.config.js`
- Add missing packages to ignore patterns

### Tests hanging
- Use `--runInBand` to run serially
- Check for unresolved promises
- Ensure all async operations use `act()`

## Coverage Goals

- Overall: >80%
- Critical paths: 100%
- Stores: 100%
- Services: >90%
- Utils: 100%

## CI/CD Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --ci --coverage
      - uses: codecov/codecov-action@v3
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Zustand Testing](https://docs.pmnd.rs/zustand/guides/testing)
- [Expo Testing](https://docs.expo.dev/develop/unit-testing/)

## Getting Help

1. Check `__tests__/README.md` for detailed patterns
2. Look at existing tests for examples
3. Review `TEST_SUMMARY.md` for coverage overview

---

**Total Tests:** 450+
**Avg Run Time:** <10 seconds
**Coverage:** Stores, Services, Utils, Constants, Integration
