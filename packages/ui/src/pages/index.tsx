import React, { ReactElement } from 'react';
import Navigation from '../components/Navigation';
import Main from '../components/Main';
import { FormProvider, useFormContext } from 'react-hook-form';

const Index = (): ReactElement => {
  const methods = useFormContext();

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-10">
        <FormProvider {...methods}>
          <Main />
        </FormProvider>
      </div>
    </>
  );
};

export default Index;
