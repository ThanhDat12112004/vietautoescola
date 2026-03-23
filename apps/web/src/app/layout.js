import "../styles/globals.css";

export const metadata = {
  title: "Viet Acosla",
  description: "Bilingual quiz platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
