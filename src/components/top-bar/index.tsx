import React from 'react';
import { useHistory, RouteProps } from 'react-router-dom';
import './index.scss';

interface IProps extends RouteProps {

}

const TopBar: React.FC<IProps> = () => {
  const history = useHistory();
  // console.log('routes', props); // sy-log
  return (
    <div className="topBar">
      <span
        onClick={() => history.go(-1)}
        className="iconfont icon-jiantou-copy"
      />
      <div className="menu-item">--</div>
    </div>
  );
};

export default TopBar;
