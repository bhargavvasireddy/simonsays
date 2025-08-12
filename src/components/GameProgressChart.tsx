import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export type GameStats = {
  attempt: number;
  roundsReached: number;
  timestamp: Date;
};

interface GameProgressChartProps {
  data: GameStats[];
  width?: number;
  height?: number;
}

function GameProgressChart({ data, width = 600, height = 300 }: GameProgressChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const margin = { top: 70, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.attempt.toString()))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.roundsReached) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.attempt.toString()) || 0)
      .attr('y', d => yScale(d.roundsReached))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.roundsReached))
      .attr('fill', '#4caf50')
      .attr('rx', 4)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#45a049');
        
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('pointer-events', 'none');

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`Game #${d.attempt}<br/>Rounds: ${d.roundsReached}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#4caf50');
        d3.selectAll('.tooltip').remove();
      });

    // Add value labels on bars
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.attempt.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.roundsReached) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.roundsReached);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .style('font-weight', 'bold')
      .text('Game Attempt');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .style('font-weight', 'bold')
      .text('Rounds Reached');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('Game Progress: Rounds Reached per Attempt');

  }, [data, width, height]);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd', borderRadius: '8px' }}></svg>
    </div>
  );
}

export default GameProgressChart;
