import { Bell, Mail, Menu, MoreHorizontal } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navigationItems } from '../data/dashboardData';

export function Header() {
  const location = useLocation();

  return (
    <header className="topbar">
      <Link className="brand-mark" aria-label="dataCraft" to="/superset/welcome">
        <span className="brand-text">dataCraft</span>
        <span className="brand-dot" />
      </Link>

      <nav className="topbar-nav" aria-label="Основное меню">
        {navigationItems.map((item) => (
          item.path ? (
            <NavLink
              key={item.label}
              to={item.path}
              className={() => {
                const isCurrent = item.matchPaths?.includes(location.pathname) ?? location.pathname === item.path;

                return `topbar-nav__item${isCurrent ? ' is-active' : ''}`;
              }}
            >
              {item.label}
            </NavLink>
          ) : (
            <button
              key={item.label}
              className={`topbar-nav__item${item.active && location.pathname !== '/agents' ? ' is-active' : ''}`}
              type="button"
            >
              {item.label}
            </button>
          )
        ))}
      </nav>

      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Уведомления">
          <MoreHorizontal size={20} />
        </button>
        <Link className="icon-button has-badge" to="/ai-chat" aria-label="Открыть AI Chat">
          <Mail size={20} />
          <span className="notification-badge">99</span>
        </Link>
        <button className="icon-button" type="button" aria-label="Список уведомлений">
          <Bell size={20} />
        </button>
        <button className="icon-button icon-button--menu" type="button" aria-label="Меню">
          <Menu size={28} />
        </button>
      </div>
    </header>
  );
}
