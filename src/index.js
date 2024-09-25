const { board } = window.miro;

async function init() {
  // Trigger the duplication when the icon is clicked
  board.ui.on("icon:click", async () => {
    // Get selected items
    let selectedItems = await board.getSelection();

    // Filter shapes from selected items
    let shapes = selectedItems.filter((item) => item.type === "shape");

    if (shapes.length === 0) {
      // If no shape is selected, notify the user
      board.ui.showNotification('Please select a shape to duplicate.');
      return;
    }

    // Loop through each selected shape and create a duplicate
    for (const shape of shapes) {
      await board.createShape({
        content: shape.content, // Copy the text content
        x: shape.x + 50, // Offset to avoid overlap
        y: shape.y + 50, // Offset to avoid overlap
        width: shape.width, // Copy width
        height: shape.height, // Copy height
        shape: shape.shape, // Copy shape type (rectangle, circle, etc.)
        style: shape.style, // Copy style (background color, border, etc.)
      });
    }

    // Notify the user that the shapes have been duplicated
    board.ui.showNotification('Shapes duplicated successfully!');
  });
}

init();
