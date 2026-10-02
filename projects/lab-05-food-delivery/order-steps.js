const delay = Number(process.env.DELAY_MS ?? 1000);

function stage(item, label) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (process.env.FAIL_STAGE === label) {
        return reject(new Error(`${label} failed for ${item}`));
      }
      console.log(`${label}: ${item}`);
      resolve(item); // Pass the item to the next step in the chain.
    }, delay);
  });
}

const placeOrder = item => stage(item, 'Order Placed');
const trackOrder = item => stage(item, 'Preparing');
const confirmDelivery = item => stage(item, 'Out for Delivery');
module.exports = { placeOrder, trackOrder, confirmDelivery };
