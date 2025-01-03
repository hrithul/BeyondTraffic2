import React, { useEffect, useState, useMemo } from "react";
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
  parseISO,
  startOfYear,
  isAfter,
  isBefore,
} from "date-fns";
import config from "../../../config";
import ShimmerCard from "../../Common/ShimmerCard";

const MonthlyTraffic = () => {
  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Total",
        data: Array(12).fill(0),
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
        width: [4, 3, 3],
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        title: {
          text: "- Months -",
          style: {
            fontSize: "0.75rem",
            fontWeight: "semi-bold",
          },
        },
        labels: {
          style: {
            fontSize: "9px",
          },
        },
      },
      yaxis: {
        title: {
          text: "- Traffic Count -",
          style: {
            fontSize: "0.75rem",
            fontWeight: "semi-bold",
          },
        },
        labels: {
          style: {
            fontSize: "10px",
            fontWeight: 500,
            colors: "#333",
          },
          formatter: (value) => Math.round(value),
        },
        min: 0,
      },
      colors: ["#7366FF", "#008FFB", "#FF4560"],
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " visitors";
          },
        },
      },
      grid: {
        borderColor: "#f1f1f1",
      },
      legend: {
        position: "top",
      },
    },
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.hostname}/metrics`);
        const metrics = response.data;
        setMetricsData(metrics);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Failed to fetch metrics data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateFilter, deviceFilter]);

  const calculateMetrics = (metrics) => {
    const monthlyData = {
      total: Array(12).fill(0),
    };

    // Filter metrics based on device filter
    const filteredMetrics = metrics.filter((metric) => {
      const selectedDevices = deviceFilter.selectedDevices || {};
      if (Object.keys(selectedDevices).length === 0) return true;
      
      const deviceId = metric.Metrics["@DeviceId"];
      return Object.values(selectedDevices).flat().some(device => device.device_id === deviceId);
    });

    const today = new Date();
    const todayDate = format(today, "yyyy-MM-dd");
    const yesterday = subDays(today, 1);
    const yesterdayDate = format(yesterday, "yyyy-MM-dd");
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
    const yearStart = format(startOfYear(today), "yyyy-MM-dd");
    const prevWeekEnd = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), "yyyy-MM-dd");
    const prevWeekStart = format(
      startOfWeek(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
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
        filterStart = format(subMonths(today, 12), "yyyy-MM-dd");
        filterEnd = format(subDays(subMonths(today, 11), 1), "yyyy-MM-dd");
        break;
      default:
        filterStart = todayDate;
        filterEnd = todayDate;
    }

    // Convert filter dates to Date objects once
    const filterStartDate = parseISO(filterStart);
    const filterEndDate = parseISO(filterEnd);

    // Process metrics using reduce for better efficiency
    monthlyData.total = filteredMetrics.reduce((acc, metric) => {
      const reportDate = parseISO(metric.Metrics.ReportData.Report["@Date"]);
      
      if (isAfter(reportDate, filterStartDate) && isBefore(reportDate, filterEndDate)) {
        const month = reportDate.getMonth();
        
        metric.Metrics.ReportData.Report.Object.forEach((obj) => {
          if (obj["@ObjectType"] === "0") {
            acc[month] += obj.Count.reduce((sum, count) => sum + (parseInt(count["@Exits"]) || 0), 0);
          }
        });
      }
      return acc;
    }, Array(12).fill(0));

    // Update chart data
    setChartData((prevState) => ({
      ...prevState,
      series: [
        {
          name: "Total",
          data: monthlyData.total,
        },
      ],
    }));
  };

  // Memoize metrics calculation
  const monthlyMetrics = useMemo(() => {
    if (metricsData.length === 0) return Array(12).fill(0);
    const metrics = [...metricsData];
    calculateMetrics(metrics);
    return chartData.series[0].data;
  }, [metricsData, dateFilter, deviceFilter]);

  if (loading) {
    return (
      <Col xxl="6" xl="6" lg="12" md="12" sm="12" className="box-col-6">
        <ShimmerCard height="23.75rem" />
      </Col>
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
    <Col xxl="6" xl="6" lg="12" md="12" sm="12" className="box-col-6">
      <Card>
        <CardHeader className="card-no-border">
          <div className="header-top">
            <H5 className="m-0">Monthly Traffic Distribution</H5>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="monthly-traffic-chart">
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

export default MonthlyTraffic;
