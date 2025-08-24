import React, { useState } from "react";

const groceryData = {
  sabji: [
    { id: 1, name: "Aloo", price: 30, image: "🥔" },
    { id: 2, name: "Tamatar", price: 40, image: "🍅" },
    { id: 3, name: "Pyaz", price: 25, image: "🧅" },
  ],
  fal: [
    { id: 4, name: "Seb", price: 120, image: "🍎" },
    { id: 5, name: "Kela", price: 60, image: "🍌" },
  ],
  spices: [
    { id: 6, name: "Haldi", price: 200, image: "🟡" },
    { id: 7, name: "Mirchi", price: 180, image: "🌶️" },
  ],
  chini: [
    { id: 8, name: "Chini", price: 50, image: "🍚" },
  ],
  other: [
    { id: 9, name: "Daal", price: 100, image: "🥣" },
    { id: 10, name: "Chawal", price: 90, image: "🍚" },
  ],
};

const weightOptions = ["200g", "500g", "1kg"];

export default function GroceryStore({onaddToCart}) {
  const [selectedCategory, setSelectedCategory] = useState("sabji");

  // sort items by price
  const items = [...groceryData[selectedCategory]].sort((a, b) => a.price - b.price);

  return (
    <div className="p-4">
      {/* Categories horizontally */}
      <div className="flex gap-4 border-b pb-2 mb-4 overflow-x-auto">
        {Object.keys(groceryData).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === cat
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 flex flex-col items-center shadow-md"
          >
            <div className="text-6xl">{item.image}</div>
            <h3 className="mt-2 font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-500">₹{item.price} / kg</p>

            {/* Weight options */}
            <select className="mt-3 border rounded-md p-1">
              {weightOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>

            <button onClick={onaddToCart} className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
