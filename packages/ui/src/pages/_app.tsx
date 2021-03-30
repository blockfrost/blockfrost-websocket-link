import { AppContext, AppInitialProps } from 'next/app';
import Head from 'next/head';
import React, { ReactElement } from 'react';
import '../styles/tailwind.css';

function App({ Component, pageProps }: AppContext & AppInitialProps): ReactElement {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Websocket link ui</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
