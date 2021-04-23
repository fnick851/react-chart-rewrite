import React, { useEffect, useRef, useState } from "react"
import "./Chart.css"
import data from "./stats.json"
import * as d3 from "d3"

interface IChartData {
  year: string
  applicants: number
  percent_growth: number
}

export function Chart() {
  const width = 800
  const height = 400
  const margin = { top: 30, right: 0, bottom: 70, left: 40 }
  const timeseries = data.map((d) => ({
    year: d.year,
    applicants: parseInt(d.applicants),
    percent_growth: parseFloat(d.percent_growth),
  }))

  // scales and axes for bar
  const x = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(data.map((d) => d.year))
    .padding(0.3)
  const barTextX = (item: IChartData) =>
    (x(item.year) as number) + x.bandwidth() / 2
  const y = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain([0, d3.max(timeseries, (d) => d.applicants) as number])
  const barTextY = (item: IChartData) => y(item.applicants) - 5
  const xAxis = (g: d3.Selection<any, any, any, any>) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
  const yAxis = (g: d3.Selection<any, any, any, any>) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
  const xAxisRef = useRef(null)
  const yAxisRef = useRef(null)
  useEffect(() => {
    const xAxisSelection = xAxis(d3.select(xAxisRef.current))
    const yAxisSelection = yAxis(d3.select(yAxisRef.current))
    xAxisSelection.selectAll("text").attr("dy", 17)
    yAxisSelection.selectAll("text").attr("dx", -5)
  })

  // scales for line
  const lineX = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(data.map((d) => d.year))
    .padding(0.3)
  const lineY = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain([
      (d3.min(timeseries, (d) => d.percent_growth) as number) - 0.2,
      (d3.max(timeseries, (d) => d.percent_growth) as number) + 1,
    ])
  const lineData = [...timeseries]
  lineData[0].percent_growth = 0
  const line = d3
    .line<IChartData>()
    .x((d) => lineX(d.year) as number)
    .y((d) => lineY(d.percent_growth))
  const linePath = line(lineData) as string

  /**
   * animations
   */
  // 1. bar animation, then show bar text
  const [showBarText, setShowbarText] = useState(false)
  const vizRootRef = useRef(null)
  useEffect(() => {
    const root = d3.select(vizRootRef.current)
    const rect = root.selectAll(".bar-rects")
    rect
      .data(timeseries)
      .transition()
      .ease(d3.easeLinear)
      .duration(800)
      .attr("y", (d) => y(d.applicants))
      .attr("height", (d) => y(0) - y(d.applicants))
      .delay((d, i) => i * 100)
    setTimeout(() => {
      setShowbarText(true)
    }, 1200)
  })
  // 2. line animation
  const [showLineText, setShowLineText] = useState(false)
  const [pathAnimationStart, setPathAnimationStart] = useState(false)
  setTimeout(() => {
    setPathAnimationStart(true)
    setShowLineText(true)
  }, 1300)
  const widthOfLegend = 315

  return (
    <div className="Chart" ref={vizRootRef}>
      <h1>NAEP Internship Program Applicants Growth</h1>
      <svg viewBox={`0 0 ${width} ${height}`}>
        <g className="bars">
          {timeseries.map((item, index) => (
            <g key={index}>
              <rect
                className="bar-rects"
                x={x(item.year)}
                y={y(0)}
                width={x.bandwidth()}
                height="0"
              />
              {showBarText ? (
                <text x={barTextX(item)} y={barTextY(item)}>
                  {item.applicants}
                </text>
              ) : null}
            </g>
          ))}
        </g>

        <g className="line" transform={`translate(${x.bandwidth() / 2},0)`}>
          <path d={linePath} className={pathAnimationStart ? "animated" : ""} />
          {showLineText
            ? lineData.map((item, index) => (
                <g key={index}>
                  <circle
                    cx={lineX(item.year)}
                    cy={lineY(item.percent_growth)}
                    r="7"
                  />
                  {item.year !== "2017" ? (
                    <text
                      x={lineX(item.year)}
                      y={lineY(item.percent_growth) - 20}
                    >
                      {Math.round(item.percent_growth * 1000) / 10 + "%"}
                    </text>
                  ) : null}
                </g>
              ))
            : null}
        </g>

        <g className="axes">
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
        </g>

        <g className="legends">
          <text transform="translate(0, 15)">Number of Applicants</text>
          <g
            transform={`translate(${
              (width - margin.left - margin.right) / 2 +
              margin.left -
              widthOfLegend / 2
            }, ${height - margin.bottom + 60})`}
          >
            <path d="M0,0 L12,10 L20,0 L32,10" transform="translate(0, -10)" />
            <circle cx="6" cy="-5" r="4" />
            <text transform="translate(40, 0)">
              Percentage Growth from Previous Year
            </text>
          </g>
        </g>
      </svg>

      <div className="footnote">
        <p>
          Between the years 2017 and 2021 the NAEP Internship Program
          experienced a 112% growth in applications received.
        </p>
      </div>
    </div>
  )
}
