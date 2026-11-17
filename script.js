
// Get the filter and status elements from the HTML
const sizeFilter = document.getElementById("business-size-filter");
const yearFilter = document.getElementById("year-filter");
const dataStatus = document.getElementById("data-status");

// Set number formatting and chart colours
const numberFormat = new Intl.NumberFormat("en-US");
const chartColors = ["#e27a45", "#477a95", "#bc9b45", "#85526c", "#6b895e"];

// Store the dataset and chart objects
let businessData = [];
let trendChart;
let businessChart;
let employmentChart;


// Read the CSV file and convert it into records
function readCsv(text) {
    const rows = text.trim().split(/\r?\n/);
    const headings = rows[0].split(",");

    return rows.slice(1).map(function (row) {
        const values = row.split(",");
        const record = {};

        // Match each value with its column heading
        headings.forEach(function (heading, index) {
            record[heading] = values[index];
        });

        // Convert the values into the correct data types
        return {
            year: Number(record.year),
            businessSize: record.businessSize,
            employeeRange: record.employeeRange,
            establishments: Number(record.establishments),
            employment: Number(record.employment),
            employmentShare: Number(record.employmentSharePercent)
        };
    });
}

// Get records for the selected year
function getYearData(year) {
    return businessData.filter(function (row) {
        return row.year === year;
    });
}

// Filter records by the selected business size
function getSelectedData(yearData) {
    if (sizeFilter.value === "all") {
        return yearData;
    }

    return yearData.filter(function (row) {
        return row.businessSize === sizeFilter.value;
    });
}

// Calculate and display the total businesses and jobs
function updateNumbers(yearData, selectedData) {
    const businesses = selectedData.reduce(function (total, row) {
        return total + row.establishments;
    }, 0);
    const jobs = selectedData.reduce(function (total, row) {
        return total + row.employment;
    }, 0);

    // Display rounded totals and the selected year
    document.getElementById("business-total").textContent = numberFormat.format(Math.round(businesses));
    document.getElementById("employment-total").textContent = numberFormat.format(Math.round(jobs));
    document.getElementById("year-heading").textContent = "South Africa · " + yearFilter.value;
}


// Set the appearance and options for the charts
function chartOptions(valueFormat) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    color: "#655e62"
                }
            },
            // Format the information shown when hovering over a chart
            tooltip: {
                callbacks: {
                    label: function (item) {
                        return item.dataset.label + ": " + valueFormat(item.parsed.y);
                    }
                }
            }
        },
        // Set the appearance of the chart axes
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#777174" }
            },
            y: {
                beginAtZero: true,
                grid: { color: "#ece4da" },
                ticks: {
                    color: "#777174",
                    callback: valueFormat
                }
            }
        }
    };
}

// Set chart colours based on the selected business size
function barColors(rows, selectedSize, baseColor) {
    return rows.map(function (row, index) {
        if (selectedSize === "all" || row.businessSize === selectedSize) {
            return chartColors[index % chartColors.length];
        }

        return baseColor;
    });
}
