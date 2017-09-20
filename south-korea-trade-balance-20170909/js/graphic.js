// Global vars
var pymChild = null;
var isMobile = false;
var charts = [];

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

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });
}

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
    DATA.forEach(function(d) {
        for (var key in d) {
            if (key == 'label') {
                d['label'] = d3.time.format('%Y').parse(d['label']);
            } else if (d[key] != null) {
                d[key] = +d[key];
            }
        }
    });

    charts = d3.keys(DATA[0]).filter(function(d) {
        return d != 'label';
    });
}

/*
 * Render the graphic(s). Called by pym with the container width.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    var graphicWidth = null;
    var gutterWidth = 10;
    var numCols = null;

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
        numCols = 1;
    } else {
        isMobile = false;
        numCols = 4;
    }

    graphicWidth = Math.floor((containerWidth - ((numCols - 1) * gutterWidth)) / numCols);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select('#column-chart');
    containerElement.html('');

    charts.forEach(function(d,i) {
        var chartElement = containerElement.append('div')
            .attr('class', 'chart ' + classify(d));

        if (numCols > 1) {
            chartElement.attr('style', function() {
                var s = '';
                s += 'width: ' + graphicWidth + 'px; ';
                s += 'float: left; ';
                if (i % numCols > 0) {
                    s += 'margin-left: ' + gutterWidth + 'px; ';
                }
                return s;
            });
        }

        // Render the chart!
        renderColumnChart({
            container: '.chart.' + classify(d),
            width: graphicWidth,
            data: DATA,
            dataColumn: d,
            title: d,
            yDomain: [ -100, 100 ]
        });
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
    var labelColumn = 'label';
    var valueColumn = config['dataColumn'];

    var aspectWidth = 4;
    var aspectHeight = 3;
    var valueGap = 6;

    var margins = {
        top: 5,
        right: 5,
        bottom: 20,
        left: 35
    };

    var ticksY = 4;
    var ticksX = 4;
    var roundTicksFactor = 10;

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    // containerElement.html('');

    containerElement.append('h3')
        .text(config['title']);

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
        .rangeRoundBands([0, chartWidth], .1)
        .domain(config['data'].map(function (d) {
            return d[labelColumn];
        }));

    var min = config['yDomain'][0];
    var max = config['yDomain'][1];

    var yScale = d3.scale.linear()
        .domain([ min, max ])
        .range([ chartHeight, 0 ]);

    /*
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(function(d, i) {
            if (isMobile) {
                return fmtYearAbbrev(d);
            } else {
                return '\u2019' + fmtYearAbbrev(d);
            }
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY)
        .tickFormat(function(d) {
            return d + "%";
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

// annotation

    var average = d3.time.format('%Y').parse('2000')


    highlight_g = chartElement.append('g')
    .attr('class', 'highlights');

    // highlight_g.append('text')
    // .attr('class', 'highlight-label')
    // .text(' ')
    // .attr('text-anchor', 'begin')
    // .attr('x', xScale(average))
    // .attr('y', yScale(11))
    // .html(LABELS['annotation_average']);

    highlight_g.append('text')
    .attr('class', 'highlight-label-high')
    .text(' ')
    .attr('text-anchor', 'begin')
    .attr('x', xScale(average))
    .attr('y', yScale(80))
    .html(LABELS['annotation_high']);

    highlight_g.append('text')
    .attr('class', 'highlight-label-low')
    .text(' ')
    .attr('text-anchor', 'begin')
    .attr('x', xScale(average))
    .attr('y', yScale(-85))
    .html(LABELS['annotation_low']);

// // average line

//         chartElement.append('line')
//             .attr('class', 'avgline')
//             .attr('y1', yScale(2.8))
//             .attr('y2', yScale(2.8))
//             .attr('x1', 0)
//             .attr('x2', chartWidth);

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
            .attr('width', xScale.rangeBand())
            .attr('height', function(d) {
                if (d[valueColumn] < 0) {
                    return yScale(d[valueColumn]) - yScale(0);
                }

                return yScale(0) - yScale(d[valueColumn]);
            })
            .attr('class', function(d) {
                if (d[valueColumn] < 0) {
                    return 'bar bar-negative ' + d[labelColumn];
                }
                else {
                    return 'bar bar-positive ' + d[labelColumn];
                }
                
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

    /*
     * Render bar values.
     */
    chartElement.append('g')
        .attr('class', 'value')
        .selectAll('text')
        .data(config['data'])
        .enter()
        .append('text')
            .text(function(d) {
                return d[valueColumn].toFixed(0) + "%";
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
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;