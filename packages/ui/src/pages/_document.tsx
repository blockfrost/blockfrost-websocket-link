import React from 'react';
import Document, { Html, Main, NextScript, Head, DocumentContext } from 'next/document';

class MainDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;600;700&amp;display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="bg-blue-50	">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MainDocument;
