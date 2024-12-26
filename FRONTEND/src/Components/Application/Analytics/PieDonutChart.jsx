import React from "react";
import Chart from "react-apexcharts";

const PieDonutChart = ({ chartData, isDonutChart }) => {
  // Create base chart options
  const baseOptions = {
    chart: {
      type: isDonutChart ? "donut" : "pie",
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      }
    },
    legend: {
      show: true,
      position: "bottom"
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  // Default data for empty state
  const defaultData = {
    series: [{ data: [100] }],
    options: {
      ...baseOptions,
      labels: ["No Data"]
    }
  };

  // Validate chart data
  if (!chartData || !Array.isArray(chartData.series) || !chartData.options?.labels) {
    console.log("Invalid chart data, using default:", defaultData);
    return (
      <div className="pie-donut-chart">
        <Chart
          options={defaultData.options}
          series={defaultData.series[0].data}
          type={isDonutChart ? "donut" : "pie"}
          height={350}
        />
      </div>
    );
  }

  // Ensure series is in the correct format
  const validSeries = chartData.series.map(val => Number(val) || 0);

  // Merge chart options
  const options = {
    ...baseOptions,
    labels: chartData.options.labels
  };

  console.log("Rendering chart with:", {
    options,
    series: validSeries
  });

  return (
    <div className="pie-donut-chart">
      <Chart
        options={options}
        series={validSeries}
        type={isDonutChart ? "donut" : "pie"}
        height={350}
      />
    </div>
  );
};

export default PieDonutChart;
