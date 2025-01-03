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
  parseISO,
  getDay,
} from "date-fns";
import config from "../../../config";
import ShimmerCard from "../../Common/ShimmerCard";

const DayTraffic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Total",
        data: Array(7).fill(0),
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        title: {
          text: "- Day of Week -",
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

  const calculateMetrics = (metrics) => {
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
    const prevMonthStart = format(
      startOfMonth(subDays(startOfMonth(today), 1)),
      "yyyy-MM-dd"
    );

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

    const dailyTotals = Array(7).fill(0);

    metrics.forEach((metric) => {
      const deviceId = metric.Metrics?.["@DeviceId"];
      const selectedDeviceIds = Object.values(
        deviceFilter.selectedDevices || {}
      )
        .flat()
        .map((device) => device.device_id);
      const isDeviceSelected =
        selectedDeviceIds.length === 0 || selectedDeviceIds.includes(deviceId);

      if (!isDeviceSelected) return;

      const reportDate = metric.Metrics?.ReportData?.Report?.["@Date"];
      if (!reportDate || reportDate < filterStart || reportDate > filterEnd)
        return;

      const counts =
        metric.Metrics?.ReportData?.Report?.Object?.[0]?.Count || [];
      counts.forEach((count) => {
        const date = parseISO(`${reportDate}T${count["@StartTime"]}`);
        const dayIndex = getDay(date); // 0 for Sunday, 1 for Monday, etc.

        dailyTotals[dayIndex] += parseInt(count["@Exits"]) || 0;
      });
    });

    setChartData((prev) => ({
      ...prev,
      series: [
        { name: "Total", data: dailyTotals },
      ],
    }));
  };

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
            <H5>Daily Traffic Distribution</H5>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div id="day-traffic-chart">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height={350}
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default React.memo(DayTraffic);
