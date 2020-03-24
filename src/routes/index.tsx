import React from 'react';
import { BrowserRouter as Router, Route, Switch, RouteProps } from 'react-router-dom';
import HomePage from '../pages/home-page';
import LoginPage from '../pages/login-page';
import UserPage from '../pages/user-page';
import CartPage from '../pages/cart-page';
import OrderPage from '../pages/order-page';
import TopBar from '../components/top-bar';
import BottomNav from '../components/bottom-nav';
// import PrivateRoute from './private-route';

// const bottomNav = {};

const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: HomePage,
  },
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/user',
    component: UserPage,
  },
  {
    path: '/cart',
    component: CartPage,
  },
  {
    path: '/orderlist',
    component: OrderPage,
  },
];

// todo 实现topBar的顶部title显示，注意优化，不要重复渲染
const Routes: React.FC = () => {
  return (
    <Router>
      {/* 能获取到history location match吗，来自context */}
      {/* <BottomNav /> */}
      <Route routes={routes} component={TopBar} />
      <Route component={BottomNav} />
      <Switch>
        {routes.map((item) => {
          return (
            <Route
              key={item.path as string}
              exact={item.exact}
              path={item.path}
              component={item.component}
            />
          );
        })}
      </Switch>
    </Router>
  );
};

export default Routes;
