/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    var tablesort = new Tablesort(document.getElementById('africa-table'));
    var tablesort = new Tablesort(document.getElementById('americas-table'));
    var tablesort = new Tablesort(document.getElementById('eastern-mediterranean-table'));
    var tablesort = new Tablesort(document.getElementById('europe-table'));
    var tablesort = new Tablesort(document.getElementById('south-east-asia-table'));
    var tablesort = new Tablesort(document.getElementById('western-pacific'));
	
    // var tablesort = new Tablesort(document.getElementById('country-table-mobile'));
	
    pymChild = new pym.Child({});
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
