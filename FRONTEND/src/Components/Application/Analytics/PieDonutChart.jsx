import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieDonutChart = ({ chartData, isDonutChart }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = dataset.data.reduce((sum, value) => sum + value, 0);
              
              return data.labels.map((label, i) => {
                const value = dataset.data[i];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    },
    cutout: isDonutChart ? '65%' : 0
  };

  // If no data or invalid data, show empty chart
  if (!chartData?.datasets?.[0]?.data || chartData.datasets[0].data.length === 0) {
    const emptyData = {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#e0e0e0'],
        borderWidth: 1
      }]
    };
    return (
      <div style={{ height: '350px', position: 'relative' }}>
        <Pie data={emptyData} options={options} />
      </div>
    );
  }

  return (
    <div style={{ height: '350px', position: 'relative' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieDonutChart;
