import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { ProductThreshold } from '@/api/types';
import { getDb } from '@/mocks/data';
import { server } from '@/mocks/server';
import {
  expectNoAxeViolations,
  renderWithProviders,
  screen,
  userEvent,
} from '@/test/test-utils';
import { ThresholdForm } from './ThresholdForm';

const threshold: ProductThreshold = { id: 'thr-01', product: 'Insulin', minTempC: 2, maxTempC: 8 };
const ADMIN = { username: 'admin', role: 'ADMIN' } as const;

function setup() {
  const user = userEvent.setup();
  renderWithProviders(<ThresholdForm threshold={threshold} />, { user: ADMIN });
  return {
    user,
    min: screen.getByLabelText(/minimum/i),
    max: screen.getByLabelText(/maximum/i),
    save: screen.getByRole('button', { name: 'Save thresholds' }),
  };
}

describe('ThresholdForm', () => {
  it('starts with the current thresholds', () => {
    const { min, max } = setup();
    expect(min).toHaveValue('2');
    expect(max).toHaveValue('8');
  });

  it('rejects a maximum that is not above the minimum and focuses it', async () => {
    const { user, min, max, save } = setup();
    await user.clear(min);
    await user.type(min, '9');
    await user.click(save);

    expect(
      screen.getByText('Maximum temperature must be greater than the minimum.'),
    ).toBeInTheDocument();
    expect(max).toHaveFocus();
    expect(max).toHaveAttribute('aria-invalid', 'true');
    expect(getDb().thresholds[0]).toMatchObject({ minTempC: 2, maxTempC: 8 }); // nothing sent
  });

  it('requires a value and focuses the first empty field', async () => {
    const { user, min, save } = setup();
    await user.clear(min);
    await user.click(save);

    expect(screen.getByText('Minimum temperature is required.')).toBeInTheDocument();
    expect(min).toHaveFocus();
  });

  it('saves valid thresholds and confirms', async () => {
    const { user, min, max, save } = setup();
    await user.clear(min);
    await user.type(min, '1');
    await user.clear(max);
    await user.type(max, '7');
    await user.click(save);

    expect(await screen.findByText('Insulin thresholds saved.')).toBeInTheDocument();
    expect(getDb().thresholds[0]).toMatchObject({ id: 'thr-01', minTempC: 1, maxTempC: 7 });
  });

  it('clears the confirmation as soon as the user edits again', async () => {
    const { user, min, save } = setup();
    await user.click(save);
    expect(await screen.findByText('Insulin thresholds saved.')).toBeInTheDocument();

    await user.type(min, '0');
    expect(screen.queryByText('Insulin thresholds saved.')).not.toBeInTheDocument();
  });

  it('shows the server message when saving fails', async () => {
    server.use(
      http.put('*/api/thresholds/:id', () => HttpResponse.json({ message: 'Boom' }, { status: 500 })),
    );
    const { user, save } = setup();
    await user.click(save);

    expect(await screen.findByRole('alert')).toHaveTextContent('Boom');
  });

  it('has no accessibility violations, including with errors showing', async () => {
    const { user, min, save } = setup();
    await user.clear(min);
    await user.click(save);

    await expectNoAxeViolations(document.body);
  });
});
