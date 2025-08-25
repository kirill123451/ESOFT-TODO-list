import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>TODO List</h1>
        <nav className="header-nav">
          <Link to='/tasks' className='nav-link'>Задачи</Link>
          <Link to='/profile' className='nav-link'>Личный кабинет</Link>
          <Link to='/Login' className='nav-link'>Вход</Link>
        </nav>
      </div>
    </header>
  );
};
