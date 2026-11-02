import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/global.css';
import { enableMocking } from '@/mocks/enableMocking';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found.');

function render() {
  createRoot(container!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Start the mock API first (when enabled) so the very first requests are intercepted.
enableMocking()
  .catch((error) => console.error('Could not start the mock API:', error))
  .finally(render);
