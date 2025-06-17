import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { sliderImages } from '../utils/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import cn from 'classnames';

const HeroSlider: React.FC = () => {
  const ArrowClasses =
    'absolute top-1/2 -translate-y-1/2 z-[2] w-10 h-10 bg-white/30 rounded-full cursor-pointer flex items-center justify-center border-none transition-colors duration-300';

  const arrowPrev = (onClickHandler: () => void) => (
    <button onClick={onClickHandler} className={cn(ArrowClasses, 'left-10')} aria-label="Previous">
      <ChevronLeft className="h-6 w-6 text-white" />
    </button>
  );

  const arrowNext = (onClickHandler: () => void) => (
    <button onClick={onClickHandler} className={cn(ArrowClasses, 'right-10')} aria-label="Next">
      <ChevronRight className="h-6 w-6 text-white" />
    </button>
  );

  return (
    <div className="container mx-auto mb-8 px-4 sm:px-0">
      <div className="carousel-container">
        <Carousel
          showArrows={true}
          infiniteLoop={true}
          autoPlay={true}
          interval={5000}
          showThumbs={false}
          showStatus={false}
          renderArrowPrev={arrowPrev}
          renderArrowNext={arrowNext}
          showIndicators={true}
          emulateTouch={true}
          swipeable={true}
        >
          {sliderImages.map((image, index) => (
            <div key={index} className="relative overflow-hidden pb-[40%] ">
              <img
                src={image}
                alt={`Слайд ${index + 1}`}
                className="w-full absolute top-0 left-0 h-full object-cover"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default HeroSlider;
