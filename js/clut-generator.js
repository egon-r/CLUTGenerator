    var h2r = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };

    var r2h = function (rgb) {
        return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    };

    // Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
    // Taken from the awesome ROT.js roguelike dev library at
    // https://github.com/ondras/rot.js
    var _interpolateColor = function (color1, color2, factor) {
        if (arguments.length < 3) { factor = 0.5; }
        var result = color1.slice();
        for (var i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }
        return result;
    };

    var rgb2hsl = function (color) {
        var r = color[0] / 255;
        var g = color[1] / 255;
        var b = color[2] / 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    };

    var hsl2rgb = function (color) {
        var l = color[2];

        if (color[1] == 0) {
            l = Math.round(l * 255);
            return [l, l, l];
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var s = color[1];
            var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
            var p = 2 * l - q;
            var r = hue2rgb(p, q, color[0] + 1 / 3);
            var g = hue2rgb(p, q, color[0]);
            var b = hue2rgb(p, q, color[0] - 1 / 3);
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
    };

    var _interpolateHSL = function (color1, color2, factor) {
        if (arguments.length < 3) { factor = 0.5; }
        var hsl1 = rgb2hsl(color1);
        var hsl2 = rgb2hsl(color2);
        for (var i = 0; i < 3; i++) {
            hsl1[i] += factor * (hsl2[i] - hsl1[i]);
        }
        return hsl2rgb(hsl1);
    };


    (function ($) {
        var $list = $('#list'),
            $start = $('#start'),
            $end = $('#end'),
            $intype = $('input[name="intype"]'),
            $usehex = $('#usehex');

        var _createSteps = function (numSteps) {
            $list.find('li.interim').remove();

            for (var i = 0; i < numSteps - 2; i++) {
                $end.before('<li class="interim"><span></span></li>');
            }
        };

        var _styleSteps = function () {
            var $items = $('li'),
                scol = h2r($("#startinput").val()),
                ecol = h2r($("#endinput").val());
            var fn = '_' + $('input[name="intype"]:checked').val();

            console.log('fn', fn);
            $("#clutsrc").append("uint32_t clut["+$("#numsteps").val()+"] = {");
            var factorStep = 1 / ($items.length - 1);
            $items.each(function (idx) {
                var icol = window[fn](scol, ecol, factorStep * idx),
                    hcol = r2h(icol);
                cluthex = hcol.substr(1).toString();
                cluthex = "0xFF" + cluthex.toUpperCase();
                $("#clutsrc").append(cluthex + ",");
                $(this).css('background-color', hcol);
            });
            $("#clutsrc").text($("#clutsrc").text().slice(0, -1));
            $("#clutsrc").append("};");
        }

        $('input').on('change', _styleSteps);
        $('#numsteps').on('change', function () {
            $("#clutsrc").empty();
            _createSteps($(this).val());
            _styleSteps();
        }).trigger('change');

    })(jQuery);