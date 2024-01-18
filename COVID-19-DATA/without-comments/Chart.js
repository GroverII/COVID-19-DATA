import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { parse, getTime } from 'date-fns';
import 'chartjs-adapter-date-fns';



const ChartComponent = ({ startDate, endDate, covidData }) => {
    const chartContainer = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartContainer.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

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

            const dataPointsTotalCases = sortedData.map(record => ({
                x: getTime(record.date),
                y: record.totalCases
            }));

            const dataPointsTotalDeaths = sortedData.map(record => ({
                x: getTime(record.date),
                y: record.totalDeaths
            }));

            const ctx = chartContainer.current.getContext('2d');

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

    return (
        <div className="ChartContainer">
            <canvas ref={chartContainer} width={1200} height={400}></canvas>
        </div>
    );
};

export default ChartComponent;
