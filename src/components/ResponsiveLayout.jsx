import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';

const ResponsiveLayout = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  return (
    <div className={`
      ${isMobile ? 'p-2 space-y-2' : ''}
      ${isTablet ? 'p-4 space-y-4' : ''}
      ${!isMobile && !isTablet ? 'p-6 space-y-6' : ''}
    `}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;