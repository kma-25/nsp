async function initApp() {
  // Initialize Miro SDK
  await miro.board.ui.init({
    capabilities: ['selector', 'sidebar'], // What your app can do
  });

  // Listen for shape clicks
  miro.board.ui.on('item:selected', async (event) => {
    const selectedItems = event.items;

    if (selectedItems.length) {
      selectedItems.forEach(async (item) => {
        if (item.type === 'shape') {
          const shapeType = item.metadata['type'] || 'Custom Shape';
          alert(`Shape type: ${shapeType}`);
        }
      });
    }
  });
}

document.getElementById('start-app').onclick = initApp;
