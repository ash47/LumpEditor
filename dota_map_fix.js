const { bsp, Vector } = require('./bsp.js');
const { LUMP_ENTITIES } = require('./lumps.js');

// Load a bsp
new bsp('dota.bsp', function (map) {
    const ents = map.getLump(LUMP_ENTITIES).data;

    const worldBounds = ents.getEntitiesByClassname('world_bounds');

    for(let worldBound of worldBounds) {
        worldBound.setKey('min', '-7232 -7488 0');
        worldBound.setKey('max', '7168 6656 0');
    }

    map.updateLump(LUMP_ENTITIES, ents.createBuffer());

    // Save the bsp
    map.save('dota_fixed.bsp', function () {
        console.log('Done saving!');
    });
});