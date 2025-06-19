import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sliderImages } from '../../utils/mockData';

const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isMobile]);

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + (isMobile ? sliderImages.length : sliderImages.length - 2)) %
        (isMobile ? sliderImages.length : sliderImages.length - 2),
    );
    setTranslateX(0);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (isMobile ? sliderImages.length : sliderImages.length - 2));
    setTranslateX(0);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
    if (isDragging) {
      handleDragEnd();
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsAutoPlaying(false);
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const moveX = clientX - startX;
    setTranslateX(moveX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Определяем, был ли это свайп (перетаскивание на достаточное расстояние)
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    } else {
      setTranslateX(0);
    }
  };

  const getVisibleSlides = () => {
    if (isMobile) {
      return [sliderImages[currentIndex]];
    }
    return [sliderImages[currentIndex], sliderImages[currentIndex + 1], sliderImages[currentIndex + 2]];
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto mt-[80px] px-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-4">
        {/* Левая кнопка - скрыта на мобильных */}
        <button
          onClick={goToPrevious}
          className={`flex-shrink-0 transform translate-x-10 w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-10 ${isMobile ? 'hidden' : ''}`}
          aria-label="Предыдущий слайд"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Контейнер с слайдами */}
        <div
          className="flex-1 overflow-hidden"
          ref={sliderRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div
            className={`flex ${isMobile ? 'justify-center' : 'items-center gap-5 md:grid md:grid-cols-3'}`}
            style={{
              transform: isMobile ? `translateX(${translateX}px)` : 'none',
              transition: isDragging ? 'none' : 'transform 0.3s ease',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            {getVisibleSlides().map((slide, index) => (
              <div
                key={`${slide.id}-${currentIndex}-${index}`}
                className={`relative bg-gray-400 h-64 md:h-80 ${isMobile ? 'w-full max-w-md' : 'w-70 md:w-auto'} rounded-2xl overflow-hidden group cursor-pointer transform transition-all duration-500 flex-shrink-0`}
              >
              
              {/* Картинки сюда */}

                <div className="absolute inset-0 " />

                <div className="absolute bottom-0 font-philosopher left-0 right-0 p-6">
                  <h3 className="text-white text-3xl mb-2 ">{slide.title}</h3>
                  <p className="text-orange-300 text-2xl ">{slide.subtitle}</p>
                </div>

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Правая кнопка - скрыта на мобильных */}
        <button
          onClick={goToNext}
          className={`flex-shrink-0 w-12 h-12 transform -translate-x-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-10 ${isMobile ? 'hidden' : ''}`}
          aria-label="Следующий слайд"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Индикаторы */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: isMobile ? sliderImages.length : sliderImages.length - 2 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-red-500' : 'bg-gray-300'}`}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
