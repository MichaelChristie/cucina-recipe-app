import { FC, useEffect, useRef } from 'react';

const Logo: FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const animateElements = svgRef.current.querySelectorAll('animate');
      animateElements.forEach((animate) => {
        animate.beginElement();
      });
    }
  }, []);

  return (
    <svg 
      ref={svgRef}
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" />
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M16.8106 18L4 18V22L14.5012 22L16.8106 18ZM29.6906 22L36 22V18L32 18L29.6906 22Z" 
        fill="#FFFFFF"
      />
      <path 
        d="M4 20C4 24.2435 5.68571 28.3131 8.68629 31.3137C11.6869 34.3143 15.7565 36 20 36C24.2435 36 28.3131 34.3143 31.3137 31.3137C34.3143 28.3131 36 24.2435 36 20" 
        stroke="#FFFFFF" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M19 28.5584L32.6015 5" 
        stroke="#FFFFFF" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo; 