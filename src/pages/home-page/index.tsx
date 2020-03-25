import React from 'react';
import BasicLayout from '../../layout/basic-layout';
import UploadComp from '../../components/upload-file';

const HomePage: React.FC = () => {
  return (
    <BasicLayout title="首页">
      <h3>HomePage</h3>
      <UploadComp />
    </BasicLayout>
  );
};
export default HomePage;
