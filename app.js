// Imports
var bsp = require('./bsp.js').bsp;
var Vector = require('./bsp.js').Vector;

// Lump IDs
var LUMP_ENTITIES = 0;
var LUMP_PLANES = 1;
var LUMP_TEXDATA = 2;
var LUMP_VERTEXES = 3;
var LUMP_VISIBILITY = 4;
var LUMP_NODES = 5;
var LUMP_TEXINFO = 6;
var LUMP_FACES = 7;
var LUMP_LIGHTING = 8;
var LUMP_OCCLUSION = 9;
var LUMP_LEAFS = 10;
var LUMP_FACEIDS = 11;
var LUMP_EDGES = 12;
var LUMP_SURFEDGES = 13;
var LUMP_MODELS = 14;
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
    var faces = map.getLump(LUMP_FACES).data;
    //var planes = map.getLump(LUMP_PLANES).data;
    var vertexes = map.getLump(LUMP_VERTEXES).data;
    var edges = map.getLump(LUMP_EDGES).data;
    var surfedges = map.getLump(LUMP_SURFEDGES).data;

    for(var i=0; i<dispinfo.length; i++) {
        // Grab the position of this displacement
        var disp = dispinfo[i];
        var pos = disp.startPosition;

        // Check if this is a cave displacement
        if(toRemove[pos.toString()]) {

            var face = faces[disp.MapFace];
            if(face) {
                // Loop over this face's surfedges
                for(var j=0; j<face.numedges; j++) {
                    var surfedge = surfedges[face.firstedge+j];
                    if(surfedge) {
                        var edge = edges[Math.abs(surfedge)];
                        if(edge) {
                            // Grab the vertexes
                            var a = vertexes[edge.v[0]];
                            var b = vertexes[edge.v[1]];
                            if(a && b) {
                                // Set them all to (0,0,0)
                                a.x = 0;
                                b.x = 0;
                                a.y = 0;
                                b.y = 0;
                                a.z = 0;
                                b.z = 0;
                                a.save();
                                b.save();
                            } else {
                                console.log('Failed to find vertexes!');
                            }
                        } else {
                            console.log('Failed to find edge!');
                        }
                    } else {
                        console.log('Failed to find surface edge!');
                    }
                }
            } else {
                console.log('Failed to find face!');
            }
        }
    }

    // Save the bsp
    map.save('output.bsp', function() {
        console.log('Done saving!');
    });
});
