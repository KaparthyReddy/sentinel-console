import { useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { config } from '@/api/config';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { TextField } from '@/components/ui/TextField';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/utils/errors';
import { safeRedirect } from '@/utils/redirect';
import styles from './LoginPage.module.css';

// Fake demo credentials, only shown when the app runs against the mock API.
const DEMO_ACCOUNTS = [
  { role: 'Admin', username: 'admin', password: 'admin123' },
  { role: 'Operator', username: 'operator', password: 'operator123' },
  { role: 'Viewer', username: 'viewer', password: 'viewer123' },
] as const;

interface FieldErrors {
  username?: string;
  password?: string;
}

export function LoginPage() {
  useDocumentTitle('Sign in');

  const { user, login } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  if (user) {
    const from = (location.state as { from?: unknown } | null)?.from;
    return <Navigate to={safeRedirect(from)} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: FieldErrors = {};
    if (!username.trim()) nextErrors.username = 'Enter your username.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setFormError(null);

    if (nextErrors.username) {
      usernameRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      // On success `user` is set and this page redirects on the next render.
    } catch (error) {
      setFormError(errorMessage(error, 'Could not sign in. Please try again.'));
      setPassword('');
      passwordRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to Sentinel Console</h1>
        <p className="text-muted">
          Monitor cold-chain shipments and respond to temperature alerts.
        </p>

        <form noValidate className="stack" onSubmit={handleSubmit}>
          {formError && <Notice tone="error">{formError}</Notice>}

          <TextField
            ref={usernameRef}
            label="Username"
            autoComplete="username"
            value={username}
            error={errors.username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <TextField
            ref={passwordRef}
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" loading={submitting}>
            Sign in
          </Button>
        </form>

        {config.useMocks && (
          <Notice tone="info" title="Demo mode">
            <p>This app is running on sample data. Try one of these accounts:</p>
            <ul className={styles.demo}>
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.username}>
                  <strong>{account.role}:</strong> <code>{account.username}</code> /{' '}
                  <code>{account.password}</code>
                </li>
              ))}
            </ul>
          </Notice>
        )}
      </div>
    </main>
  );
}
