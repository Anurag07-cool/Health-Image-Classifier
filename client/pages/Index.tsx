import { useState, useCallback } from "react";
import { Upload, X, Brain, Shield, AlertCircle, CheckCircle2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PredictionResult {
  condition: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  description: string;
}

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setPrediction(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  }, [handleImageSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback to mock data on error
      setPrediction({
        condition: "Analysis Error",
        confidence: 0,
        severity: "medium",
        description: "Unable to analyze image. Please try again or contact support if the problem persists."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low": return <CheckCircle2 className="w-4 h-4" />;
      case "medium": return <AlertCircle className="w-4 h-4" />;
      case "high": return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HealthVision AI</h1>
              <p className="text-sm text-muted-foreground">Advanced Medical Image Analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Upload Section */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {!imagePreview ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                    isDragOver 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Upload Medical Image
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Drag and drop an image here, or click to select
                  </p>
                  <Button asChild>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Select Image
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports: JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Medical image preview"
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="min-w-[150px]"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={clearImage}>
                      Upload Different Image
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {prediction && (
            <Card className="mb-8">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Analysis Results
                </h3>
                
                <div className="space-y-6">
                  {/* Main Prediction */}
                  <div className="p-6 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-foreground">
                        Detected Condition
                      </h4>
                      <Badge className={`${getSeverityColor(prediction.severity)} flex items-center gap-1`}>
                        {getSeverityIcon(prediction.severity)}
                        {prediction.severity.charAt(0).toUpperCase() + prediction.severity.slice(1)} Risk
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          {prediction.condition}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mt-4">
                        {prediction.description}
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">Medical Disclaimer</p>
                        <p className="text-amber-700">
                          This AI analysis is for informational purposes only and should not replace 
                          professional medical advice. Please consult with a qualified healthcare 
                          provider for proper diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Advanced AI</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by state-of-the-art deep learning models trained on extensive medical datasets
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your medical images are processed securely and never stored permanently
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get preliminary analysis results in seconds to help guide your healthcare decisions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
