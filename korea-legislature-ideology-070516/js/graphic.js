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
        d['public'] = +d['public'];
        d['saenuri'] = +d['saenuri'];
        d['minjoo'] = +d['minjoo'];
        d['justice'] = +d['justice'];
        d['peoples'] = +d['peoples'];

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
    //value
	var publicColumn = 'public';
    //min/
	var saenuriColumn = 'saenuri';
    //max
	var minjooColumn = 'minjoo';
	
	var peoplesColumn = 'peoples'

	var justiceColumn = 'justice'

    var barHeight = 20;
    var barGap = 5;
    var labelWidth = 80;
    var labelMargin = 10;
    var valueMinWidth = 30;
    var dotRadius = 5;

    var margins = {
        top: 30,
        right: 20,
        bottom: 20,
        left: (labelWidth + labelMargin + 10)
    };

    var ticksX = 6;
    var roundTicksFactor = 5;

    if (isMobile) {
        ticksX = 6;
        margins['right'] = 5;
		margins['top'] = 20;
		dotRadius = 3;
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
    var min = 2;
    var max = 7;
	
    // var max = d3.max(config['data'], function(d) {
//         return Math.ceil(d[publicColumn] / roundTicksFactor) * roundTicksFactor;
//     });

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
            return d;
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
     * Render range bars to chart.
     */
    chartElement.append('g')
        .attr('class', 'bars')
        .selectAll('line')
        .data(config['data'])
        .enter()
        .append('line')
            .attr('x1', function(d, i) {
                return xScale(d[saenuriColumn]);
            })
            .attr('x2', function(d, i) {
                return xScale(d[minjooColumn]);
            })
            .attr('y1', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('y2', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            });

    /*
     * Render dots to chart.
     */
			
    //public
	chartElement.append('g')
        .attr('class', 'dots')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[publicColumn]);
            })
            .attr('cy', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('r', dotRadius)
			
    // saenuri
	chartElement.append('g')
        .attr('class', 'dots-saenuri')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[saenuriColumn]);
            })
            .attr('cy', function(d, i) {
                return i * (barHeight + barGap) + (barHeight / 2);
            })
            .attr('r', dotRadius)
			
    // //justice
// 	chartElement.append('g')
//         .attr('class', 'dots-justice')
//         .selectAll('circle')
//         .data(config['data'])
//         .enter().append('circle')
//             .attr('cx', function(d, i) {
//                 return xScale(d[justiceColumn]);
//             })
//             .attr('cy', function(d, i) {
//                 return i * (barHeight + barGap) + (barHeight / 2);
//             })
//             .attr('r', dotRadius)
//
//     //people's
// 	chartElement.append('g')
//         .attr('class', 'dots-peoples')
//         .selectAll('circle')
//         .data(config['data'])
//         .enter().append('circle')
//             .attr('cx', function(d, i) {
//                 return xScale(d[peoplesColumn]);
//             })
//             .attr('cy', function(d, i) {
//                 return i * (barHeight + barGap) + (barHeight / 2);
//             })
//             .attr('r', dotRadius)
    
	//minjoo
	chartElement.append('g')
        .attr('class', 'dots-minjoo')
        .selectAll('circle')
        .data(config['data'])
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d[minjooColumn]);
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

    /*
     * Render bar values.
     */
    
	// // justice
