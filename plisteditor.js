var plist = '<?xml version="1.0" encoding="UTF-8"?>\
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\
<plist version="1.0">\
<dict>\
    <key>_metadata</key>\
    <dict>\
        <key>created_by</key>\
        <string>gneagle</string>\
        <key>creation_date</key>\
        <date>2015-03-10T18:37:03Z</date>\
        <key>munki_version</key>\
        <string>2.2.0.2401</string>\
        <key>os_version</key>\
        <string>10.9.5</string>\
    </dict>\
    <key>autoremove</key>\
    <false/>\
    <key>catalogs</key>\
    <array>\
        <string>production</string>\
    </array>\
    <key>category</key>\
    <string>Internet</string>\
    <key>description</key>\
    <string>Google\'s web browser.</string>\
    <key>developer</key>\
    <string>Google</string>\
    <key>display_name</key>\
    <string>Google Chrome</string>\
    <key>installer_item_hash</key>\
    <string>ad7091a6bfdb0b54b20c3ac966c88937ec30d2cc80a34ca9170e7bfb7b3481e2</string>\
    <key>installer_item_location</key>\
    <string>apps/GoogleChrome-41.0.2272.89.dmg</string>\
    <key>installer_item_size</key>\
    <integer>66581</integer>\
    <key>installer_type</key>\
    <string>copy_from_dmg</string>\
    <key>installs</key>\
    <array>\
        <dict>\
            <key>CFBundleIdentifier</key>\
            <string>com.google.Chrome</string>\
            <key>CFBundleName</key>\
            <string>Chrome</string>\
            <key>CFBundleShortVersionString</key>\
            <string>41.0.2272.89</string>\
            <key>CFBundleVersion</key>\
            <string>2272.89</string>\
            <key>minosversion</key>\
            <string>10.6.0</string>\
            <key>path</key>\
            <string>/Applications/Google Chrome.app</string>\
            <key>type</key>\
            <string>application</string>\
            <key>version_comparison_key</key>\
            <string>CFBundleShortVersionString</string>\
        </dict>\
    </array>\
    <key>items_to_copy</key>\
    <array>\
        <dict>\
            <key>destination_path</key>\
            <string>/Applications</string>\
            <key>source_item</key>\
            <string>Google Chrome.app</string>\
        </dict>\
    </array>\
    <key>minimum_os_version</key>\
    <string>10.6.0</string>\
    <key>name</key>\
    <string>GoogleChrome</string>\
    <key>unattended_install</key>\
    <true/>\
    <key>uninstall_method</key>\
    <string>remove_copied_items</string>\
    <key>uninstallable</key>\
    <true/>\
    <key>version</key>\
    <string>41.0.2272.89</string>\
</dict>\
</plist>'

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


