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
var SIZE_VECTOR = 12;
var SIZE_LUMP_T = 16;
var SIZE_DEDGE_T = 4;
var SIZE_DPLANE_T = 20;
var SIZE_DFACE_T = 56;
var SIZE_DDISPINFO_T = 176;
var HEADER_LUMPS = 64;

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
            if(callback) callback(thisBSP);
        })
    });
}

// Saves the bsp
bsp.prototype.save = function(newName, callback) {
    fs.writeFile(fileDir+newName, this.data, function(err) {
        if (err) throw err;

        // run the callback
        if(callback) callback();
    })
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

        case LUMP_FACES:
            var total = lump_t.filelen / SIZE_DFACE_T;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = new dface_t(rawData.slice(i*SIZE_DFACE_T, (i+1)*SIZE_DFACE_T));
            }

            // Store data onto the lump
            lump.data = data;
        break;

        case LUMP_PLANES:
            var total = lump_t.filelen / SIZE_DPLANE_T;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = new dplane_t(rawData.slice(i*SIZE_DPLANE_T, (i+1)*SIZE_DPLANE_T));
            }

            // Store data onto the lump
            lump.data = data;
        break;

        case LUMP_VERTEXES:
            var total = lump_t.filelen / SIZE_VECTOR;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = new Vector_s(rawData.slice(i*SIZE_VECTOR, (i+1)*SIZE_VECTOR));
            }

            // Store data onto the lump
            lump.data = data;
        break;

        case LUMP_EDGES:
            var total = lump_t.filelen / SIZE_DEDGE_T;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = new dedge_t(rawData.slice(i*SIZE_DEDGE_T, (i+1)*SIZE_DEDGE_T));
            }

            // Store data onto the lump
            lump.data = data;
        break;

        case LUMP_SURFEDGES:
            var total = lump_t.filelen / SIZE_INT;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = rawData.readInt32LE(i*SIZE_INT);
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
    //this.buff = buff;
    this.fileofs = buff.readInt32LE(0);
    this.filelen = buff.readInt32LE(4);
    this.version = buff.readInt32LE(8);
    this.fourCC = buff.toString(null, 12, 16);
}

/*
dplane_t class
*/
function dplane_t(buff) {
    this.buff = buff;
    this.load();
}

dplane_t.prototype.load = function() {
    this.normal = this.buff.readVector(0);
    this.dist = this.buff.readFloatLE(12);
    this.type = this.buff.readUInt32LE(16);
}

dplane_t.prototype.save = function() {
    this.buff.writeVector(this.normal, 0);
    this.buff.writeFloatLE(this.dist, 12);
    this.buff.writeUInt32LE(this.type, 16);
}

/*
dedge_t class
*/
function dedge_t(buff) {
    this.buff = buff;
    this.load();
}

dedge_t.prototype.load = function() {
    this.v = new Array(this.buff.readUInt16LE(0), this.buff.readUInt16LE(2));
}

dedge_t.prototype.save = function() {
    this.buff.writeUInt16LE(this.v[0], 0)
    this.buff.writeUInt16LE(this.v[1], 2);
}


/*
dface_t class
*/
function dface_t(buff) {
    this.buff = buff;
    this.load();
}

dface_t.prototype.load = function(){
    this.planenum = this.buff.readUInt16LE(0);
    this.side = this.buff.readUInt8(2);
    this.onNode = this.buff.readUInt8(3);
    this.firstedge = this.buff.readInt32LE(4);
    this.numedges = this.buff.readInt16LE(8);
    this.texinfo = this.buff.readInt16LE(10);
    this.dispinfo = this.buff.readInt16LE(12);
    this.surfaceFogVolumeID = this.buff.readInt16LE(14);
    this.styles = new Array(this.buff.readUInt8(16), this.buff.readUInt8(17), this.buff.readUInt8(18), this.buff.readUInt8(19));
    this.lightofs = this.buff.readInt32LE(20);
    this.area = this.buff.readFloatLE(24);
    this.LightmapTextureMinsInLuxels = new Array(this.buff.readInt32LE(28), this.buff.readInt32LE(32));
    this.LightmapTextureSizeInLuxels = new Array(this.buff.readInt32LE(36), this.buff.readInt32LE(40));
    this.origFace = this.buff.readInt32LE(44);
    this.numPrims = this.buff.readUInt16LE(48);
    this.firstPrimID = this.buff.readUInt16LE(50);
    this.smoothingGroups = this.buff.readInt32LE(52);
}

