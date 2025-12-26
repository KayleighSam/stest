import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, ArrowRight, Send
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/about', label: 'About Us' },
    { path: '/history', label: 'Our History' },
    { path: '/league-rules', label: 'League Rules' },
    { path: '/venues', label: 'Venues' },
  ];

  const programs = [
    { path: '/events', label: 'Events & Tournaments' },
    { path: '/draft-info', label: 'Draft Process' },
    { path: '/managers', label: 'Team Managers' },
    { path: '/gallery', label: 'Photo Gallery' },
  ];

  const resources = [
    { path: '/blog', label: 'News & Blog' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/privacy', label: 'Privacy Policy' },
  ];

  return (
    <footer className="footer-modern">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Stay Updated</h3>
              <p>Subscribe to our newsletter for the latest news and updates</p>
            </div>
            <form className="newsletter-form">
              <div className="newsletter-input-wrapper">
                <Mail size={20} className="newsletter-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  <Send size={20} />
                  <span>Subscribe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid-modern">
            {/* About Section */}
            <div className="footer-col footer-col-about">
              <div className="footer-logo-modern">
                <div className="footer-shield">
                  <span className="shield-text">TBWS</span>
                </div>
                <div className="footer-brand">
                  <span className="brand-title">TBWS</span>
                  <span className="brand-subtitle">Basketball Society</span>
                </div>
              </div>
              
              <p className="footer-about-text">
                Building champions on and off the court. Join us in promoting
                basketball excellence and community development in Kenya.
              </p>

              {/* Social Links */}
              <div className="footer-social">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link-modern"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link-modern"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link-modern"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link-modern"
                  aria-label="YouTube"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h3 className="footer-heading">Quick Links</h3>
              <ul className="footer-links-modern">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link-modern">
                      <ArrowRight size={14} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Programs */}
            <div className="footer-col">
              <h3 className="footer-heading">Programs</h3>
              <ul className="footer-links-modern">
                {programs.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link-modern">
                      <ArrowRight size={14} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h3 className="footer-heading">Contact Us</h3>
              <ul className="footer-contact-modern">
                <li className="contact-item-modern">
                  <div className="contact-icon-modern">
                    <Mail size={18} />
                  </div>
                  <div className="contact-text">
                    <span className="contact-label">Email</span>
                    <a href="mailto:info@tbws.org">info@tbws.org</a>
                  </div>
                </li>
                <li className="contact-item-modern">
                  <div className="contact-icon-modern">
                    <Phone size={18} />
                  </div>
                  <div className="contact-text">
                    <span className="contact-label">Phone</span>
                    <a href="tel:+254123456789">+254 123 456 789</a>
                  </div>
                </li>
                <li className="contact-item-modern">
                  <div className="contact-icon-modern">
                    <MapPin size={18} />
                  </div>
                  <div className="contact-text">
                    <span className="contact-label">Location</span>
                    <span>Nairobi, Kenya</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom-modern">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright-text">
              &copy; {currentYear} Tusker Basketball Welfare Society. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="bottom-link">Privacy Policy</Link>
              <span className="bottom-divider">•</span>
              <Link to="/terms" className="bottom-link">Terms of Service</Link>
            </div>
            <p className="developer-credit">
              Developed by{' '}
              <a 
                href="https://samtechnologies.co.ke" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="developer-link-modern"
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