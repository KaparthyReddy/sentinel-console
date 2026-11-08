import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '@/test/test-utils';
import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Username" />);
    expect(screen.getByLabelText('Username').tagName).toBe('INPUT');
  });

  it('describes the input with its hint', () => {
    render(<TextField label="Search" hint="Reference, product or city" />);
    expect(screen.getByLabelText('Search')).toHaveAccessibleDescription(
      'Reference, product or city',
    );
  });

  it('marks the input invalid and describes it with the error', () => {
    render(<TextField label="Username" error="Enter your username." />);
    const input = screen.getByLabelText('Username');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Enter your username\./);
    expect(screen.getByText('Enter your username.')).toBeInTheDocument();
  });

  it('includes both hint and error in the description', () => {
    render(<TextField label="Max" hint="Allowed: -80 to 40" error="Too high." />);
    expect(screen.getByLabelText('Max')).toHaveAccessibleDescription(/Allowed.*Too high\./);
  });

  it('is not marked invalid when there is no error', () => {
    render(<TextField label="Username" />);
    expect(screen.getByLabelText('Username')).not.toHaveAttribute('aria-invalid');
  });

  it('accepts typing and reports changes', async () => {
    const onChange = vi.fn();
    render(<TextField label="Username" onChange={onChange} />);
    const input = screen.getByLabelText('Username');

    await userEvent.setup().type(input, 'admin');
    expect(input).toHaveValue('admin');
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it('uses a custom id when given', () => {
    render(<TextField id="custom-id" label="Username" />);
    expect(screen.getByLabelText('Username')).toHaveAttribute('id', 'custom-id');
  });

  it('has no accessibility violations, with or without an error', async () => {
    const { container } = render(
      <form>
        <TextField label="Username" hint="Your sign-in name" />
        <TextField label="Password" type="password" error="Enter your password." />
      </form>,
    );
    await expectNoAxeViolations(container);
  });
});
