import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const autofillHideCss = `
input::-webkit-credentials-auto-fill-button,
input::-webkit-contacts-auto-fill-button,
input::-webkit-strong-password-auto-fill-button {
  visibility: hidden !important;
  display: none !important;
  pointer-events: none;
  width: 0;
  height: 0;
}
input::-ms-reveal,
input::-ms-clear {
  display: none;
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: autofillHideCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
