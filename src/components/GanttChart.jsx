import React, {useLayoutEffect, useState} from "react";
import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import {tr} from "date-fns/locale";

export default function GanttChart(){
    const chartRef = useRef(null);
    const [data, setData] = useState([]);

    let myChart = null;

    useLayoutEffect(() => {
        window.dbapi.getDates().then((res) => {
            const _data = res.map(({ x, y, name }) => ({
                x: [new Date(x[0]), new Date(x[1])],
                y,
                name,
            }));
            setData(_data);
        });
    }, []);

    useLayoutEffect(() => {
        if (chartRef.current && data.length > 0) {
            const containerWidth = chartRef.current.offsetWidth;
            myChart = createChart(data, containerWidth);
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.destroy();
            };
        }
    }, [chartRef.current, data, myChart]);

    const handleResize = () => {
        if (chartRef.current && myChart) {
            const ctx = chartRef.current.getContext('2d');
            const containerWidth = ctx.canvas.parentNode.offsetWidth;
            chartRef.current.style.width = `${containerWidth}px`;
            myChart.options.scales.x.ticks.source = 'auto';
            myChart.resize();
            console.log(containerWidth)
        }
    };

    const createChart = (data) => {
        const ctx = chartRef.current.getContext('2d');
        if (myChart) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'Projeler',
                    data: data,
                    borderWidth: 1,
                    borderSkipped: false,
                    borderRadius: 10,
                    barPercentage: 0.5,
                }]
            },
            options: {
                layout: {
                 padding: {
                     left: 100,
                 }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                indexAxis: 'y',
                scales: {
                    x: {
                        adapters: {
                            date: {
                                locale: tr
                            }
                        },
                        position: 'top',
                        type: 'time',
                        time: {
                            unit: 'week',
                        },
                        min: new Date (Math.min(...data.map(item => item.x[0].getTime()))).toISOString().substring(0, 10),
                    },
                },
            },
            plugins: [
                todayLine,
                assignedTasks,
            ]
        });
        return myChart;
    };

    const todayLine = {
        id: "todayLine",
        afterDatasetDraw(chart, args, options) {
            const {ctx, data, chartArea:{top, bottom, left, right},scales:{x,y} } = chart;

            ctx.save();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgb(239,40,69)";
            ctx.setLineDash([14,8]);
            ctx.moveTo(x.getPixelForValue(new Date()), top);
            ctx.lineTo(x.getPixelForValue(new Date()), bottom);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    const assignedTasks = {
        id: 'assignedTasks',
        afterDatasetDraw(chart, args, options) {
            const {ctx, data, chartArea: {top, bottom, left, right}, scales: {x, y}} = chart;

            ctx.font = 'bolder 12px sans-serif';
            ctx.fillStyle = 'black';
            ctx.textBaseline = 'middle';
            data.datasets[0].data.forEach((datapoint, index) => {
                ctx.fillText(datapoint.name, 10, y.getPixelForValue(index))
            })
        },
    }


    return(
        <div>
            <canvas  id="myChart" ref={chartRef} style={{height:'99%'}}></canvas>
        </div>
    )
}