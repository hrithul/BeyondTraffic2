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
} from "date-fns";

const GenderTraffic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Female Traffic",
        data: [],
      },
      {
        name: "Male Traffic",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        stacked: false,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "35%",
          borderRadius: 2,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: [],
        title: {
          text: "Date",
        },
      },
      yaxis: {
        title: {
          text: "Traffic",
        },
      },
      colors: ["#FF4560", "#008FFB"],
      legend: {
        position: "top",
        markers: {
          customHTML: () => {
            return '<span style="width: 10px; height: 10px; background-color: currentColor; display: inline-block; border-radius: 50%;"></span>';
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " Traffic";
          },
        },
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
    const weekStart = format(
      startOfWeek(today, { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
    const yearStart = format(startOfYear(today), "yyyy-MM-dd");
    const prevWeekEnd = format(
      subDays(startOfWeek(today, { weekStartsOn: 1 }), 1),
      "yyyy-MM-dd"
    );
    const prevWeekStart = format(
      startOfWeek(subDays(startOfWeek(today, { weekStartsOn: 1 }), 1), {
        weekStartsOn: 1,
      }),
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

    // Group metrics by date and gender
    const dailyData = {};

    metrics.forEach((metric) => {
      const deviceId = metric.Metrics?.["@DeviceId"];
      const report = metric.Metrics?.ReportData?.Report;
      const reportDate = report?.["@Date"];

      // Check if date is in range and device is selected
      const selectedDeviceIds = Object.values(deviceFilter.selectedDevices || {}).flat().map(device => device.device_id);
      const isDeviceSelected = selectedDeviceIds.length === 0 || selectedDeviceIds.includes(deviceId);

      if (reportDate && reportDate >= filterStart && reportDate <= filterEnd && isDeviceSelected) {
        if (!dailyData[reportDate]) {
          dailyData[reportDate] = { male: 0, female: 0 };
        }

        report.Object?.forEach((obj) => {
          if (obj["@ObjectType"] === "0") { // Entrance Traffic
            obj.Count?.forEach((count) => {
              const maleExits = parseInt(count["@ExitsMaleCustomer"], 10) || 0;
              const femaleExits = parseInt(count["@ExitsFemaleCustomer"], 10) || 0;

              dailyData[reportDate].male += maleExits;
              dailyData[reportDate].female += femaleExits;
            });
          }
        });
      }
    });

    // Debug logs
    console.log('Selected Device IDs:', Object.values(deviceFilter.selectedDevices || {}).flat().map(device => device.device_id));
    console.log('Daily Data:', dailyData);

    // Convert to series data
    const dates = Object.keys(dailyData).sort();
    const maleData = dates.map((date) => dailyData[date].male);
    const femaleData = dates.map((date) => dailyData[date].female);

    setChartData((prevData) => ({
      ...prevData,
      series: [
        {
          name: "Female Traffic",
          data: femaleData,
        },
        {
          name: "Male Traffic",
          data: maleData,
        },
      ],
      options: {
        ...prevData.options,
        xaxis: {
          ...prevData.options.xaxis,
          categories: dates,
        },
      },
    }));
  };

  // if (error) return <div>{error}</div>;

  return (
    <Col xxl="6" lg="12" className="box-col-12">
      <Card>
        <CardHeader className="card-no-border">
          <H5>Gender-wise Traffic</H5>
        </CardHeader>
        <CardBody className="pt-0">
          <Row className="m-0 overall-card">
            <Col xl="12" className="p-0">
              <div className="chart-right">
                <CardBody className="p-0">
                  {/* <UL
                    attrUL={{
                      horizontal: true,
                      className: "d-flex balance-data",
                    }}
                  >
                    <LI>
                      <span
                        className="circle"
                        style={{ backgroundColor: "#FF4560" }}
                      >
                        {" "}
                      </span>
                      <span className="f-light ms-1">Female Traffic</span>
                    </LI>
                    <LI>
                      <span
                        className="circle"
                        style={{ backgroundColor: "#008FFB" }}
                      >
                        {" "}
                      </span>
                      <span className="f-light ms-1">Male Traffic</span>
                    </LI>
                  </UL> */}
                  <div className="current-sale-container">
                    <ReactApexChart
                      type="bar"
                      height={350}
                      options={chartData.options}
                      series={chartData.series}
                    />
                  </div>
                </CardBody>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default GenderTraffic;
