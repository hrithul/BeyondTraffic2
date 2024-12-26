import React, { Fragment, useContext } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import H3 from '../Headings/H3Element';
import CustomizerContext from '../../_helper/Customizer';
import SvgIcon from '../../Components/Common/Component/SvgIcon';
import DateFilter from './DateFilter';
import DeviceFilter from './DeviceFilter';
import { setDateFilter } from '../../redux/actions/dateFilterActions';
import { setDeviceFilter } from '../../redux/actions/deviceFilterActions';

const Breadcrumbs = (props) => {
  const { layoutURL } = useContext(CustomizerContext);
  const dispatch = useDispatch();

  const handleDateFilterChange = (filter) => {
    dispatch(setDateFilter(filter));
  };

  const handleDeviceFilterSelect = (filter) => {
    dispatch(setDeviceFilter(filter));
  };

  return (
    <Fragment>
      <Container fluid={true}>
        <div className="page-title">
          <Row>
            <Col xs="6">
              <H3>{props.mainTitle}</H3>
            </Col>
            <Col xs="6">
              <div className="d-flex align-items-center justify-content-end">
                <DateFilter onFilterSelect={handleDateFilterChange} />
                <ol className="breadcrumb">
                  <li>
                    <DeviceFilter onFilterSelect={handleDeviceFilterSelect} />
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={`${process.env.PUBLIC_URL}/dashboard/default/${layoutURL}`}>
                      <SvgIcon iconId="stroke-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">{props.parent}</li>
                  {props.subParent && (
                    <li className="breadcrumb-item">{props.subParent}</li>
                  )}
                  <li className="breadcrumb-item active">{props.title}</li>
                </ol>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </Fragment>
  );
};

export default Breadcrumbs;
