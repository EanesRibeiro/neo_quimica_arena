import { useEffect } from 'react';

export function useScrollReveal(selector = '.reveal', deps = []) {
  useEffect(() => {
    // Add a slight delay to ensure DOM is updated after React renders
    const timeout = setTimeout(() => {
      const els = document.querySelectorAll(selector);
      const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        }),
        { threshold: 0.12 }
      );
      els.forEach(el => observer.observe(el));
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [selector, ...deps]);
}
