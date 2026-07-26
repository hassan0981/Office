"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Save, Eraser, Palette, Undo } from "lucide-react";
import { saveTaskSketchAction } from "@/app/actions/tasks";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface WhiteboardCanvasProps {
  taskId: string;
  initialSketch?: string | null;
}

export function WhiteboardCanvas({ taskId, initialSketch }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#3A3229"); // charcoal
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const colors = [
    { name: "Charcoal", hex: "#3A3229" },
    { name: "Terracotta", hex: "#FF6B4A" },
    { name: "Sage", hex: "#5B8C73" },
    { name: "Gold", hex: "#D97706" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get styling dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 400 * 2;
    canvas.style.width = "100%";
    canvas.style.height = "400px";

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Fill with a clean off-white background
    context.fillStyle = "#FDFBF7";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // If an initial sketch exists, load it
    if (initialSketch) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, rect.width, 400);
      };
      img.src = initialSketch;
    }
  }, [initialSketch]);

  // Handle color or brush changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isEraser ? "#FDFBF7" : color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, isEraser]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    contextRef.current.fillStyle = "#FDFBF7";
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Whiteboard cleared");
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await saveTaskSketchAction(taskId, dataUrl);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Sketch saved successfully!");

        // Broadcast realtime update
        const supabase = createClient();
        supabase.channel("live-tasks-channel").send({
          type: "broadcast",
          event: "task-changed",
          payload: { action: "update", id: taskId }
        });
      }
    } catch (err) {
      toast.error("Failed to save sketch");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-cream-300 bg-white/90 p-5 shadow-warm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-charcoal-900">Task Whiteboard / Sketchpad</h3>
          <p className="text-xs text-charcoal-400">Sketch wireframes, flowcharts, or notes</p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Colors */}
          <div className="flex items-center gap-1.5 border-r border-cream-200 pr-2 mr-2">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  setColor(c.hex);
                  setIsEraser(false);
                }}
                className={`h-6 w-6 rounded-full border transition-transform ${
                  color === c.hex && !isEraser ? "scale-110 border-charcoal-900" : "border-cream-300"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Eraser */}
          <Button
            variant={isEraser ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEraser(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Eraser className="h-3.5 w-3.5" /> Eraser
          </Button>

          {/* Brush size input */}
          <div className="flex items-center gap-2 text-xs text-charcoal-500 font-semibold border-l border-cream-200 pl-3">
            <span>Size:</span>
            <input
              type="range"
              min="2"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 h-1 bg-cream-300 rounded-lg appearance-none cursor-pointer accent-terracotta-500"
            />
            <span className="w-4 text-right">{brushSize}px</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative overflow-hidden rounded-2xl border border-cream-200 bg-[#FDFBF7] shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block"
        />
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={handleClear} className="gap-2 text-charcoal-600">
          <Trash2 className="h-4 w-4" /> Clear All
        </Button>
        <Button size="sm" onClick={handleSave} isLoading={isSaving} className="gap-2 px-5">
          <Save className="h-4 w-4" /> Save Sketch
        </Button>
      </div>
    </div>
  );
}
