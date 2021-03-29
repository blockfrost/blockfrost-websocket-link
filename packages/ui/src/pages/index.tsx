import React, { ReactElement } from 'react';
import Navigation from '../components/Navigation';
import Main from '../components/Form';
import { FormProvider, useForm } from 'react-hook-form';

const Index = (): ReactElement => {
  const methods = useForm({
    defaultValues: {
      socketUrl: 'ws://localhost:3005',
      accountInfoKey:
        'f1f3816b898cb100b336c169a1ca3e2571ed8fa55687c58a381ece7406cdb88b7703a2088169d725d7a3f0b03e6d2f538d10f81ea0df8869e025309c259f15dc',
    },
  });

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
