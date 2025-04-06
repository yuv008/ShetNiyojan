import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react"; 
 
interface ActivityFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  audioData?: any; // Speech recognition data
}

// Updated activity types with proper capitalization for UI display
const activityTypes = [
  "Cultivation",
  "Sowing",
  "Fertilizer",
  "Pesticide",
  "Irrigation",
  "Harvesting",
  "Financial",
  "Other"
];

const ActivityForm = ({ onClose, onSubmit, audioData }: ActivityFormProps) => {
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    expense: "",
    summary: "",
    isExpense: true,
    fertilizer: {
      name: "",
      quantity: "",
      billImage: null as File | null,
    },
    pesticide: {
      name: "",
      quantity: "",
      billImage: null as File | null,
    },
    financial: {
      category: "",
      paymentMethod: "",
      receiptImage: null as File | null,
    }
  });

  // Populate form with speech recognition data if available
  useEffect(() => {
    if (audioData) {
      console.log("Populating form with speech data:", audioData);
      setFormData({
        type: audioData.type || "",
        name: audioData.name || "",
        expense: audioData.expense || "",
        summary: audioData.summary || "",
        isExpense: audioData.isExpense !== undefined ? audioData.isExpense : true,
        fertilizer: {
          name: audioData.fertilizer?.name || "",
          quantity: audioData.fertilizer?.quantity || "",
          billImage: null
        },
        pesticide: {
          name: audioData.pesticide?.name || "",
          quantity: audioData.pesticide?.quantity || "",
          billImage: null
        },
        financial: {
          category: audioData.financial?.category || "",
          paymentMethod: audioData.financial?.paymentMethod || "",
          receiptImage: null
        }
      });
    }
  }, [audioData]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecialFieldChange = (category: "fertilizer" | "pesticide" | "financial", field: string, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleFileChange = (category: "fertilizer" | "pesticide" | "financial", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fieldName = category === "financial" ? "receiptImage" : "billImage";
      handleSpecialFieldChange(category, fieldName, file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showFertilizerFields = formData.type === "Fertilizer";
  const showPesticideFields = formData.type === "Pesticide";
  const showFinancialFields = formData.type === "Financial";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] rounded-lg p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <DialogTitle className="text-lg md:text-xl">
            {audioData ? "Confirm Voice Entry" : "Add New Activity"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 mt-2">
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="type" className="text-sm md:text-base">Activity Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger className="h-9 md:h-10">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="name" className="text-sm md:text-base">Activity Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter activity name"
              className="h-9 md:h-10"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="expense" className="text-sm md:text-base">Amount (₹)</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="isExpense" className="text-xs md:text-sm">Is Expense</Label>
                <Switch 
                  id="isExpense" 
                  checked={formData.isExpense}
                  onCheckedChange={(checked) => handleChange("isExpense", checked)}
                  className="h-4 md:h-5"
                />
              </div>
            </div>
            <Input
              id="expense"
              type="number"
              value={formData.expense}
              onChange={(e) => handleChange("expense", e.target.value)}
              placeholder="Enter amount"
              className="h-9 md:h-10"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="summary" className="text-sm md:text-base">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              placeholder="Enter activity summary"
              className="h-20 resize-none"
            />
          </div>

          {showFertilizerFields && (
            <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="fertilizerName" className="text-sm md:text-base">Fertilizer Name</Label>
                <Input
                  id="fertilizerName"
                  value={formData.fertilizer.name}
                  onChange={(e) => handleSpecialFieldChange("fertilizer", "name", e.target.value)}
                  placeholder="Enter fertilizer name"
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="fertilizerQuantity" className="text-sm md:text-base">Quantity</Label>
                <Input
                  id="fertilizerQuantity"
                  value={formData.fertilizer.quantity}
                  onChange={(e) => handleSpecialFieldChange("fertilizer", "quantity", e.target.value)}
                  placeholder="Enter quantity (e.g., 50kg)"
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="fertilizerBill" className="text-sm md:text-base">Upload Bill Image</Label>
                <Input
                  id="fertilizerBill"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("fertilizer", e)}
                  className="h-9 md:h-10 text-xs md:text-sm"
                />
              </div>
            </div>
          )}

          {showPesticideFields && (
            <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="pesticideName" className="text-sm md:text-base">Pesticide Name</Label>
                <Input
                  id="pesticideName"
                  value={formData.pesticide.name}
                  onChange={(e) => handleSpecialFieldChange("pesticide", "name", e.target.value)}
                  placeholder="Enter pesticide name"
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="pesticideQuantity" className="text-sm md:text-base">Quantity</Label>
                <Input
                  id="pesticideQuantity"
                  value={formData.pesticide.quantity}
                  onChange={(e) => handleSpecialFieldChange("pesticide", "quantity", e.target.value)}
                  placeholder="Enter quantity (e.g., 5L)"
                  className="h-9 md:h-10"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="pesticideBill" className="text-sm md:text-base">Upload Bill Image</Label>
                <Input
                  id="pesticideBill"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("pesticide", e)}
                  className="h-9 md:h-10 text-xs md:text-sm"
                />
              </div>
            </div>
          )}
          
          {showFinancialFields && (
            <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="financialCategory" className="text-sm md:text-base">Financial Category</Label>
                <Select
                  value={formData.financial.category}
                  onValueChange={(value) => handleSpecialFieldChange("financial", "category", value)}
                >
                  <SelectTrigger className="h-9 md:h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="subsidy">Subsidy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm md:text-base">Payment Method</Label>
                <Select
                  value={formData.financial.paymentMethod}
                  onValueChange={(value) => handleSpecialFieldChange("financial", "paymentMethod", value)}
                >
                  <SelectTrigger className="h-9 md:h-10">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="financialReceipt" className="text-sm md:text-base">Upload Receipt</Label>
                <Input
                  id="financialReceipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("financial", e)}
                  className="h-9 md:h-10 text-xs md:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 md:pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="h-8 md:h-10 text-xs md:text-sm px-3 md:px-4">
              Cancel
            </Button>
            <Button type="submit" className="h-8 md:h-10 text-xs md:text-sm px-3 md:px-4">
              {audioData ? "Confirm Activity" : "Add Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityForm;