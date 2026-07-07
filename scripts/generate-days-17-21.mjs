#!/usr/bin/env node
/**
 * Generator for days 17-21 curriculum JSON.
 * Run: node scripts/generate-days-17-21.mjs
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

// ─── DAY 17 ───────────────────────────────────────────────────────────────────
writeDay(17, {
  'meta.json': {
    id: 'day17',
    version: '1.0.0',
    day: 17,
    week: 3,
    track: 'react-interview',
    title: 'Product Management using RTK Query',
    subtitle: 'Promise chaining, API models, query and mutation hooks, cache, and invalidations',
    mission: 'Build Product Management using RTK Query.',
    readingTimeMinutes: 30,
    estimatedBuildHours: 4,
    difficulty: 'intermediate',
    tags: ['react', 'rtk-query', 'redux', 'api', 'cache', 'mutations', 'products'],
    topics: {
      javascript: ['promise chaining', 'async patterns'],
      typescript: ['API models', 'generic responses'],
      react: ['RTK Query', 'query hooks', 'mutation hooks', 'cache', 'invalidations'],
    },
    prerequisites: [
      'day16 — Redux Toolkit store, createSlice, typed hooks, selectors',
      'day08 — fetch APIs, loading and error UI states from Week 2',
      'day15 — Provider placement at app root (ThemeProvider pattern)',
    ],
    expectedOutcome: [
      'Chain promises and explain async patterns that underpin RTK Query',
      'Type API models and generic response wrappers in TypeScript',
      'Configure createApi with baseQuery and inject endpoints',
      'Use useGetProductsQuery and mutation hooks for product CRUD',
      'Handle loading, error, and success states in the UI',
      'Invalidate cache tags so lists refresh after mutations',
      'Compare RTK Query vs React Query in interviews',
    ],
    definitionOfDone: [
      'Fetch and display products with loading and error states',
      'Add, update, and delete products via mutation hooks',
      'Cache updates correctly after mutations via tag invalidation',
      'No duplicate fetch storms on remount',
      'API types defined for Product and list responses',
      'Code pushed to Git',
    ],
    tomorrowPreview: {
      day: 18,
      title: 'Authentication Flow',
      summary: 'Tomorrow you will secure your app with JWT basics, auth types, protected routes, login/logout, and session persistence — building on today\'s API layer.',
    },
  },
  'lesson.json': {
    id: 'day17-lesson',
    metaId: 'day17',
    title: 'Day 17 — Product Management using RTK Query',
    summary: 'Layer server state on your Redux store with RTK Query — typed API models, query and mutation hooks, automatic caching, and tag invalidations for product CRUD.',
    blocks: [
      { type: 'heading', id: 'mission', level: 2, text: "Today's Mission" },
      {
        type: 'paragraph',
        content: 'Day 16 gave you client state with Redux Toolkit — todos, filters, actions. Real apps also need server state: products from an API that loads, caches, refetches, and updates after mutations. RTK Query ships with Redux Toolkit and solves this without bolting on a separate library. Today you build product CRUD with loading and error handling — the same pattern Flipkart and Swiggy use for catalog management.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Scope boundary',
        content: 'Today covers RTK Query and product CRUD only. Do NOT introduce authentication (Day 18), admin dashboards (Day 19), or performance memoization labs (Day 20). Your API calls are open — auth headers come tomorrow.',
      },
      { type: 'heading', id: 'javascript', level: 2, text: 'JavaScript — Promise Chaining and Async Patterns' },
      {
        type: 'paragraph',
        content: 'RTK Query abstracts fetch, but interviews still test promise fundamentals. A promise represents a future value. .then() chains success handlers; .catch() handles failures. async/await is syntactic sugar over promises — easier to read, same underlying mechanics.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: "fetch('/api/products')\n  .then(res => {\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    return res.json();\n  })\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// Equivalent async/await:\nasync function loadProducts() {\n  try {\n    const res = await fetch('/api/products');\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    return await res.json();\n  } catch (err) {\n    console.error(err);\n  }\n}",
      },
      {
        type: 'tip',
        title: 'Production connection',
        content: 'RTK Query uses async thunks internally. When an interviewer asks "what happens under the hood," say: each query hook dispatches a lifecycle action — pending, fulfilled, rejected — and stores result metadata in the cache slice.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'typescript', level: 2, text: 'TypeScript — API Models and Generic Responses' },
      {
        type: 'paragraph',
        content: 'Define Product once and reuse across endpoints. Generic wrappers like ApiResponse<T> standardize pagination and error shapes — interviewers love seeing typed API contracts instead of any everywhere.',
      },
      {
        type: 'code',
        language: 'typescript',
        filename: 'types/api.ts',
        code: "export interface Product {\n  id: string;\n  name: string;\n  price: number;\n  category: string;\n  inStock: boolean;\n}\n\nexport interface ApiResponse<T> {\n  data: T;\n  total: number;\n  page: number;\n}\n\nexport type ProductListResponse = ApiResponse<Product[]>;",
      },
      {
        type: 'warning',
        title: 'Type the transformResponse',
        content: 'If your API wraps data in { data: [...] }, use transformResponse in the endpoint definition so hooks return Product[] directly — components should not unwrap envelopes.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'react', level: 2, text: 'React — RTK Query' },
      {
        type: 'tabs',
        items: [
          {
            id: 'tab-setup',
            label: 'createApi',
            blocks: [
              {
                type: 'paragraph',
                content: 'createApi defines a slice of Redux state for server data. Register its reducer and middleware in configureStore alongside your client slices from Day 16.',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "export const productsApi = createApi({\n  reducerPath: 'productsApi',\n  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),\n  tagTypes: ['Product'],\n  endpoints: (builder) => ({\n    getProducts: builder.query<Product[], void>({\n      query: () => '/products',\n      providesTags: ['Product'],\n    }),\n  }),\n});",
              },
            ],
          },
          {
            id: 'tab-queries',
            label: 'Query hooks',
            blocks: [
              {
                type: 'paragraph',
                content: 'Auto-generated hooks like useGetProductsQuery subscribe to cache entries. They return { data, isLoading, isError, error, refetch } — wire these to your loading and error UI from Day 8.',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "const { data: products, isLoading, isError, error } = useGetProductsQuery();\n\nif (isLoading) return <Spinner />;\nif (isError) return <ErrorMessage error={error} />;\nreturn <ProductList products={products ?? []} />;",
              },
            ],
          },
          {
            id: 'tab-mutations',
            label: 'Mutations & cache',
            blocks: [
              {
                type: 'paragraph',
                content: 'Mutations change server data. Use invalidatesTags so related queries refetch automatically — no manual cache surgery after add or delete.',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "addProduct: builder.mutation<Product, Omit<Product, 'id'>>({\n  query: (body) => ({ url: '/products', method: 'POST', body }),\n  invalidatesTags: ['Product'],\n}),\n\n// In component:\nconst [addProduct, { isLoading }] = useAddProductMutation();",
              },
            ],
          },
        ],
      },
      { type: 'note', title: 'Cache deduplication', content: 'Two components calling useGetProductsQuery() share one request and one cache entry. RTK Query deduplicates in-flight requests — explain this when asked about duplicate API calls.' },
      { type: 'divider' },
      { type: 'heading', id: 'build', level: 2, text: 'Build Mission — Product CRUD' },
      {
        type: 'checklist',
        title: 'Requirements',
        items: [
          { id: 'req-fetch', text: 'Fetch and display products with loading spinner' },
          { id: 'req-add', text: 'Add product form with mutation hook' },
          { id: 'req-update', text: 'Update product inline or via modal' },
          { id: 'req-delete', text: 'Delete product with confirmation' },
          { id: 'req-error', text: 'Show error UI when fetch or mutation fails' },
        ],
      },
      { type: 'challenge' },
      { type: 'heading', id: 'debugging', level: 2, text: 'Debugging — RTK Query mistakes' },
      {
        type: 'accordion',
        items: [
          {
            id: 'dbg-cache',
            title: 'Cache not updating after mutation',
            blocks: [{ type: 'paragraph', content: 'Symptom: New product added but list stale. Cause: Mutation missing invalidatesTags or providesTags mismatch. Fix: Add invalidatesTags: [\'Product\'] to mutation; ensure query providesTags returns [{ type: \'Product\' }].' }],
          },
          {
            id: 'dbg-duplicate',
            title: 'Duplicate requests',
            blocks: [{ type: 'paragraph', content: 'Symptom: Network tab shows repeated GET /products. Cause: Different query args create separate cache keys, or refetchOnMountOrArgChange misconfigured. Fix: Use consistent args; tune refetchOnFocus/refetchOnReconnect defaults.' }],
          },
          {
            id: 'dbg-invalidation',
            title: 'Wrong invalidation',
            blocks: [{ type: 'paragraph', content: 'Symptom: Unrelated queries refetch unnecessarily. Cause: Over-broad tag like invalidatesTags: [\'Product\'] when granular tags needed. Fix: Use { type: \'Product\', id } for entity-level invalidation.' }],
          },
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'interview-prep', level: 2, text: 'Interview Focus — RTK Query vs React Query' },
      {
        type: 'paragraph',
        content: 'Both solve server state caching. RTK Query integrates with existing Redux store and DevTools — pick it when you already use Redux Toolkit. React Query (TanStack Query) is standalone and lighter if you have no Redux. Say: "I choose RTK Query when client and server state live in one Redux store with unified DevTools."',
      },
      { type: 'quote', content: 'RTK Query is an optional addon included in the Redux Toolkit package, and its functionality is built on top of the other APIs in Redux Toolkit.', attribution: 'Redux Toolkit documentation' },
      { type: 'heading', id: 'wrap-up', level: 2, text: 'Wrap-up' },
      {
        type: 'checklist',
        title: 'Definition of Done',
        items: [
          { id: 'done-crud', text: 'Product CRUD works with loading/error states' },
          { id: 'done-cache', text: 'Cache invalidates after mutations' },
          { id: 'done-typed', text: 'Product and response types defined' },
          { id: 'done-git', text: 'Git push' },
        ],
      },
      ...lessonFooter(),
    ],
  },
  'quiz.json': makeQuiz('day17', 17, 'Day 17 Quiz — RTK Query and Async Patterns', 'Verify promise chaining, API typing, query/mutation hooks, cache, and invalidations.', [
    { id: 'q01', type: 'true-false', prompt: 'RTK Query automatically deduplicates identical in-flight requests.', correctAnswer: true, explanation: 'Multiple subscribers to the same query share one request and cache entry.', difficulty: 'easy', tags: ['rtk-query', 'cache'] },
    { id: 'q02', type: 'single-choice', prompt: 'What hook reads cached server data in RTK Query?', options: [{ id: 'a', text: 'useSelector only' }, { id: 'b', text: 'Auto-generated query hook like useGetProductsQuery' }, { id: 'c', text: 'useReducer' }, { id: 'd', text: 'useContext' }], correctOptionId: 'b', explanation: 'createApi generates typed query hooks per endpoint.', difficulty: 'easy', tags: ['rtk-query'] },
    { id: 'q03', type: 'single-choice', prompt: 'What does invalidatesTags on a mutation do?', options: [{ id: 'a', text: 'Deletes the Redux store' }, { id: 'b', text: 'Marks cached queries stale so they refetch' }, { id: 'c', text: 'Cancels all pending requests globally' }, { id: 'd', text: 'Persists cache to localStorage' }], correctOptionId: 'b', explanation: 'Tag invalidation triggers refetch of queries that provided matching tags.', difficulty: 'medium', tags: ['rtk-query', 'cache'] },
    { id: 'q04', type: 'multiple-choice', prompt: 'Which belong in configureStore when using RTK Query? Select all that apply.', options: [{ id: 'a', text: 'api.reducer in reducer object' }, { id: 'b', text: 'api.middleware in middleware chain' }, { id: 'c', text: 'ThemeProvider reducer' }, { id: 'd', text: 'Client slices like todos from Day 16' }], correctOptionIds: ['a', 'b', 'd'], explanation: 'RTK Query adds reducer and middleware; client slices coexist.', difficulty: 'medium', tags: ['redux', 'rtk-query'] },
    { id: 'q05', type: 'fill-blank', prompt: 'Type a generic API wrapper as {{blank1}} where T is the data shape.', blanks: [{ id: 'blank1', acceptedAnswers: ['ApiResponse<T>', 'interface ApiResponse<T>'] }], explanation: 'Generic responses reuse one wrapper for many endpoints.', difficulty: 'medium', tags: ['typescript'] },
    { id: 'q06', type: 'code-output', prompt: 'What does .catch() receive if fetch fails network?', code: "fetch('/api/x').then(r => r.json()).catch(e => e.message);", language: 'javascript', correctOutput: 'Failed to fetch', explanation: 'Network errors reject the promise; catch receives the Error object.', difficulty: 'hard', tags: ['javascript', 'promises'] },
    { id: 'q07', type: 'single-choice', prompt: 'When is RTK Query preferred over hand-rolled fetch in useEffect?', options: [{ id: 'a', text: 'One-off static JSON file read' }, { id: 'b', text: 'Shared server data with caching, loading states, and mutations' }, { id: 'c', text: 'Local theme preference' }, { id: 'd', text: 'Form input state' }], correctOptionId: 'b', explanation: 'RTK Query shines for cached server state with lifecycle management.', difficulty: 'easy', tags: ['architecture'] },
    { id: 'q08', type: 'code-completion', prompt: 'Complete the mutation invalidation.', code: 'addProduct: builder.mutation({\n  query: (body) => ({ url: "/products", method: "POST", body }),\n  {{invalidates}}\n});', language: 'typescript', blanks: [{ id: 'invalidates', acceptedAnswers: ["invalidatesTags: ['Product']", 'invalidatesTags: ["Product"]'] }], explanation: 'invalidatesTags refreshes queries that provide the Product tag.', difficulty: 'medium', tags: ['rtk-query'] },
    { id: 'q09', type: 'short-answer', prompt: 'Explain providesTags vs invalidatesTags.', acceptedKeywords: ['cache', 'stale', 'refetch', 'mark'], sampleAnswer: 'providesTags labels cached query data so RTK Query knows what each entry represents. invalidatesTags on mutations marks those tagged entries stale, triggering refetch of affected queries.', explanation: 'Tag system connects queries and mutations for automatic cache updates.', difficulty: 'medium', tags: ['rtk-query'] },
    { id: 'q10', type: 'multiple-choice', prompt: 'Which states does useGetProductsQuery expose? Select all that apply.', options: [{ id: 'a', text: 'isLoading' }, { id: 'b', text: 'isError' }, { id: 'c', text: 'data' }, { id: 'd', text: 'isFetching' }], correctOptionIds: ['a', 'b', 'c', 'd'], explanation: 'Query hooks expose data plus loading, error, and background fetch flags.', difficulty: 'easy', tags: ['rtk-query', 'react'] },
  ]),
  'challenge.json': makeChallenge('day17', 17, {
    title: 'Build Product Management with RTK Query',
    mission: 'Build Product Management using RTK Query.',
    description: 'Implement full product CRUD with RTK Query — typed API layer, query and mutation hooks, loading/error UI, and cache invalidation. No authentication yet.',
    estimatedMinutes: 240,
    difficulty: 'intermediate',
    requirements: [
      'Create productsApi with createApi, fetchBaseQuery, and Product tag type',
      'Register productsApi reducer and middleware in configureStore',
      'Define Product interface and ApiResponse generic in TypeScript',
      'Implement getProducts query with providesTags',
      'Implement addProduct, updateProduct, deleteProduct mutations with invalidatesTags',
      'Build ProductList showing loading spinner and error message',
      'Build AddProductForm dispatching addProduct mutation',
      'Build edit and delete actions with optimistic or refetch-on-success UX',
      'Connect to mock API or json-server for local development',
    ],
    acceptanceCriteria: [
      'Products load on mount with visible loading state',
      'Adding a product refreshes the list without manual refetch',
      'Update and delete reflect in UI after mutation success',
      'Error states display when API fails',
      'No auth headers or protected routes — open API only',
      'npm run build passes with strict TypeScript',
      'Repository pushed to Git',
    ],
    hints: [
      'Use json-server or MSW for a local /api/products endpoint.',
      'Export hooks: useGetProductsQuery, useAddProductMutation, etc.',
      'Keep client state (UI filters) in Redux slice; server data in RTK Query cache.',
      'Compare loading patterns with Day 8 fetch — RTK Query removes boilerplate.',
      'Tag individual products with { type: \'Product\', id } for granular invalidation.',
    ],
    bonus: {
      title: 'Senior polish',
      description: 'Optional enhancements for interview depth.',
      requirements: [
        'Optimistic updates with onQueryStarted rollback on error',
        'Pagination query with page arg and keepUnusedDataFor tuning',
        'RTK Query DevTools inspection of cache entries',
      ],
    },
    debuggingScenarios: [
      { id: 'dbg-cache', title: 'Cache not updating', symptom: 'List stale after add/delete', cause: 'Missing or mismatched invalidatesTags/providesTags', fix: 'Add invalidatesTags: [\'Product\'] to mutations; verify query providesTags' },
      { id: 'dbg-duplicate', title: 'Duplicate requests', symptom: 'Multiple identical GET calls in Network tab', cause: 'Different query args or missing deduplication window', fix: 'Normalize query args; check refetchOnMountOrArgChange settings' },
      { id: 'dbg-invalidation', title: 'Wrong invalidation', symptom: 'Entire app refetches on single product edit', cause: 'Over-broad tag invalidation', fix: 'Use entity tags { type: \'Product\', id: productId } for surgical updates' },
    ],
  }),
  'interview.json': makeInterview('day17', 17, 'Day 17 Interview Prep', 'Practice RTK Query, caching, React Query comparison, and async API architecture.', [
    { id: 'int-e01', question: 'What is RTK Query and why use it over raw fetch?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'Server state tooling awareness.', keyPoints: ['Caching and deduplication', 'Loading/error lifecycle', 'Integrates with Redux store', 'Generated typed hooks'], sampleAnswer: 'RTK Query is Redux Toolkit\'s data fetching layer. It caches responses, deduplicates requests, generates typed hooks, and manages loading/error states. I use it instead of raw fetch in useEffect because it eliminates boilerplate and keeps server cache in Redux DevTools alongside client state.', followUps: ['What is baseQuery?', 'How handle pagination?'] },
    { id: 'int-e02', question: 'RTK Query vs React Query — when do you pick each?', difficulty: 'easy', category: 'architecture', whatInterviewerTests: 'Library selection judgment.', keyPoints: ['RTK Query needs Redux', 'React Query standalone', 'DevTools unity vs bundle size', 'Team familiarity'], sampleAnswer: 'I pick RTK Query when the app already uses Redux Toolkit — one store, one DevTools timeline. I pick TanStack React Query for greenfield apps without Redux or when minimizing bundle size. Both solve caching; the difference is ecosystem integration.', followUps: ['Can you use both?', 'Migration path?'] },
    { id: 'int-m01', question: 'Explain providesTags and invalidatesTags.', difficulty: 'medium', category: 'react', whatInterviewerTests: 'Cache invalidation mechanics.', keyPoints: ['Tags label cache entries', 'Invalidation marks stale', 'Triggers refetch', 'Granular vs list tags'], sampleAnswer: 'Queries declare providesTags to label their cached data — e.g. a product list provides \'Product\'. Mutations declare invalidatesTags to mark those entries stale. RTK Query refetches affected queries automatically. For edits I use { type: \'Product\', id } for surgical invalidation instead of refetching everything.', followUps: ['Optimistic updates?', 'Manual cache update?'] },
    { id: 'int-m02', question: 'How do you type API endpoints in RTK Query?', difficulty: 'medium', category: 'typescript', whatInterviewerTests: 'Production typing patterns.', keyPoints: ['Generic on builder.query/mutation', 'Product interface', 'transformResponse typing', 'Hook inference'], sampleAnswer: 'I define Product interface separately. Endpoints use builder.query<Product[], void> and builder.mutation<Product, CreateProductDto>. transformResponse unwraps ApiResponse<T> if needed. Generated hooks infer return types — components get typed data without casts.', followUps: ['Error typing?', 'Paginated responses?'] },
    { id: 'int-m03', question: 'Walk through promise chaining vs async/await.', difficulty: 'medium', category: 'javascript', whatInterviewerTests: 'Async fundamentals underpinning RTK Query.', keyPoints: ['then chains handlers', 'catch handles rejection', 'async returns Promise', 'Same event loop behavior'], sampleAnswer: 'Promises represent async results. .then() chains success handlers sequentially; .catch() handles rejections anywhere in the chain. async/await is syntactic sugar — await pauses the async function until the promise settles. RTK Query endpoints are async functions returning data or throwing for baseQuery to catch.', followUps: ['Promise.all?', 'Error boundaries with async?'] },
    { id: 'int-h01', question: 'Product list does not update after delete. Debug step by step.', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'RTK Query debugging process.', keyPoints: ['Redux DevTools cache slice', 'Mutation success', 'Tag matching', 'Manual refetch fallback'], sampleAnswer: 'I confirm delete mutation succeeds in Network tab. In Redux DevTools I check productsApi mutations state. If fulfilled but list stale, I inspect providesTags on getProducts and invalidatesTags on deleteProduct — they must match. I add logging in transformResponse. As fallback I call refetch() from the query hook to isolate cache vs API issues.', followUps: ['onQueryStarted?', 'updateQueryData?'] },
    { id: 'int-h02', question: 'Two components mount and both fetch products — how many network requests?', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Cache deduplication understanding.', keyPoints: ['One in-flight request', 'Shared cache entry', 'Subscribers count', 'refetchOnMount behavior'], sampleAnswer: 'With identical query args, RTK Query deduplicates — one network request serves both subscribers. Both hooks read the same cache entry. If I see two requests, args differ or refetchOnMountOrArgChange forces refetch. I verify args serialization in DevTools.', followUps: ['Stale-while-revalidate?', 'Polling?'] },
    { id: 'int-s01', question: 'Design server state: RTK Query vs Redux slice for products?', difficulty: 'senior', category: 'architecture', whatInterviewerTests: 'Client vs server state separation.', keyPoints: ['RTK Query for server cache', 'Slice for UI filters', 'No duplicate product arrays', 'Single source of truth'], sampleAnswer: 'Server products live in RTK Query cache — fetched, cached, invalidated by mutations. UI state like sort order, selected category filter, and modal open flags live in a client slice. I never copy API products into a manual slice — that duplicates source of truth. Selectors combine query data with UI slice for the view.', followUps: ['Normalized entities?', 'Offline support?'], redFlags: ['Storing API data only in useState', 'Manual refetch in every mutation handler', 'Mixing auth tokens today before Day 18'] },
  ]),
  'reflection.json': makeReflection('day17', 17, 'Day 17 Reflection', 'Solidify RTK Query patterns before authentication tomorrow.', [
    { id: 'refl-01', question: 'How does RTK Query reduce boilerplate compared to Day 8 fetch + useEffect?', guidance: 'Compare loading state, caching, and refetch logic.', minWords: 45 },
    { id: 'refl-02', question: 'Did cache invalidation work on first try? What tag strategy did you use?', guidance: 'Mention providesTags and invalidatesTags.', minWords: 40 },
    { id: 'refl-03', question: 'Where does product data live vs UI filter state in your architecture?', guidance: 'Separate server cache from client slice.', minWords: 40 },
    { id: 'refl-04', question: 'Explain promise chaining and how async/await relates to RTK Query internals.', guidance: 'Use your addProduct flow as example.', minWords: 35 },
    { id: 'refl-05', question: 'What would change when you add authentication on Day 18?', guidance: 'Preview auth headers without implementing today.', minWords: 30 },
  ]),
  'resources.json': makeResources('day17', 17, 'Day 17 Resources', 'Official RTK Query documentation for API setup, hooks, and cache management.', [
    { id: 'res-overview', title: 'Redux Toolkit — RTK Query Overview', url: 'https://redux-toolkit.js.org/rtk-query/overview', type: 'documentation', description: 'Introduction to RTK Query architecture and setup.', recommended: true },
    { id: 'res-api', title: 'Redux Toolkit — createApi', url: 'https://redux-toolkit.js.org/rtk-query/api/createApi', type: 'documentation', description: 'API reference for defining endpoints and hooks.', recommended: true },
    { id: 'res-queries', title: 'Redux Toolkit — Queries', url: 'https://redux-toolkit.js.org/rtk-query/usage/queries', type: 'documentation', description: 'Query hooks, loading states, and refetching.', recommended: true },
    { id: 'res-mutations', title: 'Redux Toolkit — Mutations', url: 'https://redux-toolkit.js.org/rtk-query/usage/mutations', type: 'documentation', description: 'Mutation hooks and cache invalidation patterns.', recommended: true },
    { id: 'res-cache', title: 'Redux Toolkit — Cache Behavior', url: 'https://redux-toolkit.js.org/rtk-query/usage/cache-behavior', type: 'documentation', description: 'Tags, invalidation, and deduplication.', recommended: true },
    { id: 'res-ts', title: 'Redux Toolkit — RTK Query TypeScript', url: 'https://redux-toolkit.js.org/rtk-query/usage-with-typescript', type: 'documentation', description: 'Typing endpoints and generated hooks.', recommended: true },
    { id: 'res-promises', title: 'MDN — Using Promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises', type: 'documentation', description: 'Promise chaining fundamentals for async interviews.', recommended: true },
    { id: 'res-async', title: 'MDN — async function', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function', type: 'documentation', description: 'async/await syntax reference.', recommended: false },
  ]),
});

// ─── DAY 18 ───────────────────────────────────────────────────────────────────
writeDay(18, {
  'meta.json': {
    id: 'day18',
    version: '1.0.0',
    day: 18,
    week: 3,
    track: 'react-interview',
    title: 'Authentication Flow',
    subtitle: 'JWT basics, auth types, protected routes, login/logout, and session persistence',
    mission: 'Build Authentication Flow.',
    readingTimeMinutes: 25,
    estimatedBuildHours: 4,
    difficulty: 'intermediate',
    tags: ['react', 'auth', 'jwt', 'protected-routes', 'localStorage', 'session'],
    topics: {
      javascript: ['JWT basics', 'localStorage', 'sessionStorage'],
      typescript: ['auth types'],
      react: ['protected routes', 'route guards', 'authentication flow'],
    },
    prerequisites: [
      'day17 — RTK Query API layer, baseQuery, mutation hooks',
      'day13 — dynamic routing and navigation from Week 2',
      'day15 — localStorage persistence pattern from theme system',
    ],
    expectedOutcome: [
      'Explain JWT structure: header, payload, signature',
      'Compare localStorage vs sessionStorage for token persistence',
      'Type User, AuthState, and login credentials in TypeScript',
      'Build login and logout flows with session management',
      'Implement protected routes that redirect unauthenticated users',
      'Attach auth tokens to RTK Query baseQuery headers',
      'Explain authentication vs authorization in interviews',
    ],
    definitionOfDone: [
      'Login form authenticates and stores session token',
      'Logout clears session and redirects to login',
      'Protected routes block unauthenticated access',
      'Authenticated users redirect away from login page',
      'Token persists across page reload via storage',
      'Code pushed to Git',
    ],
    tomorrowPreview: {
      day: 19,
      title: 'Admin Dashboard',
      summary: 'Tomorrow you will build an admin dashboard with role-based UI, analytics cards, user tables, search, filter, and pagination — gated by the auth you build today.',
    },
  },
  'lesson.json': {
    id: 'day18-lesson',
    metaId: 'day18',
    title: 'Day 18 — Authentication Flow',
    summary: 'Secure your React app with JWT basics, typed auth state, login/logout flows, protected route guards, and token persistence — the frontend auth architecture every interview tests.',
    blocks: [
      { type: 'heading', id: 'mission', level: 2, text: "Today's Mission" },
      {
        type: 'paragraph',
        content: 'Day 17 gave you open API access. Production apps require authentication — who is the user, are they logged in, can they see this page? Today you build login, logout, protected routes, and session persistence. This is frontend auth architecture: storing tokens, guarding routes, attaching headers. Backend validates JWTs; your job is the client flow.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Security scope',
        content: 'Today covers client-side auth flow patterns for interviews. Never store sensitive secrets in frontend code. JWT in localStorage has XSS tradeoffs — know them, explain them, and mention httpOnly cookies as the production alternative.',
      },
      { type: 'heading', id: 'javascript', level: 2, text: 'JavaScript — JWT, localStorage, sessionStorage' },
      {
        type: 'paragraph',
        content: 'JWT (JSON Web Token) is three base64 segments: header.payload.signature. The payload holds claims like user id and expiry — readable but not tamperable without the secret. localStorage persists until cleared; sessionStorage clears when the tab closes. Both are synchronous string stores.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: "// JWT payload (middle segment) decoded for reading — NOT for trust\nconst payload = JSON.parse(atob(token.split('.')[1]));\nconsole.log(payload.exp); // expiry timestamp\n\nlocalStorage.setItem('token', token);\nconst saved = localStorage.getItem('token');\n\nsessionStorage.setItem('sessionId', id); // cleared on tab close",
      },
      {
        type: 'tip',
        title: 'Production connection',
        content: 'Check token expiry client-side for UX (redirect to login early) but always validate server-side. Client expiry checks are not security — they prevent confusing 401 errors mid-action.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'typescript', level: 2, text: 'TypeScript — Auth Types' },
      {
        type: 'code',
        language: 'typescript',
        filename: 'types/auth.ts',
        code: "export interface User {\n  id: string;\n  email: string;\n  name: string;\n  role: 'user' | 'admin';\n}\n\nexport interface AuthState {\n  user: User | null;\n  token: string | null;\n  status: 'idle' | 'loading' | 'authenticated' | 'error';\n}\n\nexport interface LoginCredentials {\n  email: string;\n  password: string;\n}",
      },
      { type: 'divider' },
      { type: 'heading', id: 'react', level: 2, text: 'React — Protected Routes and Auth Flow' },
      {
        type: 'tabs',
        items: [
          {
            id: 'tab-guard',
            label: 'Route guards',
            blocks: [
              {
                type: 'paragraph',
                content: 'A ProtectedRoute wrapper checks auth state. Unauthenticated users redirect to /login with return URL. Authenticated users hitting /login redirect to dashboard.',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "function ProtectedRoute({ children }: { children: React.ReactNode }) {\n  const { isAuthenticated } = useAuth();\n  const location = useLocation();\n  if (!isAuthenticated) {\n    return <Navigate to=\"/login\" state={{ from: location }} replace />;\n  }\n  return children;\n}",
              },
            ],
          },
          {
            id: 'tab-flow',
            label: 'Login flow',
            blocks: [
              {
                type: 'paragraph',
                content: 'Login dispatches credentials to API, receives token + user, stores token, updates auth state. Logout clears storage and resets state. Extend Day 17 baseQuery to read token from store or storage.',
              },
              {
                type: 'code',
                language: 'typescript',
                code: "const baseQuery = fetchBaseQuery({\n  baseUrl: '/api',\n  prepareHeaders: (headers, { getState }) => {\n    const token = (getState() as RootState).auth.token;\n    if (token) headers.set('Authorization', `Bearer ${token}`);\n    return headers;\n  },\n});",
              },
            ],
          },
        ],
      },
      { type: 'note', title: 'Auth vs authorization', content: 'Authentication verifies identity (login). Authorization verifies permission (admin vs user). Protected routes handle authentication; role checks on Day 19 handle authorization.' },
      { type: 'divider' },
      { type: 'heading', id: 'build', level: 2, text: 'Build Mission — Authentication Module' },
      {
        type: 'checklist',
        title: 'Requirements',
        items: [
          { id: 'req-login', text: 'Login form with email/password' },
          { id: 'req-logout', text: 'Logout button clears session' },
          { id: 'req-protected', text: 'Protected routes redirect to login' },
          { id: 'req-redirect', text: 'Post-login redirect to intended page' },
          { id: 'req-persist', text: 'Session persists across reload' },
        ],
      },
      { type: 'challenge' },
      { type: 'heading', id: 'debugging', level: 2, text: 'Debugging — Auth mistakes' },
      {
        type: 'accordion',
        items: [
          {
            id: 'dbg-unauth',
            title: 'Unauthorized access',
            blocks: [{ type: 'paragraph', content: 'Symptom: Protected page flashes before redirect. Cause: Auth state initializes as authenticated before storage read completes. Fix: Add status: \'loading\' during hydration; render null or spinner until check completes.' }],
          },
          {
            id: 'dbg-redirect',
            title: 'Route redirect bugs',
            blocks: [{ type: 'paragraph', content: 'Symptom: Infinite redirect loop between login and home. Cause: ProtectedRoute wraps login page or isAuthenticated check wrong. Fix: Public routes outside ProtectedRoute; separate PublicOnlyRoute for login.' }],
          },
          {
            id: 'dbg-token',
            title: 'Token persistence',
            blocks: [{ type: 'paragraph', content: 'Symptom: Logged out after refresh. Cause: Token not saved to localStorage or not restored on init. Fix: Persist in login success handler; hydrate auth slice from storage in store preloadedState or auth listener.' }],
          },
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'interview-prep', level: 2, text: 'Interview Focus — JWT and Protected Routes' },
      {
        type: 'paragraph',
        content: 'Expect: Where do you store JWT? localStorage vs httpOnly cookie tradeoffs. How do protected routes work? What happens on 401 from API? Your answers should mention XSS, CSRF, redirect flows, and token refresh as a follow-up you know exists.',
      },
      { type: 'heading', id: 'wrap-up', level: 2, text: 'Wrap-up' },
      {
        type: 'checklist',
        title: 'Definition of Done',
        items: [
          { id: 'done-login', text: 'Login and logout work' },
          { id: 'done-guard', text: 'Protected routes enforce auth' },
          { id: 'done-persist', text: 'Session survives reload' },
          { id: 'done-git', text: 'Git push' },
        ],
      },
      ...lessonFooter(),
    ],
  },
  'quiz.json': makeQuiz('day18', 18, 'Day 18 Quiz — Authentication and Protected Routes', 'Verify JWT basics, storage APIs, auth types, route guards, and session flow.', [
    { id: 'q01', type: 'true-false', prompt: 'JWT payload is encrypted and cannot be read by the client.', correctAnswer: false, explanation: 'JWT payload is base64-encoded, not encrypted — anyone can decode and read claims. Signature prevents tampering.', difficulty: 'easy', tags: ['jwt', 'auth'] },
    { id: 'q02', type: 'single-choice', prompt: 'What happens to sessionStorage when the browser tab closes?', options: [{ id: 'a', text: 'Data persists forever' }, { id: 'b', text: 'Data is cleared for that tab' }, { id: 'c', text: 'Data syncs to server' }, { id: 'd', text: 'Data moves to localStorage' }], correctOptionId: 'b', explanation: 'sessionStorage is scoped to the tab session.', difficulty: 'easy', tags: ['javascript', 'storage'] },
    { id: 'q03', type: 'single-choice', prompt: 'What does ProtectedRoute typically render for unauthenticated users?', options: [{ id: 'a', text: 'The protected page with hidden content' }, { id: 'b', text: 'Navigate/redirect to login' }, { id: 'c', text: 'null always with no redirect' }, { id: 'd', text: 'An error boundary crash' }], correctOptionId: 'b', explanation: 'Route guards redirect unauthenticated users to login, often preserving return URL in location state.', difficulty: 'easy', tags: ['react', 'routing'] },
    { id: 'q04', type: 'multiple-choice', prompt: 'Which are parts of a JWT? Select all that apply.', options: [{ id: 'a', text: 'Header' }, { id: 'b', text: 'Payload' }, { id: 'c', text: 'Signature' }, { id: 'd', text: 'Database ID' }], correctOptionIds: ['a', 'b', 'c'], explanation: 'JWT structure is header.payload.signature — three dot-separated segments.', difficulty: 'medium', tags: ['jwt'] },
    { id: 'q05', type: 'fill-blank', prompt: 'Attach bearer token in RTK Query via {{blank1}} in fetchBaseQuery.', blanks: [{ id: 'blank1', acceptedAnswers: ['prepareHeaders'] }], explanation: 'prepareHeaders mutates request headers before each API call.', difficulty: 'medium', tags: ['rtk-query', 'auth'] },
    { id: 'q06', type: 'code-output', prompt: 'What does localStorage.getItem return for missing key?', code: "const x = localStorage.getItem('missing');\nconsole.log(x);", language: 'javascript', correctOutput: 'null', explanation: 'getItem returns null when the key does not exist.', difficulty: 'easy', tags: ['javascript', 'storage'] },
    { id: 'q07', type: 'single-choice', prompt: 'Authentication vs authorization — which verifies permissions?', options: [{ id: 'a', text: 'Authentication' }, { id: 'b', text: 'Authorization' }, { id: 'c', text: 'Both equally' }, { id: 'd', text: 'Neither' }], correctOptionId: 'b', explanation: 'Authentication proves identity; authorization checks what that identity can access.', difficulty: 'easy', tags: ['auth'] },
    { id: 'q08', type: 'code-completion', prompt: 'Complete the redirect with return location.', code: 'if (!isAuthenticated) {\n  return <Navigate to="/login" state={{ {{from}}: location }} replace />;\n}', language: 'typescript', blanks: [{ id: 'from', acceptedAnswers: ['from'] }], explanation: 'location state preserves intended destination for post-login redirect.', difficulty: 'medium', tags: ['react-router'] },
    { id: 'q09', type: 'short-answer', prompt: 'localStorage vs httpOnly cookie for JWT — one tradeoff each.', acceptedKeywords: ['XSS', 'CSRF', 'javascript', 'httpOnly'], sampleAnswer: 'localStorage is accessible to JavaScript — vulnerable to XSS stealing tokens but immune to CSRF. httpOnly cookies cannot be read by JS — safer from XSS but need CSRF protection. Production often prefers httpOnly cookies.', explanation: 'Interviewers expect awareness of both attack vectors.', difficulty: 'hard', tags: ['auth', 'security'] },
    { id: 'q10', type: 'multiple-choice', prompt: 'Which belong in a typed AuthState? Select all that apply.', options: [{ id: 'a', text: 'user: User | null' }, { id: 'b', text: 'token: string | null' }, { id: 'c', text: 'status loading/authenticated' }, { id: 'd', text: 'productList: Product[]' }], correctOptionIds: ['a', 'b', 'c'], explanation: 'AuthState tracks user, token, and auth lifecycle — not unrelated domain data.', difficulty: 'medium', tags: ['typescript', 'auth'] },
  ]),
  'challenge.json': makeChallenge('day18', 18, {
    title: 'Build an Authentication Flow',
    mission: 'Build Authentication Flow.',
    description: 'Implement login, logout, protected routes, session persistence, and token injection into RTK Query — the standard frontend auth module.',
    estimatedMinutes: 240,
    difficulty: 'intermediate',
    requirements: [
      'Define User, AuthState, LoginCredentials TypeScript interfaces',
      'Create auth slice or context with login, logout, and hydrate actions',
      'Build LoginPage with form validation and error display',
      'Persist token to localStorage on successful login',
      'Restore auth state from localStorage on app init',
      'Build ProtectedRoute wrapper using React Router',
      'Redirect authenticated users away from /login to dashboard',
      'Implement logout clearing storage and auth state',
      'Extend RTK Query prepareHeaders to attach Bearer token',
    ],
    acceptanceCriteria: [
      'Unauthenticated users cannot access /dashboard or /products admin routes',
      'Login with valid credentials stores token and redirects to intended page',
      'Logout clears token and redirects to login',
      'Page reload keeps user logged in if token valid',
      '401 from API triggers logout or refresh prompt',
      'npm run build passes with strict TypeScript',
      'Repository pushed to Git',
    ],
    hints: [
      'Use Navigate from react-router-dom with state={{ from: location }}.',
      'Initialize auth status as loading until storage hydration completes.',
      'Mock login endpoint returning { token, user } for local dev.',
      'Reuse Day 17 productsApi — add prepareHeaders for auth.',
      'Compare persistence with Day 15 theme localStorage pattern.',
    ],
    bonus: {
      title: 'Senior polish',
      description: 'Optional auth enhancements.',
      requirements: [
        'Token expiry check with auto-logout on expired JWT',
        'PublicOnlyRoute redirecting logged-in users from login/register',
        'Auth error boundary for 401 global handler',
      ],
    },
    debuggingScenarios: [
      { id: 'dbg-unauth', title: 'Unauthorized access', symptom: 'Protected content visible briefly or always', cause: 'Auth hydration race or missing guard', fix: 'Loading state during init; wrap routes correctly' },
      { id: 'dbg-redirect', title: 'Route redirect bugs', symptom: 'Infinite loop login ↔ home', cause: 'Login inside ProtectedRoute or wrong isAuthenticated', fix: 'Separate public and protected route trees' },
      { id: 'dbg-token', title: 'Token persistence', symptom: 'Logged out on refresh', cause: 'Token not saved or not restored', fix: 'Persist on login; preload auth slice from localStorage' },
    ],
  }),
  'interview.json': makeInterview('day18', 18, 'Day 18 Interview Prep', 'Practice JWT, auth storage, protected routes, and authentication architecture.', [
    { id: 'int-e01', question: 'What is JWT and how does frontend use it?', difficulty: 'easy', category: 'javascript', whatInterviewerTests: 'Basic auth token understanding.', keyPoints: ['Three segments', 'Payload has claims', 'Bearer header', 'Server validates signature'], sampleAnswer: 'JWT is a signed token with header, payload, and signature. After login the server returns a JWT; the client stores it and sends Authorization: Bearer <token> on requests. I decode payload client-side only for UX like expiry display — trust comes from server validation.', followUps: ['Refresh tokens?', 'Where store JWT?'] },
    { id: 'int-e02', question: 'How do protected routes work in React?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'Route guard implementation.', keyPoints: ['Wrapper component', 'Check auth state', 'Navigate to login', 'Preserve return URL'], sampleAnswer: 'I wrap private routes in a ProtectedRoute component that reads auth state. If not authenticated, it renders Navigate to /login with location state for post-login redirect. Public routes like login sit outside the guard. I show a loading state while hydrating token from storage.', followUps: ['Role-based routes?', 'Lazy loaded routes?'] },
    { id: 'int-m01', question: 'localStorage vs sessionStorage vs httpOnly cookies for auth?', difficulty: 'medium', category: 'architecture', whatInterviewerTests: 'Storage tradeoff knowledge.', keyPoints: ['XSS vs CSRF', 'Persistence scope', 'JS accessibility', 'Production preference'], sampleAnswer: 'localStorage persists across sessions but is readable by JS — XSS risk. sessionStorage clears on tab close. httpOnly cookies are not JS-accessible — better XSS protection but need CSRF tokens. I explain tradeoffs; production teams often choose httpOnly cookies with SameSite attributes.', followUps: ['Secure flag?', 'Token refresh flow?'] },
    { id: 'int-m02', question: 'How do you type auth state in TypeScript?', difficulty: 'medium', category: 'typescript', whatInterviewerTests: 'Auth domain modeling.', keyPoints: ['User interface', 'Nullable user/token', 'Status enum', 'Typed hooks'], sampleAnswer: 'I define User with id, email, role. AuthState has user: User | null, token: string | null, and status union idle | loading | authenticated | error. Login action uses LoginCredentials. Typed useAuth hook returns discriminated state so components narrow safely.', followUps: ['Role union types?', 'RTK auth slice?'] },
    { id: 'int-m03', question: 'Walk through login to protected page flow.', difficulty: 'medium', category: 'scenario', whatInterviewerTests: 'End-to-end auth narrative.', keyPoints: ['Submit credentials', 'Store token', 'Update state', 'Redirect', 'Attach headers'], sampleAnswer: 'User submits login form. Client POSTs credentials. Server returns JWT and user. Client saves token to storage, updates auth state, redirects to saved location or dashboard. Subsequent RTK Query calls use prepareHeaders to attach Bearer token. ProtectedRoute allows access because isAuthenticated is true.', followUps: ['What on 401?', 'Concurrent tabs?'] },
    { id: 'int-h01', question: 'User sees flash of dashboard then login page on refresh. Why?', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Auth hydration race debugging.', keyPoints: ['Default authenticated false', 'Async storage read', 'Loading gate', 'SSR hydration'], sampleAnswer: 'Initial render assumes logged out while token still loading from localStorage. ProtectedRoute redirects, then auth hydrates and flips state. Fix: auth status starts as loading; ProtectedRoute renders spinner until hydration completes. Never render redirect decision on uninitialized auth.', followUps: ['preloadedState?', 'Zustand persist?'] },
    { id: 'int-h02', question: 'API returns 401 on expired token. What should the client do?', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Token lifecycle handling.', keyPoints: ['Clear auth state', 'Redirect login', 'Optional refresh', 'Global interceptor'], sampleAnswer: 'On 401 I clear token and auth state, redirect to login with message. Ideally a refresh token flow retries once before logout — but if no refresh, hard logout is correct. I implement this in baseQuery wrapper or axios interceptor globally so every endpoint handles it consistently.', followUps: ['Silent refresh?', 'Race with multiple 401s?'] },
    { id: 'int-s01', question: 'Design auth: Context vs Redux slice vs RTK Query mutation only?', difficulty: 'senior', category: 'architecture', whatInterviewerTests: 'Auth architecture for medium apps.', keyPoints: ['Auth is client state', 'Token in slice or context', 'Login as mutation', 'Single source of truth'], sampleAnswer: 'For apps with Redux from Day 16, auth lives in an auth slice — token, user, status. Login/logout are slice reducers fed by RTK Query auth endpoints or createAsyncThunk. Context works for smaller apps. I avoid duplicating user in Context and Redux. prepareHeaders reads token from auth slice — one source of truth.', followUps: ['OAuth social login?', 'Multi-tenant auth?'], redFlags: ['Trusting client-decoded JWT for authorization', 'Storing passwords in state', 'No loading gate on hydration'] },
  ]),
  'reflection.json': makeReflection('day18', 18, 'Day 18 Reflection', 'Solidify auth patterns before the admin dashboard tomorrow.', [
    { id: 'refl-01', question: 'Where did you store the JWT and why? What are the tradeoffs?', guidance: 'Compare localStorage and alternatives.', minWords: 45 },
    { id: 'refl-02', question: 'Did you hit a redirect loop or auth flash? How did you fix it?', guidance: 'Mention loading/hydration state.', minWords: 40 },
    { id: 'refl-03', question: 'How does prepareHeaders connect Day 17 RTK Query to today\'s auth?', guidance: 'Trace token from login to API call.', minWords: 40 },
    { id: 'refl-04', question: 'Explain authentication vs authorization with examples from your app.', guidance: 'Login vs admin-only features preview.', minWords: 35 },
    { id: 'refl-05', question: 'What role-based UI will you add on Day 19?', guidance: 'Preview dashboard permissions.', minWords: 30 },
  ]),
  'resources.json': makeResources('day18', 18, 'Day 18 Resources', 'Official documentation for storage APIs, routing, and auth patterns.', [
    { id: 'res-jwt', title: 'jwt.io — Introduction', url: 'https://jwt.io/introduction', type: 'documentation', description: 'JWT structure and usage overview.', recommended: true },
    { id: 'res-ls', title: 'MDN — Window.localStorage', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage', type: 'documentation', description: 'localStorage API reference.', recommended: true },
    { id: 'res-ss', title: 'MDN — Window.sessionStorage', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage', type: 'documentation', description: 'sessionStorage API reference.', recommended: true },
    { id: 'res-router', title: 'React Router — Protected Routes', url: 'https://reactrouter.com/en/main/start/tutorial', type: 'documentation', description: 'Routing patterns including auth redirects.', recommended: true },
    { id: 'res-rtk-auth', title: 'Redux Toolkit — Customizing Queries', url: 'https://redux-toolkit.js.org/rtk-query/usage/customizing-queries', type: 'documentation', description: 'prepareHeaders for auth tokens.', recommended: true },
    { id: 'res-react-auth', title: 'React — Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', type: 'documentation', description: 'Context pattern alternative for auth state.', recommended: false },
    { id: 'res-owasp', title: 'OWASP — JWT Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html', type: 'reference', description: 'Security considerations for JWT usage.', recommended: true },
    { id: 'res-bearer', title: 'MDN — Authorization Header', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization', type: 'documentation', description: 'Bearer token HTTP header format.', recommended: false },
  ]),
});

// ─── DAY 19 ───────────────────────────────────────────────────────────────────
writeDay(19, {
  'meta.json': {
    id: 'day19',
    version: '1.0.0',
    day: 19,
    week: 3,
    track: 'react-interview',
    title: 'Admin Dashboard',
    subtitle: 'Advanced array methods, dashboard models, role-based UI, search, filter, and pagination',
    mission: 'Build Admin Dashboard.',
    readingTimeMinutes: 25,
    estimatedBuildHours: 4,
    difficulty: 'intermediate',
    tags: ['react', 'dashboard', 'admin', 'role-based', 'pagination', 'search', 'filter'],
    topics: {
      javascript: ['advanced array methods', 'object manipulation'],
      typescript: ['dashboard models'],
      react: ['conditional rendering', 'role-based UI', 'dashboard layout'],
    },
    prerequisites: [
      'day18 — authentication flow, protected routes, User role types',
      'day17 — RTK Query for fetching user/product data',
      'day10 — filter, sort, and list patterns from Week 2',
      'day09 — debounced search from Week 2',
    ],
    expectedOutcome: [
      'Use map, filter, reduce, find, and sort for dashboard data pipelines',
      'Type DashboardStats, UserRow, and filter state models',
      'Build analytics summary cards with conditional rendering',
      'Render role badges and hide admin actions from regular users',
      'Implement search, category filter, and paginated user table',
      'Structure dashboard layout with sidebar and content area',
      'Explain dashboard folder architecture in interviews',
    ],
    definitionOfDone: [
      'Analytics cards display summary metrics',
      'User table with search and role filter works',
      'Role badges render correctly per user',
      'Pagination controls navigate pages',
      'Non-admin users cannot see admin-only UI',
      'Code pushed to Git',
    ],
    tomorrowPreview: {
      day: 20,
      title: 'Optimize React Performance',
      summary: 'Tomorrow you will optimize your product list and routes with React.memo, useMemo, useCallback, lazy loading, and code splitting — with before/after performance comparison.',
    },
  },
  'lesson.json': {
    id: 'day19-lesson',
    metaId: 'day19',
    title: 'Day 19 — Admin Dashboard',
    summary: 'Build an enterprise-style admin dashboard with analytics cards, searchable user tables, role badges, pagination, and role-based UI — gated by Day 18 authentication.',
    blocks: [
      { type: 'heading', id: 'mission', level: 2, text: "Today's Mission" },
      {
        type: 'paragraph',
        content: 'Authenticated users need a home base. Admin dashboards combine data visualization, tables, search, filters, and permission-aware UI — the layout every B2B SaaS ships. Today you build analytics cards, a user table with search/filter/pagination, and role badges that show or hide actions based on auth from Day 18.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Scope boundary',
        content: 'Today focuses on dashboard UI and role-based rendering. Do NOT introduce React.memo performance labs (Day 20) or machine coding review (Day 21). Apply filters with plain JavaScript — optimize tomorrow.',
      },
      { type: 'heading', id: 'javascript', level: 2, text: 'JavaScript — Advanced Array Methods and Object Manipulation' },
      {
        type: 'paragraph',
        content: 'Dashboards transform raw API data into views. Chain filter → sort → slice for paginated tables. reduce aggregates metrics for analytics cards. Destructure and spread to update filter state immutably — same patterns from Day 12 cart.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: "const admins = users.filter(u => u.role === 'admin');\nconst totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);\n\nconst visible = users\n  .filter(u => u.name.toLowerCase().includes(search))\n  .filter(u => roleFilter === 'all' || u.role === roleFilter)\n  .sort((a, b) => a.name.localeCompare(b.name));\n\nconst page = visible.slice(pageIndex * size, (pageIndex + 1) * size);",
      },
      {
        type: 'tip',
        title: 'Production connection',
        content: 'Client-side filter/pagination suits demos and small datasets. In production interviews, mention server-side pagination with query params — you built URL params on Day 13.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'typescript', level: 2, text: 'TypeScript — Dashboard Models' },
      {
        type: 'code',
        language: 'typescript',
        filename: 'types/dashboard.ts',
        code: "export interface DashboardStats {\n  totalUsers: number;\n  activeUsers: number;\n  totalProducts: number;\n  revenue: number;\n}\n\nexport interface UserRow {\n  id: string;\n  name: string;\n  email: string;\n  role: 'user' | 'admin';\n  status: 'active' | 'inactive';\n}\n\nexport interface TableFilters {\n  search: string;\n  role: 'all' | 'user' | 'admin';\n  page: number;\n  pageSize: number;\n}",
      },
      { type: 'divider' },
      { type: 'heading', id: 'react', level: 2, text: 'React — Conditional Rendering and Role-based UI' },
      {
        type: 'tabs',
        items: [
          {
            id: 'tab-layout',
            label: 'Dashboard layout',
            blocks: [
              {
                type: 'paragraph',
                content: 'Standard pattern: sidebar navigation + header + main content grid. Analytics cards in a responsive CSS grid; table below. Use auth user role from Day 18 to conditionally render admin nav items.',
              },
            ],
          },
          {
            id: 'tab-role',
            label: 'Role-based UI',
            blocks: [
              {
                type: 'code',
                language: 'typescript',
                code: "function RoleBadge({ role }: { role: UserRow['role'] }) {\n  return (\n    <span className={role === 'admin' ? 'badge-admin' : 'badge-user'}>\n      {role}\n    </span>\n  );\n}\n\n{user.role === 'admin' && (\n  <button onClick={handleDelete}>Delete User</button>\n)}",
              },
            ],
          },
          {
            id: 'tab-table',
            label: 'Search & pagination',
            blocks: [
              {
                type: 'paragraph',
                content: 'Debounce search input from Day 9. Reset page to 0 when filters change. Show "Page X of Y" with prev/next buttons. Empty state when no matches.',
              },
            ],
          },
        ],
      },
      { type: 'warning', title: 'Authorization check', content: 'Hide UI is not security — backend must enforce roles too. Frontend role checks improve UX; API must reject unauthorized mutations.' },
      { type: 'divider' },
      { type: 'heading', id: 'build', level: 2, text: 'Build Mission — Admin Dashboard' },
      {
        type: 'checklist',
        title: 'Requirements',
        items: [
          { id: 'req-cards', text: 'Analytics cards: users, products, revenue metrics' },
          { id: 'req-table', text: 'User table with name, email, role, status columns' },
          { id: 'req-search', text: 'Search users by name or email' },
          { id: 'req-filter', text: 'Filter by role: all, user, admin' },
          { id: 'req-badge', text: 'Role badge component with distinct styles' },
          { id: 'req-page', text: 'Pagination with page size control' },
        ],
      },
      { type: 'challenge' },
      { type: 'heading', id: 'debugging', level: 2, text: 'Debugging — Dashboard mistakes' },
      {
        type: 'accordion',
        items: [
          {
            id: 'dbg-conditional',
            title: 'Wrong conditional rendering',
            blocks: [{ type: 'paragraph', content: 'Symptom: Admin button visible to all users. Cause: Checking wrong property or truthy string "user". Fix: Strict role === \'admin\' check; use auth context user.role not hardcoded.' }],
          },
          {
            id: 'dbg-permission',
            title: 'Permission bugs',
            blocks: [{ type: 'paragraph', content: 'Symptom: Regular user accesses admin route via URL. Cause: Only hiding sidebar link, no route guard. Fix: Wrap admin routes with role check in ProtectedRoute or RequireAdmin component.' }],
          },
          {
            id: 'dbg-pagination',
            title: 'Pagination issues',
            blocks: [{ type: 'paragraph', content: 'Symptom: Empty page after filter or wrong total pages. Cause: Pagination applied before filter or page index not reset. Fix: Filter first, then paginate; reset page to 0 on search/filter change.' }],
          },
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'interview-prep', level: 2, text: 'Interview Focus — Dashboard Architecture' },
      {
        type: 'paragraph',
        content: 'Expect: How would you structure a dashboard app? Feature folders: features/dashboard/, features/users/, shared/components/Table. Co-locate filters with table or lift to URL search params for shareable views.',
      },
      { type: 'heading', id: 'wrap-up', level: 2, text: 'Wrap-up' },
      {
        type: 'checklist',
        title: 'Definition of Done',
        items: [
          { id: 'done-cards', text: 'Analytics cards render metrics' },
          { id: 'done-table', text: 'User table search/filter/pagination work' },
          { id: 'done-role', text: 'Role badges and gated admin UI' },
          { id: 'done-git', text: 'Git push' },
        ],
      },
      ...lessonFooter(),
    ],
  },
  'quiz.json': makeQuiz('day19', 19, 'Day 19 Quiz — Admin Dashboard and Role-based UI', 'Verify array methods, dashboard types, conditional rendering, and table patterns.', [
    { id: 'q01', type: 'true-false', prompt: 'Hiding admin buttons in UI is sufficient security without backend role checks.', correctAnswer: false, explanation: 'Frontend role UI is UX only — APIs must enforce authorization server-side.', difficulty: 'easy', tags: ['auth', 'security'] },
    { id: 'q02', type: 'single-choice', prompt: 'Which array method aggregates values into a single result?', options: [{ id: 'a', text: 'map' }, { id: 'b', text: 'filter' }, { id: 'c', text: 'reduce' }, { id: 'd', text: 'forEach' }], correctOptionId: 'c', explanation: 'reduce folds array into one accumulated value — ideal for analytics totals.', difficulty: 'easy', tags: ['javascript', 'arrays'] },
    { id: 'q03', type: 'single-choice', prompt: 'When search filter changes, what should happen to page index?', options: [{ id: 'a', text: 'Stay on current page always' }, { id: 'b', text: 'Reset to first page' }, { id: 'c', text: 'Jump to last page' }, { id: 'd', text: 'Random page' }], correctOptionId: 'b', explanation: 'Filter shrinks result set — reset page to 0 to avoid empty pages.', difficulty: 'medium', tags: ['pagination'] },
    { id: 'q04', type: 'multiple-choice', prompt: 'Which array methods are non-mutating? Select all that apply.', options: [{ id: 'a', text: 'filter' }, { id: 'b', text: 'map' }, { id: 'c', text: 'sort on copy' }, { id: 'd', text: 'push' }], correctOptionIds: ['a', 'b', 'c'], explanation: 'filter, map return new arrays. sort mutates in place — spread first [...arr].sort(). push mutates.', difficulty: 'medium', tags: ['javascript'] },
    { id: 'q05', type: 'fill-blank', prompt: 'Paginate array with slice: items.slice({{start}}, {{end}}) where start is pageIndex * pageSize.', blanks: [{ id: 'start', acceptedAnswers: ['pageIndex * pageSize', 'page * pageSize'] }, { id: 'end', acceptedAnswers: ['(pageIndex + 1) * pageSize', 'start + pageSize'] }], explanation: 'slice extracts page window from filtered sorted array.', difficulty: 'medium', tags: ['javascript', 'pagination'] },
    { id: 'q06', type: 'code-output', prompt: 'What length after filter?', code: "const users = [{ role: 'admin' }, { role: 'user' }, { role: 'admin' }];\nconsole.log(users.filter(u => u.role === 'admin').length);", language: 'javascript', correctOutput: '2', explanation: 'filter returns two admin entries.', difficulty: 'easy', tags: ['javascript'] },
    { id: 'q07', type: 'single-choice', prompt: 'Best place to check admin role for route access?', options: [{ id: 'a', text: 'Only in table cell styling' }, { id: 'b', text: 'Route guard component checking user.role' }, { id: 'c', text: 'CSS display:none only' }, { id: 'd', text: 'Comment in README' }], correctOptionId: 'b', explanation: 'Route guards enforce access at navigation level — not just visual hiding.', difficulty: 'easy', tags: ['react', 'auth'] },
    { id: 'q08', type: 'code-completion', prompt: 'Complete role badge conditional.', code: '{user.role === {{role}} && <AdminPanel />}', language: 'typescript', blanks: [{ id: 'role', acceptedAnswers: ["'admin'", '"admin"'] }], explanation: 'Strict equality check on role union type.', difficulty: 'easy', tags: ['typescript', 'react'] },
    { id: 'q09', type: 'short-answer', prompt: 'Describe dashboard folder structure for a medium React app.', acceptedKeywords: ['features', 'components', 'pages', 'shared', 'hooks'], sampleAnswer: 'I use feature folders: features/dashboard for cards and layout, features/users for table and filters, shared/ui for Table and Badge components, hooks for useDebounce and useAuth. Pages compose features; types live in types/ or feature types.ts.', explanation: 'Interviewers assess scalable organization.', difficulty: 'medium', tags: ['architecture'] },
    { id: 'q10', type: 'multiple-choice', prompt: 'DashboardStats model might include? Select all that apply.', options: [{ id: 'a', text: 'totalUsers' }, { id: 'b', text: 'revenue' }, { id: 'c', text: 'component JSX' }, { id: 'd', text: 'activeUsers' }], correctOptionIds: ['a', 'b', 'd'], explanation: 'Dashboard models are data shapes — not UI components.', difficulty: 'easy', tags: ['typescript'] },
  ]),
  'challenge.json': makeChallenge('day19', 19, {
    title: 'Build an Admin Dashboard',
    mission: 'Build Admin Dashboard.',
    description: 'Implement analytics cards, searchable/filterable/paginated user table, role badges, and role-gated admin UI — protected by Day 18 authentication.',
    estimatedMinutes: 240,
    difficulty: 'intermediate',
    requirements: [
      'Define DashboardStats and UserRow TypeScript interfaces',
      'Build dashboard layout with sidebar and main content area',
      'Create analytics cards showing total users, products, and revenue',
      'Fetch users via RTK Query or mock data',
      'Build UserTable with columns: name, email, role, status',
      'Implement RoleBadge component with admin/user styles',
      'Add search input filtering by name or email',
      'Add role filter dropdown: all, user, admin',
      'Implement client-side pagination with page controls',
      'Hide admin-only actions (delete, edit roles) from non-admin users',
      'Wrap dashboard in ProtectedRoute from Day 18',
    ],
    acceptanceCriteria: [
      'Analytics cards display computed or fetched metrics',
      'Search narrows table rows in real time or debounced',
      'Role filter shows only matching users',
      'Pagination shows correct page of filtered results',
      'Non-admin users see table but not destructive admin actions',
      'Admin users see full management UI',
      'npm run build passes with strict TypeScript',
      'Repository pushed to Git',
    ],
    hints: [
      'Pipeline: filter by search → filter by role → sort → slice for page.',
      'Reset page to 0 in useEffect when search or roleFilter changes.',
      'Reuse useDebounce from Week 2 for search optimization.',
      'Stats can derive from users/products arrays with reduce.',
      'RequireAdmin wrapper: if (user?.role !== \'admin\') return <Navigate to="/" />.',
    ],
    bonus: {
      title: 'Senior polish',
      description: 'Optional dashboard enhancements.',
      requirements: [
        'Sync filters to URL search params for shareable dashboard views',
        'Sortable column headers on user table',
        'Loading skeletons for cards and table rows',
      ],
    },
    debuggingScenarios: [
      { id: 'dbg-conditional', title: 'Wrong conditional rendering', symptom: 'Admin actions visible to regular users', cause: 'Loose truthy check or wrong role property', fix: 'Strict user.role === \'admin\' guard' },
      { id: 'dbg-permission', title: 'Permission bugs', symptom: 'User accesses /admin via URL', cause: 'No route-level role guard', fix: 'RequireAdmin route wrapper beyond sidebar hiding' },
      { id: 'dbg-pagination', title: 'Pagination issues', symptom: 'Empty table page after search', cause: 'Page index not reset on filter change', fix: 'setPage(0) when search or roleFilter updates' },
    ],
  }),
  'interview.json': makeInterview('day19', 19, 'Day 19 Interview Prep', 'Practice dashboard architecture, conditional rendering, role-based UI, and data tables.', [
    { id: 'int-e01', question: 'How do you implement role-based UI in React?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'Conditional rendering for permissions.', keyPoints: ['Read role from auth', 'Conditional render', 'Route guards', 'Backend enforcement'], sampleAnswer: 'I read user.role from auth context or Redux. Admin-only buttons use {role === \'admin\' && <Button />}. Routes wrap in RequireAdmin guard. I always note backend must enforce too — frontend hiding is UX not security.', followUps: ['Permission arrays?', 'Feature flags?'] },
    { id: 'int-e02', question: 'What array methods power dashboard data pipelines?', difficulty: 'easy', category: 'javascript', whatInterviewerTests: 'Data transformation fundamentals.', keyPoints: ['filter for search', 'reduce for aggregates', 'slice for pagination', 'sort for ordering'], sampleAnswer: 'filter narrows rows by search and role. reduce sums revenue for analytics cards. sort orders by column. slice extracts current page after filter. I chain them immutably without mutating source arrays.', followUps: ['Server-side pagination?', 'Big O of filter chain?'] },
    { id: 'int-m01', question: 'Client-side vs server-side pagination — tradeoffs?', difficulty: 'medium', category: 'architecture', whatInterviewerTests: 'Scale awareness.', keyPoints: ['Client for small datasets', 'Server for large tables', 'URL params', 'RTK Query page arg'], sampleAnswer: 'Client-side paginate after fetch works for hundreds of rows — simple, instant filter. Server-side with page/limit query params scales to millions — less memory, faster initial load. I mention RTK Query skip/take args and Day 13 URL sync for shareable pages.', followUps: ['Cursor pagination?', 'Virtual scrolling?'] },
    { id: 'int-m02', question: 'How do you type dashboard models in TypeScript?', difficulty: 'medium', category: 'typescript', whatInterviewerTests: 'Domain type design.', keyPoints: ['Stats interface', 'UserRow type', 'Filter state', 'Role unions'], sampleAnswer: 'DashboardStats holds numeric aggregates. UserRow types table row with role union user | admin. TableFilters types search string, role filter, page, pageSize. Union types prevent invalid role strings at compile time.', followUps: ['Zod validation?', 'API DTO mapping?'] },
    { id: 'int-m03', question: 'Describe dashboard layout component structure.', difficulty: 'medium', category: 'react', whatInterviewerTests: 'Component composition.', keyPoints: ['Shell layout', 'Sidebar nav', 'Outlet for routes', 'Responsive grid'], sampleAnswer: 'DashboardLayout wraps authenticated pages: Sidebar with nav links, Header with user menu, main Outlet. Analytics grid uses CSS grid auto-fit. Table section full width below cards. Layout persists across nested routes via React Router outlet.', followUps: ['Collapsible sidebar?', 'Mobile drawer nav?'] },
    { id: 'int-h01', question: 'Search returns zero rows but user sees page 5 empty. Debug.', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Pagination + filter interaction.', keyPoints: ['Page not reset', 'Total pages miscalculation', 'Off-by-one slice', 'Empty state'], sampleAnswer: 'Filter reduced results to 3 rows but page index still 5 — slice returns empty. Fix: reset page to 0 when search or filter changes. Compute totalPages from filtered.length. Show empty state component when filtered.length === 0.', followUps: ['useEffect deps?', 'Derived state anti-pattern?'] },
    { id: 'int-h02', question: 'Regular user deletes admin via DevTools manipulating DOM. Is your app secure?', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Frontend vs backend security.', keyPoints: ['UI hiding insufficient', 'API authorization', '403 responses', 'Audit logging'], sampleAnswer: 'No — frontend role checks are bypassable. Secure apps validate JWT role on every admin API endpoint returning 403. I explain I hide UI for UX but backend enforces. Mention OWASP and principle of least privilege.', followUps: ['RBAC vs ABAC?', 'JWT role claim trust?'] },
    { id: 'int-s01', question: 'Design admin dashboard state: local vs Redux vs URL?', difficulty: 'senior', category: 'architecture', whatInterviewerTests: 'State placement for dashboard filters.', keyPoints: ['URL for shareable filters', 'Redux for shared complex state', 'Local for ephemeral UI', 'Avoid over-engineering'], sampleAnswer: 'Table filters and page sync to URL searchParams — shareable and bookmarkable. Auth user in Redux from Day 18. Modal open state local. Fetched users in RTK Query cache. I avoid putting filter state in Redux unless multiple distant components need it — URL is source of truth for dashboards.', followUps: ['nuqs library?', 'Reset filters on logout?'], redFlags: ['All state in one useState object', 'No empty states', 'Pagination before filter'] },
  ]),
  'reflection.json': makeReflection('day19', 19, 'Day 19 Reflection', 'Solidify dashboard patterns before performance optimization tomorrow.', [
    { id: 'refl-01', question: 'Walk through your filter → sort → paginate pipeline.', guidance: 'Name array methods used at each step.', minWords: 45 },
    { id: 'refl-02', question: 'How did you gate admin UI vs regular user views?', guidance: 'Route guard and conditional render.', minWords: 40 },
    { id: 'refl-03', question: 'What dashboard types did you define and why?', guidance: 'DashboardStats, UserRow, TableFilters.', minWords: 40 },
    { id: 'refl-04', question: 'What pagination bug did you avoid or fix?', guidance: 'Page reset on filter change.', minWords: 35 },
    { id: 'refl-05', question: 'Which components will you memoize on Day 20?', guidance: 'Preview performance targets.', minWords: 30 },
  ]),
  'resources.json': makeResources('day19', 19, 'Day 19 Resources', 'Official documentation for array methods, conditional rendering, and layout.', [
    { id: 'res-filter', title: 'MDN — Array.prototype.filter', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter', type: 'documentation', description: 'filter reference for table pipelines.', recommended: true },
    { id: 'res-reduce', title: 'MDN — Array.prototype.reduce', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce', type: 'documentation', description: 'reduce for analytics aggregations.', recommended: true },
    { id: 'res-conditional', title: 'React — Conditional Rendering', url: 'https://react.dev/learn/conditional-rendering', type: 'documentation', description: 'Patterns for role-based UI.', recommended: true },
    { id: 'res-list', title: 'React — Rendering Lists', url: 'https://react.dev/learn/rendering-lists', type: 'documentation', description: 'Keys and list rendering for tables.', recommended: true },
    { id: 'res-router-outlet', title: 'React Router — Outlet', url: 'https://reactrouter.com/en/main/components/outlet', type: 'documentation', description: 'Nested dashboard layouts with outlets.', recommended: true },
    { id: 'res-sort', title: 'MDN — Array.prototype.sort', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort', type: 'documentation', description: 'Sorting table columns immutably.', recommended: false },
    { id: 'res-destructure', title: 'MDN — Destructuring assignment', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment', type: 'documentation', description: 'Object manipulation for filter state updates.', recommended: false },
    { id: 'res-a11y-table', title: 'MDN — Table accessibility', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/table_role', type: 'documentation', description: 'Accessible table markup for dashboards.', recommended: true },
  ]),
});

// ─── DAY 20 ───────────────────────────────────────────────────────────────────
writeDay(20, {
  'meta.json': {
    id: 'day20',
    version: '1.0.0',
    day: 20,
    week: 3,
    track: 'react-interview',
    title: 'Optimize React Performance',
    subtitle: 'Memory, React.memo, useMemo, useCallback, lazy loading, and code splitting',
    mission: 'Optimize React Performance.',
    readingTimeMinutes: 30,
    estimatedBuildHours: 4,
    difficulty: 'intermediate',
    tags: ['react', 'performance', 'memo', 'useMemo', 'useCallback', 'lazy', 'code-splitting'],
    topics: {
      javascript: ['memory', 'garbage collection'],
      typescript: ['performance-friendly types'],
      react: ['React.memo', 'useMemo', 'useCallback', 'lazy loading', 'code splitting'],
    },
    prerequisites: [
      'day19 — admin dashboard with user table and analytics cards',
      'day17 — product list from RTK Query',
      'day10 — React.memo introduction from Week 2',
      'day13 — routing for lazy route splitting',
    ],
    expectedOutcome: [
      'Explain JavaScript memory and garbage collection basics',
      'Use performance-friendly TypeScript types without unnecessary widening',
      'Apply React.memo to prevent unnecessary child re-renders',
      'Stabilize callbacks with useCallback and derived data with useMemo',
      'Lazy load routes and heavy components with React.lazy and Suspense',
      'Measure and compare before/after render performance',
      'Explain when NOT to memoize in interviews',
    ],
    definitionOfDone: [
      'Product list optimized with memoized row components',
      'Expensive filters wrapped in useMemo',
      'Stable callbacks passed to memoized children',
      'Dashboard and admin routes lazy loaded',
      'Before/after comparison documented',
      'Code pushed to Git',
    ],
    tomorrowPreview: {
      day: 21,
      title: 'Machine Coding Round 3',
      summary: 'Tomorrow is your 150-minute Week 3 review — build authentication, dashboard, Redux store, API integration, and theme system from scratch without referring to previous code.',
    },
  },
  'lesson.json': {
    id: 'day20-lesson',
    metaId: 'day20',
    title: 'Day 20 — Optimize React Performance',
    summary: 'Run a performance lab on your product list and routes — React.memo, useMemo, useCallback, lazy loading, code splitting, and before/after comparison with interview-ready optimization judgment.',
    blocks: [
      { type: 'heading', id: 'mission', level: 2, text: "Today's Mission" },
      {
        type: 'paragraph',
        content: 'Your app works — but does it scale renders? Day 10 introduced React.memo lightly. Today you go deep: profile unnecessary re-renders, memoize product rows, stabilize callbacks, lazy load admin routes, and document before/after. Interviewers ask when to optimize — the answer is measure first, memoize surgically, not everywhere.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Measure before memoizing',
        content: 'Premature memoization adds complexity without benefit. Use React DevTools Profiler to find actual bottlenecks on your Day 17 product list and Day 19 dashboard before applying fixes.',
      },
      { type: 'heading', id: 'javascript', level: 2, text: 'JavaScript — Memory and Garbage Collection' },
      {
        type: 'paragraph',
        content: 'JavaScript engines allocate objects on the heap. When references drop to zero, garbage collection reclaims memory. Closures keep variables alive. Event listeners and timers left uncleaned cause leaks. In React, stale closures in effects and unstable object references trigger extra renders — related but distinct problems.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: "// Closure keeps largeData alive while handler exists\nfunction createHandler(largeData) {\n  return () => console.log(largeData.length);\n}\n\n// GC can reclaim when no references remain\nlet cache = bigObject;\ncache = null; // eligible for GC",
      },
      {
        type: 'tip',
        title: 'Production connection',
        content: 'Memory leaks in SPAs often come from subscriptions not cleaned in useEffect return, or global caches growing unbounded. Always return cleanup functions.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'typescript', level: 2, text: 'TypeScript — Performance-friendly Types' },
      {
        type: 'paragraph',
        content: 'Types erase at compile time — zero runtime cost. Still, prefer narrow unions over string, const assertions for literal stability, and avoid unnecessary generic widening that forces casts downstream. Readonly arrays signal immutability intent to teammates.',
      },
      {
        type: 'code',
        language: 'typescript',
        code: "type Role = 'user' | 'admin'; // narrow union\n\ninterface ProductRowProps {\n  readonly product: Product;\n  onSelect: (id: string) => void;\n}\n\n// Memo component typed props\nconst ProductRow = React.memo(function ProductRow({ product, onSelect }: ProductRowProps) {\n  return <tr onClick={() => onSelect(product.id)}>...</tr>;\n});",
      },
      { type: 'divider' },
      { type: 'heading', id: 'react', level: 2, text: 'React — Memoization and Code Splitting' },
      {
        type: 'tabs',
        items: [
          {
            id: 'tab-memo',
            label: 'React.memo',
            blocks: [
              {
                type: 'paragraph',
                content: 'React.memo wraps a component and skips re-render if props are shallow-equal. Use on expensive list rows — ProductRow, UserRow — when parent re-renders often but row props unchanged.',
              },
            ],
          },
          {
            id: 'tab-hooks',
            label: 'useMemo & useCallback',
            blocks: [
              {
                type: 'code',
                language: 'typescript',
                code: "const filtered = useMemo(\n  () => products.filter(p => p.category === cat),\n  [products, cat]\n);\n\nconst handleSelect = useCallback((id: string) => {\n  dispatch(selectProduct(id));\n}, [dispatch]);",
              },
              {
                type: 'paragraph',
                content: 'useMemo caches computed values. useCallback caches function references — needed when passing to React.memo children. Wrong dependency arrays cause stale data or defeat memoization.',
              },
            ],
          },
          {
            id: 'tab-lazy',
            label: 'Lazy & Suspense',
            blocks: [
              {
                type: 'code',
                language: 'typescript',
                code: "const AdminDashboard = lazy(() => import('./features/dashboard/AdminDashboard'));\n\n<Suspense fallback={<PageSpinner />}>\n  <Routes>\n    <Route path=\"/admin\" element={<AdminDashboard />} />\n  </Routes>\n</Suspense>",
              },
            ],
          },
        ],
      },
      { type: 'note', title: 'When NOT to memoize', content: 'Do not wrap every component in memo. Cheap renders cost less than comparison overhead. Memoize list items, heavy charts, and components receiving stable props that re-render due to unrelated parent state.' },
      { type: 'divider' },
      { type: 'heading', id: 'build', level: 2, text: 'Build Mission — Performance Lab' },
      {
        type: 'checklist',
        title: 'Requirements',
        items: [
          { id: 'req-profile', text: 'Profile product list renders with React DevTools' },
          { id: 'req-memo-row', text: 'Memoize ProductRow or equivalent list item' },
          { id: 'req-usememo', text: 'Wrap expensive filter/sort in useMemo' },
          { id: 'req-callback', text: 'Stabilize handlers with useCallback' },
          { id: 'req-lazy', text: 'Lazy load admin/dashboard routes' },
          { id: 'req-compare', text: 'Document before/after render counts or timings' },
        ],
      },
      { type: 'challenge' },
      { type: 'heading', id: 'debugging', level: 2, text: 'Debugging — Performance mistakes' },
      {
        type: 'accordion',
        items: [
          {
            id: 'dbg-rerender',
            title: 'Unnecessary re-renders',
            blocks: [{ type: 'paragraph', content: 'Symptom: All rows re-render on single checkbox toggle. Cause: Inline arrow functions or object props break memo equality. Fix: useCallback for handlers; avoid style={{}} inline objects.' }],
          },
          {
            id: 'dbg-deps',
            title: 'Wrong dependency arrays',
            blocks: [{ type: 'paragraph', content: 'Symptom: Stale filtered list or infinite effect loop. Cause: Missing deps or unstable deps like {} in array. Fix: ESLint exhaustive-deps; hoist stable refs; memoize objects passed as deps.' }],
          },
          {
            id: 'dbg-memo',
            title: 'Memoization mistakes',
            blocks: [{ type: 'paragraph', content: 'Symptom: memo has no effect. Cause: Parent passes new object every render or memo on component that is always cheap. Fix: Profile first; stabilize props; remove useless memo wrappers.' }],
          },
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'interview-prep', level: 2, text: 'Interview Focus — Performance Optimization' },
      {
        type: 'paragraph',
        content: 'Classic question: React.memo vs useMemo vs useCallback? memo wraps components; useMemo caches values; useCallback caches functions. Code splitting reduces initial bundle — lazy routes load admin code only when needed. Always say: profile first, optimize bottlenecks, avoid premature abstraction.',
      },
      { type: 'quote', content: 'You should only rely on useMemo and useCallback for performance optimization.', attribution: 'React documentation' },
      { type: 'heading', id: 'wrap-up', level: 2, text: 'Wrap-up' },
      {
        type: 'checklist',
        title: 'Definition of Done',
        items: [
          { id: 'done-memo', text: 'Memoized list components' },
          { id: 'done-lazy', text: 'Lazy routes with Suspense fallback' },
          { id: 'done-compare', text: 'Before/after documented' },
          { id: 'done-git', text: 'Git push' },
        ],
      },
      ...lessonFooter(),
    ],
  },
  'quiz.json': makeQuiz('day20', 20, 'Day 20 Quiz — React Performance Optimization', 'Verify memo, hooks, lazy loading, memory concepts, and optimization judgment.', [
    { id: 'q01', type: 'true-false', prompt: 'React.memo prevents re-render when props are shallow-equal to previous render.', correctAnswer: true, explanation: 'memo bails out if shallow compare finds same props.', difficulty: 'easy', tags: ['react', 'memo'] },
    { id: 'q02', type: 'single-choice', prompt: 'What does useCallback return?', options: [{ id: 'a', text: 'A memoized function reference' }, { id: 'b', text: 'A memoized computed value' }, { id: 'c', text: 'A DOM node' }, { id: 'd', text: 'A Promise' }], correctOptionId: 'a', explanation: 'useCallback caches the function itself between renders when deps unchanged.', difficulty: 'easy', tags: ['react', 'hooks'] },
    { id: 'q03', type: 'single-choice', prompt: 'Primary benefit of React.lazy and code splitting?', options: [{ id: 'a', text: 'Smaller initial bundle — load routes on demand' }, { id: 'b', text: 'Eliminates all re-renders' }, { id: 'c', text: 'Replaces Redux' }, { id: 'd', text: 'Fixes TypeScript errors' }], correctOptionId: 'a', explanation: 'Dynamic import splits chunks loaded when user navigates to route.', difficulty: 'easy', tags: ['code-splitting'] },
    { id: 'q04', type: 'multiple-choice', prompt: 'Which cause unnecessary child re-renders with React.memo? Select all that apply.', options: [{ id: 'a', text: 'Inline arrow function props' }, { id: 'b', text: 'New object literal props each render' }, { id: 'c', text: 'Stable useCallback reference' }, { id: 'd', text: 'Primitive string props unchanged' }], correctOptionIds: ['a', 'b'], explanation: 'New function/object references each render break shallow equality.', difficulty: 'medium', tags: ['react', 'performance'] },
    { id: 'q05', type: 'fill-blank', prompt: 'Wrap lazy routes with {{blank1}} and provide a fallback UI.', blanks: [{ id: 'blank1', acceptedAnswers: ['Suspense', 'React.Suspense'] }], explanation: 'Suspense catches loading state while lazy chunk downloads.', difficulty: 'easy', tags: ['react', 'lazy'] },
    { id: 'q06', type: 'code-output', prompt: 'Does memoized child re-render when parent passes inline () => {} each time?', code: 'const Child = React.memo(() => <div />);\n// Parent: <Child onClick={() => {}} />', language: 'javascript', correctOutput: 'yes', explanation: 'New function reference every parent render — memo comparison fails.', difficulty: 'hard', tags: ['react', 'memo'] },
    { id: 'q07', type: 'single-choice', prompt: 'When should you NOT use React.memo?', options: [{ id: 'a', text: 'Expensive list row re-rendering unnecessarily' }, { id: 'b', text: 'Cheap component always receiving new props' }, { id: 'c', text: 'Heavy chart with stable props' }, { id: 'd', text: 'Large table cell with stable data' }], correctOptionId: 'b', explanation: 'Memo overhead exceeds benefit when props always change or render is trivial.', difficulty: 'medium', tags: ['performance'] },
    { id: 'q08', type: 'code-completion', prompt: 'Complete lazy import.', code: 'const Dashboard = {{lazy}}(() => import("./Dashboard"));', language: 'typescript', blanks: [{ id: 'lazy', acceptedAnswers: ['lazy', 'React.lazy'] }], explanation: 'React.lazy accepts dynamic import returning default export.', difficulty: 'easy', tags: ['react', 'lazy'] },
    { id: 'q09', type: 'short-answer', prompt: 'Explain difference between useMemo and useCallback.', acceptedKeywords: ['value', 'function', 'cache', 'reference'], sampleAnswer: 'useMemo caches a computed value result between renders when dependencies unchanged. useCallback caches a function reference itself — useful for stable props to memoized children. Both avoid unnecessary work but cache different things.', explanation: 'Common interview distinction.', difficulty: 'medium', tags: ['react', 'hooks'] },
    { id: 'q10', type: 'multiple-choice', prompt: 'Garbage collection reclaims memory when? Select all that apply.', options: [{ id: 'a', text: 'Object has zero reachable references' }, { id: 'b', text: 'Developer calls free()' }, { id: 'c', text: 'Closure no longer referenced' }, { id: 'd', text: 'Every render automatically' }], correctOptionIds: ['a', 'c'], explanation: 'JS GC is automatic when objects unreachable — no manual free().', difficulty: 'medium', tags: ['javascript', 'memory'] },
  ]),
  'challenge.json': makeChallenge('day20', 20, {
    title: 'Performance Lab — Optimize Product List and Routes',
    mission: 'Optimize React Performance.',
    description: 'Profile and optimize your Day 17 product list and Day 19 dashboard routes — memoized components, useMemo/useCallback, lazy loading, and documented before/after comparison.',
    estimatedMinutes: 240,
    difficulty: 'intermediate',
    requirements: [
      'Profile product list with React DevTools Profiler — note render counts before optimization',
      'Extract ProductRow as React.memo component with typed props',
      'Wrap filter/sort pipeline in useMemo with correct dependencies',
      'Pass stable onSelect/onDelete handlers via useCallback',
      'Lazy load AdminDashboard and other heavy routes with React.lazy',
      'Wrap lazy routes in Suspense with loading fallback',
      'Verify no inline object/function props break memo on list rows',
      'Document before/after: render count, commit duration, or bundle size delta',
    ],
    acceptanceCriteria: [
      'Product list rows skip re-render when unrelated parent state changes',
      'Filtered product list recalculates only when products or filter deps change',
      'Admin route chunk loads on navigation not initial page load',
      'Suspense shows fallback during chunk load',
      'README or PERFORMANCE.md documents before/after metrics',
      'npm run build passes; analyze bundle shows separate admin chunk',
      'Repository pushed to Git',
    ],
    hints: [
      'Toggle unrelated state in parent to verify memoized rows stay idle in Profiler.',
      'useCallback deps must include values read inside handler.',
      'Compare with Day 10 memo introduction — today goes deeper with measurement.',
      'vite build --mode analyze or rollup-plugin-visualizer for bundle diff.',
      'Do not memo everything — profile identifies real bottlenecks.',
    ],
    bonus: {
      title: 'Senior polish',
      description: 'Optional advanced performance work.',
      requirements: [
        'Custom memo comparison function for ProductRow',
        'Virtualize long product list with react-window',
        'Prefetch lazy route on sidebar hover',
      ],
    },
    debuggingScenarios: [
      { id: 'dbg-rerender', title: 'Unnecessary re-renders', symptom: 'Profiler shows all rows on minor state change', cause: 'Inline handlers or unstable props', fix: 'useCallback; extract stable props' },
      { id: 'dbg-deps', title: 'Wrong dependency arrays', symptom: 'Stale data or infinite loops', cause: 'Missing or unstable deps', fix: 'Fix exhaustive-deps warnings; memoize dep objects' },
      { id: 'dbg-memo', title: 'Memoization mistakes', symptom: 'Zero perf improvement after memo', cause: 'Props always new reference', fix: 'Stabilize props or remove ineffective memo' },
    ],
  }),
  'interview.json': makeInterview('day20', 20, 'Day 20 Interview Prep', 'Practice memoization, lazy loading, code splitting, and performance optimization judgment.', [
    { id: 'int-e01', question: 'React.memo vs useMemo vs useCallback?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'Core perf API distinction.', keyPoints: ['memo for components', 'useMemo for values', 'useCallback for functions', 'Shallow compare'], sampleAnswer: 'React.memo prevents component re-render on shallow-equal props. useMemo caches expensive computed values. useCallback caches function references for stable child props. I use memo on list rows, useMemo on filter pipelines, useCallback on handlers passed to memoized children.', followUps: ['Custom compare?', 'When skip all three?'] },
    { id: 'int-e02', question: 'What is code splitting and how do you implement it in React?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'Bundle optimization basics.', keyPoints: ['Dynamic import', 'React.lazy', 'Suspense fallback', 'Smaller initial load'], sampleAnswer: 'Code splitting breaks the bundle into chunks loaded on demand. React.lazy(() => import("./Admin")) creates a dynamic import. Suspense shows fallback while chunk loads. I lazy load admin routes and heavy modals not needed on first paint.', followUps: ['Route-based vs component?', 'Prefetching?'] },
    { id: 'int-m01', question: 'How do you identify performance bottlenecks in React?', difficulty: 'medium', category: 'react', whatInterviewerTests: 'Systematic optimization approach.', keyPoints: ['React DevTools Profiler', 'Measure first', 'Render count', 'Commit duration'], sampleAnswer: 'I use React DevTools Profiler to record interactions and see which components re-render and how long commits take. I look for wide render cascades — parent state change re-rendering entire lists. I optimize the biggest wins first, not every component.', followUps: ['why-did-you-render?', 'Production monitoring?'] },
    { id: 'int-m02', question: 'Explain garbage collection in JavaScript briefly.', difficulty: 'medium', category: 'javascript', whatInterviewerTests: 'Memory fundamentals.', keyPoints: ['Reachability', 'Automatic GC', 'Closures retain', 'Cleanup in effects'], sampleAnswer: 'JS engines track object reachability from roots. Unreachable objects get garbage collected automatically. Closures keep outer variables alive. In React I prevent leaks by cleaning subscriptions in useEffect return and avoiding unbounded global caches.', followUps: ['Memory leaks in SPAs?', 'WeakMap use cases?'] },
    { id: 'int-m03', question: 'When should you NOT memoize?', difficulty: 'medium', category: 'react', whatInterviewerTests: 'Optimization judgment.', keyPoints: ['Cheap renders', 'Always changing props', 'Comparison overhead', 'Profile first'], sampleAnswer: 'I skip memo when renders are cheap, props always change making comparison pointless, or I have not profiled a real bottleneck. Premature memo adds code complexity. React team says optimize when measured problem exists.', followUps: ['Compiler auto-memo?', 'Virtual DOM cost?'] },
    { id: 'int-h01', question: 'ProductRow is memoized but still re-renders every parent update. Why?', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Memo debugging.', keyPoints: ['Inline functions', 'Object props', 'Context consumption', 'Shallow compare fail'], sampleAnswer: 'Parent passes onDelete={() => ...} inline — new reference each render. Or ProductRow consumes Context that changes every parent update — memo only checks props not context. Fix: useCallback for handlers; split context; memo with custom compare for specific props only.', followUps: ['useMemo context value?', 'Selector granularity?'] },
    { id: 'int-h02', question: 'useMemo filter returns stale products after API update. Debug.', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Dependency array debugging.', keyPoints: ['Missing products dep', 'RTK Query reference', 'Derived state', 'Refetch timing'], sampleAnswer: 'Dependency array missing products or using stale closure over old array reference. I verify products from useGetProductsQuery is in deps. If mutating array in place without new reference, memo wont recompute — RTK Query returns new references on update so deps should catch it.', followUps: ['Structural sharing?', 'TanStack referential stability?'] },
    { id: 'int-s01', question: 'Design perf strategy for 10k row product table.', difficulty: 'senior', category: 'architecture', whatInterviewerTests: 'Scale beyond memo.', keyPoints: ['Virtualization', 'Server pagination', 'Memo rows', 'Avoid global re-render'], sampleAnswer: 'Memo alone fails at 10k DOM nodes. I virtualize with react-window rendering visible rows only, server paginate or infinite scroll, memo row component with stable props, lift selection state carefully, lazy load detail panel. Profile with realistic data volume not 10 demo items.', followUps: ['Web Workers?', 'Concurrent features?'], redFlags: ['Memo every component', 'Client render 10k nodes', 'Optimize without profiling'] },
  ]),
  'reflection.json': makeReflection('day20', 20, 'Day 20 Reflection', 'Solidify performance patterns before Week 3 machine coding tomorrow.', [
    { id: 'refl-01', question: 'What did React DevTools Profiler show before vs after optimization?', guidance: 'Render counts or commit duration.', minWords: 45 },
    { id: 'refl-02', question: 'Which component benefited most from React.memo and why?', guidance: 'ProductRow or similar list item.', minWords: 40 },
    { id: 'refl-03', question: 'Did useCallback fix a memo break? What was the unstable prop?', guidance: 'Inline function example.', minWords: 40 },
    { id: 'refl-04', question: 'How much did lazy loading reduce initial bundle or load time?', guidance: 'Chunk names or build analyze output.', minWords: 35 },
    { id: 'refl-05', question: 'What would you rebuild differently under 150-minute pressure tomorrow?', guidance: 'Preview Day 21 machine coding mindset.', minWords: 30 },
  ]),
  'resources.json': makeResources('day20', 20, 'Day 20 Resources', 'Official React documentation for memo, hooks, lazy, and performance.', [
    { id: 'res-memo', title: 'React — memo', url: 'https://react.dev/reference/react/memo', type: 'documentation', description: 'React.memo API reference.', recommended: true },
    { id: 'res-usememo', title: 'React — useMemo', url: 'https://react.dev/reference/react/useMemo', type: 'documentation', description: 'Caching expensive calculations.', recommended: true },
    { id: 'res-usecallback', title: 'React — useCallback', url: 'https://react.dev/reference/react/useCallback', type: 'documentation', description: 'Caching function references.', recommended: true },
    { id: 'res-lazy', title: 'React — lazy', url: 'https://react.dev/reference/react/lazy', type: 'documentation', description: 'Dynamic component loading.', recommended: true },
    { id: 'res-suspense', title: 'React — Suspense', url: 'https://react.dev/reference/react/Suspense', type: 'documentation', description: 'Loading fallbacks for lazy components.', recommended: true },
    { id: 'res-perf', title: 'React — Performance', url: 'https://react.dev/learn/render-and-commit', type: 'documentation', description: 'Render and commit phases explained.', recommended: true },
    { id: 'res-gc', title: 'MDN — Memory Management', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management', type: 'documentation', description: 'Memory lifecycle and garbage collection.', recommended: true },
    { id: 'res-profiler', title: 'React DevTools — Profiler', url: 'https://react.dev/learn/react-developer-tools', type: 'documentation', description: 'Using Profiler to find bottlenecks.', recommended: false },
  ]),
});

// ─── DAY 21 ───────────────────────────────────────────────────────────────────
writeDay(21, {
  'meta.json': {
    id: 'day21',
    version: '1.0.0',
    day: 21,
    week: 3,
    track: 'react-interview',
    title: 'Machine Coding Round 3',
    subtitle: '150-minute Week 3 review — auth, dashboard, Redux, RTK Query, and theme without references',
    mission: 'Machine Coding Round 3',
    readingTimeMinutes: 20,
    estimatedBuildHours: 2.5,
    difficulty: 'advanced',
    tags: ['react', 'machine-coding', 'review', 'interview', 'week3', 'redux', 'auth'],
    topics: {
      javascript: ['week 3 review', 'promises', 'JWT', 'array methods', 'memory'],
      typescript: ['week 3 review', 'API models', 'auth types', 'dashboard models'],
      react: ['Redux Toolkit', 'RTK Query', 'authentication', 'dashboard', 'performance', 'theme'],
    },
    prerequisites: [
      'day15 — ThemeProvider, useTheme, localStorage persistence',
      'day16 — Redux Toolkit store, slices, selectors',
      'day17 — RTK Query product CRUD and cache invalidation',
      'day18 — JWT auth, protected routes, session flow',
      'day19 — admin dashboard, role-based UI, search/filter/pagination',
      'day20 — React.memo, lazy routes, performance patterns',
    ],
    expectedOutcome: [
      'Build authentication, dashboard, Redux store, API integration, and theme in 150 minutes without copying old code',
      'Demonstrate Week 3 concepts under interview time pressure',
      'Explain architectural decisions: Redux vs Context, RTK Query, auth flow, memoization',
      'Identify personal weak areas before Week 4 interview simulation',
    ],
    definitionOfDone: [
      'Timed 150-minute build completed under exam conditions',
      'Theme system with light/dark and persistence',
      'Redux store with at least one client slice',
      'RTK Query API integration for products or users',
      'Login/logout with protected routes',
      'Admin dashboard with analytics and user table basics',
      'No AI, no Google — official docs only during build',
      'Self-review notes listing weak Week 3 topics',
      'Quiz and interview completed',
      'Git push of machine coding attempt',
    ],
    tomorrowPreview: {
      day: 22,
      title: 'Machine Coding Interview',
      summary: 'Week 4 begins with a 90-minute machine coding interview, debugging drills, code review, and 20 interview questions — no new theory, pure simulation.',
    },
  },
  'lesson.json': {
    id: 'day21-lesson',
    metaId: 'day21',
    title: 'Day 21 — Machine Coding Round 3',
    summary: '150-minute Week 3 review build under interview conditions — authentication, dashboard, Redux store, RTK Query API, and theme system from scratch without referring to previous code.',
    blocks: [
      { type: 'heading', id: 'mission', level: 2, text: "Today's Mission" },
      {
        type: 'paragraph',
        content: 'Day 14 tested Week 2 under pressure. Day 21 tests Week 3. You have 150 minutes to build a medium React app from scratch: theme system, Redux store, RTK Query API, authentication, and admin dashboard. No AI. No Google. Only official docs. No opening previous day folders. This is the capstone before Week 4 interview simulation.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Exam conditions',
        content: 'Start a timer. Close AI tools and search engines. Allowed: react.dev, redux-toolkit.js.org, reactrouter.com, typescriptlang.org, developer.mozilla.org. Do NOT open Days 15–20 project folders — rebuild muscle memory.',
      },
      { type: 'heading', id: 'review', level: 2, text: 'Week 3 Concept Review' },
      {
        type: 'table',
        headers: ['Day', 'Concept', "Today's build use"],
        rows: [
          ['15', 'Theme Context, persistence', 'Global theme with light/dark'],
          ['16', 'Redux Toolkit slices', 'Client state slice in store'],
          ['17', 'RTK Query CRUD', 'Products or users API layer'],
          ['18', 'JWT auth, protected routes', 'Login, logout, route guards'],
          ['19', 'Dashboard, role UI', 'Analytics cards, user table'],
          ['20', 'memo, lazy routes', 'Optional polish if time permits'],
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'strategy', level: 2, text: '150-Minute Strategy' },
      {
        type: 'checklist',
        title: 'Time boxes',
        items: [
          { id: 'tb-0-15', text: '0–15 min: Scaffold — Vite, routes, folder structure, ThemeProvider, store shell' },
          { id: 'tb-15-45', text: '15–45 min: Redux store + RTK Query API + product/user fetch' },
          { id: 'tb-45-75', text: '45–75 min: Auth slice, login page, protected routes, token persistence' },
          { id: 'tb-75-110', text: '75–110 min: Admin dashboard — cards, table, search/filter' },
          { id: 'tb-110-135', text: '110–135 min: Wire navigation, role badges, error/loading states' },
          { id: 'tb-135-150', text: '135–150 min: Fix build errors, smoke test, README self-review, git push' },
        ],
      },
      {
        type: 'tip',
        title: 'Prioritization rule',
        content: 'Working auth + protected dashboard beats perfect analytics with no login. Ship core paths first: theme → store → API → auth → dashboard shell. Polish and memoization only if time remains.',
      },
      {
        type: 'tabs',
        items: [
          {
            id: 'tab-architecture',
            label: 'Architecture',
            blocks: [
              {
                type: 'paragraph',
                content: 'src/app/store.ts — configureStore with client slice + RTK Query API. src/features/auth/ — login, ProtectedRoute. src/features/dashboard/ — cards, UserTable. src/features/theme/ — ThemeProvider from Day 15 patterns. src/app/router.tsx — public login, protected admin routes.',
              },
            ],
          },
          {
            id: 'tab-interview',
            label: 'Explain aloud',
            blocks: [
              {
                type: 'paragraph',
                content: 'While building, narrate: why Redux for auth token vs Context for theme, why RTK Query for server data, how invalidatesTags refreshes list, why ProtectedRoute checks hydration loading state.',
              },
            ],
          },
        ],
      },
      { type: 'divider' },
      { type: 'heading', id: 'rules', level: 2, text: 'Rules — No AI, No Google' },
      {
        type: 'paragraph',
        content: 'Machine coding rounds test recall and architecture under pressure. Official documentation mirrors what you can use in a proctored interview with doc access. Cheating today hides gaps that Day 22 will expose.',
      },
      { type: 'divider' },
      { type: 'heading', id: 'interview-focus', level: 2, text: 'Interview Focus — Week 3 Architecture' },
      {
        type: 'checklist',
        title: 'Be ready to explain',
        items: [
          { id: 'exp-redux', text: 'Redux Toolkit vs Context — theme vs auth vs server state' },
          { id: 'exp-rtk', text: 'RTK Query caching and invalidation' },
          { id: 'exp-auth', text: 'JWT flow, protected routes, storage tradeoffs' },
          { id: 'exp-perf', text: 'When you would add memo and lazy routes' },
          { id: 'exp-structure', text: 'Feature folder structure and separation of concerns' },
        ],
      },
      { type: 'challenge' },
      { type: 'heading', id: 'review-self', level: 2, text: 'Self-Review After Build' },
      {
        type: 'paragraph',
        content: 'After the timer stops, list weak areas honestly: Did auth hydration trip you? Did RTK Query tags confuse you? Did dashboard pagination break? These notes drive Week 4 revision. Day 22 is pure interview simulation — no new theory.',
      },
      { type: 'heading', id: 'wrap-up', level: 2, text: 'Wrap-up' },
      {
        type: 'checklist',
        title: 'Definition of Done',
        items: [
          { id: 'done-timer', text: '150-minute timed build completed' },
          { id: 'done-stack', text: 'Theme + Redux + RTK Query + auth + dashboard' },
          { id: 'done-review', text: 'Self-review weak areas documented' },
          { id: 'done-git', text: 'Git push' },
        ],
      },
      ...lessonFooter(),
    ],
  },
  'quiz.json': makeQuiz('day21', 21, 'Day 21 Quiz — Week 3 Review', 'Verify integrated understanding of Redux, RTK Query, auth, dashboard, and performance from Week 3.', [
    { id: 'q01', type: 'true-false', prompt: 'In machine coding Round 3 you may refer to previous day project source code.', correctAnswer: false, explanation: 'Build from scratch without opening Days 15–20 folders — tests recall under pressure.', difficulty: 'easy', tags: ['machine-coding'] },
    { id: 'q02', type: 'single-choice', prompt: 'First priority in 150-minute Week 3 build?', options: [{ id: 'a', text: 'Perfect CSS animations' }, { id: 'b', text: 'Core flow: scaffold, store, API, auth, dashboard shell' }, { id: 'c', text: 'Write unit tests for every reducer' }, { id: 'd', text: 'Implement OAuth providers' }], correctOptionId: 'b', explanation: 'Ship end-to-end core paths before polish.', difficulty: 'easy', tags: ['strategy'] },
    { id: 'q03', type: 'single-choice', prompt: 'Where should theme state live in this integrated app?', options: [{ id: 'a', text: 'RTK Query cache' }, { id: 'b', text: 'Context or lightweight client slice — infrequent updates' }, { id: 'c', text: 'JWT payload only' }, { id: 'd', text: 'URL query params only' }], correctOptionId: 'b', explanation: 'Theme fits Context from Day 15 — low-frequency preference state.', difficulty: 'medium', tags: ['architecture'] },
    { id: 'q04', type: 'multiple-choice', prompt: 'Week 3 build must include? Select all that apply.', options: [{ id: 'a', text: 'Authentication with protected routes' }, { id: 'b', text: 'Redux store with API integration' }, { id: 'c', text: 'Theme system' }, { id: 'd', text: 'GraphQL subscriptions' }], correctOptionIds: ['a', 'b', 'c'], explanation: 'Round 3 covers auth, Redux/RTK Query, theme, dashboard — not Week 4 topics.', difficulty: 'easy', tags: ['week3'] },
    { id: 'q05', type: 'fill-blank', prompt: 'RTK Query mutations refresh lists using {{blank1}} tags.', blanks: [{ id: 'blank1', acceptedAnswers: ['invalidatesTags', 'invalidates'] }], explanation: 'Tag invalidation connects mutations to query refetch.', difficulty: 'easy', tags: ['rtk-query'] },
    { id: 'q06', type: 'code-output', prompt: 'ProtectedRoute without hydration loading gate causes?', code: '// auth starts { status: "idle", token: null }\n// then hydrates token from localStorage', language: 'typescript', correctOutput: 'flash redirect', explanation: 'Brief redirect to login before hydration completes — need loading state.', difficulty: 'hard', tags: ['auth'] },
    { id: 'q07', type: 'single-choice', prompt: 'Allowed resources during machine coding build?', options: [{ id: 'a', text: 'ChatGPT and Stack Overflow' }, { id: 'b', text: 'Official documentation only' }, { id: 'c', text: 'Previous project folders' }, { id: 'd', text: 'Teammate screen share' }], correctOptionId: 'b', explanation: 'Exam rules: official docs only — mirrors proctored interview constraints.', difficulty: 'easy', tags: ['machine-coding'] },
    { id: 'q08', type: 'code-completion', prompt: 'Complete store setup with RTK Query middleware.', code: 'export const store = configureStore({\n  reducer: { auth: authReducer, [api.reducerPath]: api.reducer },\n  middleware: (gDM) => gDM().concat(api.{{middleware}}),\n});', language: 'typescript', blanks: [{ id: 'middleware', acceptedAnswers: ['middleware'] }], explanation: 'RTK Query requires its middleware in the store.', difficulty: 'medium', tags: ['redux'] },
    { id: 'q09', type: 'short-answer', prompt: 'Explain how you separate client state, server state, and theme in one app.', acceptedKeywords: ['Redux', 'RTK Query', 'Context', 'slice', 'cache'], sampleAnswer: 'Client UI state and auth token live in Redux slices. Server data lives in RTK Query cache with generated hooks. Theme preference uses Context from Day 15 with localStorage — infrequent updates, many readers. Each layer has one source of truth.', explanation: 'Architecture question central to Week 3 interviews.', difficulty: 'hard', tags: ['architecture'] },
    { id: 'q10', type: 'multiple-choice', prompt: 'Day 22 tomorrow focuses on? Select all that apply.', options: [{ id: 'a', text: 'Machine coding interview simulation' }, { id: 'b', text: 'Debugging drills' }, { id: 'c', text: 'New Redux fundamentals from scratch' }, { id: 'd', text: '20 interview questions' }], correctOptionIds: ['a', 'b', 'd'], explanation: 'Day 22 is Week 4 interview simulation — no new Redux theory.', difficulty: 'easy', tags: ['week4-preview'] },
  ]),
  'challenge.json': makeChallenge('day21', 21, {
    title: 'Machine Coding Round 3 — Week 3 Integrated Build',
    mission: 'Machine Coding Round 3',
    description: '150-minute timed build from scratch: theme system, Redux store, RTK Query API, authentication, and admin dashboard — without referring to previous day code.',
    estimatedMinutes: 150,
    difficulty: 'advanced',
    requirements: [
      'Complete build in 150 minutes under exam conditions',
      'Theme system: light/dark modes with localStorage persistence and ThemeProvider',
      'Redux store with configureStore and at least one client slice (auth or ui)',
      'RTK Query API with fetch for products or users — query + at least one mutation',
      'Login and logout flow with JWT or mock token storage',
      'Protected routes redirecting unauthenticated users to login',
      'Admin dashboard with analytics cards and user/product table',
      'Search or filter on table data',
      'Role badge or conditional admin UI',
      'Loading and error states on API calls',
      'Do NOT use AI, Google, or previous day source folders during build',
      'Write self-review README section listing weak Week 3 areas',
    ],
    acceptanceCriteria: [
      'Timer stopped at or before 150 minutes with attempt documented',
      'Theme toggles and persists across reload',
      'Unauthenticated users cannot access dashboard routes',
      'Login establishes session and redirects to dashboard',
      'RTK Query fetches and displays server data with cache working after mutation',
      'Dashboard shows at least two analytics metrics and a data table',
      'npm run build passes at end of session',
      'Git commit with message indicating machine coding attempt',
      'Self-review notes identify 2+ weak Week 3 topics',
    ],
    hints: [
      'Scaffold in order: theme → store shell → API → auth → dashboard — do not jump ahead.',
      'Mock API with json-server if backend unavailable — focus on architecture not infra.',
      'Copy patterns from memory, not from old repos — that is the exercise.',
      'If stuck 10+ minutes on one bug, stub the feature and move on.',
      'Day 22 will test the same stack under different time pressure — note gaps today.',
    ],
    bonus: {
      title: 'If time remains after 150 min',
      description: 'Optional polish only after core definition of done.',
      requirements: [
        'Lazy load dashboard route with Suspense',
        'Memoize table rows with React.memo',
        'Pagination on user table',
      ],
    },
    debuggingScenarios: [
      { id: 'dbg-time', title: 'Running out of time', symptom: '120 min in with no auth', cause: 'Over-engineering theme or perfect CSS early', fix: 'Skip polish; stub dashboard; ship auth + protected route minimum' },
      { id: 'dbg-store', title: 'Store not updating', symptom: 'RTK Query data undefined', cause: 'Forgot api middleware or reducer in configureStore', fix: 'Verify reducerPath and middleware concat' },
      { id: 'dbg-auth', title: 'Auth flash on reload', symptom: 'Redirect loop or login flash', cause: 'No loading gate during token hydration', fix: 'Auth status loading until localStorage read completes' },
    ],
  }),
  'interview.json': makeInterview('day21', 21, 'Day 21 Interview Prep', 'Week 3 capstone interview questions — Redux, RTK Query, auth, performance, architecture.', [
    { id: 'int-e01', question: 'Summarize Week 3 architecture in one app.', difficulty: 'easy', category: 'architecture', whatInterviewerTests: 'Holistic Week 3 understanding.', keyPoints: ['Theme Context', 'Redux client state', 'RTK Query server state', 'Auth flow', 'Dashboard UI'], sampleAnswer: 'Week 3 builds a medium app: Context for theme, Redux Toolkit for auth and client state, RTK Query for API cache and mutations, protected routes for auth, admin dashboard with role UI, and performance optimizations with memo and lazy routes on Day 20.', followUps: ['What would you simplify?', 'Monorepo structure?'] },
    { id: 'int-e02', question: 'Redux vs Context — how did you use both this week?', difficulty: 'easy', category: 'react', whatInterviewerTests: 'State tool selection after Days 15-16.', keyPoints: ['Context for theme', 'Redux for complex state', 'Not either-or', 'Interview judgment'], sampleAnswer: 'Day 15 theme uses Context — infrequent updates, many readers. Day 16+ Redux for todos, auth, and RTK Query integration where DevTools, middleware, and predictable reducers matter. I do not put everything in Redux.', followUps: ['Zustand?', 'When too much Redux?'] },
    { id: 'int-m01', question: 'Walk through RTK Query product delete updating the UI.', difficulty: 'medium', category: 'react', whatInterviewerTests: 'Cache invalidation narrative.', keyPoints: ['Mutation hook', 'invalidatesTags', 'Query refetch', 'Loading states'], sampleAnswer: 'User clicks delete. Component calls deleteProduct mutation. On success RTK Query invalidates Product tags. getProducts query refetches automatically. List re-renders with updated cache data. I show isLoading on button during mutation.', followUps: ['Optimistic delete?', 'undo?'] },
    { id: 'int-m02', question: 'Design auth + API together — where does token live?', difficulty: 'medium', category: 'architecture', whatInterviewerTests: 'Integrated auth architecture.', keyPoints: ['Auth slice', 'prepareHeaders', 'localStorage hydrate', 'Protected routes'], sampleAnswer: 'Token and user in auth slice. Login mutation or thunk sets both and persists token. prepareHeaders reads token for RTK Query. ProtectedRoute checks auth status after hydration. Logout clears slice and storage.', followUps: ['Refresh token?', 'Multiple tabs?'] },
    { id: 'int-m03', question: 'How would you structure features folder for this app?', difficulty: 'medium', category: 'architecture', whatInterviewerTests: 'Scalable folder organization.', keyPoints: ['Feature modules', 'Shared ui', 'App layer', 'Colocation'], sampleAnswer: 'features/auth, features/dashboard, features/products, features/theme each with components, hooks, types. app/ has store, router, providers. shared/ui for Button, Table, Badge. API slices in features/products/productsApi.ts.', followUps: ['Barrel exports?', 'Cross-feature imports?'] },
    { id: 'int-h01', question: '150 minutes in — auth works but dashboard empty. Interviewer asks why. Respond.', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Honest prioritization under pressure.', keyPoints: ['Time boxing', 'Core vs polish', 'What shipped', 'Next steps'], sampleAnswer: 'I prioritized auth and store setup in first 90 minutes per my strategy. Dashboard table is stubbed — RTK Query users endpoint wired but pagination incomplete. I would next add search filter and analytics derived from cached data. I communicate tradeoffs proactively in real interviews.', followUps: ['How estimate tasks?', 'MVP definition?'] },
    { id: 'int-h02', question: 'Interviewer asks why you did not use React Query instead of RTK Query.', difficulty: 'hard', category: 'scenario', whatInterviewerTests: 'Library choice defense.', keyPoints: ['Already on Redux', 'Unified DevTools', 'Team consistency', 'Know React Query too'], sampleAnswer: 'This app already uses Redux Toolkit for auth and client state. RTK Query integrates in one store with one DevTools timeline. For greenfield without Redux I would consider TanStack Query. Choice is context-dependent not religious.', followUps: ['Bundle size?', 'Learning curve?'] },
    { id: 'int-s01', question: 'Senior review: what would you refactor before production?', difficulty: 'senior', category: 'architecture', whatInterviewerTests: 'Production readiness eye.', keyPoints: ['Error boundaries', 'httpOnly cookies', 'Server pagination', 'Testing', 'Accessibility'], sampleAnswer: 'Move JWT to httpOnly cookies with CSRF protection. Add global error boundary and 401 handler. Server-side pagination on dashboard. Tests for auth reducers and RTK Query endpoints with MSW. a11y on table and login form. Environment-based API URLs. Monitoring for Core Web Vitals.', followUps: ['CI/CD?', 'Feature flags?'], redFlags: ['JWT in localStorage with no caveats', 'No backend auth validation mentioned', 'Cannot explain state separation'] },
  ]),
  'reflection.json': makeReflection('day21', 21, 'Day 21 Reflection', 'Honest Week 3 self-assessment before Week 4 interview simulation.', [
    { id: 'refl-01', question: 'Did you finish within 150 minutes? What did you cut and why?', guidance: 'Honest time management assessment.', minWords: 50 },
    { id: 'refl-02', question: 'Which Week 3 topic slowed you most — Redux, RTK Query, auth, or dashboard?', guidance: 'Identify weak area for Day 22 revision.', minWords: 45 },
    { id: 'refl-03', question: 'Explain your state architecture choices without looking at code.', guidance: 'Theme vs Redux vs RTK Query separation.', minWords: 45 },
    { id: 'refl-04', question: 'What would you do differently in the first 15 minutes next time?', guidance: 'Scaffolding and time boxing.', minWords: 40 },
    { id: 'refl-05', question: 'Are you ready for Day 22 machine coding interview simulation?', guidance: 'List 2 specific topics to revise tonight.', minWords: 35 },
  ]),
  'resources.json': makeResources('day21', 21, 'Day 21 Resources', 'Official documentation allowed during machine coding — bookmark these before starting the timer.', [
    { id: 'res-react', title: 'React — Documentation', url: 'https://react.dev/', type: 'documentation', description: 'Core React APIs and patterns.', recommended: true },
    { id: 'res-rtk', title: 'Redux Toolkit — Documentation', url: 'https://redux-toolkit.js.org/', type: 'documentation', description: 'Store, slices, and RTK Query.', recommended: true },
    { id: 'res-router', title: 'React Router — Documentation', url: 'https://reactrouter.com/', type: 'documentation', description: 'Routing and protected routes.', recommended: true },
    { id: 'res-ts', title: 'TypeScript — Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'documentation', description: 'Types and interfaces reference.', recommended: true },
    { id: 'res-mdn', title: 'MDN Web Docs — JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'documentation', description: 'JavaScript APIs including storage and promises.', recommended: true },
    { id: 'res-redux', title: 'Redux — Usage with React', url: 'https://react-redux.js.org/', type: 'documentation', description: 'Provider and hooks.', recommended: true },
    { id: 'res-rtk-query', title: 'RTK Query — Quick Start', url: 'https://redux-toolkit.js.org/tutorials/rtk-query', type: 'documentation', description: 'RTK Query tutorial for timed builds.', recommended: true },
    { id: 'res-vite', title: 'Vite — Guide', url: 'https://vite.dev/guide/', type: 'documentation', description: 'Project scaffolding if starting fresh.', recommended: false },
  ]),
});

console.log('Days 17-21 written successfully.');

