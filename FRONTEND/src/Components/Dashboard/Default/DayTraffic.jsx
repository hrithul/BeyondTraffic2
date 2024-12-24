import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import ReactApexChart from "react-apexcharts";
import { useSelector, useDispatch } from "react-redux";
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
  parseISO,
  getDay,
} from "date-fns";

const DayTraffic = () => {
  const dispatch = useDispatch();
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
      // {
      //   name: "Male",
      //   data: Array(7).fill(0),
      // },
      // {
      //   name: "Female",
      //   data: Array(7).fill(0),
      // },
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
      dataLabels: {
        enabled: false,
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
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        title: {
          text: "- Days -",
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
            fontSize: "9px",
          },
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

    const dailyTotals = Array(7).fill(0);
    // const dailyMale = Array(7).fill(0);
    // const dailyFemale = Array(7).fill(0);

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
        // dailyMale[dayIndex] += parseInt(count["@ExitsMaleCustomer"]) || 0;
        // dailyFemale[dayIndex] += parseInt(count["@ExitsFemaleCustomer"]) || 0;
      });
    });

    setChartData((prev) => ({
      ...prev,
      series: [
        { name: "Total", data: dailyTotals },
        // { name: "Male", data: dailyMale },
        // { name: "Female", data: dailyFemale },
      ],
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Col xxl="6" lg="12" className="box-col-12">
      <Card>
        <CardHeader className="card-no-border">
          <div className="d-flex justify-content-between">
            <H5>Daily Traffic Distribution</H5>
            {/* <DateFilter 
            onFilterSelect={(filter) => {
              // Update the Redux store with the selected filter
              dispatch({ type: 'SET_DATE_FILTER', payload: filter });
            }}
            initialFilter={dateFilter}
          /> */}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="daily-traffic-chart">
            <ReactApexChart
              type="area"
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

export default DayTraffic;
