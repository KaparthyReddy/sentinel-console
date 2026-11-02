import { NavLink } from 'react-router-dom';
import { can } from '@/auth/permissions';
import { useAuth } from '@/auth/useAuth';
import { cx } from '@/utils/cx';
import { NAV_ITEMS } from './navItems';
import styles from './Sidebar.module.css';

interface SidebarProps {
  id: string;
  /** Only matters on small screens, where the menu collapses. */
  open: boolean;
}

export function Sidebar({ id, open }: SidebarProps) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter(
    (item) => !item.permission || (user !== null && can(user.role, item.permission)),
  );

  return (
    <nav id={id} aria-label="Primary" className={styles.sidebar} data-open={open}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.to}>
            {/* NavLink sets aria-current="page" on the active link automatically */}
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx(styles.link, isActive && styles.active)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
