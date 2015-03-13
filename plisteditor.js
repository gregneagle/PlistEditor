var plist = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>foo</key><date>2014-08-29T01:27:29Z</date><key>bar</key><integer>1</integer><key>baz</key><string>Hello</string><key>boo</key><true/></dict></plist>'
var js_obj = PlistParser.parse(plist);

function dataToPlist() {
    $('#plist').val(PlistParser.toPlist(js_obj, true));
}

function updatePlistData(data) {
    js_obj = data;
    dataToPlist();
}

function showPath(path) {
    $('#path').text(path);
}

$(document).ready(function() {
    
    $('#plist').change(function() {
        var val = $('#plist').val();
        var js_obj = {};
        if (val) {
            try { js_obj = PlistParser.parse(val); }
            catch (e) { alert('Error in parsing plist. ' + e); }
        } else {
            js_obj = {};
        }
        $('#json').val(JSON.stringify(js_obj, null, 2));
        $('#editor').plistEditor(js_obj, { change: updatePlistData, propertyclick: showPath });
    });

    dataToPlist();
    $('#editor').plistEditor(js_obj, { change: updatePlistData, propertyclick: showPath });
});


