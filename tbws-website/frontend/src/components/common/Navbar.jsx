import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Phone, Mail, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'About',
      dropdown: [
        { name: 'About TBWS', path: '/about', desc: 'Our story and mission' },
        { name: 'History', path: '/history', desc: 'Our legacy since founding' },
        { name: 'Our Team', path: '/about#team', desc: 'Meet the leadership' },
        { name: 'FAQ', path: '/faq', desc: 'Common questions' },
      ]
    },
    {
      name: 'League',
      dropdown: [
        { name: 'League Rules', path: '/league-rules', desc: 'Official game rules' },
        { name: 'Draft Process', path: '/draft-info', desc: 'Player draft information' },
        { name: 'Team Managers', path: '/managers', desc: 'Our team leaders' },
        { name: 'Venues', path: '/venues', desc: 'Where we play' },
      ]
    },
    { name: 'Events', path: '/events' },
    { name: 'Blog', path: '/blog' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="navbar-topbar">
        <div className="container">
          <div className="topbar-content">
            <div className="topbar-left">
              <span className="topbar-text">Welcome to TBWS Basketball Society</span>
            </div>
            <div className="topbar-right">
              <a href="tel:+254123456789" className="topbar-link">
                <Phone size={14} />
                <span>+254 123 456 789</span>
              </a>
              <a href="mailto:info@tbws.com" className="topbar-link">
                <Mail size={14} />
                <span>info@tbws.com</span>
              </a>
              {/* Admin Login Link */}
              <Link to="/admin/login" className="topbar-link admin-login-link">
                <Shield size={14} />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar-main ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-wrapper">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <div className="logo-shield">
                <div className="shield-inner">
                  <span className="logo-text">TBWS</span>
                </div>
              </div>
              <div className="logo-details">
                <h1 className="logo-title">TBWS</h1>
                <p className="logo-subtitle">Basketball Society</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-menu-desktop">
              {navLinks.map((link) => (
                link.dropdown ? (
                  <div 
                    key={link.name}
                    className="nav-item-dropdown"
                    onMouseEnter={() => setActiveDropdown(link.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="nav-link-main">
                      {link.name}
                      <ChevronDown size={16} className="dropdown-chevron" />
                    </button>
                    
                    {/* Mega Menu */}
                    <div className={`mega-menu ${activeDropdown === link.name ? 'mega-menu-show' : ''}`}>
                      <div className="mega-menu-content">
                        <div className="mega-menu-grid">
                          {link.dropdown.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className={({ isActive }) =>
                                `mega-menu-item ${isActive ? 'mega-menu-item-active' : ''}`
                              }
                            >
                              <div className="mega-item-title">{item.name}</div>
                              <div className="mega-item-desc">{item.desc}</div>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `nav-link-main ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    {link.name}
                  </NavLink>
                )
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="navbar-cta-desktop">
              <Link to="/contact" className="btn-cta-primary">
                Join TBWS
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={toggleMenu}
              className="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              <span className={`hamburger-icon ${isOpen ? 'hamburger-open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
            <div className="mobile-menu-inner">
              {navLinks.map((link, index) => (
                link.dropdown ? (
                  <div key={link.name} className="mobile-nav-item">
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className="mobile-nav-trigger"
                    >
                      <span>{link.name}</span>
                      <ChevronDown 
                        size={18} 
                        className={`mobile-chevron ${activeDropdown === link.name ? 'mobile-chevron-open' : ''}`}
                      />
                    </button>
                    <div className={`mobile-submenu ${activeDropdown === link.name ? 'mobile-submenu-open' : ''}`}>
                      {link.dropdown.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `mobile-submenu-link ${isActive ? 'mobile-submenu-active' : ''}`
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? 'mobile-nav-active' : ''}`
                    }
                  >
                    {link.name}
                  </NavLink>
                )
              ))}
              
              {/* Admin Login in Mobile Menu */}
              <div className="mobile-nav-divider"></div>
              <Link to="/admin/login" className="mobile-nav-link admin-mobile-link">
                <Shield size={18} />
                <span>Admin Login</span>
              </Link>

              <div className="mobile-cta">
                <Link to="/contact" className="btn-cta-mobile">
                  Join TBWS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;