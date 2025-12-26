import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ContactForm from '../components/contact/ContactForm';
import './Contact.css';

const Contact = () => {
  const { siteSettings } = useAppContext();

  const contactInfo = [
    {
      icon: <Mail size={28} />,
      title: 'Email Us',
      value: siteSettings?.contact_email || 'info@tbws.org',
      description: 'Send us an email anytime',
      link: `mailto:${siteSettings?.contact_email || 'info@tbws.org'}`,
    },
    {
      icon: <Phone size={28} />,
      title: 'Call Us',
      value: siteSettings?.contact_phone || '+254 123 456 789',
      description: 'Mon-Fri from 9am to 5pm',
      link: `tel:${siteSettings?.contact_phone || ''}`,
    },
    {
      icon: <MapPin size={28} />,
      title: 'Visit Us',
      value: siteSettings?.address || 'Nairobi, Kenya',
      description: 'Come say hello at our office',
      link: null,
    },
    {
      icon: <Clock size={28} />,
      title: 'Working Hours',
      value: 'Mon - Fri: 9:00 AM - 5:00 PM',
      description: 'Weekend: Closed',
      link: null,
    },
  ];

  return (
    <div className="contact-page-premium">
      {/* Hero Section */}
      <section className="contact-hero-premium">
        <div className="contact-hero-overlay"></div>
        
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="contact-hero-content"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="contact-hero-tag"
            >
              <MessageSquare size={18} />
              <span>GET IN TOUCH</span>
            </motion.div>

            <h1 className="contact-hero-title">
              CONTACT US
            </h1>
            
            <p className="contact-hero-desc">
              Have questions or want to join TBWS? We'd love to hear from you
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="contact-info-card"
              >
                <div className="contact-info-icon">{info.icon}</div>
                <div className="contact-info-content">
                  <h3>{info.title}</h3>
                  {info.link ? (
                    <a href={info.link} className="contact-info-value">
                      {info.value}
                    </a>
                  ) : (
                    <p className="contact-info-value">{info.value}</p>
                  )}
                  <p className="contact-info-desc">{info.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-form-layout">
            {/* Left Side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="contact-form-text"
            >
              <div className="form-text-tag">
                <Send size={18} />
                <span>SEND MESSAGE</span>
              </div>
              <h2 className="form-text-title">
                Let's Start a Conversation
              </h2>
              <p className="form-text-desc">
                Fill out the form and our team will get back to you within 24 hours. 
                Whether you're interested in joining our league, partnerships, or just 
                have a question, we're here to help.
              </p>

              <div className="form-text-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">✓</div>
                  <div className="highlight-text">
                    <strong>Quick Response</strong>
                    <p>We typically respond within 24 hours</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">✓</div>
                  <div className="highlight-text">
                    <strong>Expert Support</strong>
                    <p>Our team is here to help you</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">✓</div>
                  <div className="highlight-text">
                    <strong>100% Confidential</strong>
                    <p>Your information is safe with us</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="contact-form-container"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section-premium">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="map-header"
          >
            <div className="map-tag">
              <MapPin size={18} />
              <span>LOCATION</span>
            </div>
            <h2 className="map-title">Find Us</h2>
            <p className="map-desc">Visit our office or drop by for a chat</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="map-container-premium"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19036322465!2d36.70730744863279!3d-1.3028618516661254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="TBWS Location"
            ></iframe>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;