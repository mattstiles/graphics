/*
 * Basic Javascript helpers used in analytics.js and graphics code. From NPR dailygraphics and colorbrewer2.org
 */

var COLORS = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7',
	'cbpurple6': '#f2f0f7', 'cbpurple5': '#dadaeb', 'cbpurple4': '#bcbddc', 'cbpurple3': '#9e9ac8', 'cbpurple2': '#756bb1', 'cbpurple1': '#54278f',
	'cbred6': '#fee5d9', 'cbred5': '#fcbba1', 'cbred4': '#fc9272', 'cbred3': '#fb6a4a', 'cbred2': '#de2d26', 'cbred1': '#a50f15',
	'cbgreen6': '#edf8fb', 'cbgreen5': '#ccece6', 'cbgreen4': '#99d8c9', 'cbgreen3': '#66c2a4', 'cbgreen2': '#2ca25f', 'cbgreen1': '#006d2c',
	'cborange6': '#feedde', 'cborange5': '#fdd0a2', 'cborange4': '#fdae6b', 'cborange3': '#fd8d3c', 'cborange2': '#e6550d', 'cborange1': '#a63603',
	'cbblue6': '#eff3ff', 'cbblue5': '#c6dbef', 'cbblue4': '#9ecae1', 'cbblue3': '#6baed6', 'cbblue2': '#3182bd', 'cbblue1': '#08519c'
};

/*
 * Convert arbitrary strings to valid css classes.
 * via: https://gist.github.com/mathewbyrne/1280286
 *
 * NOTE: This implementation must be consistent with the Python classify
 * function defined in base_filters.py.
 */
var classify = function(str) {
    return str.toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

/*
 * Convert key/value pairs to a style string.
 */
var formatStyle = function(props) {
    var s = '';

    for (var key in props) {
        s += key + ': ' + props[key].toString() + '; ';
    }

    return s;
}

/*
 * Create a SVG tansform for a given translation.
 */
var makeTranslate = function(x, y) {
    var transform = d3.transform();

    transform.translate[0] = x;
    transform.translate[1] = y;

    return transform.toString();
}

/*
 * Parse a url parameter by name.
 * via: http://stackoverflow.com/a/901144
 */
var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/*
 * Convert a url to a location object.
 */
var urlToLocation = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}
