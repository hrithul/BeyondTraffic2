import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import axios from "../../../utils/axios";
import { format, subDays, startOfMonth, startOfWeek, subMonths, startOfYear, parseISO } from "date-fns";
import config from "../../../config";
import ShimmerCard from "../../Common/ShimmerCard";

const METRICS_ENDPOINT = `${config.hostname}/metrics`;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const initialChartData = {
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
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GenderTraffic = () => {
  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(initialChartData);
  const [retryCount, setRetryCount] = useState(0);

  const getDateRange = useMemo(() => {
    return (filter, today) => {
      const formattedToday = format(today, "yyyy-MM-dd");
      switch (filter) {
        case "today": return { start: formattedToday, end: formattedToday };
        case "yesterday": return { start: format(subDays(today, 1), "yyyy-MM-dd"), end: formattedToday };
        case "week": return { start: format(startOfWeek(today), "yyyy-MM-dd"), end: formattedToday };
        case "month": return { start: format(startOfMonth(today), "yyyy-MM-dd"), end: formattedToday };
        case "year": return { start: format(startOfYear(today), "yyyy-MM-dd"), end: formattedToday };
        case "lastWeek": {
          const lastWeekEnd = format(subDays(startOfWeek(today), 1), "yyyy-MM-dd");
          const lastWeekStart = format(startOfWeek(subDays(startOfWeek(today), 1)), "yyyy-MM-dd");
          return { start: lastWeekStart, end: lastWeekEnd };
        }
        case "lastMonth": {
          const lastMonthEnd = format(subDays(startOfMonth(today), 1), "yyyy-MM-dd");
          const lastMonthStart = format(startOfMonth(subDays(startOfMonth(today), 1)), "yyyy-MM-dd");
          return { start: lastMonthStart, end: lastMonthEnd };
        }
        default: return { start: formattedToday, end: formattedToday };
      }
    };
  }, []);

  const calculateMetrics = useCallback((metrics) => {
    const today = new Date();
    const { start, end } = getDateRange(dateFilter, today);

    const maleData = [];
    const femaleData = [];
    const categories = [];

    // Filter metrics by device if needed
    const filteredMetrics = metrics.filter(metric => {
      const deviceId = metric.Metrics?.["@DeviceId"];
      const selectedDevices = Object.values(deviceFilter.selectedDevices || {})
        .flat()
        .map(device => device.device_id);
      return selectedDevices.length === 0 || selectedDevices.includes(deviceId);
    });

    // Process metrics for the date range
    filteredMetrics.forEach((metric) => {
      const reportDate = metric.Metrics?.ReportData?.Report?.["@Date"];
      if (!reportDate || reportDate < start || reportDate > end) return;

      // Get the index for this date, or create new entry
      let dateIndex = categories.indexOf(reportDate);
      if (dateIndex === -1) {
        categories.push(reportDate);
        maleData.push(0);
        femaleData.push(0);
        dateIndex = categories.length - 1;
      }

      // Extract gender counts from the metric
      const reportObject = metric.Metrics?.ReportData?.Report?.Object?.[0];
      if (!reportObject) return;

      // Handle both direct properties and Count array
      if (reportObject["@ExitsMaleCustomer"] !== undefined) {
        // Direct properties
        const maleCount = parseInt(reportObject["@ExitsMaleCustomer"]) || 0;
        const femaleCount = parseInt(reportObject["@ExitsFemaleCustomer"]) || 0;
        
        if (!isNaN(maleCount)) maleData[dateIndex] += maleCount;
        if (!isNaN(femaleCount)) femaleData[dateIndex] += femaleCount;
      } else if (Array.isArray(reportObject.Count)) {
        // Count array
        reportObject.Count.forEach(count => {
          const maleCount = parseInt(count["@ExitsMaleCustomer"]) || 0;
          const femaleCount = parseInt(count["@ExitsFemaleCustomer"]) || 0;
          
          if (!isNaN(maleCount)) maleData[dateIndex] += maleCount;
          if (!isNaN(femaleCount)) femaleData[dateIndex] += femaleCount;
        });
      }
    });

    // Sort categories and reorder data accordingly
    const sortedIndices = categories.map((_, i) => i)
      .sort((a, b) => categories[a].localeCompare(categories[b]));
    
    categories.sort();
    const sortedMaleData = sortedIndices.map(i => maleData[i]);
    const sortedFemaleData = sortedIndices.map(i => femaleData[i]);

    // Format dates for display
    const formattedCategories = categories.map(date => {
      const [year, month, day] = date.split('-');
      return `${monthNames[parseInt(month, 10) - 1]}-${day}`;
    });

    // Only update if data has changed
    const hasDataChanged = 
      JSON.stringify(chartData.series[0].data) !== JSON.stringify(sortedFemaleData) ||
      JSON.stringify(chartData.series[1].data) !== JSON.stringify(sortedMaleData) ||
      JSON.stringify(chartData.options.xaxis.categories) !== JSON.stringify(formattedCategories);

    if (hasDataChanged) {
      setChartData(prev => ({
        ...prev,
        series: [
          { name: "Female", data: sortedFemaleData },
          { name: "Male", data: sortedMaleData },
        ],
        options: {
          ...prev.options,
          xaxis: { 
            ...prev.options.xaxis, 
            categories: formattedCategories,
            labels: {
              ...prev.options.xaxis.labels,
              rotate: -45,
              style: {
                fontSize: '9px',
              }
            }
          },
        },
      }));
    }
  }, [dateFilter, deviceFilter, chartData, getDateRange]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(METRICS_ENDPOINT);
      calculateMetrics(response.data);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch metrics";
      console.error("Error fetching metrics:", errorMessage);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        setError(`Failed to fetch metrics: ${errorMessage}. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  }, [dateFilter, deviceFilter, retryCount, calculateMetrics]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

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
          <H5>Gender Traffic Distribution</H5>
        </CardHeader>
        <CardBody className="pt-0">
          <div id="gender-traffic-chart">
            <ReactApexChart 
              options={chartData.options} 
              series={chartData.series} 
              type="bar" 
              height={350} 
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default React.memo(GenderTraffic);
