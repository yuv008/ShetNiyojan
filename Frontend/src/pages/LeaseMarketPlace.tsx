import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, Tractor, Calendar, Clock, Heart, Combine, Shovel, Droplet, Cpu } from 'lucide-react';

// Import images
import tractorImage from '../assets/leasemarket/image.png';
import seederImage from '../assets/leasemarket/X5.png';
import harvestImage from '../assets/leasemarket/harvester.png';
import irrigationImage from '../assets/leasemarket/irrigation.png';
import tillageImage from '../assets/leasemarket/tillage.png';
import droneImage from '../assets/leasemarket/drone.png';

// Mock data for equipment listings
const equipmentData = [
  {
    id: 1,
    name: 'John Deere Tractor Model 5075E',
    category: 'Tractors',
    description: 'Powerful utility tractor with 75HP engine, perfect for medium-sized farms.',
    price: 125,
    period: 'day',
    image: tractorImage,
    rating: 4.8,
    reviews: 56,
    available: true
  },
  {
    id: 2,
    name: 'Automated Seed Planter Pro X5',
    category: 'Seeders',
    description: 'Precision seeding equipment with adjustable row spacing and depth control.',
    price: 85,
    period: 'day',
    image: seederImage,
    rating: 4.6,
    reviews: 42,
    available: true
  },
  {
    id: 3,
    name: 'Heavy Duty Combine Harvester',
    category: 'Harvesters',
    description: 'High-capacity grain harvester with 24-foot cutting width and GPS guidance.',
    price: 275,
    period: 'day',
    image: harvestImage,
    rating: 4.9,
    reviews: 38,
    available: false
  },
  {
    id: 4,
    name: 'Precision Irrigation System',
    category: 'Irrigation',
    description: 'Water-efficient drip irrigation system with smart scheduling and monitoring.',
    price: 65,
    period: 'day',
    image: irrigationImage,
    rating: 4.5,
    reviews: 64,
    available: true
  },
  {
    id: 5,
    name: 'Multi-purpose Tillage Equipment',
    category: 'Tillage',
    description: 'Versatile soil preparation tool combining multiple operations in a single pass.',
    price: 95,
    period: 'day',
    image: tillageImage,
    rating: 4.7,
    reviews: 29,
    available: true
  },
  {
    id: 6,
    name: 'Drone Crop Monitoring System',
    category: 'Technology',
    description: 'Advanced drone with multispectral imaging for precise crop health monitoring.',
    price: 110,
    period: 'day',
    image: droneImage,
    rating: 4.9,
    reviews: 47,
    available: true
  }
];

// Mock data for categories
const categories = [
  { name: 'Tractors', count: 24, icon: <Tractor size={18} /> },
  { name: 'Harvesters', count: 18, icon: <Combine size={18} /> },
  { name: 'Seeders', count: 15, icon: <Shovel size={18} /> },
  { name: 'Tillage', count: 12, icon: <Shovel size={18} /> },
  { name: 'Irrigation', count: 20, icon: <Droplet size={18} /> },
  { name: 'Technology', count: 16, icon: <Cpu size={18} /> }
];

const LeaseMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<number[]>([]);

  // Filter equipment by search term and category
  const filteredEquipment = equipmentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to cart
  const addToCart = (itemId: number) => {
    if (!cartItems.includes(itemId)) {
      setCartItems([...cartItems, itemId]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    setCartItems(cartItems.filter(id => id !== itemId));
  };

  return (
    <div className="bg-green-50 min-h-screen">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Tractor size={28} />
            <h1 className="text-2xl font-bold">FarmLease</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-600 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              <span className="font-semibold">Cart ({cartItems.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="bg-green-600 text-white rounded-xl p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Lease Top-Quality Farm Equipment</h2>
          <p className="text-xl mb-6">Access the equipment you need, when you need it, without the high upfront costs.</p>
          <div className="flex items-center bg-white rounded-lg p-2 shadow-md">
            <Search size={20} className="text-green-700 ml-2" />
            <input
              type="text"
              placeholder="Search for equipment..."
              className="w-full p-2 outline-none text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800">
              Search
            </button>
          </div>
        </div>

        {/* Category and Equipment Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="md:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit">
            <h3 className="text-xl font-bold text-green-800 mb-4">Categories</h3>
            <div className="space-y-2">
              <div 
                className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${!selectedCategory ? 'bg-green-100 text-green-800' : 'hover:bg-green-50'}`}
                onClick={() => setSelectedCategory(null)}
              >
                <span className="font-medium flex items-center">
                  <Filter size={18} className="mr-2" /> All Equipment
                </span>
                <span className="text-sm bg-green-600 text-white rounded-full px-2 py-1">{equipmentData.length}</span>
              </div>
              
              {categories.map((category) => (
                <div 
                  key={category.name}
                  className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${selectedCategory === category.name ? 'bg-green-100 text-green-800' : 'hover:bg-green-50'}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="font-medium flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </span>
                  <span className="text-sm bg-green-600 text-white rounded-full px-2 py-1">{category.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-4">Lease Duration</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="daily" className="rounded text-green-600" />
                  <label htmlFor="daily" className="cursor-pointer">Daily</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="weekly" className="rounded text-green-600" />
                  <label htmlFor="weekly" className="cursor-pointer">Weekly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="monthly" className="rounded text-green-600" />
                  <label htmlFor="monthly" className="cursor-pointer">Monthly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="seasonal" className="rounded text-green-600" />
                  <label htmlFor="seasonal" className="cursor-pointer">Seasonal</label>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-4">Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="300"
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-sm text-green-800 mt-2">
                  <span>$0</span>
                  <span>$300/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-green-800">Available Equipment</h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Sort by:</span>
                <select className="p-2 border rounded-md border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            {filteredEquipment.length === 0 ? (
              <div className="bg-white p-8 rounded-lg text-center shadow-md">
                <p className="text-lg text-gray-600">No equipment found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                      <button className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-gray-100">
                        <Heart size={20} className="text-gray-400 hover:text-red-500" />
                      </button>
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-green-800 mb-2">{item.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(item.rating))}
                          {'☆'.repeat(5 - Math.floor(item.rating))}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">({item.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar size={16} className="mr-1" />
                          <span>Flexible duration</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock size={16} className="mr-1" />
                          <span>{item.available ? 'Available now' : 'Currently leased'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-green-800">
                          <span className="text-xl font-bold">${item.price}</span>
                          <span className="text-sm">/{item.period}</span>
                        </div>
                        {item.available ? (
                          cartItems.includes(item.id) ? (
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                            >
                              Remove
                            </button>
                          ) : (
                            <button 
                              onClick={() => addToCart(item.id)}
                              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                            >
                              Add to Cart
                            </button>
                          )
                        ) : (
                          <button 
                            disabled
                            className="px-3 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-12 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Tractor size={24} />
                <h3 className="text-xl font-bold">FarmLease</h3>
              </div>
              <p className="text-green-200 max-w-md">
                Connecting farmers with the equipment they need to grow their business and feed the world.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Equipment</h4>
                <ul className="space-y-2 text-green-200">
                  <li><a href="#" className="hover:text-white">Tractors</a></li>
                  <li><a href="#" className="hover:text-white">Harvesters</a></li>
                  <li><a href="#" className="hover:text-white">Seeders</a></li>
                  <li><a href="#" className="hover:text-white">Irrigation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-green-200">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Lease Terms</a></li>
                  <li><a href="#" className="hover:text-white">Maintenance</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-green-200">
                  <li><a href="#" className="hover:text-white">About Us</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Partners</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-green-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-200 text-sm">© 2025 FarmLease. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li><a href="#" className="text-green-200 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-green-200 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-green-200 hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LeaseMarketplace;