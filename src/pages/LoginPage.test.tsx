import { describe, expect, it, vi } from 'vitest';
import {
  expectNoAxeViolations,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from '@/test/test-utils';
import { LoginPage } from './LoginPage';

function setup() {
  const user = userEvent.setup();
  const view = renderWithProviders(<LoginPage />, { user: null });
  return {
    user,
    ...view,
    username: screen.getByLabelText('Username'),
    password: screen.getByLabelText('Password'),
    submit: screen.getByRole('button', { name: 'Sign in' }),
  };
}

describe('LoginPage', () => {
  it('has a single top-level heading and labelled fields', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sign in to Sentinel Console' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('flags empty fields, focuses the first one and does not call login', async () => {
    const { user, username, submit, authValue } = setup();
    await user.click(submit);

    expect(screen.getByText('Enter your username.')).toBeInTheDocument();
    expect(username).toHaveFocus();
    expect(authValue.login).not.toHaveBeenCalled();
  });

  it('asks for the password when only the username is filled', async () => {
    const { user, username, password, submit } = setup();
    await user.type(username, 'admin');
    await user.click(submit);

    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(password).toHaveFocus();
  });

  it('signs in with a trimmed username', async () => {
    const { user, username, password, submit, authValue } = setup();
    await user.type(username, '  admin ');
    await user.type(password, 'secret');
    await user.click(submit);

    await waitFor(() => expect(authValue.login).toHaveBeenCalledWith('admin', 'secret'));
  });

  it('announces a failed sign-in, clears the password and refocuses it', async () => {
    const { user, username, password, submit, authValue } = setup();
    vi.mocked(authValue.login).mockRejectedValueOnce(new Error('Invalid username or password.'));

    await user.type(username, 'admin');
    await user.type(password, 'wrong');
    await user.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    await waitFor(() => expect(password).toHaveFocus());
    expect(password).toHaveValue('');
  });

  it('has no accessibility violations', async () => {
    const { container } = setup();
    await expectNoAxeViolations(container);
  });
});
