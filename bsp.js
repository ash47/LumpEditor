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
var SIZE_DGAMELUMP_T = 16;
var SIZE_COLORRGBEXP32 = 4;

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
var LUMP_GAME_LUMP = 35;

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

// Updates a lump
// WARNING: THIS WILL DESTROY ALL OTHER LOADED LUMPS, RELOAD THEM! (THIS MAY BE FIXED LATER)
bsp.prototype.updateLump = function(lumpNumber, data) {
    if(lumpNumber == LUMP_GAME_LUMP) {
        throw new Error('Unable to update lump number '+lumpNumber);
    }

    // Grab the lump info
    var lump = this.lump_ts[lumpNumber];
    var oldSize = lump.filelen;

    // Workout how far we need to push the rest of the data
    var offsetSize = data.length - oldSize;

    // Tell the user the change in buffer size
    console.log('Changing lump '+lumpNumber+' from '+oldSize+' to '+data.length+' (Offset='+offsetSize+')');

    // Update game lump
    var gl = this.getLump(LUMP_GAME_LUMP).data.dgamelump_ts;
    for(var i=0; i<gl.length; i++) {
        var nextLump = gl[i];

        if(nextLump.fileofs > lump.fileofs) {
            nextLump.fileofs += offsetSize;
            nextLump.save();
        }
    }

    // Store the new size of the lump
    lump.filelen = data.length;
    lump.save();

    // Push other lumps by correct amount
    for(var i=0; i<HEADER_LUMPS; i++) {
        var nextLump = this.lump_ts[i];

        if(nextLump.fileofs > lump.fileofs) {
            nextLump.fileofs += offsetSize;
            nextLump.save();
        }
    }

    console.log('Original length: '+this.data.length);

    // Merge the data in
    this.data = Buffer.concat([
        this.data.slice(0, lump.fileofs),
        data,
        this.data.slice(lump.fileofs+oldSize)
    ]);

    console.log('New length: '+this.data.length);
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

    console.log('Map version '+this.version);
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
        case LUMP_ENTITIES:
            // Create a string of the data
            var data = ''+rawData;
            var i = 0;
            var line = 1;

            // We are looking for a key
            var key = null;

            // Our current entity
            var curEnt = null;

            // Stores entities
            var ents = new entityList();

            // Build entity list
            while(i < data.length) {
                // Grab a character
                var chr = data.charAt(i);

                if(chr == ' ' || chr == '\t') {
                    // White space, ignore it
                } else if(chr == '\n') {
                    // We moved onto the next line
                    line++;
                    if(data.charAt(i+1) == '\r') i++;
                } else if(chr == '\r') {
                    // We moved onto the next line
                    line++;
                    if(data.charAt(i+1) == '\n') i++;
                } else if(chr == '"') {
                    // Make sure we have an entity
                    if(curEnt == null) {
                        throw new Error("Key value pair outside of an entity at line "+line);
                    }

                    var resultString = '';
                    i++;

                    while(i < data.length) {
                        chr = data.charAt(i);
                        if(chr == '"') break;

                        if(chr == '\n') {
                            // We moved onto the next line
                            line++;
                            if(data.charAt(i+1) == '\r') i++;
                        } else if(chr == '\r') {
                            // We moved onto the next line
                            line++;
                            if(data.charAt(i+1) == '\n') i++;
                        } else if(chr == '\\') {
                            i++;
                            // Gran the mext cjaracter
                            chr = data.charAt(i);

                            // Check for escaped characters
                            switch(chr) {
                                case '\\':chr = '\\'; break;
                                case '"': chr = '"'; break;
                                case '\'': chr = '\''; break;
                                case 'n': chr = '\n'; break;
                                case 'r': chr = '\r'; break;
                                default:
                                    chr = '\\';
                                    i--;
                                break;
                            }
                        }

                        resultString += chr;
                        i++;
                    }

                    if (i == data.length || chr == '\n' || chr == '\r') throw new Error("Unterminated string at line " + line);

                    // Store string
                    if(key == null) {
                        key = resultString;
                    } else {
                        // Store this key value pair
                        curEnt.addKey(key, resultString);

                        // Reset key
                        key = null;
                    }

                    // Check if we need to reparse the character that ended this string
                    if(chr != '"') --i;
                } else if(chr == '{') {
                    // Create a new entity
                    curEnt = new entity();
                    key = null;
                } else if (chr == '}') {
                    // Store current entity
                    if(curEnt.totalKeys() > 0) {
                        ents.addEntity(curEnt);
                    }

                    // No current entity
                    curEnt = null;
                } else if (chr == '\0') {
                    // Ent of lump
                } else {
                    console.log("Unexpected character \"" + chr + "\" at line " + line + " (offset " + i + ")");

                    // Skip to next line
                    while(++i < data.length) {
                        chr = data.charAt(i);

                        // Check for new line
                        if(chr == '\n' || chr == '\r') break;
                    }

                    // We are on a new line
                    line++;

                    // Move onto the next char
                    i++;
                }

                i++;
            }

            // Store entities
            lump.data = ents;
        break;

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

        case LUMP_LIGHTING:
            var total = lump_t.filelen / SIZE_COLORRGBEXP32;

            // Build useful data
            data = [];
            for(var i=0; i<total; i++) {
                data[i] = new ColorRGBExp32(rawData.slice(i*SIZE_COLORRGBEXP32, (i+1)*SIZE_COLORRGBEXP32));
            }

            // Store data onto the lump
            lump.data = data;
        break;

        case LUMP_GAME_LUMP:
            // Load game lumps
            lump.data = new dgamelumpheader_t(rawData);
        break;
    }

    return lump;
}

