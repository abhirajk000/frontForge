#!/usr/bin/env node
/**
 * One-time generator for days 16-21 curriculum JSON.
 * Run: node scripts/generate-days-16-21.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

function writeDay(dayNum, files) {
  const dir = join(contentDir, `day${dayNum}`);
  mkdirSync(dir, { recursive: true });
  for (const [name, data] of Object.entries(files)) {
    writeFileSync(join(dir, name), JSON.stringify(data, null, 2) + '\n');
  }
}

function lessonFooter() {
  return [
    { type: 'quiz-reference' },
    { type: 'interview-reference' },
    { type: 'reflection' },
  ];
}

function makeQuiz(metaId, dayNum, title, description, questions) {
  return {
    id: `day${dayNum}-quiz`,
    metaId,
    title,
    description,
    passingScorePercent: 70,
    retryAllowed: true,
    showExplanations: true,
    questions,
  };
}

function makeInterview(metaId, dayNum, title, description, questions) {
  return {
    id: `day${dayNum}-interview`,
    metaId,
    title,
    description,
    questions,
  };
}

function makeReflection(metaId, dayNum, title, description, prompts) {
  return {
    id: `day${dayNum}-reflection`,
    metaId,
    title,
    description,
    prompts,
  };
}

function makeResources(metaId, dayNum, title, description, resources) {
  return {
    id: `day${dayNum}-resources`,
    metaId,
    title,
    description,
    resources,
  };
}

function makeChallenge(metaId, dayNum, data) {
  return {
    id: `day${dayNum}-challenge`,
    metaId,
    ...data,
  };
}

// ─── DAY 16 ───────────────────────────────────────────────────────────────────
writeDay(16, {
  'meta.json': {
    id: 'day16',
    version: '1.0.0',
    day: 16,
    week: 3,
    track: 'react-interview',
    title: 'Todo Manager using Redux Toolkit',
    subtitle: 'Pure functions, slice types, and immutable global state with Redux Toolkit',
    mission: 'Build Todo Manager using Redux Toolkit.',
    readingTimeMinutes: 30,
    estimatedBuildHours: 4,
    difficulty: 'intermediate',
    tags: ['react', 'redux', 'redux-toolkit', 'slice', 'selectors', 'immutable', 'todo'],
    topics: {
      javascript: ['functions vs classes', 'pure functions'],
      typescript: ['slice types', 'store types'],
      react: ['Redux Toolkit', 'store', 'slice', 'actions', 'selectors'],
    },
    prerequisites: [
      'day15 — ThemeProvider, Context API deep dive, useTheme hook, localStorage persistence',
      'day12 — useReducer immutability patterns from shopping cart',
      'week2 — custom hooks, component composition from Days 8–11',
    ],
    expectedOutcome: [
      'Explain functions vs classes and why reducers must be pure functions',
      'Type Redux slices and RootState with TypeScript',
      'Configure a Redux store with configureStore and typed hooks',
      'Create a todos slice with createSlice, reducers, and actions',
      'Use selectors to derive filtered and completed todo lists',
      'Compare Redux Toolkit vs Context for complex mutable global state',
    ],
    definitionOfDone: [
      'Add, delete, and update todos via Redux actions',
      'Filter todos by all, active, and completed',
      'Completed tasks section or count displays correctly',
      'No direct state mutation in reducers',
      'Store typed with RootState and AppDispatch',
      'Code pushed to Git',
    ],
    tomorrowPreview: {
      day: 17,
      title: 'Product Management using RTK Query',
      summary: 'Tomorrow you will layer server state on top of your Redux store with RTK Query — query hooks, mutations, cache, and invalidations for product CRUD.',
    },
  },
  'lesson.json': {
    id: 'day16-lesson',
    metaId: 'day16',
    title: 'Day 16 — Todo Manager using Redux Toolkit',
    summary: 'Learn pure functions, type Redux slices and stores, and build a production todo manager with Redux Toolkit — the standard for scalable React global state.',
    blocks: [
      { type: 'heading', id: 'mission', level: 2, text: "Today's Mission" },
      {
        type: 'paragraph',
        content: "Day 15 gave you Context for theme — low-frequency, widely read preference state. Today you graduate to Redux Toolkit for state that many components write to with predictable updates: todos with add, delete, update, filter, and completed tracking. Every Indian product company interview asks Redux vs Context. Your todo manager is the proof point.",
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Week 3 scope',
        content: 'Today covers Redux Toolkit only. Do NOT introduce RTK Query (Day 17), authentication (Day 18), admin dashboards (Day 19), or performance memoization labs (Day 20).',
      },
      { type: 'heading', id: 'javascript', level: 2, text: 'JavaScript — Functions vs Classes, Pure Functions' },
      {
        type: 'paragraph',
        content: 'Reducers in Redux are plain functions — not classes. Interviewers test whether you understand why. A pure function always returns the same output for the same input and never mutates arguments or external state. Redux reducers must be pure so time-travel debugging, middleware, and predictable updates work.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: "// Impure — mutates input\nfunction addTodoBad(todos, text) {\n  todos.push({ id: Date.now(), text, done: false });\n  return todos;\n}\n\n// Pure — returns new array\nfunction addTodoPure(todos, text) {\n  return [...todos, { id: Date.now(), text, done: false }];\n}",
      },
      {
        type: 'heading',
        id: 'functions-vs-classes',
        level: 3,
        text: 'Functions vs classes for state logic',
      },
      {
        type: 'paragraph',
        content: 'Classes bundle data and methods with this. Redux favors plain objects and functions — easier to test, serialize, and reason about. createSlice generates action creators and reducers as functions, not class methods. In interviews, say: "I use functions for reducers because they are pure, composable, and map directly to the Redux data flow."',
      },
      {
        type: 'tip',
        title: 'Production connection',
        content: 'Immer inside Redux Toolkit lets you write "mutating" syntax in reducers while producing immutable updates. Under the hood it is still pure — never mutate state outside createSlice reducers.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'typescript', level: 2, text: 'TypeScript — Slice Types and Store Types' },
      {
        type: 'paragraph',
        content: 'Untyped Redux is a maintenance nightmare. Define Todo and TodosState interfaces, let createSlice infer action types, and export RootState and AppDispatch from your store for typed useSelector and useDispatch.',
      },
      {
        type: 'code',
        language: 'typescript',
        filename: 'features/todos/todosSlice.ts',
        code: "export interface Todo {\n  id: string;\n  text: string;\n  completed: boolean;\n}\n\nexport type Filter = 'all' | 'active' | 'completed';\n\nexport interface TodosState {\n  items: Todo[];\n  filter: Filter;\n}\n\nconst initialState: TodosState = { items: [], filter: 'all' };",
      },
      {
        type: 'code',
        language: 'typescript',
        filename: 'app/store.ts',
        code: "import { configureStore } from '@reduxjs/toolkit';\nimport todosReducer from '../features/todos/todosSlice';\n\nexport const store = configureStore({\n  reducer: { todos: todosReducer },\n});\n\nexport type RootState = ReturnType<typeof store.getState>;\nexport type AppDispatch = typeof store.dispatch;",
      },
      {
        type: 'warning',
        title: 'Type the hooks',
        content: 'Never use raw useDispatch or useSelector in TypeScript apps. Create typed hooks useAppDispatch and useAppSelector that know RootState — catches selector typos at compile time.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'react', level: 2, text: 'React — Redux Toolkit' },
      {
        type: 'tabs',
        items: [
          {
            id: 'tab-store',
            label: 'Store',
            blocks: [
              {
                type: 'paragraph',
                content: 'configureStore sets up the Redux store with good defaults: Redux DevTools, thunk middleware, and immutable checks in development. Wrap your app with <Provider store={store}> at the root — same placement discipline as ThemeProvider on Day 15.',
              },
            ],
          },
          {
            id: 'tab-slice',
            label: 'Slice',
            blocks: [
              {
                type: 'paragraph',
                content: 'createSlice combines reducers, actions, and initial state. Name reducers in reducers: { addTodo(state, action) { ... } } and RTK generates action creators automatically: todosSlice.actions.addTodo(payload).',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "const todosSlice = createSlice({\n  name: 'todos',\n  initialState,\n  reducers: {\n    addTodo(state, action: PayloadAction<string>) {\n      state.items.push({ id: crypto.randomUUID(), text: action.payload, completed: false });\n    },\n    toggleTodo(state, action: PayloadAction<string>) {\n      const todo = state.items.find(t => t.id === action.payload);\n      if (todo) todo.completed = !todo.completed;\n    },\n  },\n});",
              },
            ],
          },
          {
            id: 'tab-selectors',
            label: 'Selectors',
            blocks: [
              {
                type: 'paragraph',
                content: 'Selectors derive data from state. Keep filtering logic out of components — create selectFilteredTodos and selectCompletedCount in the slice file or a selectors.ts module.',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "export const selectFilteredTodos = (state: RootState) => {\n  const { items, filter } = state.todos;\n  if (filter === 'active') return items.filter(t => !t.completed);\n  if (filter === 'completed') return items.filter(t => t.completed);\n  return items;\n};",
              },
            ],
          },
        ],
      },
      { type: 'note', title: 'Actions vs reducers', content: 'Components dispatch actions. Reducers handle them. Never call reducers directly from UI — dispatch keeps the unidirectional data flow interviewers expect.' },
      { type: 'divider' },
      { type: 'heading', id: 'build', level: 2, text: 'Build Mission — Todo Manager' },
      {
        type: 'checklist',
        title: 'Requirements',
        items: [
          { id: 'req-add', text: 'Add new todos via input and dispatch' },
          { id: 'req-delete', text: 'Delete individual todos' },
          { id: 'req-update', text: 'Update todo text or toggle completed' },
          { id: 'req-filter', text: 'Filter: all, active, completed' },
          { id: 'req-completed', text: 'Show completed tasks count or section' },
        ],
      },
      { type: 'challenge' },
      { type: 'heading', id: 'debugging', level: 2, text: 'Debugging — Redux mistakes' },
      {
        type: 'accordion',
        items: [
          {
            id: 'dbg-mutation',
            title: 'State mutation',
            blocks: [{ type: 'paragraph', content: 'Symptom: Redux DevTools shows state changed but UI does not update, or warnings about mutation. Cause: Mutating state outside Immer reducers or spreading wrong nesting level. Fix: Only "mutate" inside createSlice reducers; return new objects if not using Immer.' }],
          },
          {
            id: 'dbg-wrong-update',
            title: 'Wrong store updates',
            blocks: [{ type: 'paragraph', content: 'Symptom: Action dispatches but state unchanged. Cause: Wrong action type string, reducer not registered in configureStore, or typo in slice name. Fix: Log action in middleware; verify reducer key matches useSelector path state.todos.' }],
          },
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'interview-prep', level: 2, text: 'Interview Focus — Redux vs Context' },
      {
        type: 'paragraph',
        content: 'Theme from Day 15 fits Context. Todos with filters, many writers, and DevTools needs fit Redux Toolkit. Say: "Context for infrequent global reads; Redux for complex client state with many actions and middleware."',
      },
      { type: 'quote', content: 'Redux Toolkit is the official recommended way to write Redux logic.', attribution: 'Redux documentation' },
      { type: 'heading', id: 'wrap-up', level: 2, text: 'Wrap-up' },
      {
        type: 'checklist',
        title: 'Definition of Done',
        items: [
          { id: 'done-crud', text: 'Todo CRUD and filters work' },
          { id: 'done-immutable', text: 'No reducer mutations outside Immer' },
          { id: 'done-typed', text: 'Typed store and hooks' },
          { id: 'done-git', text: 'Git push' },
        ],
      },
      ...lessonFooter(),
    ],
  },
  'quiz.json': makeQuiz('day16', 16, 'Day 16 Quiz — Redux Toolkit and Pure Functions', 'Verify Redux Toolkit concepts, pure functions, slice typing, and immutable updates.', [
    { id: 'q01', type: 'true-false', prompt: 'Redux reducers must be pure functions that do not mutate their arguments.', correctAnswer: true, explanation: 'Pure reducers enable predictable updates, DevTools time travel, and testability.', difficulty: 'easy', tags: ['redux', 'javascript'] },
    { id: 'q02', type: 'single-choice', prompt: 'What does createSlice from Redux Toolkit generate?', options: [{ id: 'a', text: 'Only a reducer function' }, { id: 'b', text: 'Reducer, action creators, and action types' }, { id: 'c', text: 'A React Context provider' }, { id: 'd', text: 'An API client' }], correctOptionId: 'b', explanation: 'createSlice bundles reducers with auto-generated action creators and action type strings.', difficulty: 'easy', tags: ['redux-toolkit'] },
    { id: 'q03', type: 'single-choice', prompt: 'Where should configureStore be called?', options: [{ id: 'a', text: 'Inside every component that dispatches' }, { id: 'b', text: 'Once at app setup, passed to Provider' }, { id: 'c', text: 'Inside each reducer file' }, { id: 'd', text: 'Only in test files' }], correctOptionId: 'b', explanation: 'One store per app, provided at root via react-redux Provider.', difficulty: 'easy', tags: ['redux'] },
    { id: 'q04', type: 'multiple-choice', prompt: 'Which are advantages of Redux Toolkit over hand-written Redux? Select all that apply.', options: [{ id: 'a', text: 'Less boilerplate with createSlice' }, { id: 'b', text: 'Built-in Immer for immutable updates' }, { id: 'c', text: 'Replaces the need for React components' }, { id: 'd', text: 'configureStore with good defaults' }], correctOptionIds: ['a', 'b', 'd'], explanation: 'RTK reduces boilerplate, includes Immer, and configures store defaults. It does not replace React.', difficulty: 'medium', tags: ['redux-toolkit'] },
    { id: 'q05', type: 'fill-blank', prompt: 'Derive typed RootState with {{blank1}} and typed dispatch with {{blank2}} from the configured store.', blanks: [{ id: 'blank1', acceptedAnswers: ['ReturnType<typeof store.getState>', 'ReturnType'] }, { id: 'blank2', acceptedAnswers: ['typeof store.dispatch'] }], explanation: 'These type exports power typed useAppSelector and useAppDispatch hooks.', difficulty: 'medium', tags: ['typescript', 'redux'] },
    { id: 'q06', type: 'code-output', prompt: 'With Immer inside createSlice, what happens to state.items.push()?', code: 'reducers: {\n  add(state, action) {\n    state.items.push(action.payload);\n  }\n}', language: 'typescript', correctOutput: 'immutable update', explanation: 'Immer drafts produce immutable next state despite mutating syntax — the correct mental answer is immutable update is produced.', difficulty: 'hard', tags: ['redux-toolkit', 'immer'] },
    { id: 'q07', type: 'single-choice', prompt: 'When is Redux Toolkit preferred over Context from Day 15?', options: [{ id: 'a', text: 'Theme preference with three modes' }, { id: 'b', text: 'Complex client state with many actions and DevTools needs' }, { id: 'c', text: 'Passing props one level deep' }, { id: 'd', text: 'Static configuration never changing' }], correctOptionId: 'b', explanation: 'RTK shines for complex mutable client state; Context fits simpler global preferences.', difficulty: 'medium', tags: ['architecture'] },
    { id: 'q08', type: 'code-completion', prompt: 'Complete the typed selector hook.', code: 'export const useAppSelector: TypedUseSelectorHook<{{type}}> = useSelector;', language: 'typescript', blanks: [{ id: 'type', acceptedAnswers: ['RootState'] }], explanation: 'RootState types the selector state parameter.', difficulty: 'medium', tags: ['typescript'] },
    { id: 'q09', type: 'short-answer', prompt: 'Why must reducer functions be pure?', acceptedKeywords: ['predictable', 'same input', 'immutable', 'side effects', 'test'], sampleAnswer: 'Pure reducers return the same output for the same input without side effects or mutating arguments. This makes state predictable, enables Redux DevTools time travel, and simplifies unit testing.', explanation: 'Purity is foundational to Redux architecture.', difficulty: 'medium', tags: ['javascript', 'redux'] },
    { id: 'q10', type: 'single-choice', prompt: 'What hook connects React components to the Redux store for reading state?', options: [{ id: 'a', text: 'useContext' }, { id: 'b', text: 'useSelector' }, { id: 'c', text: 'useReducer only' }, { id: 'd', text: 'useQuery' }], correctOptionId: 'b', explanation: 'useSelector (or typed useAppSelector) subscribes to store slices.', difficulty: 'easy', tags: ['react', 'redux'] },
  ]),
  'challenge.json': makeChallenge('day16', 16, {
    title: 'Build a Todo Manager with Redux Toolkit',
    mission: 'Build Todo Manager using Redux Toolkit.',
    description: 'Implement a full todo application with Redux Toolkit — add, delete, update, filter, and completed task tracking. This is the canonical Redux interview build.',
    estimatedMinutes: 240,
    difficulty: 'intermediate',
    requirements: [
      'Configure Redux store with configureStore and todos slice',
      'Create todosSlice with addTodo, deleteTodo, updateTodo, toggleTodo, and setFilter reducers',
      'Type Todo, TodosState, RootState, and AppDispatch',
      'Create typed useAppDispatch and useAppSelector hooks',
      'Build TodoInput component that dispatches addTodo',
      'Build TodoList rendering filtered todos from selectors',
      'Implement filter buttons: All, Active, Completed',
      'Display completed tasks count',
      'Wrap app with Provider at root',
    ],
    acceptanceCriteria: [
      'Adding a todo updates the list without page refresh',
      'Deleting and editing todos work via dispatched actions',
      'Filter switches between all, active, and completed lists',
      'Completed count reflects toggle state accurately',
      'Redux DevTools shows actions and immutable state transitions',
      'npm run build passes with strict TypeScript',
      'Repository pushed to Git',
    ],
    hints: [
      'Use crypto.randomUUID() or nanoid for todo ids.',
      'Keep filter state in the same slice or a ui slice — document your choice.',
      'Export selectors: selectFilteredTodos, selectActiveCount, selectCompletedCount.',
      'Use PayloadAction<string> for text payloads and PayloadAction<{ id: string; text: string }> for updates.',
      'Compare with Day 12 cart useReducer — RTK removes boilerplate.',
    ],
    bonus: {
      title: 'Senior polish',
      description: 'Optional enhancements for interview depth.',
      requirements: [
        'Persist todos to localStorage with redux-persist or custom middleware',
        'Add "clear completed" bulk action',
        'Write unit tests for reducers with no React rendering',
      ],
    },
    debuggingScenarios: [
      { id: 'dbg-mutation', title: 'State mutation', symptom: 'UI stale after dispatch; console warns about mutation', cause: 'Mutating state outside createSlice or returning wrong reference', fix: 'Only mutate draft state inside createSlice reducers; let Immer produce next state' },
      { id: 'dbg-reducer', title: 'Reducer bugs', symptom: 'Action fires but state unchanged', cause: 'Reducer not added to configureStore or wrong state path in selector', fix: 'Verify reducer key in store matches selector: state.todos' },
      { id: 'dbg-filter', title: 'Filter not working', symptom: 'Filter button clicks do nothing', cause: 'Component uses raw items instead of selector', fix: 'Dispatch setFilter and read selectFilteredTodos in list component' },
    ],
  }),
  'interview.json': makeInterview('day16', 16, 'Day 16 Interview Prep', 'Practice Redux vs Context, Redux Toolkit benefits, pure functions, and immutable updates.', [
    { id: 'int-e01', question: 'Redux vs Context — when do you use each?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'State architecture judgment after Day 15 theme Context.', keyPoints: ['Context for low-frequency global reads like theme', 'Redux for complex client state with many actions', 'DevTools and middleware with Redux', 'Neither replaces local useState'], sampleAnswer: 'I used Context on Day 15 for theme — infrequent updates, many readers. I pick Redux Toolkit when multiple features dispatch many actions to shared state — todos, cart, UI flags — and I want DevTools, middleware, and predictable reducers. Local form state stays in useState.', followUps: ['Can you combine both?', 'What about Zustand?'] },
    { id: 'int-e02', question: 'Why Redux Toolkit over plain Redux?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'Awareness of modern Redux ergonomics.', keyPoints: ['createSlice reduces boilerplate', 'Immer built in', 'configureStore defaults', 'Official recommendation'], sampleAnswer: 'Plain Redux required action types, action creators, and switch reducers by hand. RTK createSlice generates those automatically, Immer lets me write concise reducers, and configureStore wires DevTools and thunk. It is the official recommended approach — less code, fewer bugs.', followUps: ['What is Immer?', 'Do you still need reducers?'] },
    { id: 'int-m01', question: 'What is a pure function and why do Redux reducers need to be pure?', difficulty: 'medium', category: 'javascript', whatInterviewerTests: 'Functional programming fundamentals.', keyPoints: ['Same input same output', 'No side effects', 'No mutating arguments', 'Enables time travel and testing'], sampleAnswer: 'A pure function always returns the same result for the same inputs and does not cause side effects or mutate inputs. Redux reducers must be pure so the store update is predictable, DevTools can replay actions, and I can test reducers as simple functions without mounting React.', followUps: ['Is Immer pure?', 'What about async in reducers?'] },
    { id: 'int-m02', question: 'How do you type a Redux slice and RootState in TypeScript?', difficulty: 'medium', category: 'typescript', whatInterviewerTests: 'Production Redux typing.', keyPoints: ['Interface for slice state', 'PayloadAction for payloads', 'ReturnType for RootState', 'Typed hooks'], sampleAnswer: 'I define TodosState interface for initial state shape. createSlice reducers use PayloadAction<T> for typed payloads. I export RootState = ReturnType<typeof store.getState> and AppDispatch = typeof store.dispatch, then create useAppSelector and useAppDispatch typed hooks.', followUps: ['How type selectors?', 'What about createAsyncThunk?'] },
    { id: 'int-m03', question: 'Explain actions, reducers, and selectors in Redux data flow.', difficulty: 'medium', category: 'react', whatInterviewerTests: 'Unidirectional data flow understanding.', keyPoints: ['UI dispatches actions', 'Reducers compute next state', 'Store holds state', 'Selectors derive view data'], sampleAnswer: 'User interaction dispatches an action object with a type and payload. Redux calls the matching reducer with current state and action, producing next state immutably. Components use selectors via useSelector to read derived data. The flow is action → reducer → store → UI.', followUps: ['What is middleware?', 'Can reducers call APIs?'] },
    { id: 'int-h01', question: 'Todos do not update in the UI after dispatch. Walk through debugging.', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Redux debugging process.', keyPoints: ['Redux DevTools action log', 'Reducer registration', 'Selector path', 'Reference equality'], sampleAnswer: 'I open Redux DevTools — if action appears but state unchanged, reducer logic or registration is wrong. I verify the reducer is in configureStore under the key my selector uses. If state changes but UI does not, selector may return same reference or component not subscribed. I add logging middleware and check useSelector path.', followUps: ['What is serializable check?', 'Shallow vs deep equality?'] },
    { id: 'int-h02', question: 'A teammate mutates state.todos.push() outside createSlice. What breaks?', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Immutability consequences.', keyPoints: ['React-Redux uses reference equality', 'DevTools inconsistency', 'Time travel breaks', 'Immer only inside reducers'], sampleAnswer: 'Mutating state outside reducers changes data in place without a new reference — useSelector may not detect change and skip re-render. Redux expects immutable updates; DevTools and time travel become unreliable. I refactor to dispatch addTodo and let Immer inside createSlice produce the new state.', followUps: ['How detect mutations in dev?', 'Structural sharing?'] },
    { id: 'int-s01', question: 'Design todo state: one slice vs split todos and ui slices?', difficulty: 'senior', category: 'architecture', whatInterviewerTests: 'Slice organization for growing apps.', keyPoints: ['Co-locate filter with todos for small apps', 'Split when domains grow', 'Normalized state for large lists', 'Selector colocation'], sampleAnswer: 'For a todo app I keep items and filter in one todos slice — they change together and selectors are simple. As the app grows I split ui slice for modals and filters, keep entities normalized by id for large lists. I colocate selectors with slices and avoid a god-slice anti-pattern.', followUps: ['Normalized state shape?', 'Feature folder structure?'], redFlags: ['One global object with everything', 'Filters in component local state only when global filter bar exists'] },
  ]),
  'reflection.json': makeReflection('day16', 16, 'Day 16 Reflection', 'Solidify Redux Toolkit patterns before RTK Query tomorrow.', [
    { id: 'refl-01', question: 'When would you keep todo state in Context/useReducer vs Redux Toolkit?', guidance: 'Compare Day 12 cart with today todos.', minWords: 45 },
    { id: 'refl-02', question: 'Did you accidentally mutate state? How did Redux Toolkit Immer help or confuse you?', guidance: 'Mention DevTools or mutation warnings.', minWords: 40 },
    { id: 'refl-03', question: 'Explain pure functions and why your reducers must follow that rule.', guidance: 'Use addTodo as an example.', minWords: 40 },
    { id: 'refl-04', question: 'How does your filter selector derive active and completed lists?', guidance: 'Describe selectFilteredTodos logic.', minWords: 35 },
    { id: 'refl-05', question: 'What would break if you introduced RTK Query today instead of waiting for Day 17?', guidance: 'Preview server state separation without implementing.', minWords: 30 },
  ]),
  'resources.json': makeResources('day16', 16, 'Day 16 Resources', 'Official Redux Toolkit documentation for store, slices, and TypeScript.', [
    { id: 'res-rtk', title: 'Redux Toolkit — Getting Started', url: 'https://redux-toolkit.js.org/introduction/getting-started', type: 'documentation', description: 'Official RTK introduction and installation.', recommended: true },
    { id: 'res-slice', title: 'Redux Toolkit — createSlice', url: 'https://redux-toolkit.js.org/api/createSlice', type: 'documentation', description: 'API reference for slices, reducers, and generated actions.', recommended: true },
    { id: 'res-store', title: 'Redux Toolkit — configureStore', url: 'https://redux-toolkit.js.org/api/configureStore', type: 'documentation', description: 'Store setup with defaults and middleware.', recommended: true },
    { id: 'res-usage', title: 'Redux — Usage with React', url: 'https://react-redux.js.org/api/hooks', type: 'documentation', description: 'useSelector and useDispatch hooks.', recommended: true },
    { id: 'res-ts', title: 'Redux Toolkit — TypeScript Quick Start', url: 'https://redux-toolkit.js.org/tutorials/typescript', type: 'documentation', description: 'Typed store, hooks, and slices pattern.', recommended: true },
    { id: 'res-pure', title: 'MDN — Pure Functions', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Pure_function', type: 'documentation', description: 'Pure function definition for reducer interviews.', recommended: true },
    { id: 'res-immer', title: 'Redux Toolkit — Immutability with Immer', url: 'https://redux-toolkit.js.org/usage/immer-reducers', type: 'documentation', description: 'How Immer enables mutable syntax with immutable output.', recommended: true },
    { id: 'res-style', title: 'Redux — Style Guide', url: 'https://redux.js.org/style-guide', type: 'documentation', description: 'Best practices for reducers, actions, and state shape.', recommended: false },
  ]),
});

// Continue with days 17-21 in part 2...
console.log('Day 16 written. Run part 2 for remaining days.');
