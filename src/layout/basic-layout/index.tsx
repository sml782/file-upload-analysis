import React, { Component } from 'react';
import classnames from 'classnames';
import { RouteProps } from 'react-router-dom';
// import TopBar from '../../components/top-bar';
// import BottomNav from '../../components/bottom-nav';
import './index.scss';

interface Iprops extends RouteProps {
  className?: string;
  title?: string;
};

export default class BasicLayout extends Component<Iprops> {
  componentDidMount() {
    const { title = '默认' } = this.props;
    document.title = title;
  }

  render() {
    const {
      className,
      children,
      // title,
      // path,
      // component,
    } = this.props;
    // return (
    //   <>
    //     <Route component={BottomNav} />
    //     <Route path={path} component={component} />
    //   </>
    // );
    return (
      <div className={classnames('basicLayout', className)}>
        {/* <TopBar title={title} /> */}
        <article>{children}</article>
        {/* <BottomNav /> */}
      </div>
    );
  }
}
