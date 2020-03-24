import React, { Component } from 'react';
import { RouteProps } from 'react-router-dom';
import { connect } from 'react-redux';
// import { H } from 'history';
import BasicLayout from '../../layout/basic-layout';
import { RootStateMap } from '../../store';
import { UserInfo, UserState, Action } from '../../store/user-reducer';
// import { loginAction } from '../../action/login';
import './index.scss';

interface IProps extends RouteProps {
  user: UserState;
  // login: (userInfo: UserInfo) => Action;
  [key: string]: any
};

interface IState {
  name: string;
}

interface MapDTOProps {
  login: (userInfo: UserInfo) => Action;
}

export default connect(
  ({ user }: RootStateMap) => ({ user }),
  {
    // login: (userInfo: UserInfo) => ({ type: 'loginSaga', payload: userInfo }),

    login: (userInfo: UserInfo) => ({ type: 'LOGIN_SUCCESS', payload: userInfo }),
    // login: userInfo => dispatch => {
    // loginAction(dispatch, userInfo);
    // dispatch({ type: 'LOGIN_REQUEST' }); //展示loading
    // 去login请求
    // setTimeout(() => {
    //   dispatch({type: "LOGIN_SUCCESS", payload: userInfo});
    // }, 1000);
    // }
  }
)(
  class LoginPage extends Component<IProps, IState> {
    // constructor(props: Readonly<IProps>) {
    //   super(props);
    //   this.state = {name: ''};
    // }

    readonly state = {
      name: '',
    }

    handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ name: event.target.value });
    }

    handleLogin = () => {
      const { history } = this.props;
      const { name } = this.state;
      const { login } = this.props;
      login({ id: 1, name });
      history.push('/');
    }

    render() {
      const { user } = this.props;
      // const {login, user, location } = this.props;
      const { loading } = user;
      // const { isLogin, loading, err, tip } = user;
      // if (isLogin) {
      //   const { redirect = '/' } = (location as History).state || {};
      //   return <Redirect to={redirect} />;
      // }
      const { name } = this.state;
      return (
        <BasicLayout title="登录" className="loginPage">
          <h3>LoginPage</h3>
          <input
            type="text"
            value={name}
            onChange={this.handleChangeName}
          />
          {/* <p className="red">{err.msg}</p> */}
          <button className="login-btn" onClick={this.handleLogin}>
            {loading ? '登录中...' : '登录'}
          </button>
          {/* <p className="green">{tip.msg}</p> */}
        </BasicLayout>
      );
    }
  }
);
