
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SignalViewerProps {
  edfData: any;
}

export function SignalViewer({ edfData }: SignalViewerProps) {
  const [selectedSignal, setSelectedSignal] = useState<number>(0);
  const [chartData, setChartData] = useState<Array<{ time: number; value: number }>>([]);
  
  useEffect(() => {
    if (edfData && edfData.signals && edfData.signals.length > 0) {
      // Convert the signal samples to a format recharts can use
      const signal = edfData.signals[selectedSignal];
      const sampleRate = signal.sampleRate || 100; // Default to 100Hz if not specified
      const data = signal.samples.map((value: number, index: number) => ({
        time: index / sampleRate, // Convert sample index to time in seconds
        value: value
      }));
      setChartData(data);
    }
  }, [edfData, selectedSignal]);

  const headerInfo = [
    { label: "Patient ID", value: edfData?.header?.patientId || "N/A" },
    { label: "Recording ID", value: edfData?.header?.recordingId || "N/A" },
    { label: "Start Date", value: edfData?.header?.startDate ? new Date(edfData.header.startDate).toLocaleString() : "N/A" },
    { label: "Duration", value: edfData?.header?.duration ? `${edfData.header.duration} seconds` : "N/A" },
    { label: "Number of Signals", value: edfData?.header?.numberOfSignals || edfData?.signals?.length || "N/A" }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {headerInfo.map((info, index) => (
          <Card key={index}>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{info.label}</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-lg font-medium">{info.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4">
        <Select 
          value={selectedSignal.toString()} 
          onValueChange={(value) => setSelectedSignal(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a signal to view" />
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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            {edfData?.signals?.[selectedSignal]?.label || `Signal ${selectedSignal + 1}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Signal Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sample Rate:</span>
                <span>{edfData?.signals?.[selectedSignal]?.sampleRate || "N/A"} Hz</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Physical Min:</span>
                <span>{edfData?.signals?.[selectedSignal]?.physicalMin || "N/A"} μV</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Physical Max:</span>
                <span>{edfData?.signals?.[selectedSignal]?.physicalMax || "N/A"} μV</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Number of Samples:</span>
                <span>{edfData?.signals?.[selectedSignal]?.samples?.length || "N/A"}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
