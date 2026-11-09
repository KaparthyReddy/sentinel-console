import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    // Several components render router links
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default preview;
