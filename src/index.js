import shapeMappings from './shapeLookup.js';

const { board } = window.miro;

// Function to predict the shape type using a lookup
function predictShapeTypeLocally(shapeType) {
  const normalizedShapeType = shapeType.toLowerCase(); // Normalize the input shape type
  // Loop through the shape mappings
  for (const [types, predictedType] of shapeMappings) {
    if (types[0].toLowerCase() === normalizedShapeType) { // Normalize the mapped type for comparison
      return predictedType; // Return the predicted shape type if a match is found
    }
  }

  // If no match is found, return the original shape type
  return shapeType;
}
async function init() {
  // Trigger the duplication when the icon is clicked
  board.ui.on("icon:click", async () => {
    // Get selected items
    let selectedItems = await board.getSelection();

    // Filter shapes from selected items
    let shapes = selectedItems.filter((item) => item.type === "shape");

    if (shapes.length === 0) {
      // If no shape is selected, notify the user
      await miro.board.notifications.showError('Please select a shape.');
      return;
    }

    // Loop through each selected shape, create a duplicate, and add a connector
    for (const shape of shapes) {
      // Use the local lookup to predict the new shape type
      const predictedShapeType = predictShapeTypeLocally(shape.shape);

      // Create a new shape to the right of the clicked shape
      const newShape = await board.createShape({
        x: shape.x + 2 * shape.width, // Offset to avoid overlap
        y: shape.y, // Same Y position
        width: shape.width, // Copy width
        height: shape.height, // Copy height
        shape: predictedShapeType,
        style: shape.style, // Copy style (background color, border, etc.)
      });

      // Create a connector (line) between the original shape and the new shape
      await board.createConnector({
        shape: 'elbowed', // You can change this to 'straight' or 'curved' if needed
        style: {
          startStrokeCap: 'none',
          endStrokeCap: 'stealth',
          strokeStyle: 'dashed', // You can change to 'solid' if needed
          strokeColor: '#000000', // Black color for the connector
          strokeWidth: 4, // Thickness of the line
        },
        start: {
          item: shape.id, // Start the connector at the original shape
          position: {
            x: 1.0, // Start from the right side of the original shape
            y: 0.5, // Vertically centered
          },
        },
        end: {
          item: newShape.id, // End the connector at the new shape
          snapTo: 'left', // Snap to the left side of the new shape
        },
      });
    }
  });
}

init();
