const { placeOrder, trackOrder, confirmDelivery } = require('./order-steps');

async function deliverOrder() {
  try {
    const item = await placeOrder('Pasta');
    await trackOrder(item);
    await confirmDelivery(item);
    console.log(`Delivered: ${item}`);
  } catch (error) {
    console.error(`Order failed: ${error.message}`);
  }
}
deliverOrder();
