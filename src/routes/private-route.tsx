import React, { FC } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { RootStateMap } from '../store';
import { UserState } from '../store/user-reducer';

const PrivateRoute: FC<UserState> = ({ children, isLogin, ...rest}) => {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLogin ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {
                redirect: location.pathname,
              },
            }}
          />
        )
      }
    />
  );
};

export default connect(
  ({ user }: RootStateMap) => ({
    isLogin: user.isLogin,
  })
)(PrivateRoute);