/*
entityList class
*/

function entityList() {
    // List of entities in this list
    this.ents = [];
}

// Adds an entity to this list
entityList.prototype.addEntity = function(ent) {
    this.ents.push(ent);
}

// Creates a new entity by classname
entityList.prototype.createEntity = function(cls) {
    // Create new entity
    var ent = new entity();

    // Store class
    ent.addKey('classname', cls);

    // Add to our list
    this.ents.push(ent);

    // Return to user
    return ent;
}

// Gets the nth entity by name
entityList.prototype.getEntityByName = function(name, n) {
    // Default n to 0
    n = n || 0;
    var count = 0;

    // Loop over all entities
    for(var i=0; i<this.ents.length; i++) {
        var ent = this.ents[i];

        // Compare the name
        if(ent.getValue('targetname') == name) {
            // Is this the correct one?
            if(count == n) {
                return ent;
            }

            count++;
        }
    }

    // No entity found
    return null;
}

// Returns the nth entity by origin
entityList.prototype.getEntityByOrigin = function(originVector, n) {
    // Default n to 0
    n = n || 0;
    var count = 0;

    // Grab comparable string
    var o = originVector.toMapString();

    // Loop over all entities
    for(var i=0; i<this.ents.length; i++) {
        var ent = this.ents[i];

        // Compare the name
        if(ent.getValue('origin') == o) {
            // Is this the correct one?
            if(count == n) {
                return ent;
            }

            count++;
        }
    }

    // No entity found
    return null;
}

// Removes an entity from the list
entityList.prototype.removeEntity = function(ent) {
    if(!ent) {
        console.log('WARNING: removeEntity was called with a null entity!');
        return false;
    }

    // Loop over all entities
    for(var i=0; i<this.ents.length; i++) {
        if(this.ents[i] === ent) {
            this.ents.splice(i, 1);
            return true;
        }
    }

    // Warnings
    console.log('WARNING: removeEntity failed to find the entity!');

    return false;
}

entityList.prototype.createBuffer = function() {
    var str = '';

    // Loop over all entities
    for(var i=0; i<this.ents.length; i++) {
        // Grab an entitiy
        var ent = this.ents[i];

        // Open a brace
        str += '{\n';

        // Add kv pairs
        var keys = ent.getAllKeys();
        for(var j=0; j<keys.length; j++) {
            var key = keys[j];

            // Add kv pair
            str += '"'+key[0]+'" "'+key[1]+'"\n';
        }

        // Close a brace
        str += '}\n';
    }

    // Add null terminator
    str += '\0';

    // Convert into buffer
    var out = new Buffer(str.length);
    out.write(str);

    // Return buffer
    return out;
}

/*
entity class
*/
function entity() {
    // Stores key value pairs
    this.keys = [];
}

// Add key value pair
entity.prototype.addKey = function(key, value) {
    // Convert value
    if(value instanceof Vector) {
        value = value.toMapString();
    }

    this.keys.push([key, value]);
}

// Sets the name of this entity
entity.prototype.setName = function(name) {
    // Check if we already have a targetname key
    for(var i=0; i<this.keys.length; i++) {
        var key = this.keys[i];

        if(key[0] == 'targetname') {
            key[1] = name;
            return true;
        }
    }

    // Key must not exist, add it
    this.addKey('targetname', name);

    return false;
}

