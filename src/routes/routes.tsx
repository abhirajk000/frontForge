/* eslint-disable react-refresh/only-export-components -- route config intentionally exports lazy() bindings, not components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AppShell } from '@/layouts/AppShell';
import { MinimalLayout } from '@/layouts/MinimalLayout';
import { ROUTES } from '@/constants/routes';

/**
 * Every page is lazy-loaded so each route ships its own chunk. Adding a
 * new route means adding one entry here — nothing else in the app needs
 * to know about it.
 */
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LearningPage = lazy(() => import('@/pages/LearningPage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const InterviewPage = lazy(() => import('@/pages/InterviewPage'));
const ChallengePage = lazy(() => import('@/pages/ChallengePage'));
const RoadmapPage = lazy(() => import('@/pages/RoadmapPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DeveloperToolsPage = lazy(() => import('@/pages/DeveloperToolsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.learn, element: <LearningPage /> },
          { path: ROUTES.lesson(), element: <LessonPage /> },
          { path: ROUTES.quiz(), element: <QuizPage /> },
          { path: ROUTES.interview(), element: <InterviewPage /> },
          { path: ROUTES.challenge(), element: <ChallengePage /> },
          { path: ROUTES.roadmap, element: <RoadmapPage /> },
          { path: ROUTES.projects, element: <ProjectsPage /> },
          { path: ROUTES.notes, element: <NotesPage /> },
          { path: ROUTES.bookmarks, element: <BookmarksPage /> },
          { path: ROUTES.resources, element: <ResourcesPage /> },
          { path: ROUTES.progress, element: <ProgressPage /> },
          { path: ROUTES.achievements, element: <AchievementsPage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
        ],
      },
      {
        element: <MinimalLayout />,
        children: [
          { path: ROUTES.developerTools, element: <DeveloperToolsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
