import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/Button';
import styles from './Header.module.css';

interface HeaderProps {
  menuId: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
}

export function Header({ menuId, menuOpen, onToggleMenu }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={onToggleMenu}
      >
        Menu
      </button>

      <Link to="/" className={styles.brand}>
        Sentinel Console
      </Link>

      {user && (
        <div className={styles.user}>
          <span className={styles.userInfo}>
            <span className="visually-hidden">Signed in as </span>
            {user.username}
            <span className={styles.role}>{user.role}</span>
          </span>
          <Button variant="secondary" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      )}
    </header>
  );
}
