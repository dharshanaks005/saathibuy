// pages/api/polls.js
export default function handler(req, res) {
  const polls = [
    {
      id: 'poll1',
      product: 'Tomatoes',
      price: 25,
      unit: 'kg',
      demand: 150,
      minRequired: 100,
      expiresIn: '1h 30m',
    },
    {
      id: 'poll2',
      product: 'Rice',
      price: 32,
      unit: 'kg',
      demand: 90,
      minRequired: 200,
      expiresIn: '3h',
    }
  ];

  res.status(200).json({ polls });
}
