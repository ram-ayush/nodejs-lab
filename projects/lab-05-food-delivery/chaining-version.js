const { placeOrder, trackOrder, confirmDelivery } = require('./order-steps');

placeOrder('Pasta')
  .then(item => trackOrder(item))
  .then(item => confirmDelivery(item))
  .then(item => console.log(`Delivered: ${item}`))
  .catch(error => console.error(`Order failed: ${error.message}`));
