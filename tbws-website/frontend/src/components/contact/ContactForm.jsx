import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Send } from 'lucide-react';
import { contentAPI } from '../../api/content';
import toast from 'react-hot-toast';
import './ContactForm.css';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  subject: yup.string().required('Subject is required'),
  message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
  inquiry_type: yup.string().required('Please select an inquiry type'),
}).required();

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await contentAPI.submitContact(data);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'membership', label: 'Membership' },
    { value: 'sponsorship', label: 'Sponsorship' },
    { value: 'media', label: 'Media Inquiry' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={errors.name ? 'input-error' : ''}
            placeholder="John Doe"
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'input-error' : ''}
            placeholder="john@example.com"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+254 XXX XXXX"
          />
        </div>

        <div className="form-group">
          <label htmlFor="inquiry_type">Inquiry Type *</label>
          <select
            id="inquiry_type"
            {...register('inquiry_type')}
            className={errors.inquiry_type ? 'input-error' : ''}
          >
            <option value="">Select type</option>
            {inquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.inquiry_type && <span className="error-message">{errors.inquiry_type.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          id="subject"
          type="text"
          {...register('subject')}
          className={errors.subject ? 'input-error' : ''}
          placeholder="How can we help you?"
        />
        {errors.subject && <span className="error-message">{errors.subject.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          {...register('message')}
          rows="6"
          className={errors.message ? 'input-error' : ''}
          placeholder="Tell us more about your inquiry..."
        ></textarea>
        {errors.message && <span className="error-message">{errors.message.message}</span>}
      </div>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner-small"></span>
            Sending...
          </>
        ) : (
          <>
            <Send size={20} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;