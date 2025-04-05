import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaf, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import YieldModal from "./YieldModal";

export type Yield = {
  id: string;
  name: string;
  acres: number;
  status: "growing" | "harvested" | "planning";
  health: number;
  plantDate: string;
};

// Sample data - in a real app, this would come from a database
const yields: Yield[] = [
  {
    id: "y1",
    name: "Spinach",
    acres: 12.5,
    status: "growing",
    health: 94,
    plantDate: "2023-03-15",
  },
  {
    id: "y2",
    name: "Wheat",
    acres: 35.8,
    status: "growing",
    health: 87,
    plantDate: "2023-02-20",
  },
  {
    id: "y3",
    name: "Corn",
    acres: 20.2,
    status: "planning",
    health: 0,
    plantDate: "",
  },
  {
    id: "y4",
    name: "Soybeans",
    acres: 18.7,
    status: "harvested",
    health: 100,
    plantDate: "2022-09-10",
  },
];

const statusColors = {
  growing: "bg-green-100 text-green-800",
  harvested: "bg-blue-100 text-blue-800",
  planning: "bg-yellow-100 text-yellow-800",
};

const CurrentYields = () => {
  const [currentYields, setCurrentYields] = useState<Yield[]>(yields);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddYield = (data: { name: string; acres: number }) => {
    const newYield: Yield = {
      id: `y${currentYields.length + 1}`, // Simple ID generation
      name: data.name,
      acres: data.acres,
      status: "planning", // Default status for new yields
      health: 0,
      plantDate: "", // Empty for planning status
    };

    setCurrentYields([...currentYields, newYield]);
    setIsModalOpen(false);
  };

  const handleDeleteYield = (id: string) => {
    setCurrentYields(currentYields.filter(yieldItem => yieldItem.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Current Yields</h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Yield
        </Button>
      </div>
      
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Crop</TableHead>
              <TableHead>Acres</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Plant Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentYields.map((yieldItem) => (
              <TableRow key={yieldItem.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  {yieldItem.name}
                </TableCell>
                <TableCell>{yieldItem.acres.toFixed(1)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[yieldItem.status]}>
                    {yieldItem.status.charAt(0).toUpperCase() + yieldItem.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {yieldItem.status === "planning" ? (
                    "N/A"
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${yieldItem.health}%` }}
                        />
                      </div>
                      <span className="text-xs">{yieldItem.health}%</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {yieldItem.plantDate ? new Date(yieldItem.plantDate).toLocaleDateString() : "Not planted"}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteYield(yieldItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <YieldModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAddYield} 
        />
      )}
    </div>
  );
};

export default CurrentYields;