// Sets the nth key of this entity (creating a new key if n dont exist)
entity.prototype.setKey = function(keyName, value, n) {
    var count = 0;
    n = n || 0;

    // Convert value
    if(value instanceof Vector) {
        value = value.toMapString();
    }

    // Check if we already have a targetname key
    for(var i=0; i<this.keys.length; i++) {
        var key = this.keys[i];

        if(key[0] == keyName) {
            if(count == n) {
                key[1] = value;
                return true;
            }

            count++;
        }
    }

    // Key must not exist, add it
    this.addKey('keyName', value);

    return false;
}

// Returns how many keys are in this entity
entity.prototype.totalKeys = function() {
    return this.keys.length;
}

// Finds all the kv pairs with the given key
entity.prototype.getKeys = function(key) {
    var k = [];

    // Loop over all our keys
    for(var i=0; i<this.keys.length; i++) {
        // Check if this is the key we are looking for
        if(this.keys[i][0] == key) {
            // Add it to the list of keys
            k.push(this.keys[i]);
        }
    }

    // Give the list of keys
    return k;
}

// Returns the nth value for a given key (null for doesnt exist)
entity.prototype.getValue = function(key, n) {
    var count = 0;
    n = n || 0;

    // Loop over all our keys
    for(var i=0; i<this.keys.length; i++) {
        // Check if this is the key we are looking for
        if(this.keys[i][0] == key) {
            // Check if this was the one we wanted
            if(count == n) {
                return this.keys[i][1];
            }

            count++;
        }
    }

    return null;
}

// Gets all keys
entity.prototype.getAllKeys = function() {
    return this.keys;
}

/*
lump_t class
*/
function lump_t(buff) {
    this.buff = buff;
    this.load();
}

lump_t.prototype.load = function() {
    this.fileofs = this.buff.readInt32LE(0);
    this.filelen = this.buff.readInt32LE(4);
    this.version = this.buff.readInt32LE(8);
    this.fourCC = this.buff.toString(null, 12, 16);
}

lump_t.prototype.save = function() {
    this.buff.writeInt32LE(this.fileofs, 0);
    this.buff.writeInt32LE(this.filelen, 4);
    this.buff.writeInt32LE(this.version, 8);

    // Save fourCC
}

/*
dgamelumpheader_t class
*/
function dgamelumpheader_t(buff) {
    this.buff = buff;
    this.load();
}

dgamelumpheader_t.prototype.load = function() {
    this.lumpCount = this.buff.readInt32LE(0);

    // Build useful data
    this.dgamelump_ts = [];
    for(var i=0; i<this.lumpCount; i++) {
        //console.log(i);
        this.dgamelump_ts[i] = new dgamelump_t(this.buff.slice(4+i*SIZE_DGAMELUMP_T, 4+(i+1)*SIZE_DGAMELUMP_T));
    }
}



/*
dgamelump_t class
*/

function dgamelump_t(buff) {
    this.buff = buff;
    this.load();
}

dgamelump_t.prototype.load = function() {
    this.id = this.buff.readInt32LE(0);
    this.flags = this.buff.readUInt16LE(4);
    this.version = this.buff.readUInt16LE(6);
    this.fileofs = this.buff.readInt32LE(8);
    this.filelen = this.buff.readInt32LE(12);
}

dgamelump_t.prototype.save = function() {
    this.buff.writeInt32LE(this.id, 0);
    this.buff.writeUInt16LE(this.flags, 4);
    this.buff.writeUInt16LE(this.version, 6);
    this.buff.writeInt32LE(this.fileofs, 8);
    this.buff.writeInt32LE(this.filelen, 12);
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
ColorRGBExp32 class
*/
function ColorRGBExp32(buff) {
    this.buff = buff;
    this.load();
}

ColorRGBExp32.prototype.load = function() {
    this.r = this.buff.readUInt8(0);
    this.g = this.buff.readUInt8(1);
    this.b = this.buff.readUInt8(2);
    this.exponent = this.buff.readInt8(3);
}

ColorRGBExp32.prototype.save = function() {
    this.buff.writeUInt8(this.r, 0);
    this.buff.writeUInt8(this.g, 1);
    this.buff.writeUInt8(this.b, 2);
    this.buff.writeInt8(this.exponent, 3);
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

Vector.prototype.toMapString = function() {
    return(this.x+' '+this.y+' '+this.z);
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
