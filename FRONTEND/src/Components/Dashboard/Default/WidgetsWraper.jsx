import React, { useEffect, useState } from 'react';
import { Col, Row, Card, CardBody} from 'reactstrap';
import { useSelector } from 'react-redux';
import { H5 } from "../../../AbstractElements";
import Widgets1 from '../../Common/CommonWidgets/Widgets1';
import Widgets2 from '../../Common/CommonWidgets/Widgets2';
import axios from '../../../utils/axios';
import { format, subDays, startOfMonth, startOfWeek, endOfMonth, endOfWeek, subMonths, subWeeks, startOfYear  } from 'date-fns';
import ShimmerCard from '../../Common/ShimmerCard';

const WidgetsWrapper = () => {
  const [metricsData, setMetricsData] = useState([]);
  const [widgetStats, setWidgetStats] = useState({
    todayTraffic: 0,
    yesterdayTraffic: 0,
    weekTraffic: 0,
    monthTraffic: 0,
    todayGTraffic: 0,
    yesterdayGTraffic: 0,
    weekGTraffic: 0,
    monthGTraffic: 0,
    dayBeforeYesterdayTraffic: 0,
    prevWeekTraffic: 0,
    prevMonthTraffic: 0,
    MaleTraffic: 0,
    FemaleTraffic: 0,
    UnknownTraffic: 0,
    totalTraffic: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dateFilter = useSelector(state => state.dateFilter.filter);
  const deviceFilter = useSelector(state => state.deviceFilter) || { selectedDevices: {} };
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`/metrics`);
        const metrics = response.data;
        setMetricsData(metrics);
        calculateMetrics(metrics, dateFilter, deviceFilter);
        setError(null);  // Clear any previous errors
      } catch (error) {
        console.error('Error fetching metrics:', error);
        if (error.response?.status === 403) {
          setError('Access to metrics is restricted. Please contact your administrator.');
        } else {
          setError('Failed to fetch metrics data');
        }
        // Don't clear metricsData on error to keep showing last valid data
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateFilter, deviceFilter]);

  useEffect(() => {
    if (metricsData.length > 0) {
      calculateMetrics(metricsData, dateFilter, deviceFilter);
    }
  }, [dateFilter, deviceFilter, metricsData]);

  const getDateRange = (dateFilter) => {
    const today = new Date();
    const todayDate = format(today, "yyyy-MM-dd");
    const yesterday = subDays(today, 1);
    const yesterdayDate = format(yesterday, 'yyyy-MM-dd');
    const dayBeforeYesterday = format(subDays(today, 2), 'yyyy-MM-dd');
    
    // Calculate week start (last Monday) and month start
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const yearStart = format(startOfYear(today), "yyyy-MM-dd");

    // Calculate previous week and month
    const prevWeekEnd = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');
    const prevWeekStart = format(startOfWeek(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const prevMonthEnd = format(subDays(startOfMonth(today), 1), 'yyyy-MM-dd');
    const prevMonthStart = format(startOfMonth(subDays(startOfMonth(today), 1)), 'yyyy-MM-dd');

    // Set filter dates based on dateFilter
    let filterStart, filterEnd;
    switch (dateFilter) {
      case 'today':
        filterStart = todayDate;
        filterEnd = todayDate;
        break;
      case 'week':
        filterStart = weekStart;
        filterEnd = todayDate;
        break;
      case 'month':
        filterStart = monthStart;
        filterEnd = todayDate;
        break;
      case 'year':
        filterStart = yearStart;
        filterEnd = todayDate;
        break;
      case 'yesterday':
        filterStart = yesterdayDate;
        filterEnd = yesterdayDate;
        break;
      case 'lastWeek':
        filterStart = prevWeekStart;
        filterEnd = prevWeekEnd;
        break;
      case 'lastMonth':
        filterStart = prevMonthStart;
        filterEnd = prevMonthEnd;
        break;
      case 'lastYear':
        filterStart = format(subMonths(today, 23), 'yyyy-MM-dd');
        filterEnd = format(subMonths(today, 12), 'yyyy-MM-dd');
        break;
      default:
        filterStart = todayDate;
        filterEnd = todayDate;
    }
    return { startDate: filterStart, endDate: filterEnd };
  };

  const processMetrics = (metrics, startDate, endDate, selectedDeviceIds = []) => {
    let totalTraffic = 0;
    let maleTraffic = 0;
    let femaleTraffic = 0;
    let unknownTraffic = 0;

    metrics.forEach(metric => {
      try {
        const deviceId = metric.Metrics?.["@DeviceId"];
        const reportDate = metric.Metrics?.ReportData?.Report?.["@Date"];
        
        // Check if the report's date is within range
        const isDateInRange = reportDate >= startDate && reportDate <= endDate;
        
        // If no devices are selected or if this device is selected
        const isDeviceSelected = selectedDeviceIds.length === 0 || selectedDeviceIds.includes(deviceId);

        if (isDateInRange && isDeviceSelected) {
          
          // Process each object in the Report
          metric.Metrics?.ReportData?.Report?.Object?.forEach(obj => {
            if (obj["@ObjectType"] === "0" && obj.Count) { // Entrance Traffic
              obj.Count.forEach(count => {
                // Sum up gender-specific traffic
                maleTraffic += parseInt(count["@ExitsMaleCustomer"]) || 0;
                femaleTraffic += parseInt(count["@ExitsFemaleCustomer"]) || 0;
                unknownTraffic += parseInt(count["@ExitsUnknown"]) || 0;
                totalTraffic += parseInt(count["@Exits"]) || 0;
              });
            }
          });
        }
      } catch (error) {
        console.error("Error processing metric:", error);
      }
    });

    return {
      totalTraffic,
      maleTraffic,
      femaleTraffic,
      unknownTraffic
    };
  };

  const calculateMetrics = (metrics, dateFilter, deviceFilter) => {

    try {
      if (!metrics || metrics.length === 0) {
        console.log("No metrics data available");
        return {
          todayTraffic: 0,
          yesterdayTraffic: 0,
          weekTraffic: 0,
          monthTraffic: 0,
          todayGTraffic: 0,
          yesterdayGTraffic: 0,
          weekGTraffic: 0,
          monthGTraffic: 0,
          dayBeforeYesterdayTraffic: 0,
          prevWeekTraffic: 0,
          prevMonthTraffic: 0,
          MaleTraffic: 0,
          FemaleTraffic: 0,
          UnknownTraffic: 0,
          totalTraffic: 0
        };
      }

      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");
      const yesterdayStr = format(subDays(today, 1), "yyyy-MM-dd");
      const dayBeforeYesterdayStr = format(subDays(today, 2), "yyyy-MM-dd");
      
      // Current periods
      const weekStartStr = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const monthStartStr = format(startOfMonth(today), "yyyy-MM-dd");
      
      // Previous periods
      const prevWeekStart = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
      const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 1 });
      const prevMonthStart = subMonths(startOfMonth(today), 1);
      const prevMonthEnd = endOfMonth(prevMonthStart);

      // Extract device IDs from selected devices
      const selectedDevices = deviceFilter?.selectedDevices || {};
      const selectedDeviceIds = Object.values(selectedDevices)
        .flat()
        .map(device => device.device_id);

      // Calculate metrics for different time periods
      const todayMetrics = processMetrics(metrics, todayStr, todayStr, selectedDeviceIds);
      const yesterdayMetrics = processMetrics(metrics, yesterdayStr, yesterdayStr, selectedDeviceIds);
      const dayBeforeYesterdayMetrics = processMetrics(metrics, dayBeforeYesterdayStr, dayBeforeYesterdayStr, selectedDeviceIds);
      const weekMetrics = processMetrics(metrics, weekStartStr, todayStr, selectedDeviceIds);
      const monthMetrics = processMetrics(metrics, monthStartStr, todayStr, selectedDeviceIds);
      
      // Calculate previous period metrics
      const prevWeekMetrics = processMetrics(
        metrics, 
        format(prevWeekStart, "yyyy-MM-dd"), 
        format(prevWeekEnd, "yyyy-MM-dd"), 
        selectedDeviceIds
      );
      const prevMonthMetrics = processMetrics(
        metrics,
        format(prevMonthStart, "yyyy-MM-dd"),
        format(prevMonthEnd, "yyyy-MM-dd"),
        selectedDeviceIds
      );

      // Calculate metrics for the selected date range
      const { startDate, endDate } = getDateRange(dateFilter);
      const selectedRangeMetrics = processMetrics(metrics, startDate, endDate, selectedDeviceIds);

      // Set the widget stats
      setWidgetStats({
        todayTraffic: todayMetrics.totalTraffic,
        yesterdayTraffic: yesterdayMetrics.totalTraffic,
        weekTraffic: weekMetrics.totalTraffic,
        monthTraffic: monthMetrics.totalTraffic,
        todayGTraffic: selectedRangeMetrics.totalTraffic,
        yesterdayGTraffic: selectedRangeMetrics.totalTraffic,
        weekGTraffic: selectedRangeMetrics.totalTraffic,
        monthGTraffic: selectedRangeMetrics.totalTraffic,
        dayBeforeYesterdayTraffic: dayBeforeYesterdayMetrics.totalTraffic,
        prevWeekTraffic: prevWeekMetrics.totalTraffic,
        prevMonthTraffic: prevMonthMetrics.totalTraffic,
        MaleTraffic: selectedRangeMetrics.maleTraffic,
        FemaleTraffic: selectedRangeMetrics.femaleTraffic,
        UnknownTraffic: selectedRangeMetrics.unknownTraffic,
        totalTraffic: selectedRangeMetrics.totalTraffic,
      });
      
    } catch (error) {
      console.error("Error calculating metrics:", error);
      setError('Error calculating metrics');
    }
  };

  if (error) return <div>{error}</div>;

  const widgetsData = [
    {
      id: 1,
      title: "Traffic Today",
      total: widgetStats.todayTraffic,
      color: widgetStats.todayTraffic > widgetStats.yesterdayTraffic ? 'success' : 'secondary',
      icon: 'car',
      growth: ((widgetStats.todayTraffic - widgetStats.yesterdayTraffic) / widgetStats.yesterdayTraffic * 100).toFixed(1)
    },
    {
      id: 2,
      title: "Traffic Yesterday",
      total: widgetStats.yesterdayTraffic,
      color: widgetStats.yesterdayTraffic > widgetStats.dayBeforeYesterdayTraffic ? 'success' : 'secondary',
      icon: 'car',
      growth: ((widgetStats.yesterdayTraffic - widgetStats.dayBeforeYesterdayTraffic) / widgetStats.dayBeforeYesterdayTraffic * 100).toFixed(1)
    },
    {
      id: 3,
      title: 'Traffic This Week',
      total: widgetStats.weekTraffic,
      color: widgetStats.weekTraffic > widgetStats.prevWeekTraffic ? 'success' : 'secondary',
      icon: 'car',
      growth: ((widgetStats.weekTraffic - widgetStats.prevWeekTraffic) / widgetStats.prevWeekTraffic * 100).toFixed(1)
    },
    {
      id: 4,
      title: 'Traffic This Month',
      total: widgetStats.monthTraffic,
      color: widgetStats.monthTraffic > widgetStats.prevMonthTraffic ? 'success' : 'secondary',
      icon: 'car',
      growth: ((widgetStats.monthTraffic - widgetStats.prevMonthTraffic) / widgetStats.prevMonthTraffic * 100).toFixed(1)
    },
  ];

  const widgets2Data = {
    title: 'Males',
    total: widgetStats.MaleTraffic || 0,
    color: '#87CEEB',
  };

  const widgets2Data2 = {
    title: "Females",
    total: widgetStats.FemaleTraffic || 0,
    color: "#FF69B4",
  };

  const widgets2Data3 = {
    title: 'Unidentified',
    total: widgetStats.UnknownTraffic || 0,
    color: '#FF00FF',
  };

  const widgets2Data4 = {
    title: 'Total',
    total: widgetStats.totalTraffic || 0,
  };

  if (loading) {
    return (
      <>
        <Col xxl="auto" xl="4" sm="6" className="box-col-6">
          <Row>
            <Col xl="12">
              <ShimmerCard height="10px" heighth="15px"/>
            </Col>
            <Col xl="12">
              <ShimmerCard height="10px" heighth="10px"/>
            </Col>
          </Row>
        </Col>
        <Col xxl="auto" xl="4" sm="6" className="box-col-6">
          <Row>
            <Col xl="12">
              <ShimmerCard height="10px" heighth="15px"/>
            </Col>
            <Col xl="12">
              <ShimmerCard height="10px" heighth="10px"/>
            </Col>
          </Row>
        </Col>
        <Col xxl="auto" xl="12" sm="6" className="box-col-6">
          <Row>
            <Col xxl="12" xl="4" className="box-col-12">
              <ShimmerCard height="100%" heightcontainer="0.875rem"/>
            </Col>
            <Col xxl="12" xl="4" className="box-col-12">
              <ShimmerCard height="100%" heightcontainer="0.875rem"/>
            </Col>
            <Col xxl="12" xl="4" className="box-col-12">
              <ShimmerCard height="100%" heightcontainer="0.875rem"/>
            </Col>
          </Row>
        </Col>
      </>
    );
  }

  if (error) {
    return (
      <Col xxl="6" xl="6" lg="12" md="12" sm="12" className="box-col-6">
        <Card>
          <CardBody>
            <div className="error-container">
              <H5 className="text-danger">{error}</H5>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <>
        <Col xxl="auto" xl="4" sm="6" className="box-col-6">
          <Row>
            <Col xl="12">
              <Widgets1 data={widgetsData[0]} />
            </Col>
            <Col xl="12">
              <Widgets1 data={widgetsData[1]} />
            </Col>
          </Row>
        </Col>
        <Col xxl="auto" xl="4" sm="6" className="box-col-6">
          <Row>
            <Col xl="12">
              <Widgets1 data={widgetsData[2]} />
            </Col>
            <Col xl="12">
              <Widgets1 data={widgetsData[3]} />
            </Col>
          </Row>
        </Col>
        <Col xxl="auto" xl="12" sm="6" className="box-col-6">
          <Row>
            <Col xxl="12" xl="4" className="box-col-12">
              <Widgets2 data={widgets2Data} />
            </Col>
            <Col xxl="12" xl="4" className="box-col-12">
              <Widgets2 data={widgets2Data2} />
            </Col>
            {/* <Col xxl="12" xl="6" className="box-col-12">
              <Widgets2 data={widgets2Data3} />
            </Col> */}
            <Col xxl="12" xl="4" className="box-col-12">
              <Widgets2 data={widgets2Data4} />
            </Col>
          </Row>
        </Col>
    </>
  );
};

export default React.memo(WidgetsWrapper);
