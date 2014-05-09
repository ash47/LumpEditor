BSP Lump Editor
==============

###About###
 - This is a basic editor for BSP Lumps. It's primary purpose is to fix the cave crash in Evocity.
 - It also fixes the lifts in evocity, YAY!
 - Written in node.js

###What do I need to use this?###
 - Node.js
 - RP_EvoCity_v2d.bsp

###How do I use this?###
 - Create a folder in the main directory called `maps`
 - Copy `RP_EvoCity_v2d.bsp` into the maps folder
 - Parse app.js into node (run test.bat)

###Releases###
 - [Source Code Releases] (https://github.com/ash47/LumpEditor/releases)
 - [rp_evocity_v2d_updated] (http://steamcommunity.com/sharedfiles/filedetails/?id=257579432)

###Warnings###
 - Currently, if you `map.updateLump()`, any references into the BSP will be broken, since this function creates a new buffer for the map to accommodate the extra (or less) space needed.

###Future Goals###
 - I'd like to support all lumps, use less ram, and be more editable (map.updateLump breaks all references for example, this should be fixed)
 - It would be interesting to export editable parts of maps to a VMF, then allow users to reimport their changes (this can be done manually currently)
 - I'd love to be able to merge two maps into one map
 - I'd be nice to support the general BSP format, instead of just the version gmod usually uses
