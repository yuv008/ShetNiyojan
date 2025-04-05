import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Phone, User, X, Search } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

// Define types
interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  available: boolean;
  owner: string;
  contactNumber: string;
}

const LeaseMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Sample equipment data
  const equipmentData: Equipment[] = [
    {
      id: '1',
      name: 'John Deere 5E Series Tractor',
      category: 'Tractors',
      description: 'Powerful 75HP tractor ideal for medium to large farms. Includes attachments for plowing.',
      pricePerHour: 400,
      pricePerDay: 2500,
      pricePerWeek: 15000,
      pricePerMonth: 50000,
      location: 'Nashik, Maharashtra',
      rating: 4.8,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1605002123541-539772db692b?q=80&w=800',
      available: true,
      owner: 'Raghav Farms',
      contactNumber: '+91 9876543210'
    },
    {
      id: '2',
      name: 'CLAAS Harvester',
      category: 'Harvesters',
      description: 'High-capacity combine harvester for wheat, rice, and other grain crops.',
      pricePerHour: 800,
      pricePerDay: 5000,
      pricePerWeek: 30000,
      pricePerMonth: 100000,
      location: 'Pune, Maharashtra',
      rating: 4.7,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1591191425088-195b6e978259?q=80&w=800',
      available: true,
      owner: 'Singh Agri Services',
      contactNumber: '+91 9765432109'
    },
    {
      id: '3',
      name: 'KisanKraft Irrigation System',
      category: 'Irrigation',
      description: 'Complete drip irrigation system with controller for 2-acre farms.',
      pricePerHour: 150,
      pricePerDay: 800,
      pricePerWeek: 5000,
      pricePerMonth: 18000,
      location: 'Satara, Maharashtra',
      rating: 4.5,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1629793376581-8f4b9ee14537?q=80&w=800',
      available: true,
      owner: 'Modern Agro Solutions',
      contactNumber: '+91 8890123456'
    },
    {
      id: '4',
      name: 'Kubota Rotary Tiller',
      category: 'Tillage',
      description: 'Heavy-duty tiller for soil preparation with adjustable depth control.',
      pricePerHour: 200,
      pricePerDay: 1200,
      pricePerWeek: 7000,
      pricePerMonth: 25000,
      location: 'Kolhapur, Maharashtra',
      rating: 4.9,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1616631088589-9709e97a9795?q=80&w=800',
      available: true,
      owner: 'Patil Brothers',
      contactNumber: '+91 7765432109'
    },
    {
      id: '5',
      name: 'AgriDrone X500',
      category: 'Drones',
      description: 'Advanced drone with multispectral camera for crop monitoring and spraying.',
      pricePerHour: 500,
      pricePerDay: 3000,
      pricePerWeek: 18000,
      pricePerMonth: 60000,
      location: 'Nagpur, Maharashtra',
      rating: 4.6,
      reviews: 12,
      image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?q=80&w=800',
      available: true,
      owner: 'TechFarm Solutions',
      contactNumber: '+91 9912345678'
    },
    {
      id: '6',
      name: 'Mahindra Novo Seeder',
      category: 'Seeders',
      description: 'Precision seeder for row crops with variable rate application.',
      pricePerHour: 300,
      pricePerDay: 1800,
      pricePerWeek: 10000,
      pricePerMonth: 35000,
      location: 'Aurangabad, Maharashtra',
      rating: 4.4,
      reviews: 9,
      image: 'https://images.unsplash.com/photo-1598944999410-ea5298c99b65?q=80&w=800',
      available: true,
      owner: 'Sharma Equipment Rentals',
      contactNumber: '+91 8876543210'
    }
  ];

  // Get unique categories from equipment data
  const categories = Array.from(new Set(equipmentData.map(item => item.category)));

  // Function to handle search
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // Function to handle category filter
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Filter equipment based on search and category
  const filteredEquipment = equipmentData.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Function to handle contact owner button click
  const handleContactOwner = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowContactModal(true);
  };

  // Function to handle sending message to owner
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Message sent to ${selectedEquipment?.owner}!`);
    setShowContactModal(false);
  };

  return (
    <div className="bg-agriBg min-h-screen w-full">
      <div className="w-full h-full p-4">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-1 h-[calc(100vh-2rem)]">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-11">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-agrigreen mb-2">Farm Equipment Leasing</h1>
              <p className="text-gray-600">Rent high-quality agricultural equipment from farmers in your area</p>
            </div>

            {/* Search Bar and Filters */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pr-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-agrigreen hover:bg-agrigreen-dark"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`text-xs h-8 px-3 ${
                      selectedCategory === category ? "bg-agrigreen hover:bg-agrigreen-dark" : ""
                    }`}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
                {selectedCategory && (
                  <Button
                    variant="outline"
                    className="text-xs h-8 px-3 text-gray-600"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-4 gap-4">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.available ? 'Available' : 'Leased'}
                        </div>
                      </div>
                      
                      <div className="flex items-center my-1">
                        <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">{item.location}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs font-medium">{item.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({item.reviews})</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-600">Hourly Rate:</span>
                        <span className="font-semibold text-sm text-agrigreen">₹{item.pricePerHour}/hr</span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full text-xs h-8"
                        onClick={() => handleContactOwner(item)}
                      >
                        Contact Owner
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-4 flex justify-center items-center h-64 bg-white rounded-lg shadow">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No equipment found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Owner Modal */}
      {showContactModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="relative p-6">
              <button 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowContactModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Contact Owner</h3>
                <p className="text-gray-600">{selectedEquipment.name}</p>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-4">
                <div className="bg-agrigreen rounded-full p-3 text-white mr-4">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedEquipment.owner}</h4>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{selectedEquipment.contactNumber}</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSendMessage}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agrigreen focus:outline-none"
                    rows={4}
                    placeholder={`Hello, I'm interested in leasing your ${selectedEquipment.name}. Is it available for hourly rental?`}
                    required
                  ></textarea>
                </div>
                
                <div className="flex">
                  <Button
                    className="bg-agrigreen hover:bg-agrigreen-dark w-full py-2"
                    type="submit"
                  >
                    Send Message
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Your contact information will be shared when you send a message
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseMarketplace; 