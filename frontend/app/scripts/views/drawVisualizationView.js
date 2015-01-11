App.DrawVisualizationView = Ember.View.extend({
    drawVisualization: function () {
        var visualization = this.get('visualization');
        console.log("Visualization");
        console.dir(visualization);

        if (!visualization) {
            return;
        }

        var config = this.get('configurationArray')[0];
        console.log("Configuration changed");
        console.dir(JSON.stringify(config));

        if (!config) {
            return;
        }

        var dataselection = visualization.get('dataselection');
        console.log("dataselection");
        console.dir(dataselection);
        var datasource = dataselection.get('datasource');
        console.log("datasource");
        console.dir(datasource);

        var format = datasource.get('format');
        config.datasourceLocation = datasource.get('location');
        config.datasourceGraph = datasource.get('graph');

        switch (format) {
            case 'rdf':
                config.dataModule = sparql_data_module;
                break;
            case 'csv':
                config.dataModule = csv_data_module;
                break;
            default:
                console.error("Unknown DS format: " + format);
                return;
        }
        var name = visualization.get("visualizationName");
        var visualization = visualizationRegistry.getVisualization(name);
        console.log("Visualization " + name);
        console.dir(visualization);
        console.dir(config);
        var self = this;

        var element = this.get('element');

        try {
            visualization.draw(config, element.id).then(function () {
                var svg = visualization.get_SVG();
                self.set('visualizationSVG', svg);
            });
        } catch (ex) {
            console.error("Error drawing visualization: ");
            console.error(ex);
        }
    }.observes('configurationArray.@each').on('didInsertElement')
});

