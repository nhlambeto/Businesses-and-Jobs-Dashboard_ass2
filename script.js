
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
