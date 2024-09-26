import shapeMappings from './shapeLookup.js';

const { board } = window.miro;

// Function to predict the shape type using a lookup
function predictShapeTypeLocally(shapeSequence) {
  // Check if we have a valid shape sequence
  if (!shapeSequence || shapeSequence.length === 0) {
    return shapeSequence[shapeSequence.length - 1]; // If no valid sequence, return the last shape
  }

  // Loop through the shape mappings
  for (const [types, predictedType] of shapeMappings) {
    if (JSON.stringify(types) === JSON.stringify(shapeSequence)) {
      return predictedType; // Return the predicted shape type if a match is found
    }
  }

  // If no match is found, return the last shape type from the sequence
  return shapeSequence[shapeSequence.length - 1];
}


// Function to get only the previous connected shape (one step back)
async function getConnectedShapes(clickedShape) {
  // Retrieve all connectors on the board
  const connectors = await clickedShape.getConnectors();

  console.log("Checking connectors: ", connectors);

  // Array to hold connected shapes
  const connectedShapes = [];

  // Loop through all connectors to find those that start from the clicked shape
  for (const connector of connectors) {
    // Ensure the connector has a valid start item

    console.log("Checking start: ", connector.start.item);

    if (connector.start && connector.start.item) {
      // Find the shape at the end of the connector

      const startShapes = await miro.board.get({id: connector.start.item});

      for (const startShape of startShapes) {
        // Check if the endShape is valid and is a shape
        if (startShape) {

          // Add the shape type at the end of the connector to the array
          connectedShapes.push(startShape.shape);
        }
      }
    }
  }

  // Push the clicked shape's type to the sequence
  connectedShapes.push(clickedShape.shape);

  // Return the array of connected shapes (only one step back)
  return connectedShapes;
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
      // Get the sequence of connected shapes (only one step back)
      const shapeSequence = await getConnectedShapes(shape);

      // Predict the new shape type using the sequence
      const predictedShapeType = predictShapeTypeLocally(shapeSequence);

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
