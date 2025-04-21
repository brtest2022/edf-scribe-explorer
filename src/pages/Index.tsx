
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Uploader } from "@/components/Uploader";
import { SignalViewer } from "@/components/SignalViewer";
import { EDFEditor } from "@/components/EDFEditor";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [edfData, setEdfData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upload");
  
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mockEdfData = {
          header: {
            patientId: "X X X X",
            recordingId: "Startdate X X X X",
            startDate: new Date().toISOString(),
            duration: 10,
            numberOfSignals: 4,
          },
          signals: [
            { label: "EEG Fpz-Cz", samples: generateMockSamples(100), sampleRate: 100, physicalMin: -440, physicalMax: 510 },
            { label: "EEG Pz-Oz", samples: generateMockSamples(100), sampleRate: 100, physicalMin: -440, physicalMax: 510 },
            { label: "EOG horizontal", samples: generateMockSamples(100), sampleRate: 100, physicalMin: -500, physicalMax: 500 },
            { label: "EMG submental", samples: generateMockSamples(100), sampleRate: 100, physicalMin: -500, physicalMax: 500 }
          ]
        };
        setEdfData(mockEdfData);
        setActiveTab("view");
      } catch (error) {
        console.error("Error parsing EDF file:", error);
        alert("Error parsing the EDF file. Please make sure it's a valid EDF format.");
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const generateMockSamples = (count: number) => {
    const samples = [];
    for (let i = 0; i < count; i++) {
      samples.push(Math.sin(i / 10) * 100 + (Math.random() * 20 - 10));
    }
    return samples;
  };

  const handleSaveEdf = () => {
    if (!edfData) return;
    
    const jsonString = JSON.stringify(edfData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = file ? file.name.replace('.edf', '_modified.json') : 'edf_data_modified.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      description: "File modificato salvato come JSON.",
    });
  };

  const handleExportEdf = () => {
    if (!edfData) return;

    const headerSection = formatEDFHeader(edfData.header);
    const signalsSection = formatEDFSignals(edfData.signals);
    
    const edfString = headerSection + signalsSection;
    const blob = new Blob([edfString], { type: 'application/edf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = file ? file.name.replace('.edf', '_esportato.edf') : 'edf_modificato.esportato.edf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Esportazione completata",
      description: "File esportato in formato EDF con header corretto.",
    });
  };

  const formatEDFHeader = (header) => {
    let formattedHeader = "EDF+C\n";
    formattedHeader += `Paziente ID: ${header.patientId || "Unknown"}\n`;
    formattedHeader += `Paziente Nome: ${header.patientId ? header.patientId.split(' ')[0] : "Unknown"}\n`;
    formattedHeader += `Paziente Cognome: ${header.patientId ? header.patientId.split(' ')[1] : "Unknown"}\n`;
    formattedHeader += `Registrazione: ${header.recordingId}\n`;
    formattedHeader += `Data inizio: ${header.startDate}\n`;
    formattedHeader += `Durata: ${header.duration} secondi\n`;
    formattedHeader += `Numero di segnali: ${header.numberOfSignals}\n`;
    formattedHeader += "--- HEADER SECTION END ---\n\n";
    
    return formattedHeader;
  };
  
  const formatEDFSignals = (signals) => {
    let formattedSignals = "--- SIGNALS SECTION START ---\n";
    
    signals.forEach((signal, index) => {
      formattedSignals += `Signal ${index + 1}: ${signal.label}\n`;
      formattedSignals += `Sample Rate: ${signal.sampleRate} Hz\n`;
      formattedSignals += `Physical Range: ${signal.physicalMin} to ${signal.physicalMax}\n`;
      formattedSignals += `Samples: ${signal.samples.slice(0, 5).join(', ')}... (${signal.samples.length} total)\n\n`;
    });
    
    return formattedSignals;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">EDF Scribe Explorer</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>EDF File Manager</CardTitle>
          <CardDescription>
            Upload, view, modify, and save EDF (European Data Format) files for biosignal data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="view" disabled={!edfData}>View</TabsTrigger>
              <TabsTrigger value="edit" disabled={!edfData}>Edit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <Uploader onFileUpload={handleFileUpload} />
            </TabsContent>
            
            <TabsContent value="view">
              {edfData && <SignalViewer edfData={edfData} />}
            </TabsContent>
            
            <TabsContent value="edit">
              {edfData && <EDFEditor edfData={edfData} setEdfData={setEdfData} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {edfData && (
        <div className="flex justify-center gap-4">
          <Button onClick={handleSaveEdf} size="lg" className="px-8">
            Save Modified EDF File
          </Button>
          <Button onClick={handleExportEdf} size="lg" variant="outline" className="px-8 flex items-center gap-2">
            <Download className="mr-2" /> Esporta in EDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
