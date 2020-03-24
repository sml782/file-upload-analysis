import React from 'react';
import { Link } from 'react-router-dom';

export interface MenuProps {
  icon: string;
  link: string;
  title: string;
  [key: string]: string;
}

// eslint-disable-next-line react/prop-types
const MenuItem: React.FC<MenuProps> = ({ icon, link, title }) => {

  return (
    <li className="menuItem">
      <span className={`iconfont icon-${icon}`} />
      <Link to={link}>{title}</Link>
    </li>
  );
};

export default MenuItem;
