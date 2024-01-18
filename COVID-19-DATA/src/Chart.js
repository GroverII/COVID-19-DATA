// Importing necessary hooks from the React library.
// - useEffect: Enables performing side effects in functional components, similar to componentDidMount and componentDidUpdate in class components.
// - useRef: Creates a mutable object that persists across renders and allows accessing the DOM directly.
import React, { useEffect, useRef } from 'react';

// Importing necessary functions from 'chart.js/auto'.
// Chart is a library for creating interactive charts and graphs. 'chart.js/auto' includes the latest version of Chart.js with all available chart types.
import { Chart } from 'chart.js/auto';

// Importing functions from the 'date-fns' library.
// 'date-fns' is a JavaScript date utility library that provides various functions for working with dates.
import { parse, getTime } from 'date-fns';

// Importing the 'chartjs-adapter-date-fns' library.
// 'chartjs-adapter-date-fns' is an adapter that allows using 'date-fns' with Chart.js for handling date and time scales.
import 'chartjs-adapter-date-fns';



// ChartComponent is a custom component responsible for rendering charts in the application.
// It utilizes the Chart.js library to create interactive and visually appealing charts for visualizing COVID-19 data.
const ChartComponent = ({ startDate, endDate, covidData }) => {
    // useRef is used to create a mutable object that persists across renders and allows accessing the DOM directly.
    const chartContainer = useRef(null);

    // useRef is also used to create a mutable object that persists across renders and holds the Chart.js instance.
    const chartInstance = useRef(null);


    useEffect(() => {
        // useEffect is used for performing side effects in functional components.
        // In this case, it's used to handle the creation and destruction of the Chart.js instance.
        if (chartContainer.current) {
            // Checking if the chartContainer reference is available (DOM element).
            if (chartInstance.current) {
                // If a previous chart instance exists, destroy it to prevent memory leaks.
                chartInstance.current.destroy();
            }

            // Filtering, mapping, and sorting the COVID-19 data based on specified conditions.
            const sortedData = covidData
                .filter(record =>
                    record.totalCases !== undefined &&
                    record.totalDeaths !== undefined &&
                    record.date &&
                    getTime(parse(record.date, 'dd/MM/yyyy', new Date())) >= getTime(new Date(startDate)) &&
                    getTime(parse(record.date, 'dd/MM/yyyy', new Date())) <= getTime(new Date(endDate))
                )
                .map(record => ({
                    date: parse(record.date, 'dd/MM/yyyy', new Date()),
                    totalCases: record.totalCases,
                    totalDeaths: record.totalDeaths
                }))
                .sort((a, b) => getTime(a.date) - getTime(b.date));

            // Extracting data points for total cases.
            const dataPointsTotalCases = sortedData.map(record => ({
                x: getTime(record.date),
                y: record.totalCases
            }));

            // Mapping the sorted data to extract data points for total deaths.
            const dataPointsTotalDeaths = sortedData.map(record => ({
                x: getTime(record.date),
                y: record.totalDeaths
            }));

            // Accessing the 2D rendering context of the chart container.
            const ctx = chartContainer.current.getContext('2d');

            // Creating a new Chart instance and assigning it to chartInstance.current.
            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            data: dataPointsTotalCases,
                            label: 'Total Cases',
                            borderColor: 'rgb(75, 192, 192)',
                            fill: false,
                        },
                        {
                            data: dataPointsTotalDeaths,
                            label: 'Total Deaths',
                            borderColor: 'rgb(255, 99, 132)',
                            fill: false,
                        },
                    ],
                },
                options: {
                    indexAxis: 'x',
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'MM/dd/yyyy',
                            },
                            title: {
                                display: false,
                                text: 'Date',
                            },
                            distribution: 'linear',
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Count',
                            },
                        },
                    },
                },
            });
        }
    }, [startDate, endDate, covidData]);
    // The useEffect hook re-runs whenever the dependencies (startDate, endDate, covidData) change.
    // It is responsible for updating the chart based on the new date range and COVID-19 data.

    return (
        <div className="ChartContainer">
            {/* The canvas element is used as a container for the Chart.js chart. */}
            <canvas ref={chartContainer} width={1200} height={400}></canvas>
        </div>
    );
};

export default ChartComponent;
