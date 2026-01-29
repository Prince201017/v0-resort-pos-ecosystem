export interface MenuItem {
  id: string
  title: string
  price: number
  image: string
  category: "Vegetarian" | "Non-Veg" | "Snacks" | "Drinks" | "Staple Food"
  description: string
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    title: "Redhot Pizza",
    price: 450,
    image: "/redhot-pizza.jpg",
    category: "Non-Veg",
    description: "Spicy pizza with fresh toppings and mozzarella",
  },
  {
    id: "2",
    title: "Chicken Burger",
    price: 320,
    image: "/delicious-chicken-burger.png",
    category: "Non-Veg",
    description: "Grilled chicken with fresh lettuce and special sauce",
  },
  {
    id: "3",
    title: "French Fries",
    price: 150,
    image: "/crispy-french-fries.png",
    category: "Snacks",
    description: "Crispy golden fries with sea salt",
  },
  {
    id: "4",
    title: "Samosa",
    price: 80,
    image: "/crispy-golden-samosas.png",
    category: "Snacks",
    description: "Crispy pastry with spiced potato filling",
  },
  {
    id: "5",
    title: "Egg Toast",
    price: 120,
    image: "/egg-toast.jpg",
    category: "Staple Food",
    description: "Buttered toast with perfectly cooked eggs",
  },
  {
    id: "6",
    title: "Egg Omelet",
    price: 140,
    image: "/egg-omelet.jpg",
    category: "Staple Food",
    description: "Fluffy omelet with your choice of vegetables",
  },
  {
    id: "7",
    title: "Classic Burger",
    price: 280,
    image: "/classic-burger.png",
    category: "Vegetarian",
    description: "Fresh vegetable burger with special aioli",
  },
  {
    id: "8",
    title: "Alu Tikki Burger",
    price: 200,
    image: "/alu-tikki-burger.jpg",
    category: "Vegetarian",
    description: "Spiced potato patty with tangy sauce",
  },
  {
    id: "9",
    title: "Sushi",
    price: 380,
    image: "/assorted-sushi.png",
    category: "Non-Veg",
    description: "Fresh assorted sushi with wasabi and pickled ginger",
  },
  {
    id: "10",
    title: "Choco Lava",
    price: 220,
    image: "/chocolate-lava-cake.png",
    category: "Drinks",
    description: "Warm chocolate cake with molten center",
  },
  {
    id: "11",
    title: "Choco Shake",
    price: 180,
    image: "/chocolate-shake.png",
    category: "Drinks",
    description: "Rich chocolate shake with premium cocoa",
  },
  {
    id: "12",
    title: "Chocolate Cake",
    price: 250,
    image: "/decadent-chocolate-cake.png",
    category: "Drinks",
    description: "Decadent layered chocolate dessert",
  },
  {
    id: "13",
    title: "Chocolate Blend Smoothie",
    price: 190,
    image: "/chocolate-smoothie.jpg",
    category: "Drinks",
    description: "Creamy smoothie with chocolate and almonds",
  },
  {
    id: "14",
    title: "Milkshake",
    price: 170,
    image: "/classic-milkshake.png",
    category: "Drinks",
    description: "Classic vanilla milkshake with fresh milk",
  },
  {
    id: "15",
    title: "Milk Cake",
    price: 260,
    image: "/milk-cake.jpg",
    category: "Staple Food",
    description: "Soft and fluffy milk-based dessert cake",
  },
]

export interface OrderItem {
  itemId: string
  title: string
  price: number
  quantity: number
}

export const SERVICE_CHARGE = 10 // rupees
