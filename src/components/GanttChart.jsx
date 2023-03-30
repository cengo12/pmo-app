import React from "react";
import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

export default function GanttChart(){
    const chartRef = useRef(null);
    let myChart = null;
    let data1 = [];

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
                    borderSkipped: 'false',
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'week',
                        },
                        min: new Date (Math.min(...data.map(item => item.x[0].getTime()))).toISOString().substring(0, 10),
                    }
                }
            }
        });
    };

    useEffect(() => {
        window.dbapi.getDates().then((res) => {
            const data1 = res.map(({ x, y }) => ({ x: [new Date(x[0]), new Date(x[1])], y }));
            console.log(new Date(Math.min(...data1.map(item => item.x[0].getTime()))).toISOString().substring(0, 10));
            createChart(data1);
        });
    }, []);

    return(
        <div>
            <canvas style={{ width: "100%", height: "180px" }} id="myChart" ref={chartRef}></canvas>
        </div>
    )
}