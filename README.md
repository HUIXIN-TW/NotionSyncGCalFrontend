# NOTICA

[![Deploy on Amplify](https://img.shields.io/badge/Deploy-AWS%20Amplify-orange?logo=awsamplify&style=for-the-badge)](https://console.aws.amazon.com/amplify/home)

[![Live Demo](https://img.shields.io/badge/View-Live%20Demo-green?style=for-the-badge)](https://notica.studio/)

![alt text](images/notica.png)

A modern web application that provides a user interface for synchronizing Notion pages with Google Calendar events. This frontend interfaces with the NotionSyncGCal backend service to help users manage their calendar synchronization seamlessly.

## Features

- **User Authentication**: Secure login and registration system
- **Calendar Integration**: Connect and manage Google Calendar synchronization
- **Notion Integration**: Link and manage Notion workspace connections
- **Sync Management**: Control and customize how Notion pages sync with calendar events
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Getting Started

These instructions will help you set up the project for development on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (recommended to use NVM for version management)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository to your local machine:

```bash
git clone git@github.com:HUIXIN-TW/NOTICA.git
```

2. Navigate into the project directory:

```bash
cd NOTICA
```

3. Install the required dependencies:

```bash
npm install
# or
yarn install
```

4. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
# Add other required environment variables
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security

Never share or commit your personal credentials, OAuth secrets, or JWT keys.
If you believe you’ve found a security vulnerability, please read our
[SECURITY.md](./SECURITY.md) policy and report it responsibly.

## Contributing

We welcome pull requests that improve code quality, documentation, or UI/UX.
Before contributing, review the [CONTRIBUTING.md](./CONTRIBUTING.md) guide.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
