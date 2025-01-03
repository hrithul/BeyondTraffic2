import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import axios from "../../../utils/axios";
import {
  format,
  subDays,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  subMonths,
  subWeeks,
  startOfYear,
} from "date-fns";
import config from "../../../config";
import ShimmerCard from "../../Common/ShimmerCard";

const HourTraffic = () => {
  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Total",
        data: Array(24).fill(0),
      },
    ],
    options: {
      chart: {
        type: "line",
        height: 350,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: 4,
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      xaxis: {
        categories: Array.from({ length: 24 }, (_, i) => {
          const hour = i === 0 ? '12' : (i > 12 ? (i - 12).toString() : i.toString());
          const period = i >= 12 ? 'PM' : 'AM';
          return `${hour}${period}`;
        }),
        title: {
          text: "Hour of Day",
          style: {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        title: {
          text: "Traffic Count",
          style: {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        },
        labels: {
          formatter: (value) => Math.round(value),
        },
      },
      colors: ["#7366FF"],
      tooltip: {
        y: {
          formatter: (value) => Math.round(value) + " visitors",
        },
      },
      grid: {
        borderColor: "#f1f1f1",
        padding: {
          bottom: 15,
        },
      },
    },
  });

  // Memoize the fetchData function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${config.hostname}/metrics`);
      const metrics = response.data;
      setMetricsData(metrics);
      calculateMetrics(metrics);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError(err.response?.status === 401 
        ? "Session expired. Please login again." 
        : "Failed to fetch metrics data");
    } finally {
      setLoading(false);
    }
  }, [dateFilter, deviceFilter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  const calculateMetrics = useCallback((metrics) => {
    const today = new Date();
    const todayDate = format(today, "yyyy-MM-dd");
    const yesterday = subDays(today, 1);
    const yesterdayDate = format(yesterday, "yyyy-MM-dd");
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
    const yearStart = format(startOfYear(today), "yyyy-MM-dd");
    const prevWeekEnd = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), "yyyy-MM-dd");
    const prevWeekStart = format(startOfWeek(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const prevMonthEnd = format(subDays(startOfMonth(today), 1), "yyyy-MM-dd");
    const prevMonthStart = format(startOfMonth(subDays(startOfMonth(today), 1)), "yyyy-MM-dd");

    let filterStart, filterEnd;
    switch (dateFilter) {
      case "today":
        filterStart = todayDate;
        filterEnd = todayDate;
        break;
      case "week":
        filterStart = weekStart;
        filterEnd = todayDate;
        break;
      case "month":
        filterStart = monthStart;
        filterEnd = todayDate;
        break;
      case "year":
        filterStart = yearStart;
        filterEnd = todayDate;
        break;
      case "yesterday":
        filterStart = yesterdayDate;
        filterEnd = yesterdayDate;
        break;
      case "lastWeek":
        filterStart = prevWeekStart;
        filterEnd = prevWeekEnd;
        break;
      case "lastMonth":
        filterStart = prevMonthStart;
        filterEnd = prevMonthEnd;
        break;
      case "lastYear":
        filterStart = format(subMonths(today, 23), "yyyy-MM-dd");
        filterEnd = format(subMonths(today, 12), "yyyy-MM-dd");
        break;
      default:
        filterStart = todayDate;
        filterEnd = todayDate;
    }

    // Initialize hourly data array with zeros
    const hourlyData = Array(24).fill(0);

    metrics.forEach((metric) => {
      const deviceId = metric.Metrics?.["@DeviceId"];
      const report = metric.Metrics?.ReportData?.Report;
      const reportDate = report?.["@Date"];

      // Check if date is in range and device is selected
      const selectedDeviceIds = Object.values(deviceFilter.selectedDevices || {}).flat().map(device => device.device_id);
      const isDeviceSelected = selectedDeviceIds.length === 0 || selectedDeviceIds.includes(deviceId);

      if (reportDate && reportDate >= filterStart && reportDate <= filterEnd && isDeviceSelected) {
        report.Object?.forEach((obj) => {
          if (obj["@ObjectType"] === "0") { // Entrance Traffic
            obj.Count?.forEach((count) => {
              // Extract hour from StartTime (format: "HH:mm:00")
              const hour = parseInt(count["@StartTime"].split(":")[0], 10);
              // Sum up traffic for this hour
              const totalTraffic = parseInt(count["@Exits"], 10) || 0;
              
              hourlyData[hour] += totalTraffic;
            });
          }
        });
      }
    });

    setChartData(prev => ({
      ...prev,
      series: [{
        name: "Total",
        data: hourlyData,
      }],
    }));
  }, [dateFilter, deviceFilter]);

  if (loading) {
    return (
      <Col xxl="6" xl="6" lg="12" md="12" sm="12" className="box-col-12">
        <ShimmerCard height="23.75rem" />
      </Col>
    );
  }

  if (error) {
    return (
      <Col xxl="6" xl="6" lg="12" md="12" sm="12" className="box-col-12">
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
    <Col xxl="6" xl="6" lg="12" md="12" sm="12" className="box-col-12">
      <Card>
        <CardHeader className="card-no-border">
          <div className="header-top">
            <H5>Hourly Traffic Distribution</H5>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div id="hour-traffic-chart">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="line"
              height={350}
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default React.memo(HourTraffic);
