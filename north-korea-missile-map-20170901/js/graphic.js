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

    // if we wanted to shade the provinces
    var color = d3.scale.threshold()
        .domain([150, 2500, 7500, 15000, 25000, 53000])
        .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

    var projection = d3.geo.patterson()
        .center([127.9661242, 40.2555065])
        .scale([chartWidth * 5.6])
        .translate([chartWidth / 1.9, chartHeight / 1.9]);

    var path = d3.geo.path()
        .projection(projection);

    queue()
        .defer(d3.json, "data/north-korea-counties.json")
        .defer(d3.json, "data/north-korea-provinces.json")
        .defer(d3.json, "data/missile_test_counts.json")
        .await(ready);

    function ready(error, nkcounty, nkprovince, nktests, nkfacilities) {
        if (error) throw error;

        // Create tooltip

        var tooltip = d3.select(config['container']).append('div')
            .attr('class', 'hidden tooltip');

        var tooltip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Site: </strong>" + d.properties.Facility + "<br><strong>Tests:</strong> " + d.properties.Tests;
            })

        chartElement.call(tooltip)
        tooltip.direction('e');

        // county polygons

        chartElement.append("g")
            .selectAll("path")
            .data(topojson.feature(nkcounty, nkcounty.objects.PRK_adm2).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", function(d, i) {
                return 'municipalities ' + classify(d.properties.NAME_2);
            });

        // province polygons

        chartElement.append("g")
            .selectAll("path")
            .data(topojson.feature(nkprovince, nkprovince.objects.provinces).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", function(d, i) {
                return 'provinces ' + classify(d.properties.NAME_1);
            });

        // province labels

        chartElement.selectAll("text")
            .attr("class", "province-labels")
            .data(topojson.feature(nkprovince, nkprovince.objects.provinces).features)
            .enter().append("text")
            .attr("transform", function(d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("dy", "1")
            .text(function(d) {
                return d.properties.NAME_1;
            })
            .attr('class', function(d, i) {
                return 'province-labels ' + classify(d.properties.NAME_1);
            });

    // missile test bubbles

        var radius = d3.scale.sqrt()
            .domain([0, 20])
            .range([0, 30]);

        var radiusMobile = d3.scale.sqrt()
            .domain([0, 10])
            .range([0, 10]);

        chartElement.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
            .data(topojson.feature(nktests, nktests.objects.missile_test_counts).features
                .sort(function(a, b) {
                    return b.properties.Tests - a.properties.Tests;
                }))
            .enter().append("circle")
            .attr("d", path)
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .attr("transform", function(d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function(d) {
                if (isMobile) {
                    return radiusMobile(d.properties.Tests);
                } else {
                    return radius(d.properties.Tests);
                }
            });

    // missile test locations

        chartElement.append("g")
            .attr("class", "locations")
          .selectAll("circle")
            .data(topojson.feature(nktests, nktests.objects.missile_test_counts).features)
          .enter().append("circle")
            .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            .attr("r", 1);


        // launch facility labels

        //     chartElement.selectAll("text")
        //     .attr("class", "facility-labels")
        //         .data(topojson.feature(nktests, nktests.objects.missile_test_counts).features)
        //     .enter().append("text")
        //       .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        //       .attr("dy", "1")
        //       .text(function(d) { return d.properties.Facility + ": " + d.properties.Tests ; })
        //       .attr('class', function(d, i) {
        //                 return 'facility-labels ' + classify(d.properties.Facility);
        //             });

        // legend 

        var legend = chartElement.append("g")
            .attr("class", "legend")
            .attr("transform", function(d) {
                if (isMobile) {
                    return "translate(" + (chartWidth - 20) + "," + (chartHeight - 20) + ")"
                } else {
                    return "translate(" + (chartWidth - 150) + "," + (chartHeight - 70) + ")"
                }
            })

            .selectAll("g")
            .data(function(d) {
                if (isMobile) {
                    return [10, 20]
                } else {
                    return [1, 10, 20]
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
                    return -2 * radiusMobile(d);
                } else {
                    return -2 * radius(d);
                }
            })

            .attr("dy", "1.3em")
            .text(d3.format(".1s"));


    }
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;