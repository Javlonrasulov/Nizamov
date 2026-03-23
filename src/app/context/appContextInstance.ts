/**
 * This file is intentionally kept minimal so it is never hot-reloaded.
 * Keeping createContext() here ensures the context object identity is
 * stable across HMR cycles in AppContext.tsx.
 */
import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AppContext = createContext<any>(null);