dface_t.prototype.save = function(){
    this.buff.writeUInt16LE(this.planenum, 0);
    this.buff.writeUInt8(this.side, 2);
    this.buff.writeUInt8(this.onNode, 3);
    this.buff.writeInt32LE(this.firstedge, 4);
    this.buff.writeInt16LE(this.numedges, 8);
    this.buff.writeInt16LE(this.texinfo, 10);
    this.buff.writeInt16LE(this.dispinfo, 12);
    this.buff.writeInt16LE(this.surfaceFogVolumeID, 14);
    this.buff.writeUInt8(this.styles[0], 16);
    this.buff.writeUInt8(this.styles[1], 17);
    this.buff.writeUInt8(this.styles[2], 18);
    this.buff.writeUInt8(this.styles[3], 19);
    this.buff.writeInt32LE(this.lightofs, 20);
    this.buff.writeFloatLE(this.area, 24);
    this.buff.writeInt32LE(this.LightmapTextureMinsInLuxels[0], 28);
    this.buff.writeInt32LE(this.LightmapTextureMinsInLuxels[1], 32);
    this.buff.writeInt32LE(this.LightmapTextureSizeInLuxels[0], 36);
    this.buff.writeInt32LE(this.LightmapTextureSizeInLuxels[1], 40);
    this.buff.writeInt32LE(this.origFace, 44);
    this.buff.writeUInt16LE(this.numPrims, 48);
    this.buff.writeUInt16LE(this.firstPrimID, 50);
    this.buff.writeInt32LE(this.smoothingGroups, 52);
}

/*
ddispinfo_t class
*/
function ddispinfo_t(buff) {
    this.buff = buff;
    this.load();
}

ddispinfo_t.prototype.load = function() {
    this.startPosition = this.buff.readVector(0);
    this.DispVertStart = this.buff.readInt32LE(12);
    this.DispTriStart = this.buff.readInt32LE(16);
    this.power = this.buff.readInt32LE(20);
    this.minTess = this.buff.readInt32LE(24);
    this.smoothingAngle = this.buff.readFloatLE(28);
    this.contents = this.buff.readInt32LE(32);
    this.MapFace = this.buff.readUInt16LE(36);
    this.LightmapAlphaStart = this.buff.readInt32LE(38);
    this.LightmapSamplePositionStart = this.buff.readInt32LE(42);

    // missing EdgeNeighbors, CornerNeighbors, AllowedVerts
}

ddispinfo_t.prototype.save = function() {
    this.buff.writeVector(this.startPosition, 0);
    this.buff.writeInt32LE(this.DispVertStart, 12);
    this.buff.writeInt32LE(this.DispTriStart, 16);
    this.buff.writeInt32LE(this.power, 20);
    this.buff.writeInt32LE(this.minTess, 24);
    this.buff.writeFloatLE(this.smoothingAngle, 28);
    this.buff.writeInt32LE(this.contents, 32);
    this.buff.writeUInt16LE(this.MapFace, 36);
    this.buff.writeInt32LE(this.LightmapAlphaStart, 38);
    this.buff.writeInt32LE(this.LightmapSamplePositionStart, 42);

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
saveable vector
*/
function Vector_s(buff) {
    this.buff = buff;
    this.load();
}

Vector_s.prototype = new Vector(0, 0, 0);

Vector_s.prototype.load = function() {
    this.x = this.buff.readFloatLE(0);
    this.y = this.buff.readFloatLE(4);
    this.z = this.buff.readFloatLE(8);
}

Vector_s.prototype.save = function() {
    this.buff.writeFloatLE(this.x, 0);
    this.buff.writeFloatLE(this.y, 4);
    this.buff.writeFloatLE(this.z, 8);
}

/*
Extend buffer class
*/
Buffer.prototype.readVector = function(offset) {
    return new Vector(this.readFloatLE(offset), this.readFloatLE(offset+4), this.readFloatLE(offset+8));
}
Buffer.prototype.writeVector = function(vec, offset) {
    this.writeFloatLE(vec.x, offset);
    this.writeFloatLE(vec.y, offset+4);
    this.writeFloatLE(vec.z, offset+8);
}

// Define exports
exports.bsp = bsp;
exports.Vector = Vector;
