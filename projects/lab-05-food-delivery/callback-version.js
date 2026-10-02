const delay = Number(process.env.DELAY_MS ?? 2000);

function placeOrderCallback(item, callback) {
  console.log(`Order placed: ${item}`);
  setTimeout(() => callback(item), delay);
}
function trackOrderCallback(item, callback) {
  console.log(`Preparing: ${item}`);
  setTimeout(() => callback(item), delay);
}
function confirmDeliveryCallback(item, callback) {
  console.log(`Out for Delivery: ${item}`);
  setTimeout(() => callback(`${item}: Delivered`), delay);
}

// Each stage waits for the previous callback: three levels of nesting.
placeOrderCallback('Pizza', (item) => {
  trackOrderCallback(item, (trackedItem) => {
    confirmDeliveryCallback(trackedItem, (message) => {
      console.log(message);
    });
  });
});
