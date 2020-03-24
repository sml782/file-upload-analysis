import { Dispatch } from 'redux';
import LoginService from '../service/login';
import { UserInfo, Tip } from '../store/user-reducer';

interface GetMoreUserInfoFunc {
  (dispatch: Dispatch, userInfo: UserInfo): void;
}
const getMoreUserInfo: GetMoreUserInfoFunc = (dispatch, userInfo) => {
  LoginService.getMoreUserInfo(userInfo)
    .then((res) => {
      dispatch({type: 'LOGIN_SUCCESS', payload: {...res, ...userInfo}});
    })
    .catch((err) => {
      dispatch({type: 'LOGIN_FAILURE', payload: err});
    });
};

interface LoginFunc {
  (dispatch: Dispatch, userInfo: UserInfo): Promise<void | UserInfo | Tip>;
}
const login: LoginFunc = (dispatch, userInfo) => {
  return LoginService.login(userInfo)
    .then((res) => {
      return res;
      // dispatch({type: "LOGIN_SUCCESS", payload: res});
    })
    .catch((err) => {
      dispatch({type: 'LOGIN_FAILURE', payload: err});
    });
};

interface LoginActionFunc {
  (dispatch: Dispatch, userInfo: UserInfo): void;
}
export const loginAction: LoginActionFunc = async (dispatch, userInfo) => {
  dispatch({type: 'LOGIN_REQUEST'}); // 展示loading
  const res1 = await login(dispatch, userInfo);
  // 上一个请求之后，进行下一个异步请求
  getMoreUserInfo(dispatch, res1 as UserInfo);
  // // 去login请求
  // setTimeout(() => {
  //   dispatch({type: "LOGIN_SUCCESS", payload: userInfo});
  // }, 1000);
};
