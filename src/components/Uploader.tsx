
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

interface UploaderProps {
  onFileUpload: (file: File) => void;
}

export function Uploader({ onFileUpload }: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndUploadFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndUploadFile(file);
    }
  };

  const validateAndUploadFile = (file: File) => {
    // In a real implementation, we would check if it's a valid EDF file
    // For demo purposes, we'll accept any file, but in practice you might want to check the extension or header
    onFileUpload(file);
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="py-4">
      <Card 
        className={`border-2 border-dashed ${
          dragActive ? "border-primary bg-muted/50" : "border-border"
        } hover:border-primary hover:bg-muted/50 transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Upload your EDF file</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onButtonClick}
          >
            Select File
          </Button>
          <Input
            ref={inputRef}
            type="file"
            accept=".edf"
            className="hidden"
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground mt-4">
            Supported format: EDF (European Data Format)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
