import React from 'react';
import Hero from '../components/home/Hero';
import AboutSection from '../components/home/AboutSection';
import FeaturedPosts from '../components/home/FeaturedPosts';
import UpcomingEvents from '../components/home/UpcomingEvents';
import SponsorsSection from '../components/home/SponsorsSection';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <AboutSection />
      <FeaturedPosts />
      <UpcomingEvents />
      <SponsorsSection />
    </div>
  );
};

export default Home;