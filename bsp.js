// Imports
var fs = require('fs');

/*
Constants
*/
var fileDir = 'maps/';

// Status codes
var STATUS_READING = 1;
var STATUS_LOADING = 2;
var STATUS_READY = 3;

// BSP Format constants
var SIZE_INT = 4;
var SIZE_LUMP_T = 16;
var SIZE_DDISPINFO_T = 176;
var HEADER_LUMPS = 64;

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

/*
BSP class
*/

function bsp(fileName, callback) {
    // Init bsp
    this.fileName = fileName;
    this.status = STATUS_READING;

    // Grab a copy of this bsp
    var thisBSP = this;

    // Check if the file exists
    fs.exists(fileDir+fileName, function(exists) {
        if(!exists) {
            throw new Error('Failed to find file '+fileDir+fileName);
        }

        // Load the file
        fs.readFile(fileDir+fileName, function(err, data) {
            if (err) throw err;

            // Store the data
            thisBSP.data = data;

            // Store that it's loading the lumps
            thisBSP.status = STATUS_LOADING;

            // Load the lumps
            thisBSP.findLumps();

            // BSP is now ready
            thisBSP.status = STATUS_READY;

            // Run the callback
            callback(thisBSP);
        })
    });
}

// Finds the different lumps
bsp.prototype.findLumps = function() {
    // Ensure it's the right time to call this function
    if(this.status < STATUS_LOADING) throw new Error('Failed to find lumps: BSP isn\'t loaded yet!');
    if(this.status > STATUS_LOADING) return;

    // Read header info
    this.ident = this.data.readUInt32LE(0);

    // Validate the header
    if(this.ident != 1347633750) {
        console.log('WARNING: Invalid header!');
    }

    this.version = this.data.readUInt32LE(4);

    // Load in all lump_t's
    this.lump_ts = [];
    for(var i=0; i<HEADER_LUMPS; i++) {
        this.lump_ts[i] = new lump_t(this.data.slice(8+i*SIZE_LUMP_T, 8+(i+1)*SIZE_LUMP_T));
    }

    // Load the map revision
    this.mapRevision = this.data.readUInt32LE(8+HEADER_LUMPS*SIZE_LUMP_T);
}

// Return the lump data for the given number
bsp.prototype.getLump = function(number) {
    if(this.status != STATUS_READY) throw new Error('Failed to get lump: BSP not ready!');

    // Grab the lump header info
    var lump_t = this.lump_ts[number];

    // Grab the lump
    var rawData = this.data.slice(lump_t.fileofs, lump_t.fileofs+lump_t.filelen);

    var lump = {
        rawData: rawData
    };

    // Load the data specific stuff
    switch(number) {
        case LUMP_DISPINFO:
            var total = lump_t.filelen / SIZE_DDISPINFO_T;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = new ddispinfo_t(rawData.slice(i*SIZE_DDISPINFO_T, (i+1)*SIZE_DDISPINFO_T));
            }

            // Store data onto the lump
            lump.data = data;
        break;
    }

    return lump;
}

/*
lump_t class
*/
function lump_t(buff) {
    this.fileofs = buff.readUInt32LE(0);
    this.filelen = buff.readUInt32LE(4);
    this.version = buff.readUInt32LE(8);
    this.fourCC = buff.toString(null, 12, 16);
}

/*
ddispinfo_t class
*/
function ddispinfo_t(buff) {
    this.startPosition = buff.readVector(0);
    this.DispVertStart = buff.readUInt32LE(12);
    this.DispTriStart = buff.readUInt32LE(16);
    this.power = buff.readUInt32LE(20);
    this.minTess = buff.readUInt32LE(24);
    this.smoothingAngle = buff.readFloatLE(28);
    this.contents = buff.readUInt32LE(28);
    this.MapFace = buff.readUInt16LE(32);
    this.LightmapAlphaStart = buff.readUInt32LE(34);
    this.LightmapSamplePositionStart = buff.readUInt32LE(38);

    // missing EdgeNeighbors, CornerNeighbors, AllowedVerts
}

/*
vector class
*/
function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z
}

Vector.prototype.toString = function() {
    return('('+this.x+','+this.y+','+this.z+')');
}

/*
Extend buffer class
*/
Buffer.prototype.readVector = function(offset) {
    return new Vector(this.readFloatLE(offset), this.readFloatLE(offset+4), this.readFloatLE(offset+8))
}

// Define exports
exports.bsp = bsp;
exports.Vector = Vector;
