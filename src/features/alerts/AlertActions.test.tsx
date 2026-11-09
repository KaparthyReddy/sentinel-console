import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeAlert } from '@/test/factories';
import { AlertActions } from './AlertActions';

describe('AlertActions', () => {
  it('offers Acknowledge and Resolve for an open alert', () => {
    render(
      <AlertActions alert={makeAlert({ status: 'OPEN' })} pending={false} onAction={vi.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: 'Acknowledge alert for CC-2026-0001' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Resolve alert for CC-2026-0001' }),
    ).toBeInTheDocument();
  });

  it('offers only Resolve for an acknowledged alert', () => {
    render(
      <AlertActions
        alert={makeAlert({ status: 'ACKNOWLEDGED' })}
        pending={false}
        onAction={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /^Acknowledge/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Resolve/ })).toBeInTheDocument();
  });

  it('offers nothing for a resolved alert', () => {
    render(
      <AlertActions alert={makeAlert({ status: 'RESOLVED' })} pending={false} onAction={vi.fn()} />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('No actions')).toBeInTheDocument();
  });

  it('reports the alert id and the chosen action', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<AlertActions alert={makeAlert({ id: 'a-7' })} pending={false} onAction={onAction} />);

    await user.click(screen.getByRole('button', { name: /^Acknowledge/ }));
    expect(onAction).toHaveBeenLastCalledWith('a-7', 'acknowledge');

    await user.click(screen.getByRole('button', { name: /^Resolve/ }));
    expect(onAction).toHaveBeenLastCalledWith('a-7', 'resolve');
  });

  it('marks the buttons busy while a request is in flight', () => {
    render(<AlertActions alert={makeAlert()} pending onAction={vi.fn()} />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-busy', 'true');
    }
  });
});
