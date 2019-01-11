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

    var color = d3.scale.threshold()
        .domain([0.2, 0.5, 1.5, 2.5, 7])
        .range(['#C5DFDF', '#8BC0BF', '#51A09E', '#17807E', '#11605E', '#0B403F']);

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
                return'About ' + Math.abs(d.properties.koreanpct).toLocaleString(0) + '% of people in ' + d.properties.county + ', ' + d.properties.apstate + ', are Korean.';
            })

        chartElement.call(tooltip)
        tooltip.direction('n');

        chartElement.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(topojson.feature(koreans, koreans.objects.koreanscounties).features)
            .enter().append('path')
            .attr('d', path)
            .style('fill', function(d) {
                return color(d.properties.koreanpct);
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);


        chartElement.append('path')
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a.id !== b.id;
            }))
            .attr('class', 'states')
            .attr('d', path);

    }
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;