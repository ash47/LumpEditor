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

###Warnings###
 - Currently, if you `map.updateLump()`, any references into the BSP will be broken, since this function creates a new buffer for the map to accommodate the extra (or less) space needed.
