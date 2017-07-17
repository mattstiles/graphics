// Global vars
var pymChild = null;
var isMobile = false;
var dataSeries = [];

/*
 * Initialize graphic
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
        d['date'] = d3.time.format('%Y').parse(d['date']);

        for (var key in d) {
            if (key != 'date' && d[key] != null && d[key].length > 0) {
                d[key] = +d[key];
            }
        }
    });

    /*
     * Restructure tabular data for easier charting.
     */
    for (var column in DATA[0]) {
        if (column == 'date') {
            continue;
        }

        dataSeries.push({
            'name': column,
            'values': DATA.map(function(d) {
                return {
                    'date': d['date'],
                    'avg': d['avg'],
                    'amt': d[column]
                };
    // filter out empty data. uncomment this if you have inconsistent data.
           }).filter(function(d) {
               return d['amt'] != null;
            })
        });
    }
}


/*
 * Render the graphic(s). Called by pym with the container width.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    var axisWidth = 32;
    var gutterWidth = 15;
    var numCols = null;

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
        numCols = 2;
    } else {
        isMobile = false;
        numCols = 5;
    }
    var graphicWidth = Math.floor((containerWidth - axisWidth - (gutterWidth * (numCols - 1))) / numCols)

    var containerElement = d3.select('#line-chart');
    containerElement.html('');

    dataSeries.forEach(function(v,k) {
        var chartId = 'chart-' + classify(v['name']);
        var showAxisLabels = k === 0 || k === 5 || k === 10 || k === 15 || k === 20 || k === 25 || k === 30 || k === 35 || k === 40 || k === 45 || k === 50 || isMobile && k & 2 === 1;
        var aspectWidth = isMobile ? 1 : 1;
        var aspectHeight = isMobile ? 1 : 1;

        var chartWidth = graphicWidth;
        var chartHeight = Math.ceil((chartWidth * aspectHeight) / aspectWidth);

        if (showAxisLabels) {
            chartWidth += axisWidth;
        }

        containerElement.append('div')
            .attr('class', 'chart')
            .attr('id', chartId)
            .attr('style', function() {
                var s = '';
                s += 'width: ' + chartWidth + 'px; ';
                if (!showAxisLabels) {
                    s += 'margin-left: ' + gutterWidth + 'px; ';
                }
                return s;
            });
        
        // Render the chart!
        renderLineChart({
            container: '#' + chartId,
            width: chartWidth,
            height: chartHeight,
            data: [v],
            overallData: dataSeries,
            chartIndex: k,
            showAxisLabels: showAxisLabels,
            axisWidth: axisWidth
        });
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a line chart.
 */
