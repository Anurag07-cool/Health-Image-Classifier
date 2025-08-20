import { RequestHandler } from "express";
import multer from "multer";

// Configure multer for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export interface ClassificationResponse {
  condition: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  description: string;
  timestamp: string;
}

// Middleware for handling image uploads
export const uploadMiddleware = upload.single("image");

// Handler for image classification
export const handleClassification: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // TODO: Replace this mock with actual Flask API call
    // Example Flask API call:
    // const formData = new FormData();
    // formData.append('image', req.file.buffer, req.file.originalname);
    //
    // const flaskResponse = await fetch('http://your-flask-backend/predict', {
    //   method: 'POST',
    //   body: formData
    // });
    //
    // const prediction = await flaskResponse.json();

    // Mock prediction for demonstration
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

    const mockPredictions = [
      {
        condition: "Melanoma",
        confidence: 0.87,
        severity: "high" as const,
        description:
          "Detected suspicious pigmented lesion. Recommend immediate dermatological consultation for further evaluation.",
      },
      {
        condition: "Benign Nevus",
        confidence: 0.92,
        severity: "low" as const,
        description:
          "Appears to be a benign mole. Continue regular skin monitoring and annual dermatological check-ups.",
      },
      {
        condition: "Seborrheic Keratosis",
        confidence: 0.78,
        severity: "low" as const,
        description:
          "Common benign skin growth. No immediate treatment required unless cosmetically bothersome.",
      },
      {
        condition: "Basal Cell Carcinoma",
        confidence: 0.83,
        severity: "medium" as const,
        description:
          "Possible skin cancer detected. Recommend dermatological evaluation for confirmation and treatment planning.",
      },
    ];

    const randomPrediction =
      mockPredictions[Math.floor(Math.random() * mockPredictions.length)];

    const response: ClassificationResponse = {
      ...randomPrediction,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error("Classification error:", error);
    res.status(500).json({
      error: "Failed to process image classification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
