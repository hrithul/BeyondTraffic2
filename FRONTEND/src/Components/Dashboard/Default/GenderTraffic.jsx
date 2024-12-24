import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { H5, UL, LI } from "../../../AbstractElements";
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
  parseISO
} from "date-fns";

const GenderTraffic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Female",
        data: [],
      },
      {
        name: "Male",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "35%",
          endingShape: "rounded",
          borderRadius: 2,
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
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [],
        title: {
          text: "- Date -",
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
          text: "- Traffic -",
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
        min: 0,
      },
      colors: ["#FF4560", "#008FFB"],
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
        console.error("Error fetching metrics:", error);
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
    const weekStart = format(startOfWeek(today), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
    const yearStart = format(startOfYear(today), "yyyy-MM-dd");
    const prevWeekEnd = format(subDays(startOfWeek(today), 1), "yyyy-MM-dd");
    const prevWeekStart = format(
      startOfWeek(subDays(startOfWeek(today), 1)),
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
        filterStart = format(subMonths(today, 23), "yyyy-MM-dd");
        filterEnd = format(subMonths(today, 12), "yyyy-MM-dd");
        break;
      default:
        filterStart = todayDate;
        filterEnd = todayDate;
    }

    // Initialize data arrays based on filter
    let maleData = [];
    let femaleData = [];
    let categories = [];

    if (dateFilter === "year" || dateFilter === "lastYear") {
      // Monthly data for year view
      maleData = Array(12).fill(0);
      femaleData = Array(12).fill(0);
      categories = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
    } else {
      // Create a map to store data by date
      const dateMap = new Map();
      
      // Process metrics to get unique dates within filter range
      metrics.forEach(metric => {
        const reportDate = metric.Metrics?.ReportData?.Report?.["@Date"];
        if (reportDate && reportDate >= filterStart && reportDate <= filterEnd) {
          if (!dateMap.has(reportDate)) {
            dateMap.set(reportDate, { male: 0, female: 0 });
          }
        }
      });

      // Sort dates
      categories = Array.from(dateMap.keys()).sort();
      maleData = Array(categories.length).fill(0);
      femaleData = Array(categories.length).fill(0);
    }

    metrics.forEach((metric) => {
      const deviceId = metric.Metrics?.["@DeviceId"];
      const selectedDevices = Object.values(deviceFilter.selectedDevices || {})
        .flat()
        .map((device) => device.device_id);
      const isDeviceSelected =
        selectedDevices.length === 0 || selectedDevices.includes(deviceId);

      if (!isDeviceSelected) return;

      const reportDate = metric.Metrics?.ReportData?.Report?.["@Date"];
      if (!reportDate || reportDate < filterStart || reportDate > filterEnd)
        return;

      const counts = metric.Metrics?.ReportData?.Report?.Object?.[0]?.Count || [];
      counts.forEach((count) => {
        const maleCount = parseInt(count["@ExitsMaleCustomer"]) || 0;
        const femaleCount = parseInt(count["@ExitsFemaleCustomer"]) || 0;

        if (dateFilter === "year" || dateFilter === "lastYear") {
          const date = parseISO(reportDate);
          const month = date.getMonth();
          maleData[month] += maleCount;
          femaleData[month] += femaleCount;
        } else {
          const dateIndex = categories.indexOf(reportDate);
          if (dateIndex !== -1) {
            maleData[dateIndex] += maleCount;
            femaleData[dateIndex] += femaleCount;
          }
        }
      });
    });

    setChartData((prev) => ({
      ...prev,
      series: [
        { name: "Female", data: femaleData },
        { name: "Male", data: maleData },
      ],
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: dateFilter === "year" || dateFilter === "lastYear" 
            ? categories 
            : categories.map(date => {
                const [year, month, day] = date.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${monthNames[parseInt(month, 10) - 1]}-${day}`;
              }),
          title: {
            text: dateFilter === "year" || dateFilter === "lastYear" ? "- Months -" : "- Date -",
            style: {
              fontSize: "0.75rem",
              fontWeight: "semi-bold",
            },
          },
          labels: {
            rotate: dateFilter === "year" || dateFilter === "lastYear" ? 0 : -45,
            style: {
              fontSize: dateFilter === "year" || dateFilter === "lastYear" ? "10px" : "9px",
              fontWeight: 500,
              colors: "#333",
            },
          },
        },
      },
    }));
  };

  // if (error) return <div>{error}</div>;

  return (
    <Col xxl="6" lg="12" className="box-col-12">
      <Card>
        <CardHeader className="card-no-border">
          <div className="d-flex justify-content-between">
            <H5>Gender-wise Traffic</H5>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="gender-traffic-chart">
            <ReactApexChart
              type="bar"
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

export default GenderTraffic;
