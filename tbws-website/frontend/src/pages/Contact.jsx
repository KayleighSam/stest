import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ContactForm from '../components/contact/ContactForm';
import './Contact.css';

const Contact = () => {
  const { siteSettings } = useAppContext();

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: 'Email',
      value: siteSettings?.contact_email || 'info@tbws.org',
      link: `mailto:${siteSettings?.contact_email || 'info@tbws.org'}`,
    },
    {
      icon: <Phone size={24} />,
      title: 'Phone',
      value: siteSettings?.contact_phone || '+254 XXX XXXX',
      link: `tel:${siteSettings?.contact_phone || ''}`,
    },
    {
      icon: <MapPin size={24} />,
      title: 'Address',
      value: siteSettings?.address || 'Nairobi, Kenya',
      link: null,
    },
    {
      icon: <Clock size={24} />,
      title: 'Office Hours',
      value: 'Mon - Fri: 9:00 AM - 5:00 PM',
      link: null,
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="page-hero-content"
          >
            <h1>Contact Us</h1>
            <p>Get in touch with the TBWS team</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Contact Info Cards */}
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p className="contact-description">
                Have questions or want to join TBWS? We'd love to hear from you.
                Fill out the form or reach out through any of the channels below.
              </p>

              <div className="contact-cards">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="contact-card"
                  >
                    <div className="contact-card-icon">{info.icon}</div>
                    <div className="contact-card-content">
                      <h3>{info.title}</h3>
                      {info.link ? (
                        <a href={info.link}>{info.value}</a>
                      ) : (
                        <p>{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h2>Send Us A Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="section map-section">
        <div className="container">
          <h2 className="section-heading">Find Us</h2>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19036322465!2d36.70730744863279!3d-1.3028618516661254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: 'var(--radius-xl)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;