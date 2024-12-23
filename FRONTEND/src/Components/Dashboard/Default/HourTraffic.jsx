import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import axios from "axios";
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

const HourTraffic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Total Traffic",
        data: Array(24).fill(0),
      },
      {
        name: "Male Traffic",
        data: Array(24).fill(0),
      },
      {
        name: "Female Traffic",
        data: Array(24).fill(0),
      },
    ],
    options: {
      chart: {
        type: "line",
        height: 350,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
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
        categories: Array.from({ length: 24 }, (_, i) => {
          const hour = i;
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${hour12} ${period}`;
        }),
        title: {
          text: "Hours",
        },
      },
      yaxis: {
        title: {
          text: "Traffic",
        },
        min: 0,
      },
      colors: ["#3CB371", "#008FFB", "#FF4560"],
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
        horizontalAlign: "right",
      },
    },
  });

  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("http://localhost:3002/api/metrics");
        const metrics = response.data;
        setMetricsData(metrics);
        calculateMetrics(metrics);
      } catch (error) {
        setError("Failed to fetch metrics data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (metricsData.length > 0) {
      calculateMetrics(metricsData);
    }
  }, [dateFilter, deviceFilter, metricsData]);

  const calculateMetrics = (metrics) => {
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
    const maleData = Array(24).fill(0);
    const femaleData = Array(24).fill(0);

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
              const maleTraffic = parseInt(count["@ExitsMaleCustomer"], 10) || 0;
              const femaleTraffic = parseInt(count["@ExitsFemaleCustomer"], 10) || 0;
              
              hourlyData[hour] += totalTraffic;
              maleData[hour] += maleTraffic;
              femaleData[hour] += femaleTraffic;
            });
          }
        });
      }
    });

    setChartData(prevData => ({
      ...prevData,
      series: [
        {
          name: "Total Traffic",
          data: hourlyData
        },
        {
          name: "Male Traffic",
          data: maleData
        },
        {
          name: "Female Traffic",
          data: femaleData
        }
      ]
    }));
  };

  return (
    <Col xxl="6" lg="12" className="box-col-12">
      <Card>
        <CardHeader className="card-no-border">
          <H5>Hourly Traffic Distribution</H5>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="hourly-traffic-chart">
            <ReactApexChart
              type="line"
              height={350}
              options={chartData.options}
              series={chartData.series}
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default HourTraffic;
