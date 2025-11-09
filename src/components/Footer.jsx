const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-8 py-4">
      <div className="max-w-7xl mx-auto px-6 text-sm text-gray-500 flex justify-between items-center">
        <div>© {currentYear} Silverleaf Academy — Admin Workload Dashboard</div>
        <div className="flex items-center gap-4">
          <a href="#docs" className="hover:text-gray-900 transition-colors">Documentation</a>
          <a href="#support" className="hover:text-gray-900 transition-colors">Support</a>
          <div>Data: <span className="font-medium">see status bar</span></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

