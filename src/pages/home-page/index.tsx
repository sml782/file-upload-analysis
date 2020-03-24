import React from 'react';
import BasicLayout from '../../layout/basic-layout';
import InputFile from '../../components/input-file';

const HomePage: React.FC = () => {
  return (
    <BasicLayout title="首页">
      <h3>HomePage</h3>
      <InputFile />
    </BasicLayout>
  );
};
export default HomePage;
