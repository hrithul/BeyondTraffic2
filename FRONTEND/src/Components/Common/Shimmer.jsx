import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const ShimmerWrapper = styled.div`
  --shimmer-height: ${props => props.height || '20px'};
  --shimmer-width: ${props => props.width || '100%'};
  --shimmer-radius: ${props => props.borderRadius || '4px'};
  --shimmer-margin: ${props => props.margin || '0'};

  animation: ${shimmer} 1.2s linear infinite;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 800px 104px;
  height: var(--shimmer-height);
  width: var(--shimmer-width);
  border-radius: var(--shimmer-radius);
  margin: var(--shimmer-margin);
  will-change: background-position;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

const Shimmer = React.memo(({ width, height, borderRadius, margin, className }) => (
  <ShimmerWrapper
    width={width}
    height={height}
    borderRadius={borderRadius}
    margin={margin}
    className={className}
  />
));

Shimmer.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  borderRadius: PropTypes.string,
  margin: PropTypes.string,
  className: PropTypes.string
};

Shimmer.displayName = 'Shimmer';

export default Shimmer;
