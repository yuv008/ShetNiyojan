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
 
interface ActivityFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  audioData?: any; // Speech recognition data
}

const activityTypes = [
  "Cultivation",
  "Sowing",
  "Fertilizer",
  "Pesticide",
  "Irrigation",
  "Harvesting",
  "Other",
  "Financial"
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {audioData ? "Confirm Voice Entry" : "Add New Activity"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Activity Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="name">Activity Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter activity name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="expense">Amount (₹)</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="isExpense" className="text-sm">Is Expense</Label>
                <Switch 
                  id="isExpense" 
                  checked={formData.isExpense}
                  onCheckedChange={(checked) => handleChange("isExpense", checked)}
                />
              </div>
            </div>
            <Input
              id="expense"
              type="number"
              value={formData.expense}
              onChange={(e) => handleChange("expense", e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              placeholder="Enter activity summary"
            />
          </div>

          {showFertilizerFields && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="fertilizerName">Fertilizer Name</Label>
                <Input
                  id="fertilizerName"
                  value={formData.fertilizer.name}
                  onChange={(e) => handleSpecialFieldChange("fertilizer", "name", e.target.value)}
                  placeholder="Enter fertilizer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fertilizerQuantity">Quantity</Label>
                <Input
                  id="fertilizerQuantity"
                  value={formData.fertilizer.quantity}
                  onChange={(e) => handleSpecialFieldChange("fertilizer", "quantity", e.target.value)}
                  placeholder="Enter quantity (e.g., 50kg)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fertilizerBill">Upload Bill Image</Label>
                <Input
                  id="fertilizerBill"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("fertilizer", e)}
                />
              </div>
            </div>
          )}

          {showPesticideFields && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="pesticideName">Pesticide Name</Label>
                <Input
                  id="pesticideName"
                  value={formData.pesticide.name}
                  onChange={(e) => handleSpecialFieldChange("pesticide", "name", e.target.value)}
                  placeholder="Enter pesticide name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesticideQuantity">Quantity</Label>
                <Input
                  id="pesticideQuantity"
                  value={formData.pesticide.quantity}
                  onChange={(e) => handleSpecialFieldChange("pesticide", "quantity", e.target.value)}
                  placeholder="Enter quantity (e.g., 5L)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesticideBill">Upload Bill Image</Label>
                <Input
                  id="pesticideBill"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("pesticide", e)}
                />
              </div>
            </div>
          )}
          
          {showFinancialFields && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="financialCategory">Financial Category</Label>
                <Select
                  value={formData.financial.category}
                  onValueChange={(value) => handleSpecialFieldChange("financial", "category", value)}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.financial.paymentMethod}
                  onValueChange={(value) => handleSpecialFieldChange("financial", "paymentMethod", value)}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="financialReceipt">Upload Receipt</Label>
                <Input
                  id="financialReceipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("financial", e)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {audioData ? "Confirm Activity" : "Add Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityForm;