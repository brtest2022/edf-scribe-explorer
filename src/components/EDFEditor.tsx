
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";

interface EDFEditorProps {
  edfData: any;
  setEdfData: (data: any) => void;
}

export function EDFEditor({ edfData, setEdfData }: EDFEditorProps) {
  const [selectedSignal, setSelectedSignal] = useState<number>(0);
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<"header" | "signal" | "sample">("header");
  const [chartData, setChartData] = useState<Array<{ time: number; value: number }>>(() => {
    const signal = edfData.signals[selectedSignal];
    const sampleRate = signal.sampleRate || 100;
    return signal.samples.map((value: number, index: number) => ({
      time: index / sampleRate,
      value: value
    }));
  });

  const updateHeader = (field: string, value: string) => {
    const updatedEdfData = {
      ...edfData,
      header: {
        ...edfData.header,
        [field]: value
      }
    };
    setEdfData(updatedEdfData);
  };

  const updateSignalProperty = (field: string, value: string | number) => {
    const updatedSignals = [...edfData.signals];
    updatedSignals[selectedSignal] = {
      ...updatedSignals[selectedSignal],
      [field]: typeof value === "string" && !isNaN(Number(value)) ? Number(value) : value
    };
    
    const updatedEdfData = {
      ...edfData,
      signals: updatedSignals
    };
    setEdfData(updatedEdfData);
  };

  const updateSample = (index: number, value: number) => {
    const updatedSignals = [...edfData.signals];
    const updatedSamples = [...updatedSignals[selectedSignal].samples];
    updatedSamples[index] = value;
    
    updatedSignals[selectedSignal] = {
      ...updatedSignals[selectedSignal],
      samples: updatedSamples
    };
    
    const updatedEdfData = {
      ...edfData,
      signals: updatedSignals
    };
    
    setEdfData(updatedEdfData);
    
    // Update chart data
    const signal = updatedEdfData.signals[selectedSignal];
    const sampleRate = signal.sampleRate || 100;
    const data = signal.samples.map((sampleValue: number, idx: number) => ({
      time: idx / sampleRate,
      value: sampleValue
    }));
    setChartData(data);
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const timeValue = data.activePayload[0].payload.time;
      const signal = edfData.signals[selectedSignal];
      const sampleRate = signal.sampleRate || 100;
      const index = Math.round(timeValue * sampleRate);
      setSelectedSample(index);
      setEditMode("sample");
    }
  };

  return (
    <div>
      <Tabs value={editMode} onValueChange={(value: string) => setEditMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="header">Edit Header</TabsTrigger>
          <TabsTrigger value="signal">Edit Signal</TabsTrigger>
          <TabsTrigger value="sample">Edit Samples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Edit EDF Header Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input 
                    id="patientId" 
                    value={edfData.header.patientId || ""} 
                    onChange={(e) => updateHeader("patientId", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recordingId">Recording ID</Label>
                  <Input 
                    id="recordingId" 
                    value={edfData.header.recordingId || ""} 
                    onChange={(e) => updateHeader("recordingId", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="datetime-local"
                    value={edfData.header.startDate ? new Date(edfData.header.startDate).toISOString().slice(0, 16) : ""} 
                    onChange={(e) => updateHeader("startDate", new Date(e.target.value).toISOString())} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    value={edfData.header.duration || 0} 
                    onChange={(e) => updateHeader("duration", e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signal">
          <Card>
            <CardHeader>
              <CardTitle>Edit Signal Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <Select 
                  value={selectedSignal.toString()} 
                  onValueChange={(value) => setSelectedSignal(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a signal to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {edfData?.signals?.map((signal: any, index: number) => (
                      <SelectItem key={index} value={index.toString()}>
                        {signal.label || `Signal ${index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signalLabel">Signal Label</Label>
                  <Input 
                    id="signalLabel" 
                    value={edfData.signals[selectedSignal].label || ""} 
                    onChange={(e) => updateSignalProperty("label", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sampleRate">Sample Rate (Hz)</Label>
                  <Input 
                    id="sampleRate" 
                    type="number"
                    value={edfData.signals[selectedSignal].sampleRate || 0} 
                    onChange={(e) => updateSignalProperty("sampleRate", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="physicalMin">Physical Min (μV)</Label>
                  <Input 
                    id="physicalMin" 
                    type="number"
                    value={edfData.signals[selectedSignal].physicalMin || 0} 
                    onChange={(e) => updateSignalProperty("physicalMin", e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="physicalMax">Physical Max (μV)</Label>
                  <Input 
                    id="physicalMax" 
                    type="number"
                    value={edfData.signals[selectedSignal].physicalMax || 0} 
                    onChange={(e) => updateSignalProperty("physicalMax", e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sample">
          <Card>
            <CardHeader>
              <CardTitle>Edit Signal Samples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select 
                  value={selectedSignal.toString()} 
                  onValueChange={(value) => setSelectedSignal(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a signal to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {edfData?.signals?.map((signal: any, index: number) => (
                      <SelectItem key={index} value={index.toString()}>
                        {signal.label || `Signal ${index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Click on the chart to select a sample point to edit, or use the sample index selector below.
                </p>
                <div className="h-[300px]" onClick={handleChartClick}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: "Time (seconds)", position: "insideBottomRight", offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: "Amplitude (μV)", angle: -90, position: "insideLeft" }} 
                        domain={[
                          edfData?.signals?.[selectedSignal]?.physicalMin || "auto",
                          edfData?.signals?.[selectedSignal]?.physicalMax || "auto"
                        ]}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} μV`, "Value"]}
                        labelFormatter={(time) => `Time: ${time.toFixed(2)}s`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        dot={false} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {selectedSample !== null && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sampleIndex">Sample Index</Label>
                    <Input 
                      id="sampleIndex"
                      type="number"
                      className="w-24"
                      value={selectedSample} 
                      onChange={(e) => {
                        const index = parseInt(e.target.value);
                        if (!isNaN(index) && index >= 0 && index < edfData.signals[selectedSignal].samples.length) {
                          setSelectedSample(index);
                        }
                      }} 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="block mb-2">
                      Sample Value: {edfData.signals[selectedSignal].samples[selectedSample]?.toFixed(2) || 0} μV
                    </Label>
                    <Slider
                      value={[edfData.signals[selectedSignal].samples[selectedSample] || 0]}
                      min={edfData.signals[selectedSignal].physicalMin || -500}
                      max={edfData.signals[selectedSignal].physicalMax || 500}
                      step={0.1}
                      onValueChange={(values) => updateSample(selectedSample, values[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sampleValue">Manual Sample Value (μV)</Label>
                    <Input 
                      id="sampleValue"
                      type="number"
                      step="0.1"
                      value={edfData.signals[selectedSignal].samples[selectedSample] || 0} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          updateSample(selectedSample, value);
                        }
                      }} 
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (selectedSample > 0) {
                          setSelectedSample(selectedSample - 1);
                        }
                      }}
                    >
                      Previous Sample
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (selectedSample < edfData.signals[selectedSignal].samples.length - 1) {
                          setSelectedSample(selectedSample + 1);
                        }
                      }}
                    >
                      Next Sample
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
