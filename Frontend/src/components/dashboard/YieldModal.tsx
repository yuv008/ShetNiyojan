import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Yield } from "./CurrentYields";
import { useAuth } from "@/lib/auth-context";

type YieldModalProps = {
  onClose: () => void;
  onSubmit: (data: { name: string; acres: number; mobileno: string }) => void;
};

const YieldModal = ({ onClose, onSubmit }: YieldModalProps) => {
  const [name, setName] = useState("");
  const [acres, setAcres] = useState("");
  const [errors, setErrors] = useState<{ name?: string; acres?: string }>({});
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const newErrors: { name?: string; acres?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Crop name is required";
    }
    
    if (!acres.trim()) {
      newErrors.acres = "Acreage is required";
    } else if (isNaN(Number(acres)) || Number(acres) <= 0) {
      newErrors.acres = "Acreage must be a positive number";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Get user's mobile number from auth context
    const mobileno = user?.mobileno || "";
    
    if (!mobileno) {
      alert("User information not available. Please log in again.");
      return;
    }
    
    onSubmit({
      name: name.trim(),
      acres: Number(acres),
      mobileno
    });
    
    // Reset form
    setName("");
    setAcres("");
    setErrors({});
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Yield</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="crop-name" className="text-right">
                Crop Name
              </Label>
              <Input
                id="crop-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Wheat, Corn, Soybeans"
              />
              {errors.name && (
                <div className="col-span-4 -mt-2 text-right">
                  <p className="text-sm text-red-500">{errors.name}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="acres" className="text-right">
                Acres
              </Label>
              <Input
                id="acres"
                type="number"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 12.5"
                step="0.1"
                min="0.1"
              />
              {errors.acres && (
                <div className="col-span-4 -mt-2 text-right">
                  <p className="text-sm text-red-500">{errors.acres}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Yield
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default YieldModal;