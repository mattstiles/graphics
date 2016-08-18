// Global vars
var pymChild = null;
var isMobile = false;

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
        d['avg'] = +d['avg'];
        d['women'] = +d['women'];
        d['men'] = +d['men'];
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
    renderDotChart({
        container: '#dot-chart',
        width: containerWidth,
        data: DATA
	    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a bar chart.
 */
var renderDotChart = function(config) {
    /*
     * Setup
     */
    var labelColumn = 'label';
    var valueColumn = 'avg';
    var womenColumn = 'women';
    var menColumn = 'men';

    var barHeight = 20;
    var barGap = 5;
    var labelWidth = 80;
    var labelMargin = 10;
    var valueMinWidth = 30;
    var dotRadius = 5;

    var margins = {
        top: 30,
        right: 40,
        bottom: 20,
        left: (labelWidth + labelMargin)
    };

    var ticksX = 4;
    var roundTicksFactor = 5;

    if (isMobile) {
        ticksX = 6;
        margins['right'] = 20;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = ((barHeight + barGap) * config['data'].length);

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
    var min = 0;
    var max = d3.max(config['data'], function(d) {
        return Math.ceil(d[menColumn] / roundTicksFactor) * roundTicksFactor;
    });

    var xScale = d3.scale.linear()
        .domain([min, max])
        .range([0, chartWidth]);

    /*
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d) {
            return d + ' grams';
        });

    /*
     * Render axes to chart.
     */
    chartElement.append('g')
        .attr('class', 'x axis')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxis);

    /*
     * Render grid to chart.
     */
    var xAxisGrid = function() {
        return xAxis;
    };

    chartElement.append('g')
        .attr('class', 'x grid')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxisGrid()
            .tickSize(-chartHeight, 0, 0)
            .tickFormat('')
        );

    /*
     * Render annotations to chart.
     */

     var annotations = chartElement.append('g')
        .attr('class', 'annotations');

    annotations.append('text')
        .attr('class', 'label-top')
        .attr('x', xScale(32.1))
        .attr('dx', -20)
        .attr('text-anchor', 'end')
        .attr('y', -20)
        .html(LABELS['annotation_less'])

    annotations.append('text')
        .attr('class', 'label-top')
        .attr('x', xScale(32.1))
        .attr('dx', 20)
        .attr('text-anchor', 'beginning')
        .attr('y', -20)
        .html(LABELS['annotation_more'])
		
    annotations.append('text')
        .attr('class', 'label-top-avg')
        .attr('x', xScale(32.1))
        .attr('dx', 0)
        .attr('text-anchor', 'middle')
        .attr('y', -3)
        .html(LABELS['annotation_avg'])
		
    chartElement.append('line')
        .attr('class', 'avg-line')
        .attr('x1', xScale(32.1))
        .attr('x2', xScale(32.1))
        .attr('y1', chartHeight)
        .attr('y2', 5)
		
    /*
     * Render zero line to chart.
     */

     chartElement.append('line')
        .attr('class', 'x grid grid-0')
        .attr('x1', xScale(0))
        .attr('x2', xScale(0))
        .attr('y1', 0)
        .attr('y2', chartHeight);
	
	/*
     * Render range bars to chart.
     */
    chartElement.append('g')
        .attr('class', 'bars')
        .selectAll('line')
        .data(config['data'])
        .enter()
        .append('line')
            .attr('x1', function(d, i) {
                return xScale(d[womenColumn]);
            })
            .attr('x2', function(d, i) {
                return xScale(d[menColumn]);
            })
            .attr('y1', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('y2', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            });

    /*
     * Render avg dots to chart.
     */
    chartElement.append('g')
        .attr('class', 'dots avg')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[valueColumn]);
            })
            .attr('cy', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('r', dotRadius)
			
    /*
     * Render gender dots to chart.
     */
    chartElement.append('g')
        .attr('class', 'dots women')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[womenColumn]);
            })
            .attr('cy', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('r', dotRadius)

    chartElement.append('g')
        .attr('class', 'dots men')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[menColumn]);
            })
            .attr('cy', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('r', dotRadius)

    /*
     * Render bar labels.
     */
    containerElement
        .append('ul')
        .attr('class', 'labels')
        .attr('style', formatStyle({
            'width': labelWidth + 'px',
            'top': margins['top'] + 'px',
            'left': '0'
        }))
        .selectAll('li')
        .data(config['data'])
        .enter()
        .append('li')
            .attr('style', function(d, i) {
                return formatStyle({
                    'width': labelWidth + 'px',
                    'height': barHeight + 'px',
                    'left': '0px',
                    'top': (i * (barHeight + barGap)) + 'px;'
                });
            })
            .attr('class', function(d) {
                return classify(d[labelColumn]);
            })
            .append('span')
                .text(function(d) {
                    return d[labelColumn];
                });

/* Render gender labels 
*/

    _.each(['shadow', 'value'], function(cls) {
        chartElement.append('g')
            .attr('class', cls + ' women')
            .selectAll('text')
            .data(config['data'])
            .enter().append('text')
                .attr('x', function(d, i) {
                    if (d[womenColumn] > d[menColumn]) {
                        return xScale(d[womenColumn]) + 8;
                    } else {
                        return xScale(d[womenColumn]) - 8;
                    }
                })
                .attr('y', function(d,i) {
                    return i * (barHeight + barGap) + (barHeight / 2) + 3;
                })
                .attr('text-anchor', function(d, i) {
                    if (d[womenColumn] > d[menColumn]) {
                        return 'begin';
                    } else {
                        return 'end';
                    }
                })
                .text(function(d, i) {
                    var val = Math.abs(d[womenColumn].toFixed(0));
                    if (i == 0) {
                        if (d[womenColumn] > d[menColumn]) {
                            val = val + ' grams - Women';
                        } else {
                            val = 'Women: ' + val;
                        }
                    }
                    return val;
                });
    });

    _.each(['shadow', 'value'], function(cls) {
        chartElement.append('g')
            .attr('class', cls + ' men')
            .selectAll('text')
            .data(config['data'])
            .enter().append('text')
                .attr('x', function(d, i) {
                    if (d[menColumn] > d[womenColumn]) {
                        return xScale(d[menColumn]) + 8;
                    } else if (d[menColumn] == d [womenColumn]) {
                            return xScale(d[womenColumn]) + 14;
                    } else {
                        return xScale(d[menColumn]) - 8;
                    }
                })
                .attr('y', function(d,i) {
                    return i * (barHeight + barGap) + (barHeight / 2) + 3;
                })
                .attr('text-anchor', function(d, i) {
                    if (d[menColumn] > d[womenColumn]) {
                        return 'begin';
                    } else {
                        return 'end';
                    }
                })
                .text(function(d, i) {
                    var val = Math.abs(d[menColumn].toFixed(0));
                    if (i == 0) {
                        if (d[menColumn] > d[womenColumn]) {
                            val = 'Men: ' + val;
                        } else {
                            val = 'Men: ' + val + ' grams/day';
                        }
                    }
                    return val;
                });
    });
}



/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
