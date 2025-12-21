import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/about', label: 'About Us' },
    { path: '/history', label: 'Our History' },
    { path: '/blog', label: 'News & Blog' },
    { path: '/events', label: 'Events' },
  ];

  const resources = [
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/faq', label: 'FAQ' },
    { path: '/privacy', label: 'Privacy Policy' },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">
                  <span className="logo-text">TBWS</span>
                </div>
                <div className="logo-content">
                  <span className="logo-title">Tusker Basketball</span>
                  <span className="logo-subtitle">Welfare Society</span>
                </div>
              </div>
              <p className="footer-description">
                Building champions on and off the court. Join us in promoting
                basketball excellence and community development in Kenya.
              </p>
              <div className="social-links">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  aria-label="YouTube"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-section">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                {resources.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h3 className="footer-title">Contact Us</h3>
              <ul className="footer-contact">
                <li className="contact-item">
                  <Mail size={18} />
                  <span>info@tbws.org</span>
                </li>
                <li className="contact-item">
                  <Phone size={18} />
                  <span>+254 XXX XXXX</span>
                </li>
                <li className="contact-item">
                  <MapPin size={18} />
                  <span>Nairobi, Kenya</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Tusker Basketball Welfare Society. All rights reserved.</p>
            <p>
              Developed by{' '}
              <a 
                href="https://samtechnologies.co.ke" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="developer-link"
              >
                Sam Technologies
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;