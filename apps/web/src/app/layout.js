import '../index.css';

export const metadata = {
  title: 'Your Daily Delight',
  description: 'Quiz and learning interface',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
