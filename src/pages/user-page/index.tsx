import React, { Component } from 'react';
import { RouteProps } from 'react-router-dom';
import { connect } from 'react-redux';
import BasicLayout from '../../layout/basic-layout';
import { RootStateMap } from '../../store';
import { UserState, UserInfo } from '../../store/user-reducer';

interface IProps extends RouteProps {
  user: UserState;
  [key: string]: any
};

class UserPage extends Component<IProps> {
  render() {
    const { user } = this.props;
    const userInfo = user.userInfo as UserInfo;
    return (
      <BasicLayout title="用户中心">
        <h3>UserPage</h3>
        <p>id: {userInfo.id}</p>
        <p>姓名：{userInfo.name}</p>
      </BasicLayout>
    );
  }
}

export default connect(
  ({ user }: RootStateMap) => ({ user })
)(UserPage);
