document.addEventListener("DOMContentLoaded", function () {
    // https://www.chartjs.org/docs/latest/getting-started/
    //https://www.chartjs.org/docs/latest/charts/line.html
    const ctx = document.getElementById("earningsChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            datasets: [
                {
                    label: "Earnings",
                    data: [2000, 5000, 4000, 9000, 3000, 2000, 7000, 10000, 8000],
                    borderColor: "#0d6efd",
                    backgroundColor: "rgba(13, 110, 253, 0.1)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        },
    });

    // https://www.chartjs.org/docs/latest/charts/doughnut.html#pie
    const ctx2 = document.getElementById("ordersPieChart").getContext("2d");
    new Chart(ctx2, {
        type: "pie",
        data: {
            labels: ["Delivered", "Pending", "Canceled", "Shipped"],
            datasets: [
                {
                    data: [30, 10, 40, 20],
                    backgroundColor: ["#198754", "#ffc107", "#dc3545", "#0dcaf0"],
                },
            ],
        },
        options: { responsive: true },
    });
});
