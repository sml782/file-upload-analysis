import React, { Component } from 'react';
import MenuItem, { MenuProps } from './menu-item';
import './index.scss';

const menu: MenuProps[] = [
  {
    key: 'home',
    title: '首页',
    link: '/',
    icon: 'shouye',
  },
  {
    key: 'cart',
    title: '购物车',
    link: '/cart',
    icon: 'fenlei',
  },
  {
    key: 'orderlist',
    title: '订单列表',
    link: '/orderlist',
    icon: 'icon-',
  },
  {
    key: 'user',
    title: '我的淘宝',
    link: '/user',
    icon: 'wode',
  },
];

export default class BottomNav extends Component<{}, {}> {
  render() {
    return (
      <ul className="bottomNav">
        {menu.map((item) => (
          <MenuItem key={item.key} {...item} />
        ))}
      </ul>
    );
  }
}
