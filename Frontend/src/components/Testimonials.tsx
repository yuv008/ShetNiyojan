import { useEffect, useRef } from 'react';

const Testimonials = () => {
  const testimonialsRef = useRef<HTMLDivElement>(null);

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
    <div className="bg-agriBg py-16" ref={testimonialsRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-agriorange uppercase mb-2">IMPACT BY ShetNiyojan</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
            Farmers are Making Farming <br className="hidden sm:block" />
            Easier and Happier Lives
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md appear-on-scroll">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80" 
                    alt="Farmer Anne Catherine" 
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-gray-700 italic mb-4">
                  "Since I began using this tech 2 years ago, my yields have gone up! The crop monitoring tools are easy to use, and I'm saving so much water!"
                </p>
                <div>
                  <h4 className="font-semibold">Anne Catherine</h4>
                  <p className="text-sm text-gray-500">Central Lowlands, Scotland</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md appear-on-scroll">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80" 
                    alt="Farmer Sugeng Marjono" 
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-gray-700 italic mb-4">
                  "What I like about this product is how good it is at notifying me when my organic fertilizers have improved my soil health!"
                </p>
                <div>
                  <h4 className="font-semibold">Sugeng Marjono</h4>
                  <p className="text-sm text-gray-500">Kebumen, Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
