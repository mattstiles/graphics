// Global vars
var pymChild = null;
var isMobile = false;

var x_ticks = [];

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        formatData();

        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
    DATA.forEach(function(d) {
        d['amt'] = +d['amt'];
        d['date'] = d3.time.format("%m/%d/%y").parse(d['date']);
		
        if (d['date'].getDate() === 1 || d['date'].getDate() === 1) {
            x_ticks.push(d['date']);
        }
    });
}

/*
 * Render the graphic(s). Called by pym with the container width.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Render the chart!
    renderColumnChart({
        container: '#column-chart',
        width: containerWidth,
        data: DATA
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a column chart.
 */
var renderColumnChart = function(config) {
    /*
     * Setup chart container.
     */
    var labelColumn = 'date';
    var valueColumn = 'amt';
	var dateClass = 'date-label';

    var aspectWidth = isMobile ? 4 : 16;
    var aspectHeight = isMobile ? 3 : 9;
    var valueGap = 0;

    var margins = {
        top: 20,
        right: 15,
        bottom: 20,
        left: 40
    };

    var ticksY = 5;
    var roundTicksFactor = 1;

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

    /*
     * Create D3 scale objects.
     */
    var xScale = d3.scale.ordinal()
        .rangeBands([0, chartWidth],0)
        .domain(config['data'].map(function (d) {
            return d[labelColumn];
        }));

    var min = d3.min(config['data'], function(d) {
        return Math.floor(d[valueColumn] / roundTicksFactor) * roundTicksFactor;
    });

    if (min > 0) {
        min = 0;
    }

    var max = d3.max(config['data'], function(d) {
        return Math.ceil(d[valueColumn] / roundTicksFactor) * roundTicksFactor;
    });

    var yScale = d3.scale.linear()
        .domain([min, max])
        .range([chartHeight, 0]);

 /*
     * Create D3 axes.
     */
    var chart_x_ticks = x_ticks;
    if (isMobile) {
        chart_x_ticks = [ x_ticks[0], x_ticks[6], x_ticks[11] ];
    }
	
    var xAxis = d3.svg.axis()
        .scale(xScale)
		.orient('bottom')
		.tickValues(chart_x_ticks)
        .tickFormat(function(d) {
            return fmtMonthAbbrev(d);
        })
		
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY)
        .tickFormat(function(d) {
            return fmtComma(d);
        });

    /*
     * Render axes to chart.
     */
    chartElement.append('g')
        .attr('class', 'x axis')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxis);

    chartElement.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    /*
     * Render grid to chart.
     */
    var yAxisGrid = function() {
        return yAxis;
    };

    chartElement.append('g')
        .attr('class', 'y grid')
        .call(yAxisGrid()
            .tickSize(-chartWidth, 0)
            .tickFormat('')
        );
		
	    /*
	     * Render highlighted time periods
	     */
	    var bar_w = (chartWidth / config['data'].length) > 2 ? (chartWidth / config['data'].length): (chartWidth / config['data'].length);
		
	    highlight_g = chartElement.append('g')
	        .attr('class', 'highlights');

	    var average_label = d3.time.format('%m/%d/%y').parse('08/04/16')
			julyfourth_label = d3.time.format('%m/%d/%y').parse('07/04/16'),
			julyfourth_start = d3.time.format('%m/%d/%y').parse('07/04/16'),
	        julyfourth_end = d3.time.format('%m/%d/%y').parse('07/04/16'),
			valentines_label = d3.time.format('%m/%d/%y').parse('02/14/16'),
			valentines_start = d3.time.format('%m/%d/%y').parse('02/14/16'),
	        valentines_end = d3.time.format('%m/%d/%y').parse('02/14/16'),
			halloween_label = d3.time.format('%m/%d/%y').parse('10/31/16'),
			halloween_start = d3.time.format('%m/%d/%y').parse('10/31/16'),
	        halloween_end = d3.time.format('%m/%d/%y').parse('10/31/16'),
			thanksgiving_start = d3.time.format('%m/%d/%y').parse('11/24/16'),
	        thanksgiving_end = d3.time.format('%m/%d/%y').parse('11/24/16'),
			thanksgiving_label = d3.time.format('%m/%d/%y').parse('11/22/16'),
			christmas_start = d3.time.format('%m/%d/%y').parse('12/25/16'),
	        christmas_end = d3.time.format('%m/%d/%y').parse('12/25/16'),
			christmas_label = d3.time.format('%m/%d/%y').parse('12/25/16');	
			
	    // thanksgiving
		highlight_g.append('rect')
	        .attr('height', chartHeight)
	        .attr('width', xScale(thanksgiving_end) - xScale(thanksgiving_start) + bar_w)
	        .attr('transform', 'translate(' + xScale(thanksgiving_start) + ',0)');

	    highlight_g.append('text')
	        .attr('class', 'highlight-label label-thanksgiving')
	        .text(' ')
        	.attr('text-anchor', 'middle')
	        .attr('x', xScale(thanksgiving_label))
	        .attr('y', yScale(12400))
        	.html(LABELS['annotation_label-thanksgiving']);
			
	   // christmas
		highlight_g.append('rect')
	        .attr('height', chartHeight)
	        .attr('width', xScale(christmas_end) - xScale(christmas_start) + bar_w)
	        .attr('transform', 'translate(' + xScale(christmas_start) + ',0)');

	    highlight_g.append('text')
	        .attr('class', 'highlight-label label-christmas')
	        .text(' ')
        	.attr('text-anchor', 'middle')
	        .attr('x', xScale(christmas_label))
	        .attr('y', yScale(12400))
        	.html(LABELS['annotation_label-christmas']);
			
	   // july4th
		highlight_g.append('rect')
	        .attr('height', chartHeight)
	        .attr('width', xScale(julyfourth_end) - xScale(julyfourth_start) + bar_w)
	        .attr('transform', 'translate(' + xScale(julyfourth_start) + ',0)');
			
	    highlight_g.append('text')
	        .attr('class', 'highlight-label label-julyfourth')
	        .text(' ')
        	.attr('text-anchor', 'middle')
	        .attr('x', xScale(julyfourth_label))
	        .attr('y', yScale(12400))
        	.html(LABELS['annotation_label-julyfourth']);
			
	   // valentines
		highlight_g.append('rect')
	        .attr('height', chartHeight)
	        .attr('width', xScale(valentines_end) - xScale(valentines_start) + bar_w)
	        .attr('transform', 'translate(' + xScale(valentines_start) + ',0)');
			
	    highlight_g.append('text')
	        .attr('class', 'highlight-label label-valentines')
	        .text(' ')
        	.attr('text-anchor', 'middle')
	        .attr('x', xScale(valentines_label))
	        .attr('y', yScale(12400))
        	.html(LABELS['annotation_label-valentines']);
			
	   // halloween
		highlight_g.append('rect')
	        .attr('height', chartHeight)
	        .attr('width', xScale(halloween_end) - xScale(halloween_start) + bar_w)
	        .attr('transform', 'translate(' + xScale(halloween_start) + ',0)');
			
	    highlight_g.append('text')
	        .attr('class', 'highlight-label label-halloween')
	        .text(' ')
        	.attr('text-anchor', 'middle')
	        .attr('x', xScale(halloween_label))
	        .attr('y', yScale(12400))
        	.html(LABELS['annotation_label-halloween']);

    /*
     * Render bars to chart.
     */
    chartElement.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
        .data(config['data'])
        .enter()
        .append('rect')
            .attr('x', function(d) {
				return xScale(d[labelColumn]);
            })
            .attr('y', function(d) {
                if (d[valueColumn] < 0) {
                    return yScale(0);
                }

                return yScale(d[valueColumn]);
            })
			.attr('width', Math.round(xScale.rangeBand()))
            .attr('height', function(d) {
                if (d[valueColumn] < 0) {
                    return yScale(d[valueColumn]) - yScale(0);
                }

                return yScale(0) - yScale(d[valueColumn]);
            })
            .attr('class', function(d) {
                return 'bar-' + classify(d[dateClass]);
            });

    /*
     * Render 0 value line.
     */
    if (min < 0) {
        chartElement.append('line')
            .attr('class', 'zero-line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(0))
            .attr('y2', yScale(0));
    }
		
    chartElement.append('line')
        .attr('class', 'avg-line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', yScale(11131))
        .attr('y2', yScale(11131));
		
    chartElement.append('text')
        .attr('class', 'highlight-label label-average')
        .text(' ')
    	.attr('text-anchor', 'middle')
        .attr('x', xScale(average_label))
        .attr('y', yScale(10720))
    	.html(LABELS['annotation_label-average']);
		
	    

    /*
     * Render bar values.
    
    chartElement.append('g')
        .attr('class', 'value')
        .selectAll('text')
        .data(config['data'])
        .enter()
        .append('text')
            .text(function(d) {
                return d[valueColumn].toLocaleString();
            })
            .attr('x', function(d, i) {
                return xScale(d[labelColumn]) + (xScale.rangeBand() / 2);
            })
            .attr('y', function(d) {
                return yScale(d[valueColumn]);
            })
            .attr('dy', function(d) {
                var textHeight = d3.select(this).node().getBBox().height;
                var barHeight = 0;

                if (d[valueColumn] < 0) {
                    barHeight = yScale(d[valueColumn]) - yScale(0);

                    if (textHeight + valueGap * 2 < barHeight) {
                        d3.select(this).classed('in', true);
                        return -(textHeight - valueGap / 2);
                    } else {
                        d3.select(this).classed('out', true)
                        return textHeight + valueGap;
                    }
                } else {
                    barHeight = yScale(0) - yScale(d[valueColumn]);

                    if (textHeight + valueGap * 2 < barHeight) {
                        d3.select(this).classed('in', true)
                        return textHeight + valueGap;
                    } else {
                        d3.select(this).classed('out', true)
                        return -(textHeight - valueGap / 2);
                    }
                }
            })
            .attr('text-anchor', 'middle')
	 */
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
