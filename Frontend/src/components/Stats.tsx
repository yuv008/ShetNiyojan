
import { useEffect, useRef } from 'react';

const Stats = () => {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    <div className="bg-white py-16 md:py-24" ref={statsRef}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat 1 */}
          <div className="text-center relative stats-divider appear-on-scroll md:pr-4">
            <h2 className="text-4xl md:text-5xl font-bold text-agrigreen">
              5,000<span className="text-agriorange">+</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Hectares of farmland optimized using precision agriculture techniques
            </p>
          </div>

          {/* Stat 2 */}
          <div className="text-center relative stats-divider appear-on-scroll md:px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-agrigreen">
              10,000<span className="text-agriorange">+</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Farmers supported with access to cutting-edge tools and technology
            </p>
          </div>

          {/* Stat 3 */}
          <div className="text-center appear-on-scroll md:pl-4">
            <h2 className="text-4xl md:text-5xl font-bold text-agrigreen">
              10 Million
            </h2>
            <p className="mt-2 text-gray-600">
              Liters saved of water through smart irrigation systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