var renderLineChart = function(config) {
    /*
     * Setup
     */
    var dateColumn = 'date';
    var valueColumn = 'amt';
    var avgColumn = 'avg';

    var aspectWidth = isMobile ? 4 : 9;
    var aspectHeight = isMobile ? 3 : 13;

    var showAxisLabels = config['showAxisLabels'];

    var margins = {
        top: 10,
        right: 10,
        bottom: 20,
        left: showAxisLabels ? config['axisWidth'] : 5
    };

    var ticksX = 5;
    var ticksY = 5;
    var roundTicksFactor = 10;

    // Mobile
    if (isMobile) {
        ticksX = 5;
        roundTicksFactor = 10;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil(config['height'] - margins['top'] - margins['bottom']);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    containerElement.append('h3')
        .text(config['data'][0]['name'])
        .attr('style', 'margin-left: ' + margins['left'] + 'px;');

    /*
     * Create D3 scale objects.
     */
    var xScale = d3.time.scale()
        .domain(d3.extent(config['data'][0]['values'], function(d) {
            return d['date'];
        }))
        .range([ 0, chartWidth ])

    var min = d3.min(config['data'], function(d) {
        return d3.min(d['values'], function(v) {
            return Math.floor(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
        })
    });

    if (min > 0) {
        min = 0;
    }

    var max = d3.max(config['data'], function(d) {
        return d3.max(d['values'], function(v) {
            return Math.ceil(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
        })
    });

    if (max > 0) {
        max = 23;
    }

    var yScale = d3.scale.linear()
        .domain([min, max])
        .range([chartHeight, 0]);

    var colorScale = d3.scale.ordinal()
        .domain(_.pluck(config['data'], 'name'))
        .range([COLORS['red3'], COLORS['yellow3'], COLORS['blue3'], COLORS['orange3'], COLORS['teal3']]);

    /*
     * Render the HTML legend.
     */
    var legend = containerElement.append('ul')
        .attr('class', 'key')
        .selectAll('g')
        .data(config['data'])
        .enter().append('li')
            .attr('class', function(d, i) {
                return 'key-item ' + classify(d['name']);
            });

    legend.append('b')
        .style('background-color', function(d) {
            return colorScale(d['name']);
        });

    legend.append('label')
        .text(function(d) {
            return d['name'];
        });

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
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d, i) {
            if (isMobile) {
                return '\u2019' + fmtYearAbbrev(d);
            } else {
                return '\u2019' + fmtYearAbbrev(d);
            }
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY)
        .tickFormat(function(d, i) {
            return d
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
     * Render grid to chart.
     */
    var xAxisGrid = function() {
        return xAxis;
    }

    var yAxisGrid = function() {
        return yAxis;
    }

    chartElement.append('g')
        .attr('class', 'x grid')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxisGrid()
            .tickSize(-chartHeight, 0, 0)
            .tickFormat('')
        );

    chartElement.append('g')
        .attr('class', 'y grid')
        .call(yAxisGrid()
            .tickSize(-chartWidth, 0, 0)
            .tickFormat('')
        );

    var bar_w = (chartWidth / config['data'].length) > 2 ? (chartWidth / config['data'].length): (chartWidth / config['data'].length);
        
    highlight_g = chartElement.append('g')
        .attr('class', 'highlights')
        .selectAll('g')
        .data(config['data'])
        .enter()
        .append('g')
            .attr('class', function(d, i) {
                return 'highlights ' + classify(d['name']);
            });

    var usaaverage = d3.time.format('%Y').parse('2005')
            

    // Render USA average highlight

    highlight_g.append('text')
        .attr('class', 'highlight-label label-usaaverage')
        .text(' ')
        .attr('text-anchor', 'end')
        .attr('x', xScale(usaaverage))
        .attr('y', yScale(5))
        .html(LABELS['annotation_usaaverage']);

    /*
     * Render lines to chart.
     */
    var avgline = d3.svg.line()
        .interpolate('basis')
        .x(function(d) {
            return xScale(d[dateColumn]);
        })
        .y(function(d) {
            return yScale(d[avgColumn]);
        });

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) {
            return xScale(d[dateColumn]);
        })
        .y(function(d) {
            return yScale(d[valueColumn]);
        });

    chartElement.append('g')
        .attr('class', 'avglines')
        .selectAll('path')
        .data(config['data'])
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'avgline ' + classify(d['name']);
            })
            .attr('stroke', function(d) {
                return COLORS['@red3'];
            })
            .attr('d', function(d) {
                return avgline(d['values']);
            });

    chartElement.append('g')
        .attr('class', 'lines')
        .selectAll('path')
        .data(config['data'])
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line ' + classify(d['name']);
            })
            .attr('stroke', function(d) {
                return COLORS['@red3'];
            })
            .attr('d', function(d) {
                return line(d['values']);
            });    

    chartElement.append('g')
        .attr('class', 'value value-end')
        .selectAll('text')
        .data(config['data'])
        .enter().append('text')
            .attr('x', function(d, i) {
                var last = d['values'][d['values'].length - 1];

                return xScale(last[dateColumn]) + 2;
            })
            .attr('dx', 3)
            .attr('y', function(d) {
                var last = d['values'][d['values'].length - 1];
                var compare = d['values'][d['values'].length - 3];
                var offset = last[valueColumn] - compare[valueColumn] < 0 ? 16 : -6;

                return yScale(last[valueColumn]) + offset;
            })
            .text(function(d) {
                var last = d['values'][d['values'].length - 1];
                var value = last[valueColumn];

                var label = last[valueColumn].toFixed(1);

                return label;
            });

    chartElement.append('g')
        .attr('class', 'dots')
        .selectAll('circle')
            .data(config['data'])
                .enter()
        .append('circle')
            .attr('cx', function(d, i) {
                var last = d['values'][d['values'].length - 1];

                return xScale(last[dateColumn]);
            })
            .attr('cy', function(d) {
                var last = d['values'][d['values'].length - 1];

                return yScale(last[valueColumn]);
            })
            .attr('r', 3)
            .attr('class', function(d, i) {
                return 'dots ' + classify(d['name']);
            });
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
