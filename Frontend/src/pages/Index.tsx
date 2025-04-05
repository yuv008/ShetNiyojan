import React from 'react';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import Solutions from '@/components/Solutions';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import LanguageSelector from '@/components/common/LanguageSelector';
import logoImage from '@/assets/logo.png';
import dashboardImage from '@/assets/dashbaord.png';

// Export the images so they can be imported in other components
export const images = {
  logo: logoImage,
  dashboard: dashboardImage
};

const Index = () => {
  useEffect(() => {
    // Initialize appear on scroll animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.appear-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={logoImage} />
      <Hero dashboardImage={dashboardImage} />
      <Stats />
      <Features dashboardImage={dashboardImage}/>
      <Solutions />
      <Testimonials />
      <CallToAction />
      <Footer logo={logoImage} />
      
      {/* Floating language selector */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

export default Index;
