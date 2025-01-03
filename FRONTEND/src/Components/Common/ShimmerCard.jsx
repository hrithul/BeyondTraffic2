import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody } from "reactstrap";
import Shimmer from "./Shimmer";
import styled from "styled-components";

const ShimmerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none;
  height: ${(props) => props.heightcontainer || "auto"};
`;

const ShimmerCard = React.memo(
  ({
    height,
    heighth,
    className,
    heightcontainer,
    shimmerWidths = ["40%", "100%"],
  }) => {
    return (
      <Card className={className} aria-busy="true">
        <CardBody>
          <ShimmerContainer heightcontainer={heightcontainer}>
            <Shimmer height={heighth} width={shimmerWidths[0]} />
            <Shimmer height={height} width={shimmerWidths[1]} />
          </ShimmerContainer>
        </CardBody>
      </Card>
    );
  }
);

ShimmerCard.propTypes = {
  height: PropTypes.string,
  heighth: PropTypes.string,
  className: PropTypes.string,
  heightcontainer: PropTypes.string,
  shimmerWidths: PropTypes.arrayOf(PropTypes.string),
};

ShimmerCard.defaultProps = {
  height: "200px",
  heighth: "24px",
  className: "",
  heightcontainer: "auto",
  shimmerWidths: ["40%", "100%"],
};

ShimmerCard.displayName = "ShimmerCard";

export default ShimmerCard;
