import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { H5 } from "../../../AbstractElements";
import ChartDataSelector from './ChartDataSelector';
import ChartTypeSelector, { chartTypes } from './ChartTypeSelector';
import PieDonutChart from './PieDonutChart';
import { useSelector } from "react-redux";
import axios from "axios";
import config from "../../../config"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultChartOptions = {
  chart: {
    type: "bar",
    height: '100%',
    zoom: {
      enabled: false,
    },
    parentHeightOffset: 0
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "30%",
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
  const [metricsData, setMetricsData] = useState({});
  const [chartType, setChartType] = useState('bar');
  const [selectedMetrics, setSelectedMetrics] = useState([
    { value: 'enters', label: 'Total Entries', field: '@Enters' },
    { value: 'exits', label: 'Total Exits', field: '@Exits' },
    { value: 'totalTraffic', label: 'Total Traffic', field: 'total' }
  ]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const dateFilter = useSelector((state) => state.dateFilter.filter);
  const deviceFilter = useSelector((state) => state.deviceFilter);

  const handleMetricsChange = (selected) => {
    // Ensure we always have at least one metric selected
    if (selected && selected.length > 0) {
      setSelectedMetrics(selected);
    } else {
      // If user tries to remove all selections, revert to defaults
      setSelectedMetrics([
        { value: 'enters', label: 'Total Entries', field: '@Enters' },
        { value: 'exits', label: 'Total Exits', field: '@Exits' },
        { value: 'totalTraffic', label: 'Total Traffic', field: 'total' }
      ]);
    }
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Helper function to convert hex to rgba
  const hexToRGBA = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper function to get color with opacity
  const getColorWithOpacity = (rgbaColor, opacity) => {
    // Extract the RGB values from the rgba string
    const match = rgbaColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (!match) return rgbaColor;
    
    // Create new rgba with desired opacity
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (chartType === 'pie' || chartType === 'donut') {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: chartType !== 'pie' && chartType !== 'donut' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return Math.round(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    } : undefined
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(config.hostname + "/metrics");
        const metrics = Array.isArray(response.data) ? response.data : [response.data];
        setMetricsData(metrics.reduce((acc, metric) => {
          const date = metric?.Metrics?.ReportData?.Report?.["@Date"];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(metric);
          return acc;
        }, {}));
        calculateMetrics(metricsData);
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
    if (metricsData && Object.keys(metricsData).length > 0) {
      calculateMetrics(metricsData);
    }
  }, [dateFilter, deviceFilter, metricsData, selectedMetrics, chartType]);

  const getMetricValue = (count = {}, metric = {}) => {
    if (!metric.field) return 0;
    
    if (metric.field === 'total') {
      return (parseInt(count["@Enters"] || 0)) + (parseInt(count["@Exits"] || 0));
    }
    
    return parseInt(count[metric.field] || 0);
  };

  const metricColors = {
    enters: "rgba(90, 200, 90, 0.90)", 
    exits: "rgba(255, 0, 0, 0.90)", 
    totalTraffic: "rgba(90, 110, 250, 0.90)", 

    entersMale: "rgba(30, 144, 255, 0.70)",
    exitsMale: "rgba(0, 0, 139, 0.70)", 
    entersFemale: "rgba(255, 105, 180, 0.70)",
    exitsFemale: "rgba(139, 0, 139, 0.70)", 
    unknownEnters: "rgba(0, 128, 0, 0.50)",
    unknownExits: "rgba(255, 0, 0, 0.50)", 
  };

  const calculateMetrics = (metrics = {}) => {
    if (!metrics || Object.keys(metrics).length === 0) {
      setChartData({
        labels: [],
        datasets: []
      });
      return;
    }


    const categories = [];
    const seriesData = {};

    // Initialize series data for each metric
    selectedMetrics.forEach(metric => {
      seriesData[metric.value] = [];
    });

    // Process data based on date filter
    Object.entries(metrics).forEach(([date, countArray]) => {
      if (isDateInRange(date, dateFilter)) {
        categories.push(date);
        
        // Initialize metric values for this date
        const dateMetrics = {};
        selectedMetrics.forEach(metric => {
          dateMetrics[metric.value] = 0;
        });

        // Sum up all values for each metric on this date
        countArray.forEach(metricData => {
          const deviceId = metricData.Metrics?.["@DeviceId"];
          const selectedDevices = Object.values(deviceFilter.selectedDevices || {})
            .flat()
            .map((device) => device.device_id);
          const isDeviceSelected =
            selectedDevices.length === 0 || selectedDevices.includes(deviceId);

          if (!isDeviceSelected) return;

          const counts = metricData?.Metrics?.ReportData?.Report?.Object?.[0]?.Count || [];
          counts.forEach(count => {
            selectedMetrics.forEach(metric => {
              if (metric.value === 'totalTraffic') {
                return;
              }
              const value = parseInt(count[metric.field] || 0);
              dateMetrics[metric.value] += isNaN(value) ? 0 : value;
            });
          });
        });

        // Calculate total traffic if selected
        if (selectedMetrics.some(m => m.value === 'totalTraffic')) {
          dateMetrics['totalTraffic'] = dateMetrics['enters'] + dateMetrics['exits'];
        }

        // Add the summed values to series data
        selectedMetrics.forEach(metric => {
          seriesData[metric.value].push(dateMetrics[metric.value]);
        });
      }
    });

    // Sort categories chronologically
    categories.sort((a, b) => new Date(a) - new Date(b));

    // Format labels based on date filter
    const formattedLabels = dateFilter === "year" || dateFilter === "lastYear"
      ? categories
      : categories.map((date) => {
          const [year, month, day] = date.split("-");
          const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ];
          return `${monthNames[parseInt(month, 10) - 1]}-${day}`;
        });

    if (chartType === 'pie' || chartType === 'donut') {
      // For pie/donut charts, use the sum of all values for each metric
      const totalValues = selectedMetrics.map(metric => {
        return seriesData[metric.value].reduce((sum, val) => sum + val, 0);
      });

      const chartData = {
        labels: selectedMetrics.map(m => m.label),
        datasets: [{
          data: totalValues,
          backgroundColor: selectedMetrics.map(metric => metricColors[metric.value]),
          borderColor: Array(selectedMetrics.length).fill('#ffffff'),
          borderWidth: 1
        }]
      };

      setChartData(chartData);
    } else {
      // For other charts
      const datasets = selectedMetrics.map((metric) => {
        const color = metricColors[metric.value];
        return {
          label: metric.label,
          data: seriesData[metric.value],
          borderColor: color,
          backgroundColor: chartType === 'area' 
            ? getColorWithOpacity(color, 0.2) // Reduced opacity for area chart fill
            : color,
          fill: chartType === 'area',
          tension: 0.4
        };
      });

      const chartData = {
        labels: formattedLabels,
        datasets
      };

      setChartData(chartData);
    }
  };

  const isDateInRange = (date, filter) => {
    if (!date) return false;
    
    const currentDate = new Date();
    const [year, month, day] = date.split('-').map(Number);
    const dateToCheck = new Date(year, month - 1, day);
    
    // Handle custom date range
    if (typeof filter === 'object' && filter.type === 'custom') {
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);
      return dateToCheck >= startDate && dateToCheck <= endDate;
    }

    // Handle predefined filters
    switch (filter) {
      case 'today':
        return dateToCheck.toDateString() === currentDate.toDateString();
      
      case 'yesterday': {
        const yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        return dateToCheck.toDateString() === yesterday.toDateString();
      }
      
      case 'week': {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        return dateToCheck >= startOfWeek && dateToCheck <= currentDate;
      }
      
      case 'lastWeek': {
        const endOfLastWeek = new Date(currentDate);
        endOfLastWeek.setDate(currentDate.getDate() - currentDate.getDay() - 1);
        const startOfLastWeek = new Date(endOfLastWeek);
        startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
        return dateToCheck >= startOfLastWeek && dateToCheck <= endOfLastWeek;
      }
      
      case 'month': {
        return dateToCheck.getFullYear() === currentDate.getFullYear() &&
               dateToCheck.getMonth() === currentDate.getMonth();
      }
      
      case 'lastMonth': {
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        return dateToCheck.getFullYear() === lastMonth.getFullYear() &&
               dateToCheck.getMonth() === lastMonth.getMonth();
      }
      
      case 'year':
        return dateToCheck.getFullYear() === currentDate.getFullYear();
      
      case 'lastYear':
        return dateToCheck.getFullYear() === currentDate.getFullYear() - 1;
      
      default:
        return false;
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <Col className="box-col-8">
      <Card>
        <CardHeader className="card-no-border">
          <div className="header-top d-sm-flex justify-content-between align-items-center">
            <H5>Traffic Analysis</H5>
            <div className="d-flex gap-3 align-items-center">
              <ChartDataSelector
                selectedMetrics={selectedMetrics}
                onChange={handleMetricsChange}
              />
              <ChartTypeSelector
                selectedType={chartType}
                onChange={handleChartTypeChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0 ">
          <div style={{
            height: '300px',
            width: '100%',
            position: 'relative'
          }}>
            {['pie', 'donut'].includes(chartType) ? (
              <PieDonutChart
                chartData={chartData}
                isDonutChart={chartType === 'donut'}
              />
            ) : chartType === 'bar' ? (
              <Bar
                data={chartData}
                options={chartOptions}
              />
            ) : (
              <Line
                data={chartData}
                options={chartOptions}
              />
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Chartpage;
