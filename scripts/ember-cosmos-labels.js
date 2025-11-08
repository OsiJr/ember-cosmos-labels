const hideBackgrounds = true;
const debugMode = false;
var isUpdating = false;

// Pages
let pages = {
  'Akon': ['emberCosmos00000', '3Oywe0peo57dQT9j'],
  'Aura': ['emberCosmos00000', 'smc0OuMxsxfcSdhR'],
  'Cora': ['emberCosmos00000', '5pD8lxiilJJXOgoa'],
  'Mayis': ['emberCosmos00000', 'RkdBtFQk7STvMbV2'],
  'Ragen': ['emberCosmos00000', 'LKptgmc56euSOb0G'],
  'Orbis': ['emberCosmos00000', 'zkmWSB32y8Fbc4UL'],
  'Luxarum': ['emberCosmos00000', 'pPU6VZV7WFubtcSR'],
  'Primordis': ['emberCosmos00000', '16sqn71JsCkghaTt'],
  'Signara': ['emberCosmos00000', '3OvueRrGcFnwtnmw'],
  'Lantyr': ['emberDeities0000', '8PNpme2Ot0zfHLBH']
}

function getMappedNotes() {
  var mappedNotes = {}

  for (const noteID in canvas.scene.notes.contents)
  {
    let note = canvas.scene.notes.contents[noteID]
    if (note.text in pages)
    {
      mappedNotes[note.text] = note;
    }
  }

  return mappedNotes;
}

async function UpdateLabelsOnCosmos()
{
  if (isUpdating || !canvas.ready) {
    if (debugMode)
      console.log("EmberCosmosLabels | UpdateLabelsOnCosmos skipped, isUpdating:", isUpdating, "canvas.ready:", canvas.ready);
    return;
  }
  isUpdating = true;
  const isGM = game.user.isGM;

  // Check we're on the right scene
  if (canvas.scene.id !== 'emberCosmos00000')
  {
    console.warn("EmberCosmosLabels | This only works from 'The Cosmos' scene");
    return;
  }

  // Gather Cosmic Items
  var items = {}

  // The name is Soleil in the sun object so overriding it here instead of using ember.calendar.sun.name
  items["Lantyr"] = {
    name: "Lantyr",
    x: ember.calendar.sun.sprite.canvasBounds.center.x,
    y: ember.calendar.sun.sprite.canvasBounds.center.y,
    size: 500
  }

  for (const moonid in ember.calendar.moons)
  {
    let moon = ember.calendar.moons[moonid]
    items[moon.name] = {
      name: moon.name,
      x: moon.sprite.canvasBounds.center.x,
      y: moon.sprite.canvasBounds.center.y,
      size: 350
    }
  }

  for (const realmid in ember.calendar.realms)
  {
    let realm = ember.calendar.realms[realmid]
    items[realm.name] = {
      name: realm.name,
      x: realm.sprite.canvasBounds.center.x,
      y: realm.sprite.canvasBounds.center.y,
      size: 1200
    }
  }

  // Gather Notes
  var foundNotes = [] // Tracking duplicates to remove them
  for (const noteid in canvas.scene.notes.contents)
  {
    let note = canvas.scene.notes.contents[noteid]
    
    if (note.text in items)
    {
      foundNotes.push(note.text)
    
      if (note._object)
      {
        // Moving this way works for non-GMs
        note._object.x = items[note.text].x;
        note._object.y = items[note.text].y;
      }

      // Remove it so it doesn't get processed below
      delete items[note.text];
    } else if (foundNotes.includes(note.text)) {
      if (isGM)
        await canvas.scene.deleteEmbeddedDocuments("Note", [note.id]);
    }
  }
  
  // Create New Notes
  if (isGM)
  {
    var newNotes = []
  
    for (const itemid in items)
    {
      let item = items[itemid]
      if (!(item.name in pages)) {
        console.warn("EmberCosmosLabels | ", item.name, "does not have a page!")
      } else {
        newNotes.push({
          entryId: pages[item.name][0],
          pageId: pages[item.name][1],
          x: item.x,
          y: item.y,
          text: item.name,
          iconSize: item.size,
          fontSize: 120,
          visible: false,
          texture: {
            src: "modules/ember-cosmos-labels/artwork/empty.svg",
            scaleX: 0,
            scaleY: 0
          }
        })
      }
    }
  
    if (newNotes.length > 0)
    {
      await canvas.scene.createEmbeddedDocuments("Note", newNotes)
    }
  }

  isUpdating = false;
}

