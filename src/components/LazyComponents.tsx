import { lazy } from 'react';

// Lazy load components for better initial bundle size
export const LazyCalendar = lazy(() => import('./Calendar'));
export const LazyDashboard = lazy(() => import('./Dashboard'));
export const LazyTasksSection = lazy(() => import('./TasksSection'));
export const LazyMembersSection = lazy(() => import('./MembersSection'));
export const LazySettingsSection = lazy(() => import('./SettingsSection'));