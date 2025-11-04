import "../styles/global.css";
import Provider from "@components/provider/Provider";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://huixinyang.com",
  ),
  title: {
    default: "WhatNow Studio",
    template: "%s | WhatNow Studio",
  },
  description: "Two-way sync between Notion and Google Calendar",
  authors: [{ name: "Huixin Yang" }],
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      <div className="main">
        <div className="gradient" />
      </div>
      <Provider>
        <main>{children}</main>
        <footer>
          <p>
            © 2025 Huixin Yang. All rights reserved.
          </p>
        </footer>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
