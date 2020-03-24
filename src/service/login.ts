import { UserInfo, Tip } from '../store/user-reducer';

interface LoginServer {
  login(userInfo: UserInfo): Promise<UserInfo | Tip>;
  getMoreUserInfo(userInfo: UserInfo): Promise<Tip>;
};

// 模拟登录接口
const LoginService: LoginServer = {
  login(userInfo) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userInfo.name === '小明') {
          resolve({ id: 123, name: 'omg原来是小明' });
        } else {
          reject({ err: { msg: '用户名或密码错误' } });
        }
      }, 1000);
    });
  },
  // 获取更多信息
  getMoreUserInfo(userInfo) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userInfo.id === 123) {
          resolve({ money: '100' });
        } else {
          reject({ msg: '获取详细信息错误' });
        }
      }, 1000);
    });
  },
};
export default LoginService;
