import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('allows type="submit"', () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('ignores clicks while loading but stays focusable', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();

    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();

    button.focus();
    expect(button).toHaveFocus();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDisabled();
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('lets aria-label give a more specific accessible name', () => {
    render(<Button aria-label="Resolve alert for CC-2026-0001">Resolve</Button>);
    expect(
      screen.getByRole('button', { name: 'Resolve alert for CC-2026-0001' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations in any variant or state', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
