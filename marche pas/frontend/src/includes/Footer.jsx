function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© 2026 - {year} Pharell77coder - TOUS DROITS RÉSERVÉS</p>
        <div className="footer-links">
          <a href="/mentions-legales" className="footer-link">MENTIONS LÉGALES</a>
          <span className="footer-separator">•</span>
          <a href="/contact" className="footer-link">CONTACT</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;