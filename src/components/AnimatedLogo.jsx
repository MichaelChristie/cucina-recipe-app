import React, { useEffect, useRef } from 'react';

const AnimatedSVG = () => {
  const svgRef = useRef(null);

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
      width="32"
      height="32"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Frame 1 */}
      <g id="frame1" opacity="1">
        <path d="M4 18.6667C4 21.4956 5.26428 24.2087 7.51472 26.2091C9.76516 28.2095 12.8174 29.3333 16 29.3333C19.1826 29.3333 22.2348 28.2095 24.4853 26.2091C26.7357 24.2087 28 21.4956 28 18.6667" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10.6667 12V5.33334" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M20 5.33333L20 12" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <animate attributeName="opacity" from="1" to="0" begin="0.4s" dur="0.08s" fill="freeze" />
      </g>

      {/* Frame 2 */}
      <g id="frame2" opacity="0">
        <path d="M4 18.6667C4 21.4956 5.26428 24.2087 7.51472 26.2091C9.76516 28.2095 12.8174 29.3333 16 29.3333C19.1826 29.3333 22.2348 28.2095 24.4853 26.2091C26.7357 24.2087 28 21.4956 28 18.6667" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10.6667 12V5.33334" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M17.3333 8H24" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <animate attributeName="opacity" from="0" to="1" begin="0.48s" dur="0.08s" fill="freeze" />
        <animate attributeName="opacity" from="1" to="0" begin="0.88s" dur="0.08s" fill="freeze" />
      </g>

      {/* Frame 3 */}
      <g id="frame3" opacity="0">
        <path d="M4 18.6667C4 21.4956 5.26428 24.2087 7.51472 26.2091C9.76516 28.2095 12.8174 29.3333 16 29.3333C19.1826 29.3333 22.2348 28.2095 24.4853 26.2091C26.7357 24.2087 28 21.4956 28 18.6667" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M13.8852 19.0633L18.2851 2.64258" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M18.7149 20.3574L23.1148 3.93668" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <animate attributeName="opacity" from="0" to="1" begin="0.96s" dur="0.08s" fill="freeze" />
      </g>
    </svg>
  );
};

export default AnimatedSVG;