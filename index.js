var mirror = exports;
var fs = require('fs');

mirror.assets = function assets(assets, options) {
    if (!Array.isArray(assets)) assets = [ assets ];
    if (!options) options = {};
    if (!options.headers) options.headers = {'Content-Type': 'text/javascript'};

    return function(req, res, next) {
        var data = [];
        if (!assets.length) return done();

        var pending = assets.length, cancelled = false;
        for (var i = 0; i < assets.length; i++) {
            fs.readFile(assets[i], 'utf8', function(err, file) {
                if (err) {
                    cancelled = true;
                    next(err);
                } else if (!cancelled) {
                    if (options.wrapper) file = options.wrapper(file, assets[this]);
                    data[this] = file;
                    if (!--pending) done();
                }
            }.bind(i));
        }

        function done() {
            res.send(data.join('\n'), options.headers);
        }
    };
};

mirror.source = function source(sources, options) {
    if (!Array.isArray(sources)) sources = [ sources ];
    if (!options) options = {};
    if (!options.headers) options.headers = {'Content-Type': 'text/javascript'};

    return function(req, res, next) {
        res.send(sources.map(function(file) {
            if (options.wrapper) {
                return options.wrapper(file.content, file.filename);
            } else {
                return file.content;
            }
        }).join('\n'), options.headers);
    };
};
