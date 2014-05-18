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
var LUMP_DISP_VERTS = 33;
var LUMP_GAME_LUMP = 35;
var LUMP_TEXDATA_STRING_DATA = 43;

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

// The position of the displacement that needs to be made smoother
var dispPatchPos = new Vector(-5566, -385, 58).toString();

// Progrsss update
console.log('Attempting to load evocity...');

// Load a bsp
new bsp('RP_EvoCity_v2d.bsp', function(map) {
    // Progress update
    console.log('Loaded map, editing entities...');

    // How fast the lift will now travel
    var newLiftSpeed = 200;
    var otherLiftSpeed = 400;

    // Grab all entities
    var ents = map.getLump(LUMP_ENTITIES).data;
    var ent;

    // Grab the lift
    var lift = ents.getEntityByName('PDElevatorIsAPainInYourAss');
    if(!lift) throw new Error('Failed to find the lift!');
    lift.setName('Ash47_Lift');
    lift.setKey('startspeed', newLiftSpeed);
    //lift.setKey('target', 'Floor5');

    // Modify other lifts
    ent = ents.getEntityByName('TallBuild_Elev2');
    if(!ent) throw new Error('Failed to find the lift!');
    ent.setKey('startspeed', otherLiftSpeed);
    ent.setKey('target', 'elev1_l2');

    ent = ents.getEntityByName('lookatmeimaliftgoinguporgoingdown');
    if(!ent) throw new Error('Failed to find the lift!');
    ent.setKey('startspeed', otherLiftSpeed);
    ent.setKey('target', 'niggervader1');

    // Make lifts land correctly
    ent = ents.getEntityByName('niggervader2');
    if(!ent) throw new Error('Failed to find the lift!');
    ent.setKey('origin', new Vector(-7819, -8683, -380+36));

    ent = ents.getEntityByName('niggervader1');
    if(!ent) throw new Error('Failed to find the lift!');
    ent.setKey('origin', new Vector(-7819, -8683, -2191-28));

    ent = ents.getEntityByName('elev1_l1');
    if(!ent) throw new Error('Failed to find the lift!');
    ent.setKey('origin', new Vector(-4708, -9285, 129.958-24));

    ent = ents.getEntityByName('elev1_l2');
    if(!ent) throw new Error('Failed to find the lift!');
    ent.setKey('origin', new Vector(-4708, -9285, 1677.96+24));

    // Patch the lower lift buttons
    ent = ents.getEntityByOrigin(new Vector(-7769.5, -8608.5, -325.5));
    if(!ent) throw new Error('Failed to find the lift button!');
    ent.setKey('OnPressed', 'lookatmeimaliftgoinguporgoingdown,StartForward,0,0,0');
    ent.setKey('sounds', '3');

    ent = ents.getEntityByOrigin(new Vector(-7766.96, -8724.5, -2163.66));
    if(!ent) throw new Error('Failed to find the lift button!');
    ent.setKey('OnPressed', 'lookatmeimaliftgoinguporgoingdown,StartForward,0,0,0');
    ent.setKey('sounds', '3');

    ent = ents.getEntityByOrigin(new Vector(-7769.5, -8608.5, -2153.5));
    if(!ent) throw new Error('Failed to find the lift button!');
    ent.setKey('OnPressed', 'lookatmeimaliftgoinguporgoingdown,StartForward,0,0,0');
    ent.setKey('sounds', '3');

    // Tall building buttons
    ent = ents.getEntityByName('call1');
    if(!ent) throw new Error('Failed to find the lift button!');
    ent.setKey('OnPressed', 'TallBuild_Elev2,StartForward,0,0,0');
    ent.setKey('sounds', '3');

    ent = ents.getEntityByName('call2');
    if(!ent) throw new Error('Failed to find the lift button!');
    ent.setKey('OnPressed', 'TallBuild_Elev2,StartForward,0,0,0');
    ent.setKey('sounds', '3');

    ent = ents.getEntityByName('cockbtn1');
    if(!ent) throw new Error('Failed to find the lift button!');
    ent.setKey('OnPressed', 'TallBuild_Elev2,StartForward,0,0,0');
    ent.setKey('sounds', '3');

    // Grab the button model
    ent = ents.getEntityByOrigin(new Vector(-7106, -9382, 132));
    if(!ent) throw new Error('Failed to find button model!');
    var buttonModel = ent.getValue('model');
    ents.removeEntity(ent);

    // Elevator button
    ent = ents.getEntityByOrigin(new Vector(-7115, -9354, 144));
    if(!ent) throw new Error('Failed to find Elevator button!');
    ents.removeEntity(ent);

    // Second Floor Button
    ent = ents.getEntityByOrigin(new Vector(-7106, -9382, 894));
    if(!ent) throw new Error('Failed to find Second Floor Button');
    ents.removeEntity(ent);

    // Third Floor Button
    ent = ents.getEntityByOrigin(new Vector(-7122, -9382, 1530));
    if(!ent) throw new Error('Failed to find Third Floor Button');
    ents.removeEntity(ent);

    // Fourth Floor Button
    ent = ents.getEntityByOrigin(new Vector(-7124, -9379.24, 2682.73));
    if(!ent) throw new Error('Failed to find Fourth Floor Button');
    ents.removeEntity(ent);

    // Remove old hooks
    ent = ents.getEntityByName('relay_f1');
    if(!ent) throw new Error('Failed to find relay f1');
    ents.removeEntity(ent);

    ent = ents.getEntityByName('relay_f2');
    if(!ent) throw new Error('Failed to find relay f2');
    ents.removeEntity(ent);

    ent = ents.getEntityByName('relay_f3')
    if(!ent) throw new Error('Failed to find relay f3');
    ents.removeEntity(ent);

    // Modify the old track
    ent = ents.getEntityByName('Floor4')
    if(!ent) throw new Error('Failed to find Floor4');
    ent.setKey('OnPass', 'ash47_fm_01,Trigger,0,0,0');
    ent.setKey('origin', new Vector(-7188, -9309, 128-9));

    ent = ents.getEntityByName('Floor2')
    if(!ent) throw new Error('Failed to find Floor4');
    ent.setKey('OnPass', 'ash47_fm_02,Trigger,0,0,0');
    ent.setKey('origin', new Vector(-7188, -9309, 908-6));

    ent = ents.getEntityByName('Floor3')
    if(!ent) throw new Error('Failed to find Floor4');
    ent.setKey('OnPass', 'ash47_fm_03,Trigger,0,0,0');
    ent.setKey('origin', new Vector(-7188, -9309, 1548-6));

    ent = ents.getEntityByName('Floor5')
    if(!ent) throw new Error('Failed to find Floor4');
    ent.setKey('OnPass', 'ash47_fm_04,Trigger,0,0,0');
    ent.setKey('origin', new Vector(-7188, -9309, 2680+15));

    // Relays to make lift take shortest route
    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_02_f');
    ent.addKey('OnTrigger', 'Ash47_Lift,StartForward,0,0,0');

    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_02_b');
    ent.addKey('OnTrigger', 'Ash47_Lift,StartBackward,0,0,0');

    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_03_f');
    ent.addKey('OnTrigger', 'Ash47_Lift,StartForward,0,0,0');

    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_03_b');
    ent.addKey('OnTrigger', 'Ash47_Lift,StartBackward,0,0,0');

    /*
    Floor Managers
    */

    // Floor 1
    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_fm_01');
    ent.addKey('OnTrigger', 'Ash47_Lift,Stop,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_02,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_03,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_04,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_02_f,Enable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_03_f,Enable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_02_b,Disable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_03_b,Disable,0,0,0');

    // Floor 2
    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_fm_02');
    ent.addKey('OnTrigger', 'Ash47_Lift,Stop,0,0.070,0');
    ent.addKey('OnTrigger', 'ash47_btn_01,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_03,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_04,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_03_f,Enable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_03_b,Disable,0,0,0');
    ent.addKey('StartDisabled', '1');

    // Floor 3
    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_fm_03');
    ent.addKey('OnTrigger', 'Ash47_Lift,Stop,0,0.074,0');
    ent.addKey('OnTrigger', 'ash47_btn_01,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_02,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_04,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_02_f,Disable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_02_b,Enable,0,0,0');
    ent.addKey('StartDisabled', '1');

    // Floor 4
    ent = ents.createEntity('logic_relay');
    ent.setName('ash47_fm_04');
    ent.addKey('OnTrigger', 'Ash47_Lift,Stop,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_01,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_02,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_btn_03,Unlock,0,0,0');
    ent.addKey('OnTrigger', 'ash47_02_f,Disable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_03_f,Disable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_02_b,Enable,0,0,0');
    ent.addKey('OnTrigger', 'ash47_03_b,Enable,0,0,0');
    ent.addKey('StartDisabled', '1');

    /*
    Create Buttons
    */

        /*
        Floor 1
        */

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_01');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7115, -9354, 126));
    ent.addKey('angles', new Vector(0, 180, 0));
    ent.addKey('parentname', 'Ash47_Lift');
    ent.addKey('spawnflags', '1025');
    ent.addKey('StartDisabled', '1');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Enable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Disable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'Ash47_Lift,StartBackward,0,0,0');

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_01');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7117, -9381, 142));
    ent.addKey('angles', new Vector(0, 0, 0));
    ent.addKey('spawnflags', '1025');
    ent.addKey('StartDisabled', '1');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Enable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Disable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'Ash47_Lift,StartBackward,0,0,0');

        /*
        Floor 2
        */

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_02');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7115, -9354, 134));
    ent.addKey('angles', new Vector(0, 180, 0));
    ent.addKey('parentname', 'Ash47_Lift');
    ent.addKey('spawnflags', '1025');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Enable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Disable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'ash47_02_f,Trigger,0,0,0');
    ent.addKey('OnPressed', 'ash47_02_b,Trigger,0,0,0');

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_02');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7106, -9382, 894));
    ent.addKey('angles', new Vector(0, 0, 0));
    ent.addKey('spawnflags', '1025');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Enable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Disable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'ash47_02_f,Trigger,0,0,0');
    ent.addKey('OnPressed', 'ash47_02_b,Trigger,0,0,0');

        /*
        Floor 3
        */

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_03');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7115, -9354, 142));
    ent.addKey('angles', new Vector(0, 180, 0));
    ent.addKey('parentname', 'Ash47_Lift');
    ent.addKey('spawnflags', '1025');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Enable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Disable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'ash47_03_f,Trigger,0,0,0');
    ent.addKey('OnPressed', 'ash47_03_b,Trigger,0,0,0');

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_03');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7122, -9382, 1530));
    ent.addKey('angles', new Vector(0, 0, 0));
    ent.addKey('spawnflags', '1025');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Enable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Disable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'ash47_03_f,Trigger,0,0,0');
    ent.addKey('OnPressed', 'ash47_03_b,Trigger,0,0,0');

        /*
        Floor 4
        */

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_04');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7115, -9354, 150));
    ent.addKey('angles', new Vector(0, 180, 0));
    ent.addKey('parentname', 'Ash47_Lift');
    ent.addKey('spawnflags', '1025');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Enable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'Ash47_Lift,StartForward,0,0,0');

    // Create a button
    ent = ents.createEntity('func_button');
    ent.setName('ash47_btn_04');
    ent.addKey('model', buttonModel);
    ent.addKey('origin', new Vector(-7124, -9379, 2682));
    ent.addKey('angles', new Vector(0, 0, 0));
    ent.addKey('spawnflags', '1025');
    ent.addKey('sounds', '3');

    // Enable only our floor
    ent.addKey('OnPressed', 'ash47_fm_01,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_02,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_03,Disable,0,0,0');
    ent.addKey('OnPressed', 'ash47_fm_04,Enable,0,0,0');

    // Disable buttons
    ent.addKey('OnPressed', 'ash47_btn_01,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_02,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_03,Lock,0,0,0');
    ent.addKey('OnPressed', 'ash47_btn_04,Lock,0,0,0');

    // Make it move the lift
    ent.addKey('OnPressed', 'Ash47_Lift,StartForward,0,0,0');

    // Fix initial allignment
    ent = ents.createEntity('logic_auto');
    ent.addKey('OnMapSpawn', 'Ash47_Lift,StartForward,0,1,0');
    ent.addKey('OnMapSpawn', 'TallBuild_Elev2,StartForward,0,1,0');
    ent.addKey('OnMapSpawn', 'lookatmeimaliftgoinguporgoingdown,StartForward,0,1,0');

    // Progress update
    console.log('Saving modified entities...');

    var vertexesOld = map.getLump(LUMP_VERTEXES).data;

    // Update entities lump
    map.updateLump(LUMP_ENTITIES, ents.createBuffer());
    //map.updateLump(LUMP_ENTITIES, map.getLump(LUMP_ENTITIES).rawData);

    console.log('Done saving entities, editing map...');

    var dispinfo = map.getLump(LUMP_DISPINFO).data;
    var dispverts = map.getLump(LUMP_DISP_VERTS).data;
    var faces = map.getLump(LUMP_FACES).data;
    //var planes = map.getLump(LUMP_PLANES).data;
    var vertexes = map.getLump(LUMP_VERTEXES).data;
    var edges = map.getLump(LUMP_EDGES).data;
    var surfedges = map.getLump(LUMP_SURFEDGES).data;

    // Progress update
    console.log('Finished reading lumps! Let\'s make some changes...');

    for(var i=0; i<dispinfo.length; i++) {
        // Grab the position of this displacement
        var disp = dispinfo[i];
        var pos = disp.startPosition;
        var posStr = pos.toString();

        // Check if this is a cave displacement
        if(toRemove[posStr]) {
            //disp.remove();
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
                                a.z = -100000;
                                b.z = -100000;
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
        } else if(posStr == dispPatchPos) {
            // Patch the displacement
            var total = Math.pow(Math.pow(2, disp.power)+1, 2);
            var end = disp.DispVertStart + total;

            // Build dist array
            var dists = [
                0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,
                14.9199,22.4576,14.9199,0,0,0,0,0,0,
                28.7401,36.246,24.9733,10,0,0,0,0,0,
                29.933,33.6969,8.7036,5,0,0,0,0,0,
                36.3485,43.3119,12.0081,2.04281,9.0036,2.7819,0,0,0,
                38.1556,3.1073,4.4995,4.13319,7.0567,0.781601,2.18277,0,0,
                25.295,14.001,14.24,1.789,18.902,6.8936,2.3924,9.335,70.8692,
                62.714,45.431,10.547,6.97699,9.42801,3.31479,10.1173,9.864,99.9388
            ];

            // Build norms array
            var norms = [
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,1,0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,1,0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,0,0,0,0,0,0,0,
                0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,
                0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,
                0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,1,0,0,-1,0,0,1,0,0,1
            ];

            var distn = 0;
            var normsn = 0;

            // Loop over all disp verts
            for(var j=disp.DispVertStart; j<end; j++) {
                var dv = dispverts[j];
                dv.dist = dists[distn++];
                dv.vec.x = norms[normsn++];
                dv.vec.y = norms[normsn++];
                dv.vec.z = norms[normsn++];
                dv.save();
            }
        }
    }

    // Update lump
    //map.updateLump(LUMP_DISPINFO, dispinfo.createBuffer());

    // Progress Update
    console.log('Finished making changes! Saving changes...');

    // Save the bsp
    map.save('output.bsp', function() {
        console.log('Done saving!');
    });
});
