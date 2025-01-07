class ChartManager {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.chart = null;
    this.scatterData = { datasets: [] };
    this.scatterOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
          },
        },
      },
      scales: {
        x: {
          type: "category",
          title: {
            display: true,
            text: "Algorithm",
          },
        },
        y: {
          type: "logarithmic",
          beginAtZero: false,
          title: {
            display: true,
            text: "Mean Execution Time (ms)",
          },
          ticks: {
            callback: function (value) {
              return Number(value).toLocaleString();
            },
          },
        },
      },
    };
  }

  initialize() {
    const ctx = document.getElementById(this.canvasId).getContext("2d");
    this.chart = new Chart(ctx, {
      type: "scatter",
      data: this.scatterData,
      options: this.scatterOptions,
    });
  }

  updateDatasets(results, operations, operationDisplayNames, colors, pointStyles) {
    this.chart.data.datasets = operations.map((operation) => ({
      label: operationDisplayNames[operation],
      data: results.map((result) => ({
        x: result.algorithm,
        y: result.average[operation] || 0.01,
      })),
      backgroundColor: colors[operation],
      pointStyle: pointStyles[operation],
      pointRadius: 10,
    }));

    this.chart.update(); 
  }

  reset() {
    this.scatterData.datasets = [];
    this.chart.update();
  }
}

export default ChartManager;