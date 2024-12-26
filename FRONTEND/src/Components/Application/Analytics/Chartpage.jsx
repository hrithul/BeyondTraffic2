import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { H5 } from "../../../AbstractElements";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import axios from "axios";
import ChartDataSelector from './ChartDataSelector';
import ChartTypeSelector, { chartTypes } from './ChartTypeSelector';
import PieDonutChart from './PieDonutChart';
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
} from "date-fns";

const defaultChartOptions = {
  chart: {
    type: "bar",
    height: '100%',
    // toolbar: {
    //   show: true,
    // },
    zoom: {
      enabled: false,
    },
    parentHeightOffset: 0
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "35%",
      endingShape: "rounded",
      borderRadius: 2,
    },
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
  colors: [
    "#FF4560",
    "#008FFB",
    "#00E396",
    "#FEB019",
    "#775DD0",
    "#546E7A",
    "#26a69a",
    "#D10CE8",
  ],
  tooltip: {
    y: {
      formatter: function (val, { seriesIndex, w }) {
        const metric = w?.config?.series?.[seriesIndex]?.name;
        if (metric?.includes('Ratio')) {
          return val.toFixed(1) + '%';
        }
        return val + ' visitors';
      },
    },
  },
  grid: {
    borderColor: "#f1f1f1",
  },
  legend: {
    position: "top",
  },
  fill: {
    opacity: 1,
    type: 'solid'
  },
  stroke: {
    curve: 'smooth',
    width: 2
  }
};

