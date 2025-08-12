import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GameStats } from './GameProgressChart';

interface AccuracyChartProps {
  data: GameStats[];
  width?: number;
  height?: number;
}

function AccuracyChart({ data, width = 600, height = 250 }: AccuracyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate running average accuracy
    const accuracyData = data.map((d, i) => {
      const gamesUpToNow = data.slice(0, i + 1);
      const totalRounds = gamesUpToNow.reduce((sum, game) => sum + game.roundsReached, 0);
      const averageRounds = totalRounds / gamesUpToNow.length;
      return {
        attempt: d.attempt,
        accuracy: Math.min(100, (averageRounds / 10) * 100) // Scale to percentage (assuming 10 rounds is "perfect")
      };
    });

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([1, data.length])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create line generator
    const line = d3.line<{attempt: number, accuracy: number}>()
      .x(d => xScale(d.attempt))
      .y(d => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    // Add the line
    g.append('path')
      .datum(accuracyData)
      .attr('fill', 'none')
      .attr('stroke', '#2196F3')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots
    g.selectAll('.dot')
      .data(accuracyData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.attempt))
      .attr('cy', d => yScale(d.accuracy))
      .attr('r', 4)
      .attr('fill', '#2196F3')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 6);
        
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
        
        tooltip.html(`Game #${d.attempt}<br/>Avg Performance: ${d.accuracy.toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4);
        d3.selectAll('.tooltip').remove();
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .style('font-weight', 'bold')
      .text('Game Attempt');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d + '%'))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .style('font-weight', 'bold')
      .text('Average Performance');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('Performance Trend Over Time');

  }, [data, width, height]);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd', borderRadius: '8px' }}></svg>
    </div>
  );
}

export default AccuracyChart;
