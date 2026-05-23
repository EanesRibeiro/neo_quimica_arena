import { useEffect, useRef, useState } from 'react';

/**
 * Hook para disparar efeitos de fade-in quando o elemento entra na tela.
 * @param {number} threshold - Porcentagem de visibilidade para disparar o reveal.
 * @returns {[React.RefObject, boolean]} Referência do elemento e se ele está visível.
 */
export function useScrollReveal(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Uma vez visível, para de observar
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [elementRef, isVisible];
}
