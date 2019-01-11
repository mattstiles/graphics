    // Global vars
var pymChild = null;
var isMobile = false;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new parseym.Child({});
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
 * Render the graphic.
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
    renderGraphic({
        container: '#graphic',
        width: containerWidth,
        data: []
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a graphic.
 */
var renderGraphic = function(config) {
    var aspectWidth = 4;
    var aspectHeight = 2.5;

    var margins = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    if (isMobile) {
        margins['right'] = 0;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    // Create container
    var chartElement = containerElement.append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ')');

    var color = d3.scale.threshold()
        .domain([0.2, 0.5, 1.5, 2.5, 7])
        .range(['#e9e9e9']);

    var projection = d3.geo.albersUsa()
        .scale([chartWidth * 1.2])
        .translate([chartWidth / 2, chartHeight / 2]);

    var path = d3.geo.path()
        .projection(projection);

    queue()
        .defer(d3.json, 'data/koreanscounties.json')
        .defer(d3.json, 'data/us.json')
        .await(ready);

    function ready(error, koreans, us) {
        if (error) throw error;

        //Create tooltip
        var tooltip = d3.select(config['container']).append('div')
            .attr('class', 'hidden tooltip');

        var tooltip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return'About ' + Math.abs(d.properties.koreans).toLocaleString(0) + ' Koreans live in ' + d.properties.county + ', ' + d.properties.apstate + '.';
            })

        chartElement.call(tooltip)
        tooltip.direction('n');

        chartElement.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(topojson.feature(koreans, koreans.objects.koreanscounties).features)
            .enter().append('path')
            .attr('d', path)
            // .style('fill', function(d) {
            //     return color(d.properties.koreanpct);
            // })
        //     .on('mouseover', tooltip.show)
        //     .on('mouseout', tooltip.hide);

        var radius = d3.scale.sqrt()
            .domain([0, 100000])
            .range([0, 20]);

        var radiusMobile = d3.scale.sqrt()
            .domain([0, 100000])
            .range([0, 10]);

        chartElement.append('g')
            .attr('class', 'bubble')
            .selectAll('circle')
            .data(topojson.feature(koreans, koreans.objects.koreanscounties).features
                .sort(function(a, b) {
                    return b.properties.koreans - a.properties.koreans;
                }))
            .enter().append('circle')
            .attr('d', path)
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .attr('transform', function(d) {
                return 'translate(' + path.centroid(d) + ')';
            })
            .attr('r', function(d) {
                if (isMobile) {
                    return radiusMobile(d.properties.koreans);
                } else {
                    return radius(d.properties.koreans);
                }
            });

        chartElement.append('path')
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a.id !== b.id;
            }))
            .attr('class', 'states')
            .attr('d', path);


        var legend = chartElement.append("g")
            .attr("class", "legend")
            .attr("transform", function(d) {
                if (isMobile) {
                    return "translate(" + (chartWidth - 20) + "," + (chartHeight - 20) + ")"
                } else {
                    return "translate(" + (chartWidth - 120) + "," + (chartHeight - 60) + ")"
                }
            })

            .selectAll("g")
            .data(function(d) {
                if (isMobile) {
                    return [1e2, 1e4, 1e5]
                } else {
                    return [1e2, 1e4, 1e5]
                }
            })
            .enter().append("g");

        legend.append("circle")
            .attr("cy", function(d) {
                if (isMobile) {
                    return -radiusMobile(d);
                } else {
                    return -radius(d);
                }
            })
            .attr("r", function(d) {
                if (isMobile) {
                    return radiusMobile(d);
                } else {
                    return radius(d);
                }
            });

        legend.append("text")
            .attr("y", function(d) {
                if (isMobile) {
                    return -40
                } else {
                    return -70
                }
            })

            .attr("dy", "1.3em")
            .text('Korean Population');

        legend.append("text")
            .attr("y", function(d) {
                if (isMobile) {
                    return -2 * radiusMobile(d);
                } else {
                    return -2 * radius(d);
                }
            })

            .attr("dy", "1.3em")
            .text(d3.format(","));
    }
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;