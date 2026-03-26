import '../index.css';

export const metadata = {
  title: {
    default: 'Viet Autoescola',
    template: '%s | Viet Autoescola',
  },
  description: 'Quiz and learning interface',
  icons: {
    icon: '/brand/logo.png',
    shortcut: '/brand/logo.png',
    apple: '/brand/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
