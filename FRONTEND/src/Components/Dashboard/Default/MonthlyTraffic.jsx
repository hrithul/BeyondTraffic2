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
  parseISO,
} from "date-fns";

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
      {
        name: "Male",
        data: Array(12).fill(0),
      },
      {
        name: "Female",
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
          text: "Months",
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
          text: "Traffic",
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
      },
    },
  });

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
    // Initialize arrays for each month
    const monthlyData = {
      total: Array(12).fill(0),
      male: Array(12).fill(0),
      female: Array(12).fill(0),
    };

    // Filter metrics based on device filter
    const filteredMetrics = metrics.filter((metric) => {
      const selectedDevices = deviceFilter.selectedDevices || {};
      if (Object.keys(selectedDevices).length === 0) return true;
      
      const deviceId = metric.Metrics["@DeviceId"];
      return Object.values(selectedDevices).flat().some(device => device.device_id === deviceId);
    });

    // Process each metric
    filteredMetrics.forEach((metric) => {
      const reportDate = parseISO(metric.Metrics.ReportData.Report["@Date"]);
      const month = reportDate.getMonth();

      // Apply date filter
      let includeMetric = true;
      switch (dateFilter) {
        case "today":
          includeMetric = format(reportDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          break;
        case "yesterday":
          includeMetric = format(reportDate, "yyyy-MM-dd") === format(subDays(new Date(), 1), "yyyy-MM-dd");
          break;
        case "week":
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
          const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
          includeMetric = reportDate >= weekStart && reportDate <= weekEnd;
          break;
        case "month":
          const monthStart = startOfMonth(new Date());
          const monthEnd = endOfMonth(new Date());
          includeMetric = reportDate >= monthStart && reportDate <= monthEnd;
          break;
        case "year":
          includeMetric = reportDate.getFullYear() === new Date().getFullYear();
          break;
        case "lastMonth":
          const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
          const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
          includeMetric = reportDate >= lastMonthStart && reportDate <= lastMonthEnd;
          break;
        case "lastWeek":
          const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
          const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
          includeMetric = reportDate >= lastWeekStart && reportDate <= lastWeekEnd;
          break;
        case "lastYear":
          includeMetric = reportDate.getFullYear() === new Date().getFullYear() - 1;
          break;
        default:
          includeMetric = true;
      }

      if (!includeMetric) return;

      // Sum up the counts for each object
      metric.Metrics.ReportData.Report.Object.forEach((obj) => {
        if (obj["@ObjectType"] === "0") { // Entrance Traffic
          obj.Count.forEach((count) => {
            const exits = parseInt(count["@Exits"]) || 0;
            const exitsMale = parseInt(count["@ExitsMaleCustomer"]) || 0;
            const exitsFemale = parseInt(count["@ExitsFemaleCustomer"]) || 0;

            monthlyData.total[month] += exits;
            monthlyData.male[month] += exitsMale;
            monthlyData.female[month] += exitsFemale;
          });
        }
      });
    });

    // Update chart data
    setChartData((prevState) => ({
      ...prevState,
      series: [
        {
          name: "Total",
          data: monthlyData.total,
        },
        {
          name: "Male",
          data: monthlyData.male,
        },
        {
          name: "Female",
          data: monthlyData.female,
        },
      ],
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          categories: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
        },
      },
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Col xxl="6" lg="12" className="box-col-12">
      <Card>
        <CardHeader className="card-no-border">
          <div className="d-flex justify-content-between">
            <H5>Monthly Traffic Distribution</H5>
            {/* <DateFilter 
            onFilterSelect={(filter) => {
              // Update the Redux store with the selected filter
              // dispatch({ type: 'SET_DATE_FILTER', payload: filter });
            }}
            initialFilter={dateFilter}
          /> */}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="monthly-traffic-chart">
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

export default MonthlyTraffic;
