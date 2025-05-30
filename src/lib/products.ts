export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
};

export const products: Product[] = [
  {
    id: "1",
    name: "Dad's Approval (Nothing)",
    slug: "dads-approval",
    description: "Buy it to finally hear 'I'm proud of you'. No refund.",
    category: "Relatable",
    price: 2,
  },
  {
    id: "2",
    name: "Asmongold’s Hair (Nothing)",
    slug: "asmongolds-hair",
    description: "A rare and mythical collectible.",
    category: "Gaming",
    price: 3,
  },
  {
    id: "3",
    name: "My Confidence (Nothing)",
    slug: "my-confidence",
    description: "Good luck finding it after purchase.",
    category: "Mental Health",
    price: 2,
  },
  {
    id: "4",
    name: "Elon's Promises (Nothing)",
    slug: "elons-promises",
    description: "Expect greatness. Receive nothing.",
    category: "Edgy",
    price: 5,
  },
];

export default products;
