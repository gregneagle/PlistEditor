// PlistEditor

// © 2015 Greg Neagle
// Inspired by and borrowing code from Davis Durman's FlexiJsonEditor
// https://github.com/DavidDurman/FlexiJsonEditor

// Dependencies:

// * Bootstrap 3 (most recently tested with 3.3.1)
//  (not strictly dependent on Bootstrap, but you may find it painful without)
// * jQuery (most recently tested with v1.11.2)
// * JSON (use json2 library for browsers that do not support JSON natively)

// Example:
//     $('#mydiv').plistEditor(jsobj, opt);

(function( $ ) {

    $.fn.plistEditor = function(obj, options) {
        options = options || {};
        
        var K = function() {};
        var onchange = options.change || K;
        var onpropertyclick = options.propertyclick || K;

        return this.each(function() {
            PlistEditor($(this), obj, onchange, onpropertyclick);
        });

    };

    function PlistEditor(target, obj, onchange, onpropertyclick, propertyElement, valueElement) {
        var opt = {
            target: target,
            onchange: onchange,
            onpropertyclick: onpropertyclick,
            original: obj,
        };
        construct(opt, obj, target);
    }

    function isDate(o) {
        return Object.prototype.toString.call(o) == '[object Date]';
    }
    function isObject(o) {
        return Object.prototype.toString.call(o) == '[object Object]'; 
    }
    function isArray(o) {
        return Object.prototype.toString.call(o) == '[object Array]';
    }
    function isBoolean(o) {
        return Object.prototype.toString.call(o) == '[object Boolean]';
    }
    function isNumber(o) {
        return Object.prototype.toString.call(o) == '[object Number]';
    }
    function isInteger(o) {
        return (isNumber(o) && Math.round(o) == o);
    }
    function isString(o) {
        return Object.prototype.toString.call(o) == '[object String]';
    }
    var types = 'object array boolean number string date null';

    // Feeds object `o` with `value` at `path`. If value argument is omitted,
    // object at `path` will be deleted from `o`.
    // Example:
    //      feed({}, 'foo.bar.baz', 10);
    // returns { foo: { bar: { baz: 10 } } }
    function feed(o, path, value) {
        var del = arguments.length == 2;
        
        if (path.indexOf('.') > -1) {
            var diver = o,
                i = 0,
                parts = path.split('.');
            for (var len = parts.length; i < len - 1; i++) {
                diver = diver[parts[i]];
            }
            if (del) {
                if (getType(diver) == 'array') {
                    var index = parts[len - 1];
                    diver.splice(index, 1);
                } else { delete diver[parts[len - 1]]; }
            } else { diver[parts[len - 1]] = value; }
        } else {
            if (del) {
                if (getType(diver) == 'array') {
                    o.splice(path, 1);
                } else { delete o[path]; }
            } else { o[path] = value; }
        }
        return o;
    }

    // Get a property by path from object o if it exists. 
    // If not, return defaultValue.
    // Example:
    //     def({ foo: { bar: 5 } }, 'foo.bar', 100);   // returns 5
    //     def({ foo: { bar: 5 } }, 'foo.baz', 100);   // returns 100
    function def(o, path, defaultValue) {
        path = path.split('.');
        var i = 0;
        while (i < path.length) {
            if ((o = o[path[i++]]) == undefined) return defaultValue;
        }
        return o;
    }

    function error(reason) { if (window.console) { console.error(reason); } }
    
    function parse(str) {
        var res;
        try { res = JSON.parse(str); }
        catch (e) { res = null; error('JSON parse failed'); }
        return res;
    }

    function stringify(obj) {
        var res;
        try { res = JSON.stringify(obj); }
        catch (e) { res = 'null'; error('JSON stringify failed.'); }
        return res;
    }
    
    function expander() {
        var _expander =   $('<span>',  { 'class': 'expander' });
        _expander.bind('click', function() {
            var item = $(this).parent();
            item.toggleClass('expanded');
        });
        return _expander;
    }

    function itemAppender(handler) {
        var appender = $('<div>', { 'class': 'item appender' }),
            btn      = $('<button />', { 'class': 'btn btn-success btn-xs' }),
            span     = $('<span>', { 'class': 'glyphicon glyphicon-plus' })

        //btn.text('Add New Value');
        btn.append(span);
        btn.click(handler);
        appender.append(btn);
        return appender;
    }

    function rowControls(opt) {
        var _rowControls = $('<td>', 
                             {'class': 'row-controls', 'width': '24px'}),
            btn = $('<button>', { 'class': 'btn btn-danger btn-xs' }),
            delSpan = $('<span>', 
                        {'class': 'glyphicon glyphicon-minus'});
        btn.append(delSpan);
        _rowControls.append(btn);
        btn.click(deleteRow(opt));
        return _rowControls;
    }

    function addNewValue(obj) {
        if (isArray(obj)) {
            obj.push(null);
            return true;
        }

        if (isObject(obj)) {
            var i = 1, newName = "newKey";

            while (obj.hasOwnProperty(newName)) {
                newName = "newKey" + i;
                i++;
            }

            obj[newName] = null;
            return true;
        }

        return false;
    }

    function construct(opt, obj, root, path) {
        path = path || '';
        root.children().remove();
        var objType = getType(obj);
        if (objType == 'dict') {
            var table = $('<table>',
                          {"class": "table table-striped table-condensed"}),
                tableBody = $('<tbody>', {'class': 'dict'});
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var dataPath = (path ? path + '.' : '') + key;
                    var tableRow = $('<tr>', {'data-path': dataPath});
                    var rowHeader = $('<th>', 
                                      {'scope': 'row', 'class': 'col-sm-3'});
                    var keyElement = $('<input>',
                        {'class': 'property form-control'});
                    keyElement.val(key).attr('title', key);
                    rowHeader.append(keyElement);
                    keyElement.click(propertyClicked(opt));
                    keyElement.change(propertyChanged(opt));
                    var rowValue = $('<td>',
                                     {'data-type': getType(obj[key])});
                    construct(opt, obj[key], rowValue, dataPath);
                    tableRow.append(rowHeader).append(rowValue);
                    tableRow.append(rowControls(opt));
                    tableBody.append(tableRow);
                }
            }
            table.append(tableBody);
            root.append(expander());
            root.append(table);
            root.append(itemAppender(function() {
                    addNewValue(obj);
                    construct(opt, obj, root, path);
                    opt.onchange(opt.original);
            }));
        } else if (objType == 'array') {
            // array
            var table = $('<table>',
                          {"class": "table table-striped table-condensed"}),
                tableBody = $('<tbody>', {'class': 'array'});
            for (var i=0; i<obj.length; ++i) {
                var dataPath = (path ? path + '.' : '') + i;
                var tableRow = $('<tr>', {'data-path': dataPath});
                var rowHeader = $('<th>',
                                  {'scope': 'row'});
                var rowValue = $('<td>', 
                                 {'data-type': getType(obj[i]), 
                                  'width': '100%'});
                construct(opt, obj[i], rowValue, dataPath);
                tableRow.append(rowHeader);
                tableRow.append(rowValue);
                tableRow.append(rowControls(opt));
                tableBody.append(tableRow);
            }
            // make array elements re-orderable
            tableBody.sortable({
                items: '> tr',
                containment: 'table',
                update: function( event, ui ) {
                    var newArray = [],
                        childItems = $(event.target).children('tr');
                    
                    $(childItems).each(function() {
                        var path = $(this).data('path'),
                            val = def(opt.original, path);
                        newArray.push(val);
                    });
                    //alert(newArray);
                    var valueElement = $(event.target).closest('td'),
                        parentTableRow = valueElement.closest('tr'),
                        path = parentTableRow.data('path');
                    feed(opt.original, path, newArray);
                    construct(opt, newArray, valueElement, path);
                    opt.onchange(opt.original);
                }
            });
            table.append(tableBody);
            root.append(expander());
            root.append(table);
            root.append(itemAppender(function() {
                    addNewValue(obj);
                    construct(opt, obj, root, path);
                    opt.onchange(opt.original);
            }));
        } else if (objType == 'null') {
            valueElement = typeSelect();
            root.append(valueElement);
            valueElement.change(valueChanged(opt));
        } else if (objType == 'boolean') {
            valueElement = checkbox(obj)
            root.append(valueElement);
            valueElement.change(valueChanged(opt));
        } else if (objType == 'string') {
            var rows = obj.split('\n').length;
            if (rows == 1 && obj.length > 79) { rows = 2 };
            valueElement = $('<textarea>', 
                            {'class': 'value form-control', 'rows': rows});
            valueElement.val(obj);
            root.append(valueElement);
            valueElement.change(valueChanged(opt));
        } else {
            valueElement = $('<input>', 
                             {'class': 'value form-control'});
            if (objType == 'date') {
                var val = obj.toISOString();
            } else {
                var val = stringify(obj);
            }
            valueElement.val(val).attr('title', val);
            root.append(valueElement);
            valueElement.change(valueChanged(opt));
        }
    };

    function checkbox(currentValue) {
        var s = $('<input />', 
            {'type': 'checkbox', 'class': 'value'}).prop(
                "checked", currentValue);
        return s;
    }

    function typeSelect() {
        var arr = [
          {val: null,       text: 'Select type'},
          {val: 'string',   text: 'String'},
          {val: 0,          text: 'Integer'},
          {val: false,      text: 'Boolean'},
          {val: new Date(), text: 'Date'},
          {val: [],         text: 'Array'},
          {val: {},         text: 'Dict'}
        ];

        var sel = $('<select>', {'class': 'value form-control'});
        $(arr).each(function() {
            sel.append($("<option>").attr('value',
                stringify(this.val)).text(this.text));
        });
        return sel;
    }

    function propertyClicked(opt) {
        return function() {
            var tableRow = $(this).closest('tr'),
            path = $(tableRow).data('path');
            var safePath = path.split('.').join('\'][\'');
            opt.onpropertyclick('[\'' + safePath + '\']');
        };
    }

    function propertyChanged(opt) {
        return function() {
            //parent is <th>; its parent is <tr>
            var tableRow = $(this).closest('tr'),
                prevPath = $(tableRow).data('path'),
                newKey = $(this).val(),
                oldKey = $(this).attr('title'),
                val = def(opt.original, prevPath, null);

            // store the new key
            $(this).attr('title', newKey);

            // remove oldKey and value
            feed(opt.original, prevPath);
            // insert newKey and value
            if (newKey) {
                // calculate the newPath
                var pathElements = prevPath.split('.')
                pathElements.pop();
                pathElements.push(newKey);
                var newPath = pathElements.join('.');
                //alert('New path: ' + newPath);
                feed(opt.original, newPath, val);
                //update the tableRow's data path
                $(tableRow).data('path', newPath);
                // jQuery doesn't actually update the DOM; in order that we
                // can see what's going on, we'll also update the DOM item
                $(tableRow).attr('data-path', newPath);
                //paths for all sub-elements need to be updated, so just
                //re-construct the value
                //th is $(this).parent(); next item is td (value)
                var valueElement = $(this).parent().next();
                construct(opt, val, valueElement, newPath);
            } else {
                $(tableRow).remove();
            }
            opt.onchange(opt.original);
        };
    }

    function deleteRow(opt){
        return function() {
            //parent is <td>; its parent is <tr>
            var tableRow = $(this).closest('tr'),
                path = $(tableRow).data('path');
            // remove oldKey and value
            stringify(feed(opt.original, path));
            if ($(tableRow).closest('tbody').hasClass('array')) {
                // with an array, we need to reconstruct the rows
                // since the <tr> paths are now wrong
                // unless we deleted the last row
                var nextRow = $(tableRow).next('tr');
                while ($(nextRow).data('path')) {
                    path = $(nextRow).data('path');
                    var pathElements = path.split('.'),
                        lastElement = pathElements.pop();
                    pathElements.push(lastElement-1);
                    path = pathElements.join('.');
                    $(nextRow).data('path', path);
                    $(nextRow).attr('data-path', path);
                    nextRow = $(nextRow).next('tr');
                }
            }
            $(tableRow).remove();
            opt.onchange(opt.original);
        };
    }

    function getValue(valueElement) {
        var type = $(valueElement).parent().data('type');
        if (type == 'string') {
            // do not parse value; just return it as-is
            val = $(valueElement).val();
        } else if (type == 'date') {
            // attempt to parse as a valid date
            var timestamp = Date.parse($(valueElement).val());
            if (isNaN(timestamp)) {
                // invalid date string
                alert("Invalid date!")
                $(valueElement).closest('td').addClass('danger');
                timestamp = 0;
            } else {
                $(valueElement).parent().closest('td').removeClass('danger');
            }
            val = new Date(timestamp);
        } else if (type == 'boolean') {
            // boolean, which is displayed as a checkbox; is it checked?
            val = $(valueElement).is(':checked');
        } else {
            // parse as JSON
            val = parse($(valueElement).val() || 'null');
            // TO-DO: validate that type wasn't changed -- like number to bool
        }
        return val
    }

    function valueChanged(opt) {
        return function() {
            var val = null,
                tableRow = $(this).closest('tr'),
                path = $(tableRow).data('path');

            if ($(this).is('select')) {
                // null type; select new type
                val = parse($(this).val() || 'null');
                var type = getType(val);
                if (type == 'string') {
                    // strings and dates are both strings in JSON
                    // so try to parse the string as a date
                    var timestamp = Date.parse(val);
                    if (!isNaN(timestamp)) {
                        type = 'date';
                        val = new Date(timestamp);
                    }
                }
                $(this).parent().data('type', type);
                // jQuery doesn't actually update the DOM, so we're going to
                $(this).parent().attr('data-type', type);
                construct(opt, val, $(this).parent(), path);
            } else {
                val = getValue($(this));
            }
            feed(opt.original, path, val);
            opt.onchange(opt.original);
        };
    }

    function getType(val) {
        var type = 'null';
        
        if (isDate(val)) type = 'date';
        else if (isObject(val)) type = 'dict';
        else if (isArray(val)) type = 'array';
        else if (isBoolean(val)) type = 'boolean';
        else if (isString(val)) type = 'string';
        else if (isNumber(val)) type = 'number';
        //error(type);
        return type
    }

})( jQuery );
