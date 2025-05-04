import "../styles/global.css";
import Provider from "@components/provider/Provider";

export const metadata = {
  title: "WhatNow Studio",
  description: "two way sync between Notion and Google Calendar",
  author: "Huixin Yang",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      <Provider>
        <main>{children}</main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
