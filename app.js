// Imports
var bsp = require('./bsp.js').bsp;
var Vector = require('./bsp.js').Vector;

// Lump IDs
var LUMP_ENTITIES = 0;
var LUMP_PLANES = 1;
var LUMP_TEXDATA = 3;
var LUMP_VERTEXES = 4;
var LUMP_VISIBILITY = 5;
var LUMP_NODES = 6;
var LUMP_TEXINFO = 7;
var LUMP_FACES = 8;
var LUMP_LIGHTING = 9;
var LUMP_OCCLUSION = 10;
var LUMP_LEAFS = 11;
var LUMP_FACEIDS = 12;
var LUMP_EDGES = 13;
var LUMP_SURFEDGES = 14;
var LUMP_MODELS = 15;
var LUMP_DISPINFO = 26;

// Replace shit
var toRemove = {};
function doRemove(x, y, z) {
    toRemove[new Vector(x, y, z).toString()] = true;
}

//doRemove(-9608,11256,58); // ground displacement
doRemove(-9608,12914,368);
doRemove(-8840,12426,64);
doRemove(-9096,12450,368);
doRemove(-9096,12426,368);
doRemove(-9480,11426,368);
doRemove(-9480,11426,64);
doRemove(-9480,11450,368);
doRemove(-9480,11450,64);
doRemove(-8840,11426,64);
doRemove(-9480,12426,64);
doRemove(-9096,12426,368);
doRemove(-8840,11426,368);
doRemove(-9480,11450,671);
doRemove(-9480,12426,368);
doRemove(-9608,12938,64);
doRemove(-9096,12426,64);
doRemove(-8840,12938,64);
doRemove(-8584,11256,64);
doRemove(-9608,12938,368);
doRemove(-8584,11256,368);


// Load a bsp
new bsp('test.bsp', function(map) {
    var dispinfo = map.getLump(LUMP_DISPINFO).data;

    for(var i=0; i<dispinfo.length; i++) {
        // Grab the position of this displacement
        var pos = dispinfo[i].startPosition;

        if(toRemove[pos.toString()]) {
            console.log('Found it!');
        }
    }
});
