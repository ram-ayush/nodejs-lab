function placeOrder(item) {
  return new Promise((resolve, reject) => {
    console.log(`Order placed: ${item}`);
    setTimeout(() => {
      // Default: ~80% success. Set ORDER_OUTCOME for repeatable demonstrations.
      const outcome = process.env.ORDER_OUTCOME;
      const success = outcome === 'success' || (outcome !== 'fail' && Math.random() > 0.2);
      if (success) resolve(`${item} is out for delivery!`);
      else reject(new Error(`Sorry, the restaurant could not prepare ${item}`));
    }, Number(process.env.DELAY_MS ?? 2000));
  });
}

if (require.main === module) {
  placeOrder('Burger')
    .then(message => console.log(`Fulfilled: ${message}`))
    .catch(error => console.log(`Rejected: ${error.message}`));
}
module.exports = { placeOrder };
