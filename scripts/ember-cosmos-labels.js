async function UpdateLabels()
{
  // Check we're on the right scene
  if (canvas.scene.id !== 'emberCosmos00000')
  {
    console.log("EmberCosmosLabels | This only works from 'The Cosmos' scene");
    return;
  }

  const isGM = game.user.isGM;

  // Pages
  let pages = {
    'akon': ['emberCosmos00000', '3Oywe0peo57dQT9j'],
    'aura': ['emberCosmos00000', 'smc0OuMxsxfcSdhR'],
    'cora': ['emberCosmos00000', '5pD8lxiilJJXOgoa'],
    'mayis': ['emberCosmos00000', 'RkdBtFQk7STvMbV2'],
    'ragen': ['emberCosmos00000', 'LKptgmc56euSOb0G'],
    'orbis': ['emberCosmos00000', 'zkmWSB32y8Fbc4UL'],
    'luxarum': ['emberCosmos00000', 'pPU6VZV7WFubtcSR'],
    'primordis': ['emberCosmos00000', '16sqn71JsCkghaTt'],
    'signara': ['emberCosmos00000', '3OvueRrGcFnwtnmw'],
    'sun': ['emberDeities0000', '8PNpme2Ot0zfHLBH']
  }

  // Gather Cosmic Items
  var items = {}

  // The name is Soleil in the sun object so overriding it here instead of using ember.calendar.sun.name
  items["Lantyr"] = {
    id: 'sun',
    name: "Lantyr",
    x: ember.calendar.sun.sprite.canvasBounds.center.x,
    y: ember.calendar.sun.sprite.canvasBounds.center.y,
    size: 500
  }

  for (const moonid in ember.calendar.moons)
  {
    let moon = ember.calendar.moons[moonid]
    items[moon.name] = {
      id: moon.id,
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
      id: realm.id,
      name: realm.name,
      x: realm.sprite.canvasBounds.center.x,
      y: realm.sprite.canvasBounds.center.y,
      size: 1200
    }
  }

  // Gather Notes
  var foundNotes = [] // Tracking duplicates to remove them
  //console.log("ValidNotes:", canvas.scene.notes.contents)
  for (const noteid in canvas.scene.notes.contents)
  {
    let note = canvas.scene.notes.contents[noteid]
    
    if (note.text in items)
    {
      foundNotes.push(note.text)
    
      if (isGM) {
        await note.update({
          x: items[note.text].x,
          y: items[note.text].y
        });
      } else {
        //TODO: Move them for players if there isn't a GM in the scene
      }
    
      // Remove the background from the item
      note._object.controlIcon.alpha = 0;

      // Remove it so it doesn't get processed below
      delete items[note.text];
    } else if (foundNotes.includes(note.text)) {
      //console.log("EmberCosmosLabels | Found duplicate for ", note.text);
	  if (isGM)
        await canvas.scene.deleteEmbeddedDocuments("Note", [note.id]);
    }
  }
  
  //console.log("EmberCosmosLabels | FoundNotes:", foundNotes);

  // Create New Notes
  if (isGM)
  {
    var newNotes = []
  
    for (const itemid in items)
    {
      let item = items[itemid]
      if (!(item.id in pages)) {
        console.log("EmberCosmosLabels | ", item.id, "does not have a page!")
      } else {
        newNotes.push({
          entryId: pages[item.id][0],
          pageId: pages[item.id][1],
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
  
      // Remove the background on the new notes
      for (const noteid in canvas.scene.notes.contents)
      {
        let note = canvas.scene.notes.contents[noteid]
        if (note.text in items)
        {
          // Remove the background from the item
          note._object.controlIcon.alpha = 0;
        }
      }
    }
  }
}

Hooks.on("initializeCanvasEnvironment", function() {
  //console.log("EmberCosmosLabels | This code runs when the scene updates.");
  if (canvas.scene.id === 'emberCosmos00000')
  UpdateLabels();
});
