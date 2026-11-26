import {
  ArcElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { byId } from "./dom.js";

Chart.register(
  ArcElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

export function renderCharts() {
  const line = byId("chart-line", HTMLCanvasElement);
  const context = line.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");
  const gradient = context.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(0, 255, 163, 0.3)");
  gradient.addColorStop(1, "rgba(0, 255, 163, 0)");
  Chart.defaults.color = "#a1a1aa";
  Chart.defaults.font.family = "Inter, sans-serif";
  const timeline = new Chart(line, {
    type: "line",
    data: {
      labels: ["Mai", "Jun", "Jul", "Ago", "Set", "Out"],
      datasets: [
        {
          data: [320, 450, 410, 680, 850, 750],
          borderColor: "#00ffa3",
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { grid: { color: "rgba(255,255,255,0.08)" } } },
    },
  });
  try {
    const media = new Chart(byId("chart-doughnut", HTMLCanvasElement), {
      type: "doughnut",
      data: {
        labels: ["Computação", "Mobile", "Infraestrutura"],
        datasets: [
          {
            data: [55, 25, 20],
            backgroundColor: ["#00ffa3", "#00e5ff", "#064e3b"],
            borderColor: "#000",
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true } },
        },
      },
    });
    return () => {
      media.destroy();
      timeline.destroy();
    };
  } catch (error) {
    timeline.destroy();
    throw error;
  }
}
