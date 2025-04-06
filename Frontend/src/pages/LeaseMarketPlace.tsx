import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Phone, User, X, Search, Plus, Upload, Loader2 } from 'lucide-react';
import DashboardHeader from '@/components/common/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Define types
interface Equipment {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  pricePerHour: number;
  location: string;
  rating?: number;
  reviews?: number;
  imageUrl: string;
  available: boolean;
  ownerName?: string;
  ownerContact?: string;
}

const LeaseMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<Partial<Equipment>>({
    name: '',
    category: '',
    description: '',
    pricePerHour: 0,
    location: '',
    imageUrl: '',
  });
  
  // Fetch equipment data and categories on component mount
  useEffect(() => {
    const fetchEquipmentData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/lease-items');
        console.log("Lease items API response:", response.data);
        
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          setEquipmentData(response.data.data);
        } else {
          console.error('Invalid data format from API:', response.data);
          toast.error('Failed to load equipment data: Invalid response format');
          setEquipmentData([]);
        }
      } catch (error) {
        console.error('Error fetching equipment data:', error);
        if (axios.isAxiosError(error)) {
          console.log("Error response:", error.response?.data);
          console.log("Error status:", error.response?.status);
        }
        toast.error('Failed to load equipment data');
        setEquipmentData([]);
      }
      
      try {
        const categoriesResponse = await api.get('/lease-items/categories');
        console.log("Categories API response:", categoriesResponse.data);
        
        if (categoriesResponse.data.status === 'success' && Array.isArray(categoriesResponse.data.data)) {
          setCategories(categoriesResponse.data.data);
        } else {
          console.error('Invalid categories format from API:', categoriesResponse.data);
          toast.error('Failed to load categories: Invalid response format');
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (axios.isAxiosError(error)) {
          console.log("Error response:", error.response?.data);
          console.log("Error status:", error.response?.status);
        }
        toast.error('Failed to load categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEquipmentData();
  }, []);

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

  // Function to handle calling the owner
  const handleCallOwner = (phoneNumber: string | undefined) => {
    if (!phoneNumber) {
      console.error('No phone number provided');
      toast.error("No contact number available");
      return;
    }
    
    // Trim any whitespace and check if it's empty
    const cleanNumber = phoneNumber.trim();
    if (cleanNumber === '') {
      console.error('Empty phone number provided');
      toast.error("Contact number is empty");
      return;
    }

    console.log(`Attempting to call: ${cleanNumber}`);
    
    try {
      // Create the tel: URI and open it
      window.location.href = `tel:${cleanNumber}`;
      
      // Also log success and show toast
      console.log(`Phone call initiated to: ${cleanNumber}`);
      toast.success(`Calling ${cleanNumber}...`);
    } catch (error) {
      console.error('Error initiating phone call:', error);
      toast.error("Could not initiate call");
    }
  };

  // Handle input change for new item form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'pricePerHour' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle category selection for new item
  const handleCategorySelect = (value: string) => {
    setNewItem(prev => ({
      ...prev,
      category: value
    }));
  };

  // Handle image URL input for new item
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(prev => ({
      ...prev,
      imageUrl: e.target.value
    }));
  };

  // Function to add a new equipment item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newItem.name || !newItem.description || !newItem.category || 
        !newItem.pricePerHour || !newItem.location || !newItem.imageUrl) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      
      console.log("=== Debug Information ===");
      console.log("User object:", user);
      console.log("Token from localStorage:", token);
      
      if (!token) {
        toast.error('You must be logged in to add items');
        setIsLoading(false);
        return;
      }
      
      console.log("Making API request with token:", token);
      
      // Use the api utility which automatically includes the token
      const response = await api.post(
        '/lease-items',
        {
          name: newItem.name,
          description: newItem.description,
          category: newItem.category,
          pricePerHour: newItem.pricePerHour,
          location: newItem.location,
          imageUrl: newItem.imageUrl
        }
      );
      
      console.log("API response:", response.data);
      
      if (response.data.status === 'success') {
        toast.success('Equipment added successfully!');
        
        // Add the new item to the equipment data
        const addedItem = response.data.data;
        setEquipmentData(prev => [addedItem, ...prev]);
        
        // Reset form and close modal
        setNewItem({
          name: '',
          category: '',
          description: '',
          pricePerHour: 0,
          location: '',
          imageUrl: '',
        });
        setShowAddItemModal(false);
      }
    } catch (error) {
      console.error('Error adding equipment:', error);
      if (axios.isAxiosError(error)) {
        console.log("Error response:", error.response?.data);
        console.log("Error status:", error.response?.status);
        console.log("Error headers:", error.response?.headers);
      }
      toast.error('Failed to add equipment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showAddItemModal, setShowAddItemModal] = useState(false);

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
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-agrigreen mb-2">Farm Equipment Leasing</h1>
                <p className="text-gray-600">Rent high-quality agricultural equipment from farmers in your area</p>
              </div>
              
              {user && (
                <Button 
                  onClick={() => setShowAddItemModal(true)}
                  className="bg-agrigreen hover:bg-agrigreen-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Equipment
                </Button>
              )}
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-agrigreen" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map(item => (
                    <Card key={item._id || item.id} className="overflow-hidden">
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
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
                          <span className="text-xs font-medium">{item.rating || 4.5}</span>
                          <span className="text-xs text-gray-500 ml-1">({item.reviews || 10})</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-600">Hourly Rate:</span>
                          <span className="font-semibold text-sm text-agrigreen">₹{item.pricePerHour}/hr</span>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full text-xs h-8 flex items-center justify-center"
                          onClick={() => handleCallOwner(item.ownerContact)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call Owner
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
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
            <div className="relative p-6">
              <button 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddItemModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Equipment for Rent</h3>
                <p className="text-gray-600">Share your equipment with farmers in your area</p>
              </div>
              
              <form onSubmit={handleAddItem}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Equipment Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newItem.name}
                      onChange={handleInputChange}
                      placeholder="e.g., John Deere 5E Tractor"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={handleCategorySelect}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newItem.description}
                      onChange={handleInputChange}
                      placeholder="Describe your equipment (specifications, condition, etc.)"
                      required
                      rows={3}
                    />
            </div>
                  
                  <div className="grid grid-cols-2 gap-4">
              <div>
                      <Label htmlFor="pricePerHour">Hourly Rate (₹) *</Label>
                      <Input
                        id="pricePerHour"
                        name="pricePerHour"
                        type="number"
                        value={newItem.pricePerHour || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 350"
                        required
                        min="1"
                      />
              </div>
                    
              <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        value={newItem.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Pune, Maharashtra"
                        required
                      />
                    </div>
              </div>
                  
              <div>
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={newItem.imageUrl}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    {newItem.imageUrl && (
                      <div className="mt-2 h-32 rounded-md overflow-hidden">
                        <img 
                          src={newItem.imageUrl}
                          alt="Equipment preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
              </div>
            </div>
                
                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddItemModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-agrigreen hover:bg-agrigreen-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        Add Equipment
                      </>
                    )}
                  </Button>
          </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseMarketplace;