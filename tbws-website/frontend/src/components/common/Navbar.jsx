import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
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
      path: '/about',
      dropdown: [
        { name: 'About TBWS', path: '/about' },
        { name: 'History', path: '/history' },
        { name: 'Our Team', path: '/about#team' },
        { name: 'FAQ', path: '/faq' },
      ]
    },
    {
      name: 'League',
      dropdown: [
        { name: 'League Rules', path: '/league-rules' },
        { name: 'Draft Process', path: '/draft-info' },
        { name: 'Team Managers', path: '/managers' },
        { name: 'Venues', path: '/venues' },
      ]
    },
    { name: 'Events', path: '/events' },
    { name: 'Blog', path: '/blog' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-wrapper">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-circle">
              <div className="logo-inner">
                <span className="logo-text">TB</span>
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
                  className="nav-dropdown"
                  onMouseEnter={() => setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="nav-link nav-dropdown-trigger">
                    {link.name}
                    <ChevronDown size={16} className="dropdown-icon" />
                  </button>
                  <div className={`dropdown-menu ${activeDropdown === link.name ? 'dropdown-menu-show' : ''}`}>
                    {link.dropdown.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `dropdown-item ${isActive ? 'dropdown-item-active' : ''}`
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
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  {link.name}
                </NavLink>
              )
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="navbar-cta-desktop">
            <Link to="/contact" className="btn-join">
              <span>Join Us</span>
              <div className="btn-shine"></div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="mobile-toggle"
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isOpen ? 'hamburger-active' : ''}`}>
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar-collapse ${isOpen ? 'navbar-collapse-show' : ''}`}>
          <div className="navbar-menu-mobile">
            {navLinks.map((link, index) => (
              link.dropdown ? (
                <div key={link.name} className="mobile-dropdown">
                  <button
                    onClick={() => toggleDropdown(link.name)}
                    className="nav-link-mobile nav-dropdown-mobile-trigger"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {link.name}
                    <ChevronDown 
                      size={18} 
                      className={`mobile-dropdown-icon ${activeDropdown === link.name ? 'mobile-dropdown-icon-open' : ''}`}
                    />
                  </button>
                  <div className={`mobile-dropdown-content ${activeDropdown === link.name ? 'mobile-dropdown-content-show' : ''}`}>
                    {link.dropdown.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `mobile-dropdown-item ${isActive ? 'mobile-dropdown-item-active' : ''}`
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
                    `nav-link-mobile ${isActive ? 'nav-link-mobile-active' : ''}`
                  }
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {link.name}
                </NavLink>
              )
            ))}
            <div className="navbar-cta-mobile">
              <Link to="/contact" className="btn-join-mobile">
                Join Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;