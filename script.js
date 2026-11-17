
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


// Create and display the three dashboard charts
function drawCharts(yearData) {

    // Get all business sizes and available years
    const allSizes = Array.from(new Set(businessData.map(function (row) {
        return row.businessSize;
    })));
    const years = Array.from(new Set(businessData.map(function (row) {
        return row.year;
    }))).sort(function (first, second) {
        return first - second;
    });

    const selectedSize = sizeFilter.value;

    // Decide which business sizes to show in the line chart
    const trendSizes = selectedSize === "all"
        ? allSizes
        : [selectedSize];

    // Prepare the data for each line in the trend chart
    const trendLines = trendSizes.map(function (size) {
        const sizeData = businessData.filter(function (row) {
            return row.businessSize === size;
        });
        const color = chartColors[allSizes.indexOf(size) % chartColors.length];

        return {
            label: size,
            data: years.map(function (year) {
                const match = sizeData.find(function (row) {
                    return row.year === year;
                });
                return match ? match.establishments : null;
            }),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.2
        };
    });

    // Remove the previous charts before creating updated ones
    if (trendChart) {
        trendChart.destroy();
        businessChart.destroy();
        employmentChart.destroy();
    }

    // Create the line chart showing business trends over time
    trendChart = new Chart(document.getElementById("trend-chart"), {
        type: "line",
        data: { labels: years, datasets: trendLines },
        options: chartOptions(function (value) {
            return numberFormat.format(Math.round(value));
        })
    });

    // Create the bar chart showing business counts by size
    businessChart = new Chart(document.getElementById("business-chart"), {
        type: "bar",
        data: {
            labels: yearData.map(function (row) {
                return row.businessSize;
            }),
            datasets: [{
                label: "Businesses",
                data: yearData.map(function (row) {
                    return row.establishments;
                }),
                backgroundColor: barColors(yearData, selectedSize, "#e8cbbb"),
                borderRadius: 3
            }]
        },
        options: chartOptions(function (value) {
            return numberFormat.format(Math.round(value));
        })
    });

    // Create the bar chart showing employment by business size
    employmentChart = new Chart(document.getElementById("employment-chart"), {
        type: "bar",
        data: {
            labels: yearData.map(function (row) {
                return row.businessSize;
            }),
            datasets: [{
                label: "Jobs",
                data: yearData.map(function (row) {
                    return row.employment;
                }),
                backgroundColor: barColors(yearData, selectedSize, "#bfd0d8"),
                borderRadius: 3
            }]
        },
        options: chartOptions(function (value) {
            return numberFormat.format(Math.round(value));
        })
    });
}


// Update the dashboard when a filter changes
function updateDashboard() {

    // Get data for the selected year and business size
    const yearData = getYearData(Number(yearFilter.value));
    const selectedData = getSelectedData(yearData);

    // Get the name of the selected business size
    const selection = sizeFilter.value === "all"
        ? "All business sizes"
        : sizeFilter.options[sizeFilter.selectedIndex].text;

    // Update the summary, charts and selected group
    document.getElementById("selection-label").textContent = selection;
    updateNumbers(yearData, selectedData);
    drawCharts(yearData);

    // Calculate and display the percentage of jobs
    if (selectedData.length) {
        const jobsShare = selectedData.reduce(function (total, row) {
            return total + row.employmentShare;
        }, 0);

        document.getElementById("insight-note").textContent = selection + " in " + yearFilter.value
            + ": " + document.getElementById("business-total").textContent + " businesses and "
            + document.getElementById("employment-total").textContent + " jobs. "
            + "This group accounts for " + jobsShare.toFixed(1) + "% of estimated jobs.";
    }
}

// Load the CSV dataset into the dashboard
async function loadData() {
    try {
        const response = await fetch("data/sead_sa_business_size_2018_2025.csv");

        // Check whether the data file loaded successfully
        if (!response.ok) {
            throw new Error("The data file could not be loaded.");
        }

        businessData = readCsv(await response.text());

        // Create dropdown options for each business size
        const sizes = Array.from(new Map(businessData.map(function (row) {
            return [row.businessSize, row.employeeRange];
        })).entries());

        sizes.forEach(function (size) {
            const option = document.createElement("option");
            option.value = size[0];
            option.textContent = size[0] + " (" + size[1] + " employees)";
            sizeFilter.appendChild(option);
        });

        // Create dropdown options for each available year
        const years = Array.from(new Set(businessData.map(function (row) {
            return row.year;
        }))).sort(function (first, second) {
            return second - first;
        });

        years.forEach(function (year) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Select the latest year by default
        yearFilter.value = years[0];

        // Display the number of records and the available years
        dataStatus.textContent = businessData.length + " records loaded for " + years[years.length - 1]
            + "–" + years[0] + ".";

        // Display the dashboard using the loaded data
        updateDashboard();

        // Update the dashboard when either filter changes
        sizeFilter.addEventListener("change", updateDashboard);
        yearFilter.addEventListener("change", updateDashboard);

    } catch (error) {

        // Display an error message if the dataset cannot load
        dataStatus.textContent = "Could not load the data. Use VS Code Live Server and check the data folder.";
        dataStatus.classList.add("error-message");
        console.error(error);
    }
}

// Start loading the dataset
loadData();
