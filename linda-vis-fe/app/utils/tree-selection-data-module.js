import csv_data_module from "./csv-data-module";
import sparql_data_module from "./sparql-data-module";

/* global $ */
/* global _ */
/*jshint loopfunc: true */
var treeselection_data_module = function() {
    var _location = "";
    var _graph = "";
    var _format = "";
    var _data_module = "";

    function initialize(dataInfo) {
        console.log('SELECTION TREE COMPONENT - INITIALIZING TREE');

        _location = dataInfo.location;
        _graph = dataInfo.graph;
        _format = dataInfo.format;
        _data_module = getDataModule(_format);

        return _data_module.queryClasses(_location, _graph).then(function(data) {
            return createTreeContent(data);
        });
    }

    function restore(dataInfo, previousSelection) {
        console.log('SELECTION TREE COMPONENT - RESTORING TREE');

        _location = dataInfo.location;
        _graph = dataInfo.graph;
        _format = dataInfo.format;
        _data_module = getDataModule(_format);

        var _selectedClassKey = previousSelection[0].parent[0].id;
        var _selectedClassTitle = previousSelection[0].parent[0].label;

        return _data_module.queryClasses(_location, _graph).then(function(classes) {
            var treecontent = createTreeContent(classes);
            var branch = _.filter(treecontent, function(item) {
                if (_.isEqual(item.key, _selectedClassKey)) {
                    return true;
                }
            });

            branch[0]['expanded'] = true;
            branch[0]['selected'] = true;
            branch[0]['lazy'] = false;
            branch[0]['children'] = [];
            branch[0]['parent'] = [{id: _selectedClassKey, label: _selectedClassTitle}];

            return restoreTreeContent(previousSelection, branch[0]).then(function() {
                return treecontent;
            });
        });
    }

    function restoreTreeContent(previousSelection, branch) {
        console.log('SELECTION TREE COMPONENT - RESTORING TREE CONTENT');

        return branch._children.loadChildren(branch.parent).then(function(children) {
            var promises = [];

            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                child['parent'] = branch.parent.concat([{id: child.key, label: child.title}]);

                for (var i = 0; i < previousSelection.length; i++) {
                    var selection = previousSelection[i];
                    var prefix = selection.parent.slice(0, child.parent.length);

                    if (_.isEqual(child.parent, prefix) && (selection.parent.length > child.parent.length)) {
                        child['expanded'] = true;
                        child['selected'] = true;
                        child['lazy'] = false;
                        child['children'] = [];
                        promises.push(restoreTreeContent(previousSelection, child));
                        break;
                    } else if (_.isEqual(child.parent, prefix)) {
                        child['selected'] = true;
                        child['lazy'] = true;
                        if (!child.grandchildren) {
                            child['lazy'] = false;
                        }

                    }
                }
                branch.children.push(child);
            }
            return $.when.apply($, promises).then(function(content) {
                console.log('SELECTION TREE COMPONENT - FINISHED RESTORING TREE CONTENT');
                return content;
            });
        });
    }

    function createTreeContent(data) {
        console.log('SELECTION TREE COMPONENT - CREATING TREE CONTENT');
        var treeContent = [];

        for (var i = 0; i < data.length; i++) {
            var record = data[i];
            var id = record.id;
            var label = record.label;
            var type = record.type;
            var role = record.role;
            var special = record.special;
            var grandchildren = record.grandchildren;

            treeContent.push({
                title: label,
                key: id,
                lazy: grandchildren,
                extraClasses: getCSSClass(type),
                type: type,
                datatype: getDataType(type),
                role: role,
                special: special,
                hideCheckbox: hideCheckbox(type),
                _children: {
                    loadChildren: function(node_path) {
                        var _class = "";
                        var _properties = "";

                        if (node_path.length > 1) {
                            _class = _.first(node_path);
                            _properties = _.rest(node_path);
                        } else {
                            _class = _.last(node_path);
                            _properties = [];
                        }

                        return _data_module.queryProperties(_location, _graph, _class, _properties).then(function(data) {
                            return createTreeContent(data);
                        });
                    }
                }
            });
        }

        return treeContent;
    }

    function getDataSelection(selection, datasource) {
        var dataSelection = {datasource: datasource, propertyInfos: []};

        for (var i = 0; i < selection.length; i++) {
            var record = selection[i];
            dataSelection['propertyInfos'].push({
                key: record.key,
                label: record.label,
                parent: record.parent,
                role: record.role,
                special: record.special,
                type: record.type,
                datatype: record.datatype
            });
        }
 
        return dataSelection;
    }

    function getCSSClass(record) {
        switch (record) {
            case "Ratio":
                return 'treenode-number-label';
            case "Interval":
                return 'treenode-date-label';
            case "Nominal":
                return 'treenode-text-label';
            case "Geographic Latitude":
            case "Geographic Longitude":
                return 'treenode-spatial-label';
            case "Class":
                return 'treenode-class-label';
            case "Resource":
            case "Nothing":
                return 'treenode-resource-label';
        }
        console.error("Unknown type of record  '" + record + "'");
        return null;
    }
    
    function getDataType(record) {
        switch (record) {
            case "Ratio":
                return 'Number';
            case "Interval":
                return 'Date';
            case "Ordinal":
                return 'Ordinal';
            case "Nominal":
                return 'String';  
            case "Angular":
                return 'Angle';  
            case "Geographic Latitude":
            case "Geographic Longitude":
                return 'Spatial';
            case "Class":
            case "Resource":
            case "Nothing": 
                return null;           
        }
        console.error("Unknown data type of record  '" + record + "'");
        return null;
    }

    function hideCheckbox(record) {
        switch (record) {
            case "Ratio":
            case "Interval":
            case "Nominal":
            case "Angular":
            case "Geographic Latitude":
            case "Geographic Longitude":
            case "Class":
                return false;
            case "Resource":
            case "Nothing":
                return true;
        }
        console.error("Unknown category '" + record + "'");
        return null;
    }

    function getDataModule(format) {
        switch (format) {
            case 'csv':
                return csv_data_module;
            case 'rdf':
                return sparql_data_module;
        }
        console.error("Unknown data format '" + format + "'");
        return null;
    }

    return {
        initialize: initialize,
        restore: restore,
        getDataSelection: getDataSelection
    };
}();

export default treeselection_data_module;

