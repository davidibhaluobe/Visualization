import util from "./util";
import exportVis from "./export-visualization";

/* global dimple */
/* global $ */
var linechart = function() {

    function draw(configuration, visualisationContainerID) {
        console.log("### INITIALIZE VISUALISATION - LINE CHART");

        var container = $('#' + visualisationContainerID);
        container.empty();
        
        var xAxis = configuration['Horizontal Axis'];
        var yAxis = configuration['Vertical Axis'];
        var group = configuration['Series'];

        if (!(configuration.dataModule && configuration.datasourceLocation && xAxis && yAxis && group)) {
            return $.Deferred().resolve().promise();
        }

        if ((xAxis.length === 0) || (yAxis.length === 0)) {
            return $.Deferred().resolve().promise();
        }

        var dataModule = configuration.dataModule;
        var location = configuration.datasourceLocation;
        var graph = configuration.datasourceGraph;
        var gridlines = configuration.Gridlines;
        var tooltip = configuration.Tooltip;
        var hLabel = configuration["Horizontal Label"];
        var vLabel = configuration["Vertical Label"];

        var selection = {
            dimension: yAxis, // measure
            multidimension: xAxis.concat(group),
            gridlines: gridlines,
            tooltip: tooltip,
            hLabel: hLabel,
            vLabel: vLabel
        };

        console.log("VISUALISATION SELECTION FOR LINE CHART:");
        console.dir(selection);

        var svg = dimple.newSvg('#' + visualisationContainerID, container.width(), container.height());

        return dataModule.parse(location, graph, selection).then(function(inputData) {
            var columnsHeaders = inputData[0];
            var data = util.createRows(inputData);
            console.log("GENERATE INPUT DATA FORMAT FOR LINE CHART");
            console.dir(data);

            var chart = new dimple.chart(svg, data);

            var x = chart.addCategoryAxis("x", columnsHeaders[1]); // x axis: ordinal values
            var y = chart.addMeasureAxis("y", columnsHeaders[0]); // y axis: one measure (scale)  

            var series = null;

            if (group.length > 0) {
                series = columnsHeaders.slice(2);
            }

            chart.addSeries(series, dimple.plot.line);
            chart.addLegend("10%", "5%", "80%", 20, "right");
            
            //gridlines tuning
            //x.showGridlines = selection.gridlines;
            //y.showGridlines = selection.gridlines;
            //titles
            if (selection.hLabel ==="" || selection.hLabel === "Label"){
                selection.hLabel = columnsHeaders[1]; 
            }
            if (selection.vLabel ==="" || selection.vLabel === "Label"){
                selection.vLabel = columnsHeaders[0];
            }
            x.title = selection.hLabel;
            y.title = selection.vLabel;
            //ticks
            x.ticks = selection.gridlines;
            y.ticks = selection.gridlines;
            //tooltip
            if (selection.tooltip === false){
                chart.addSeries(series, dimple.plot.line).addEventHandler("mouseover",function(){});
            }
            
            chart.draw();
        });
    }

    function export_as_PNG() {
        return exportVis.export_PNG();
    }

    function export_as_SVG() {
        return exportVis.export_SVG();
    }

    function get_SVG() {
        return exportVis.get_SVG();
    }

    return {
        export_as_PNG: export_as_PNG,
        export_as_SVG: export_as_SVG,
        get_SVG: get_SVG,
        draw: draw
    };
}();

export default linechart;
