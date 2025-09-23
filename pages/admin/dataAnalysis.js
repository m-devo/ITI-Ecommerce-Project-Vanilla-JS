import { db } from "../../config/firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let ordersPieChartInstance = null;
let earningsLineChartInstance = null;

async function updateOrderStatusPie() {
    const statusCounts = { "delivered": 0, "pending": 0, "canceled": 0, "shipped": 0 }

    try {
        const ordersData = await getDocs(collection(db, "orders"));
        console.log("Orders: ");
        ordersData.forEach((doc) => {
            console.log(doc.data());
            const status = doc.data().status;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        const chartData = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ["#198754", "#ffc107", "#dc3545", "#0dcaf0"],
            }]
        };

        const ctx = document.getElementById("ordersPieChart").getContext("2d");

        if (ordersPieChartInstance) {
            ordersPieChartInstance.data = chartData;
            ordersPieChartInstance.update();
        } else {
            ordersPieChartInstance = new Chart(ctx, {
                type: "pie",
                data: chartData,
                options: { responsive: true, maintainAspectRatio: false },
            });
        }
    } catch (error) {
        console.error("Can not fetch chart status:", error);
    }
}

async function updateEarningsChart() {
    const monthlyEarnings = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    try {
        const orderQuery = query(collection(db, "orders"), where("status", "==", "delivered"));

        const ordersData = await getDocs(orderQuery);
        console.log("Orders: ")
        ordersData.forEach(doc => {
            const order = doc.data();
            console.log(doc.data());
            if (order.createdAt && order.total) {
                const orderDate = order.createdAt.toDate();
                if (orderDate.getFullYear() === currentYear) {
                    const month = orderDate.getMonth();
                    monthlyEarnings[month] += order.total;
                }
            }
        });

        const chartData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "Earnings",
                data: monthlyEarnings,
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
                fill: true,
                tension: 0.4,
            }]
        };

        const ctx = document.getElementById('earningsChart').getContext('2d');

        if (earningsLineChartInstance) {
            earningsLineChartInstance.data = chartData;
            earningsLineChartInstance.update();
        } else {
            earningsLineChartInstance = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                },
            });
        }
    } catch (error) {
        console.error("Error fetching earnings data for chart:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateOrderStatusPie();
    updateEarningsChart();
});