async function UpdateLabelsOnVistas()
{
  if (isUpdating || !canvas.ready) {
    if (debugMode)
      console.log("EmberCosmosLabels | UpdateLabelsOnVistas skipped, isUpdating:", isUpdating, "canvas.ready:", canvas.ready);
    return;
  }
  isUpdating = true;
  const isGM = game.user.isGM;

  // Get existing notes
  var mappedNotes = getMappedNotes()

  // Get Scene Elements
  for (const spriteID in ember.scene.composition.sprites) {
    let sprite = ember.scene.composition.sprites[spriteID];

    let mappedSpriteID = spriteID
    if (spriteID === 'OrbisCore')
      mappedSpriteID = 'Orbis'
    else if (spriteID.indexOf('#') > 0)
      mappedSpriteID = spriteID.split('#')[1]

    if (mappedSpriteID in pages)
    {
      if (mappedSpriteID in mappedNotes) {
        let note = mappedNotes[mappedSpriteID]
        if (note._object) {
          note._object.x = sprite.placements[0].x + (canvas.stage.pivot.x - canvas.stage.width + canvas.stage.x) * 0.1;
          note._object.y = sprite.placements[0].y + (canvas.stage.pivot.y - canvas.stage.height+ canvas.stage.y) * 0.1;
        }
      } else if (isGM) {
        let newNote = {
          entryId: pages[mappedSpriteID][0],
          pageId: pages[mappedSpriteID][1],
          x: sprite.placements[0].x,
          y: sprite.placements[0].y,
          text: mappedSpriteID,
          iconSize: 512 * sprite.placements[0].scale,
          fontSize: 30,
          visible: false,
          texture: {
            src: "modules/ember-cosmos-labels/artwork/empty.svg",
            scaleX: 0,
            scaleY: 0
          }
        }
        await canvas.scene.createEmbeddedDocuments("Note", [newNote]);
        mappedNotes = getMappedNotes()
      }
    }
  }

  isUpdating = false;
}

Hooks.on("initializeCanvasEnvironment", function() {
  if (debugMode)
    console.log("EmberCosmosLabels | This code runs in initializeCanvasEnvironment.");
  if (canvas.scene.id === 'emberCosmos00000')
    UpdateLabelsOnCosmos();
  else if (ember.scene.config.label.indexOf("Vista") >= 0)
    UpdateLabelsOnVistas();
});

Hooks.on("canvasPan", function() {
  if (debugMode)
    console.log("EmberCosmosLabels | This code runs when is canvasPan.");
  if (ember.scene.config.label.indexOf("Vista") >= 0)
    UpdateLabelsOnVistas();
});

Hooks.on("activateNotesLayer", function() {
  if (debugMode)
    console.log("EmberCosmosLabels | This code runs in activateNotesLayer.");

  if (canvas.scene.id === 'emberCosmos00000')
    UpdateLabelsOnCosmos();
})

Hooks.on("refreshNote", function(note, options, userId) {
  if (debugMode)
    console.log("EmberCosmosLabels | This code runs in createNote.");

  if ((ember.scene.config.label.indexOf("Vista") >= 0 || canvas.scene.id === 'emberCosmos00000') >= 0 && note.text in pages && hideBackgrounds)
  {
    if (note.controlIcon)
      note.controlIcon.alpha = 0;
  }
})