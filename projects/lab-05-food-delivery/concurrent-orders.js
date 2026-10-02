function placeOrder(item) {
  const delay = process.env.DELAY_MS !== undefined
    ? Number(process.env.DELAY_MS)
    : 1000 + Math.floor(Math.random() * 1500);
  console.log(`Order placed: ${item} (${delay}ms)`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (process.env.FAIL_ORDER === item) return reject(new Error(`Could not prepare ${item}`));
      resolve(`${item} is out for delivery!`);
    }, delay);
  });
}

async function orderMultiple() {
  console.log('Placing 3 orders at once...');
  console.time('All orders');
  try {
    const results = await Promise.all([
      placeOrder('Pizza'),
      placeOrder('Burger'),
      placeOrder('Coffee')
    ]);
    console.log(results.join('\n'));
  } catch (error) {
    console.error(`Order failed: ${error.message}`);
  } finally {
    console.timeEnd('All orders');
  }
}
orderMultiple();
