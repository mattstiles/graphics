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

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
    DATA.forEach(function(d) {
        d['date'] = d3.time.format('%m/%d/%y').parse(d['date']);
        d['values'] = [];
        d['total'] = d['max'] - d['min'];

        if (d['date'].getDate() === 1 || d['date'].getDate() === 1) {
            x_ticks.push(d['date']);
        }

        // Air quality thresholds (adjusted for AQI?)
        var thresholds = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40];
        var th_labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        var lower = parseFloat(d['min']);

        for (var i=0; i<thresholds.length; i++) {
            var th = thresholds[i];
            var y0 = lower;
            var min = parseFloat(d['min']);
            var max = parseFloat(d['max']);

            if (isNaN(min)) {
                y0 = 0;
                y1 = 0;
                lower = 0;
            } else if (th < min) {
                y1 = min;
                lower = min;
            } else if (th < max) {
                y1 = th;
                lower = th;
            } else {
                y1 = max;
                lower = max;
            }

            d['values'].push({
                'name': th_labels[i],
                'y0': y0,
                'y1': y1,
                'val': y1 - y0,
                'avgmin': !isNaN(d['avgmin']) ? d['avgmin'] : null,
				'avgmax': !isNaN(d['avgmax']) ? d['avgmax'] : null
	            })
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
    renderStackedColumnChart({
        container: '#stacked-column-chart',
        width: containerWidth,
        data: DATA
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a stacked column chart.
 */
var renderStackedColumnChart = function(config) {
    /*
     * Setup
     */
    var labelColumn = 'date';
	
    var aspectWidth = 16;
    var aspectHeight = 9;

    var margins = {
        top: 5,
        right: 60,
        bottom: 20,
        left: 40
    };

    var ticksY = 10;
    var roundTicksFactor = 10;

    if (isMobile) {
        margins['left'] = 30;
        margins['right'] = 50;
        aspectWidth = 4;
        aspectHeight = 3;
    }

    // Calculate actual chart dimensions
    // var chartWidth = Math.floor((config['width'] - margins['left'] - margins['right']) / (config['data'].length + 1)) * (config['data'].length + 1);
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    if (chartHeight > 350) {
        chartHeight = 350;
    }

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create D3 scale objects.
     */
    var xScale = d3.time.scale()
        .domain(d3.extent(config['data'], function(d) {
            return d['date'];
        }))
        .range([ 0, chartWidth ]);

    var min = d3.min(config['data'], function(d) {
        return Math.floor(d['min'] / roundTicksFactor) * roundTicksFactor;
    });

    if (min > 0) {
        min = 0;
    }

    var max = d3.max(config['data'], function(d) {
        return Math.ceil(d['max'] / roundTicksFactor) * roundTicksFactor;
    });

    var yScale = d3.scale.linear()
        .domain([min, max])
        .rangeRound([chartHeight, 0]);
		
	// Thanks, ColorBrewer: http://colorbrewer2.org/#type=diverging&scheme=Spectral&n=11

    var colorScale = d3.scale.ordinal()
        .domain(config['data'][0]['values'].map(function(d) { return d['name']; }))
        .range(['#362e5e','#5e4fa2', '#3288bd', '#66c2a5', '#e6f598', '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142']);

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
            .attr('transform', makeTranslate(margins['left'], margins['top']));

    /*
     * Create D3 axes.
     */
    var chart_x_ticks = x_ticks;
    // if (isMobile) {
//         chart_x_ticks = [ x_ticks[0], x_ticks[3], x_ticks[6], x_ticks[9] ];
//     }

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickValues(chart_x_ticks)
        .tickFormat(function(d, i) {
            if (isMobile) {
                return fmtMonthAbbr(d);
            } else {
                return formatAPDates(d);
            }
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY)
        .tickFormat(function(d) {
            return fmtComma(d) + '°C';
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
        .call(yAxis);
		
    /*
     * Render highlighted time periods
     */
    
	    var bar_w = (chartWidth / config['data'].length) > 2 ? (chartWidth / config['data'].length): (chartWidth / config['data'].length);
	    highlight_g = chartElement.append('g')
	        .attr('class', 'highlights');

	    var jan_start = d3.time.format('%m/%d/%y').parse('1/1/16'),
	        jan_end = d3.time.format('%m/%d/%y').parse('1/1/16'),
	        aug_start = d3.time.format('%m/%d/%y').parse('8/1/16'),
	        aug_end = d3.time.format('%m/%d/%y').parse('8/16/16'),
			aug_label = d3.time.format('%m/%d/%y').parse('8/9/16'),
			f_label = d3.time.format('%m/%d/%y').parse('1/10/16');
			
			
	    highlight_g.append('rect')
	        .attr('height', chartHeight)
	        .attr('width', xScale(aug_end) - xScale(aug_start) + bar_w)
	        .attr('transform', 'translate(' + xScale(aug_start) + ',0)');

	    highlight_g.append('text')
	        .attr('class', 'highlight-label label-aug')
	        .text(' ')
        	.attr('text-anchor', 'middle')
	        .attr('x', xScale(aug_label))
	        .attr('y', yScale(37))
        	.html(LABELS['annotation_label-aug']);
			

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
     * Render bars to chart.
     */
    var bars = chartElement.selectAll('.bar')
        .data(config['data'])
        .enter().append('g')
            .attr('class', 'bar')
            .attr('transform', function(d) {
                return makeTranslate(xScale(d[labelColumn]), 0);
            });

    bars.selectAll('rect')
        .data(function(d) {
            return d['values'];
        })
        .enter().append('rect')
            .attr('y', function(d) {
                if (d['y1'] < d['y0']) {
                    return yScale(d['y0']);
                }

                return yScale(d['y1']);
            })
            .attr('width', bar_w + .1)
            .attr('height', function(d) {
                return Math.abs(yScale(d['y0']) - yScale(d['y1']));
            })
            .style('fill', function(d) {
                return colorScale(d['name']);
            })
            .attr('class', function(d) {
                return classify(d['name']);
            });
			
	    // Render average high temp line
 
			var line = d3.svg.line()
	        .interpolate('step-after')
	        .defined(function(d) {
	            return d['avgmax'] != null;
	        })
	        .x(function(d) {
	            return xScale(d[labelColumn]);
	        })
	        .y(function(d) {
	            return yScale(d['avgmax']);
	        });

	    var line_data = config['data'];

	    chartElement.append('g')
	        .attr('class', 'lines')
	        .selectAll('path')
	        .data([line_data])
	        .enter()
	        .append('path')
	            .attr('class', function(d, i) {
	                return 'line-avgmax';
	            })
	            .attr('d', function(d) {
	                return line(d);
	            });
				
	    // Render average low temp line

			var line = d3.svg.line()
	        .interpolate('step-after')
	        .defined(function(d) {
	            return d['avgmin'] != null;
	        })
	        .x(function(d) {
	            return xScale(d[labelColumn]);
	        })
	        .y(function(d) {
	            return yScale(d['avgmin']);
	        });

	    var line_data = config['data'];

	    chartElement.append('g')
	        .attr('class', 'lines')
	        .selectAll('path')
	        .data([line_data])
	        .enter()
	        .append('path')
	            .attr('class', function(d, i) {
	                return 'line-avgmin';
	            })
	            .attr('d', function(d) {
	                return line(d);
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
            .attr('class', 'f-line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(32.2))
            .attr('y2', yScale(32.2));
			
	chartElement.append('text')
        .attr('class', 'f-label')
        .attr('x', xScale(f_label))
        .attr('dx', 0)
        .attr('text-anchor', 'begin')
        .attr('y', yScale(32.6))
        .html(LABELS['annotation_f-label'])
			
	chartElement.append('text')
        .attr('class', 'avgmax-label-temp')
        .attr('x', chartWidth + 8)
        .attr('dx', 0)
        .attr('text-anchor', 'begin')
        .attr('y', yScale(25.5))
        .html(LABELS['annotation_avgmax-label-temp'])
			
	chartElement.append('text')
        .attr('class', 'avgmin-label-temp')
        .attr('x', chartWidth + 8)
        .attr('dx', 0)
        .attr('text-anchor', 'begin')
        .attr('y', yScale(16.5))
        .html(LABELS['annotation_avgmin-label-temp'])
    
}


var formatAPDates = function(d) {
    var AP_MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

    return AP_MONTHS[d.getMonth()] + ' ' + d.getDate();
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
