import { useEffect } from 'react';

const APP_NAME = 'Sentinel Console';

/** Gives each page a unique title, which screen readers announce on navigation. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${APP_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
