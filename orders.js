// pages/api/orders.js
export default function handler(req, res) {
  const orders = [
    {
      id: 'order1',
      item: 'Onions',
      quantity: 20,
      price: 15,
      status: 'Delivered',
      date: '2025-07-21',
    },
    {
      id: 'order2',
      item: 'Oil',
      quantity: 10,
      price: 120,
      status: 'Pending',
      date: '2025-07-25',
    },
  ];

  res.status(200).json({ orders });
}
