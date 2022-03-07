(function (module) {
    'use strict';
    // Reference http://stackoverflow.com/questions/12413705/parsing-natural-language-ingredient-quantities-for-recipes

    var Defaults = require('./defaults');
    var unitsOfMeasure = Defaults.unitsOfMeasure;
    var noiseWords = Defaults.noiseWords;
    var inflect = require('i')();

    var isNumeric = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    var isFraction = function (n) {
        return n.match(/^(\d+\W\d+\/\d+|\d+\/\d+|½|↉|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅐|⅛|⅜|⅝|⅞|⅑|⅒|⅟)$/);
    };

    var getNumber = function (s) {
        return s.match(/^(\d+\W\d+\/\d+|\d+\W*[½↉⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒⅟]+|\d+\/\d+|\d+\.\d+|\d+|½|↉|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅐|⅛|⅜|⅝|⅞|⅑|⅒|⅟)/);
    };

    var properCase = function (what) {
        if (!what) {
            return what;
        }
        return what.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    var Parser = function (opts) {

        var options = opts || {};
        var expandedUnits = [];
        var unitsOfMeasure = options.unitsOfMeasure || Defaults.unitsOfMeasure;
        var unitsKeys = Object.keys(unitsOfMeasure);
        var unitsTable = {};
        unitsKeys.forEach(function (key) {
            expandedUnits = expandedUnits.concat(unitsOfMeasure[key]);
            unitsOfMeasure[key].forEach(function (alt) {
                unitsTable[alt] = key;
            });
        });
        this.options = options;
        this.expandedUnits = expandedUnits;
        this.unitsOfMeasure = unitsOfMeasure;
        this.unitsTable = unitsTable;

    };

    function preprocess(source) {

        // Remove prices
        source = source.replace(/\$\d+.\d+/, "");

        // Remove any symbols
        source = source.replace(/\*/g, "");

        // Remove ascii space
        source = source.replace(/ /g, ' ');

        // Remove emojis
        source = source.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u2149]|[\u2160\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

        return source;
    }

    Parser.prototype.isUnitOfMeasure = function (value) {
        
        // Remove non alpha characters
        value = value.replace(/[^a-zA-Z]/g, "");

        // TODO: "Replace this with the actual singularized version"
        var val = Defaults.singularizeFixes.includes(value) ? value : inflect.singularize(value);

        if (this.unitsOfMeasure[val.toLowerCase()] || this.expandedUnits.indexOf(val) > -1) {
            return true;
        }
        return false;
    };

    Parser.prototype.unitExpander = function (unit) {

        if (Defaults.singularizeFixes.includes(unit)) {
            return properCase(unit.toLowerCase());
        } else {
            // console.log("Unit: " + unit);
            var val = inflect.singularize(unit);
            // var val = unit;
            // console.log("singularized to: " + val);
            val = properCase(this.unitsTable[val.toLowerCase()] || this.unitsTable[val] || val);
            
            return val;
        }
    };

    Parser.prototype.getNumber = function (from) {
        var part = from.shift();

        if (part) {
            if (isNumeric(part) || isFraction(part)) {
                return (part + ' ' + this.getNumber(from)).trim();
            }
            from.unshift(part);
        } else {
        }

        return '';
    };


    Parser.prototype.getAmount = function (from) {
        
        var s = from.join(' ');

        var start = getNumber(s);
        
        if (start) {
            s = s.substr(start[0].length);
        
            var tmp = s.match(this.options.reToWords || Defaults.reToWords);
        
            var hasInto = s.match(/\s+into\s+/);
            
            if (tmp && !hasInto) {
                if (!tmp[2]) {
                    s = s.substr(tmp[0].length);
                }
                if (tmp[2] && isNumeric(tmp[2])) {
                    s = s.substr(tmp[0].length - tmp[2].length).replace(/^\s*/, '');
                }
                var end = getNumber(s);
                if (end) {
                    return {
                        match: {
                            min: start[1],
                            max: end[1]
                        },
                        rest: s.substr(end[0].length).trim().split(' ')
                    };
                }
            }
            return {
                match: start[1],
                rest: s.trim().split(' ')
            };
        }
        return false;
    };

    var checkForMatch = function (len, section, within, offset) {
        if (within.length - offset < len) {
            return false;
        }
        var seg = within.slice(offset, offset + len).join(' ').toLowerCase();
        if (seg === section) {
            return offset;
        }
        return checkForMatch(len, section, within, offset + 1);
    };

    var findWithAttr = function(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }
    

    Parser.prototype.findMatch = function (args) {
        var matchList = args.lookFor,
            matchIdx = checkForMatch(matchList.length, matchList.join(' '), args.within, 0);
        if (matchIdx !== false) {
            args.within.splice(matchIdx, matchList.length);
        }
        return matchIdx;
    };

    Parser.prototype.getALittle = function (from) {
        var idx = this.findMatch({
            lookFor: ['a', 'little'],
            within: from
        });
        return idx === false ? false : true;
    };

    Parser.prototype.getByWeight = function (from) {
        var idx = this.findMatch({
            lookFor: ['by', 'weight'],
            within: from
        });
        return idx === false ? false : true;
    };

    Parser.prototype.getFluidic = function (from) {
        var val = from[0].toLowerCase().replace(/\./g, '');
        if ((this.options.fluidicWords || Defaults.fluidicWords).indexOf(val) > -1) {
            from.shift();
            return true;
        }
        return false;
    };

    Parser.prototype.getUnit = function (from) {
        if (this.getALittle(from)) {
            return 'a little';
        }

        var _this = this;
        var units = [];

        from.forEach(function(val, idx) {
            val = val.replace(/[^A-Za-z0-9]/, '');
            // console.log("New val: " + val);
            if (_this.isUnitOfMeasure(val)) {
                val = _this.unitExpander(val);
                units.push(val);
                from.splice(idx, 1);
            }
        });

        if (units.length > 0) {
            var unit = units.join(" ").replace(/[^A-Za-z0-9]/, '');
            return unit;
        } else {
            return false;
        }

        if (this.isUnitOfMeasure(from[0] || '')) {
            return this.unitExpander(from.shift());
        }
        return false;
    };

    Parser.prototype.getOptional = function (from) {
        var res = false;
        var reOptional = this.options.reOptional || Defaults.reOptional;
        from.filter(function (val, idx) {
            if (reOptional.test(val)) {
                res = true;
                from.splice(idx, 1);
            }
        });
        return res;
    };

    Parser.prototype.getToTaste = function (from) {
        var idx = this.findMatch({
            lookFor: ['to', 'taste'],
            within: from
        });
        return idx === false ? false : true;
    };

    Parser.prototype.removeNoise = function (from) {
        var res = false;
        var nw = this.options.noiseWords || noiseWords;
        from.filter(function (val, idx) {
            if (nw.indexOf(val.toLowerCase()) > -1) {
                res = true;
                from.splice(idx, 1);
            }
        });
        return res;
    };

    Parser.prototype.getPrep = function (from) {

        var excludeParts = ['optional'];

        // Grab anything in parenthesis
        var _this = this;
        var start = false, end;
        var inPrep = false, hasPrep = false;
        var wholeWord = false;
        var prep = from.forEach(function (item, idx) {

            if (item[0] == '(' && item[item.length-1] == ')') {
                inPrep = false;
                start = idx;
                end = idx;                
                wholeWord = true;
            } else {
                if ((!inPrep) && (start === false) && item[0] === '(') {
                    inPrep = true;
                    start = idx;
                }
    
                if (inPrep && (item.substr(-1) === ')')) {
                    inPrep = false;
                    end = idx;
                }
            }
        });

        var found = [];

        if (wholeWord == true) {
            prep = from.splice(start, 1)[0];            
            var val = prep.substring(1, prep.length-1);            
            found.push(val);
        } else if (start !== false && wholeWord == false) {
                        
            var splitVal = from.slice(start, end+1);
            var unitOfMeasure = false;
            // splitVal.forEach(function(v, i) {
            //     console.log("Checking: " + v);
            //     if (_this.isUnitOfMeasure(v)) {
            //         unitOfMeasure = true;
            //     }
            // });

            // if (!unitOfMeasure) {
                prep = from.splice(start, end - start + 1);
                prep = prep.join(' ');
                var val = prep.substr(-1) === ')' ? prep.substring(1, prep.length - 1) : prep.substr(1);
    
                // Remove prices $10.99
                val = val.replace(/^\$\d+\.\d+$/g, "");
    
                if (val != "") {
                    // return val;
                    if (!excludeParts.includes(val) && !unitOfMeasure) {
                        found.push(val);
                        // from.push(val);
                    }
                }
            // } else {
            //     console.log("We've got a unit of measure here");
            // }
        }

        // Grab anything after a trailing comma
        for (var i = from.length; i--; i> -1) {
            var word = from[i];
            if (word.match(/\,$/)) {                
                var prepDesc = from.splice(i+1).join(" ");
                found.push(prepDesc);
                break;
            }
        }

        // Grab reserved prep words
        var prepWords = this.options.prepWords || Defaults.prepWords;

        var i = from.length;

        for (var i = from.length; i--; i > -1) {
            var val = from[i].toLowerCase().replace('/\./g', '');
            val = val.replace(/\,$/, '');

            if (prepWords.indexOf(val) > -1) {
                found.push(val);
                from.splice(i, 1);
            }
        }

        this.removeNoise(found);

        found = found.filter(function(v) {
            // Return if it's:
                // Not an empty string
                // Not an empty parenthesis
                // not a unit of measure
            var unit = v.replace(/[\d\s]/g, '');
            var isUnitOfMeasure = _this.isUnitOfMeasure(unit);
            
            var filter = ((v != '') && (v != "()") && !isUnitOfMeasure);
            return filter;
        });

        if (found.length > 0) {
            return found.reverse().join(" ").trim();
        }

        return false;
    };

    Parser.prototype.parse = function (source) {

        // Remove any prices
        source = preprocess(source);
        
        // console.log("\n\nSource: " + source);
        var parts = source.split(/[ \t]/);
        // console.log("parts");
        // console.log(parts);
        var ing = {};
        var val, tmpAmount;
        if (parts[0] === 'a') {
            tmpAmount = 1;
            parts.shift();
        }
        
        if (this.getOptional(parts)) {
            ing.optional = true;
        }

        // console.log("Before prep");
        // console.log(parts);
        if (val = this.getPrep(parts)) {
            ing.prep = val;
        }
        // console.log("After prep");
        // console.log(parts);

        if ((!tmpAmount) && (val = this.getAmount(parts))) {
            ing.amountMin = val.match;
            parts = val.rest;
        }
        
        if (this.getFluidic(parts)) {
            ing.fluidic = true;
        }

        // console.log("Parts before get unit");
        // console.log(parts);
        if (val = this.getUnit(parts)) {
            ing.unit = val;
        }
        // console.log("Parts after get unit");
        // console.log(parts);

        if (this.getByWeight(parts)) {
            ing.byWeight = true;
        }
        
        if (this.getToTaste(parts)) {
            ing.toTaste = true;
        }

        
        this.removeNoise(parts);
        ing.name = parts.join(' ');
        ing.name = ing.name.replace(/,/g, '');
        ing.name = ing.name.replace(/\s?$/, '');
        ing.name = ing.name.replace(/^\s/, '');
        ing.name = ing.name.trim();

        if (tmpAmount) {
            if (ing.unit !== 'Little') {
                ing.amountMin = tmpAmount + '';
            }
        }

        return ing;
    };

    module.exports = Parser;
})(module);
