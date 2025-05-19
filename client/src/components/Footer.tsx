export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 p-4 border-t text-center text-gray-600">
      <p>© {currentYear} Oceanview Resort. All rights reserved.</p>
    </footer>
  );
}