const Chartpage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [selectedMetrics, setSelectedMetrics] = useState([
    { value: 'enters', label: 'Entries', field: '@Enters' },
    { value: 'exits', label: 'Exits', field: '@Exits' }
  ]);
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: true
        }
      },
      xaxis: {
        type: 'category',
        categories: [],
        labels: {
          show: true,
          rotate: -45,
          style: {
            fontSize: '10px',
            fontWeight: 500
          }
        }
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return val.toFixed(0);
          }
        }
      },
      labels: [],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy'
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      }
    }
  });

  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);

  const handleMetricsChange = (selected) => {
    setSelectedMetrics(selected || []);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("http://localhost:3002/api/metrics");
        const metrics = Array.isArray(response.data) ? response.data : [response.data];
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
    if (metricsData?.length > 0) {
      calculateMetrics(metricsData);
    }
  }, [dateFilter, deviceFilter, metricsData, selectedMetrics]);

  useEffect(() => {
    setChartData(prev => {
      try {
        console.log("Current Series:", prev?.series);
        console.log("Selected Metrics:", selectedMetrics);
        
        // Normalize the series data structure
        const normalizeSeriesData = (series) => {
          if (!Array.isArray(series) || series.length === 0) {
            return selectedMetrics.map(metric => ({
              name: metric.label || 'Unnamed',
              data: [0],
              type: chartType
            }));
          }
          
          // If the series is an array of numbers (from pie chart), convert back to original structure
          if (typeof series[0] === 'number') {
            return selectedMetrics.map((metric, index) => ({
              name: metric.label || 'Unnamed',
              data: [series[index] || 0],
              type: chartType
            }));
          }
          
          // Otherwise, process the regular series structure
          return series.map((item, index) => ({
            name: selectedMetrics[index]?.label || item?.name || 'Unnamed',
            data: Array.isArray(item?.data) ? item.data.map(d => Number(d) || 0) : [0],
            type: chartType
          }));
        };

        // Get normalized series data
        const originalSeries = normalizeSeriesData(prev?.series);
        
        console.log("Normalized Series:", originalSeries);

        // Determine chart type
        const isPieChart = ['pie', 'donut'].includes(chartType);

        // Handle pie/donut chart data transformation
        if (isPieChart) {
          console.log("Processing pie chart data:", {
            originalSeries,
            selectedMetrics
          });

          // Ensure we have valid data
          if (!Array.isArray(originalSeries) || originalSeries.length === 0 || !Array.isArray(selectedMetrics) || selectedMetrics.length === 0) {
            console.log("Invalid data structure, returning default");
            return {
              series: [100],
              options: {
                labels: ["No Data"]
              }
            };
          }

          try {
            // Get the latest values for each series
            const pieData = originalSeries.map((series, index) => {
              if (!series || !Array.isArray(series.data)) {
                console.log(`Invalid series data for index ${index}`);
                return { value: 0, name: selectedMetrics[index]?.label || 'Unknown' };
              }

              // Get the last non-zero value from the series
              const lastValue = [...series.data]
                .reverse()
                .find(val => Number(val) > 0) || 0;
              
              return {
                value: Number(lastValue),
                name: selectedMetrics[index]?.label || 'Unknown'
              };
            }).filter(item => item.value > 0);

            // If no valid data, return default
            if (pieData.length === 0) {
              console.log("No valid data points found");
              return {
                series: [100],
                options: {
                  labels: ["No Data"]
                }
              };
            }

            // Calculate percentages
            const total = pieData.reduce((sum, item) => sum + item.value, 0);
            const series = pieData.map(item => Number(((item.value / total) * 100).toFixed(1)));
            const labels = pieData.map(item => item.name);

            console.log("Pie chart data prepared:", {
              pieData,
              series,
              labels,
              total
            });

            // Return minimal chart configuration
            return {
              series: series.map(val => Number(val)),
              options: {
                labels: labels
              }
            };
          } catch (error) {
            console.error("Error processing pie chart data:", error);
            return {
              series: [100],
              options: {
                labels: ["Error"]
              }
            };
          }
        }

        // Default configuration for line, bar, and area charts
        const processedSeries = originalSeries.map(series => ({
          name: series.name,
          type: chartType,
          data: Array.isArray(series.data) ? series.data.map(d => Number(d) || 0) : [0]
        }));

        return {
          series: processedSeries,
          options: {
            chart: {
              type: chartType,
              height: 350,
              toolbar: {
                show: true
              },
              zoom: {
                enabled: !isPieChart
              }
            },
            dataLabels: {
              enabled: true
            },
            stroke: {
              curve: 'smooth',
              width: 2
            },
            legend: {
              position: 'bottom',
              horizontalAlign: 'center'
            },
            noData: {
              text: 'Loading...'
            }
          }
        };
      } catch (error) {
        console.error("Error updating chart:", error);
        return prev;
      }
    });
  }, [chartType, selectedMetrics]);

  const getMetricValue = (count = {}, metric = {}) => {
    if (!metric.field) return 0;
    
    if (metric.field === 'total') {
      return (parseInt(count["@Enters"] || 0)) + (parseInt(count["@Exits"] || 0));
    }
    
    return parseInt(count[metric.field] || 0);
  };

  const calculateMetrics = (metrics = []) => {
    if (!Array.isArray(metrics) || metrics.length === 0) {
      setChartData(prev => ({
        ...prev,
        series: [],
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: []
          }
        }
      }));
      return;
    }

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

    let categories = [];
    let seriesData = {};

    if (dateFilter === "year" || dateFilter === "lastYear") {
      categories = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      selectedMetrics.forEach(metric => {
        seriesData[metric.value] = Array(12).fill(0);
      });
    } else {
      const dateMap = new Map();
      metrics.forEach((metric) => {
        const reportDate = metric?.Metrics?.ReportData?.Report?.["@Date"];
        if (reportDate && reportDate >= filterStart && reportDate <= filterEnd) {
          dateMap.set(reportDate, true);
        }
      });
      categories = Array.from(dateMap.keys()).sort();
      selectedMetrics.forEach(metric => {
        seriesData[metric.value] = Array(categories.length).fill(0);
      });
    }

    metrics.forEach((metric) => {
      const deviceId = metric?.Metrics?.["@DeviceId"];
      const selectedDevices = Object.values(deviceFilter?.selectedDevices || {})
        .flat()
        .map((device) => device?.device_id);
      const isDeviceSelected =
        !selectedDevices.length || selectedDevices.includes(deviceId);

      if (!isDeviceSelected) return;

      const reportDate = metric?.Metrics?.ReportData?.Report?.["@Date"];
      if (!reportDate || reportDate < filterStart || reportDate > filterEnd)
        return;

      const counts = metric?.Metrics?.ReportData?.Report?.Object?.[0]?.Count || [];
      counts.forEach((count) => {
        if (!count) return;
        selectedMetrics.forEach(metric => {
          const value = getMetricValue(count, metric);
          if (dateFilter === "year" || dateFilter === "lastYear") {
            const date = parseISO(reportDate);
            const month = date.getMonth();
            seriesData[metric.value][month] += value;
          } else {
            const dateIndex = categories.indexOf(reportDate);
            if (dateIndex !== -1) {
              seriesData[metric.value][dateIndex] += value;
            }
          }
        });
      });
    });

    const series = selectedMetrics.map(metric => ({
      name: metric.label,
      data: seriesData[metric.value] || []
    }));
    console.log("Series:",series)

    setChartData((prev) => ({
      ...prev,
      series,
      options: {
        ...prev.options,
        xaxis: {
          ...((prev.options && prev.options.xaxis) || {}),
          categories: dateFilter === "year" || dateFilter === "lastYear"
            ? categories
            : categories.map((date) => {
                const [year, month, day] = date.split("-");
                const monthNames = [
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ];
                return `${monthNames[parseInt(month, 10) - 1]}-${day}`;
              }),
          title: {
            text: dateFilter === "year" || dateFilter === "lastYear"
              ? "- Months -"
              : "- Date -",
            style: {
              fontSize: "14px",
              fontWeight: "600"
            },
          },
          labels: {
            rotate: dateFilter === "year" || dateFilter === "lastYear" ? 0 : -45,
            style: {
              fontSize: dateFilter === "year" || dateFilter === "lastYear"
                ? "10px"
                : "9px",
              fontWeight: 500,
              colors: "#333",
            },
          },
        },
      },
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Col className="box-col-8">
      <Card>
        <CardHeader className="card-no-border">
          <div className="header-top d-sm-flex justify-content-between align-items-center">
            <H5>Traffic Analysis</H5>
            <div className="d-flex gap-3 align-items-center">
              <ChartDataSelector
                selectedData={selectedMetrics}
                onChange={handleMetricsChange}
              />
              <ChartTypeSelector
                selectedType={chartType}
                onChange={handleChartTypeChange}
              />
            </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div style={{
          height: '400px',
          width: '100%',
          position: 'relative'
        }}>
          {chartType === 'pie' || chartType === 'donut' ? (
            <PieDonutChart
              chartData={chartData}
              selectedMetrics={selectedMetrics}
              isDonutChart={chartType === 'donut'}
            />
          ) : (
            <ReactApexChart
              type={chartType}
              height="100%"
              options={chartData.options}
              series={chartData.series}
            />
          )}
        </div>
      </CardBody>
    </Card>
  </Col>
  );
};

export default Chartpage;
