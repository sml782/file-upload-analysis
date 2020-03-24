import { Reducer } from 'redux';

export type Tip = {
  msg?: string,
  money?: string,
}
export type UserInfo = {
  id: null | number,
  name: null | string,
};

export interface UserState {
  isLogin?: boolean; // 判断是否登录
  loading?: boolean; // 显示loading状态
  userInfo?: UserInfo;
  tip?: Tip, // 提示 信息
  err?: Tip // 错误显示信息
};

// 定义修改规则 登录
const initalUserInfo: UserState = {
  isLogin: false, // 判断是否登录
  loading: false, // 显示loading状态
  userInfo: {
    // 详细数据信息
    id: null,
    name: null,
  },
  tip: {}, // 提示 信息
  err: {}, // 错误显示信息
};

type ActionType = 'LOGOUT_REQUEST' | 'LOGIN_REQUEST' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT_SUCCESS' | 'LOGOUT_FAILURE';
export interface Action {
  type: ActionType;
  payload: UserState;
};

export type UserReducer = Reducer<UserState, Action>;

const userReducer: UserReducer = (state = {...initalUserInfo}, action) => {
  switch (action.type) {
    case 'LOGOUT_REQUEST':
    case 'LOGIN_REQUEST':
      return {
        ...state,
        loading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        isLogin: true,
        loading: false,
        userInfo: action.payload as UserInfo,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        ...initalUserInfo,
        ...action.payload,
      };
    case 'LOGOUT_SUCCESS':
      return {
        isLogin: false,
        ...initalUserInfo,
        ...action.payload,
      };
    case 'LOGOUT_FAILURE':
      return {
        ...state,
        ...initalUserInfo,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default userReducer;