//     _.each(['shadow', 'value'], function(cls) {
//         chartElement.append('g')
//             .attr('class', cls)
//             .selectAll('text')
//             .data(config['data'])
//             .enter().append('text')
//                 .attr('x', function(d, i) {
//                     return xScale(d[justiceColumn]) - 25;
//                 })
//                 .attr('y', function(d,i) {
//                     return i * (barHeight + barGap) + (barHeight / 2) + 3;
//                 })
//                 .text(function(d) {
//                     return d[justiceColumn].toFixed(1) + '';
//                 });
//     });
//
// 	// peoples
//     _.each(['shadow', 'value'], function(cls) {
//         chartElement.append('g')
//             .attr('class', cls)
//             .selectAll('text')
//             .data(config['data'])
//             .enter().append('text')
//                 .attr('x', function(d, i) {
//                     return xScale(d[peoplesColumn]) - 25;
//                 })
//                 .attr('y', function(d,i) {
//                     return i * (barHeight + barGap) + (barHeight / 2) + 3;
//                 })
//                 .text(function(d) {
//                     return d[peoplesColumn].toFixed(1) + '';
//                 });
//     });
	
	// minjoo
	_.each(['shadow', 'value'], function(cls) {
        chartElement.append('g')
            .attr('class', cls)
            .selectAll('text')
            .data(config['data'])
            .enter().append('text')
                .attr('x', function(d, i) {
                    return xScale(d[minjooColumn]) - 25;
                })
                .attr('y', function(d,i) {
                    return i * (barHeight + barGap) + (barHeight / 2) + 3;
                })
                .text(function(d) {
                    return d[minjooColumn].toFixed(1) + '';
                });
    });
	
    // saenuri
	_.each(['shadow', 'value'], function(cls) {
        chartElement.append('g')
            .attr('class', cls)
            .selectAll('text')
            .data(config['data'])
            .enter().append('text')
                .attr('x', function(d, i) {
                    return xScale(d[saenuriColumn]) + 8;
                })
                .attr('y', function(d,i) {
                    return i * (barHeight + barGap) + (barHeight / 2) + 3;
                })
                .text(function(d) {
                    return d[saenuriColumn].toFixed(1) + '';
                });
    });
	
    // public
	_.each(['shadow', 'value'], function(cls) {
        chartElement.append('g')
            .attr('class', cls)
            .selectAll('text')
            .data(config['data'])
            .enter().append('text')
                .attr('x', function(d, i) {
                    return xScale(d[publicColumn]) - 25;
                })
                .attr('y', function(d,i) {
                    return i * (barHeight + barGap) + (barHeight / 2) + 3;
                })
                .text(function(d) {
                    return d[publicColumn].toFixed(1) + '';
                });
    });
	
 var annotations = chartElement.append('g')
    .attr('class', 'annotations');

	annotations.append('text')
	    .attr('class', 'label-top')
	    .attr('x', xScale(3))
	    .attr('dx', 0)
	    .attr('text-anchor', 'middle')
	    .attr('y', -10)
	    .html(LABELS['annotation_liberal'])
	
	annotations.append('text')
	    .attr('class', 'label-top')
	    .attr('x', xScale(4.5))
	    .attr('dx', 0)
	    .attr('text-anchor', 'middle')
	    .attr('y', -10)
	    .html(LABELS['annotation_moderate'])

	annotations.append('text')
	    .attr('class', 'label-top')
	    .attr('x', xScale(6))
	    .attr('dx', 10)
	    .attr('text-anchor', 'middle')
	    .attr('y', -10)
	    .html(LABELS['annotation_conservative'])
	
	chartElement.append('line')
        .attr('class', 'leg-avg-line')
        .attr('x1', xScale(3.9))
        .attr('x2', xScale(3.9))
        .attr('y1', chartHeight)
        .attr('y2', 0)
	
	annotations.append('text')
	    .attr('class', 'label-top-avg')
	    .attr('x', xScale(3.9))
	    .attr('dx', 0)
	    .attr('text-anchor', 'end')
	    .attr('y', 26.5)
	    .html(LABELS['annotation_avg'])
	
	
var ideologyRanges = chartElement.append('g')
    .attr('class', 'ideology-ranges');

ideologyRanges.append('rect')
    .attr('class', 'liberal')
    .attr('x', xScale(2))
    .attr('y', 0)
    .attr('width', xScale(4))
    .attr('height', chartHeight);

ideologyRanges.append('rect')
    .attr('class', 'conservative')
    .attr('x', xScale(5))
    .attr('y', 0)
    .attr('width', xScale(4))
    .attr('height', chartHeight);

ideologyRanges.append('rect')
    .attr('class', 'moderate')
    .attr('x', xScale(4))
    .attr('y', 0)
    .attr('width', xScale(3))
    .attr('height', chartHeight);
	

	
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
