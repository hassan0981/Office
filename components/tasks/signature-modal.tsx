"use client";

import { useRef, useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eraser, CheckSquare } from "lucide-react";
import { saveTaskSignatureAction } from "@/app/actions/tasks";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onSuccess?: () => void;
}

export function SignatureModal({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  onSuccess,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Wait a brief tick for dialog animation to settle
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = 180 * 2;
      canvas.style.width = "100%";
      canvas.style.height = "180px";

      const context = canvas.getContext("2d");
      if (!context) return;

      context.scale(2, 2);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#1A1613"; // dark charcoal
      context.lineWidth = 3;
      contextRef.current = context;

      // Fill signature space with clean solid white
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

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

    contextRef.current.fillStyle = "#FFFFFF";
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSubmitting(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await saveTaskSignatureAction(taskId, dataUrl, "DONE");

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Task completed with signature verification!");
        onSuccess?.();

        // Broadcast realtime change
        const supabase = createClient();
        supabase.channel("live-tasks-channel").send({
          type: "broadcast",
          event: "task-changed",
          payload: { action: "update", id: taskId }
        });

        onClose();
      }
    } catch (err) {
      toast.error("Failed to complete task with signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Verified Task Sign-off"
      description={`Please sign below to authorize and mark "${taskTitle}" as completed.`}
    >
      <div className="space-y-4">
        {/* Signature drawing canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-inner cursor-crosshair">
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
          <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-[10px] uppercase tracking-wider text-charcoal-300 font-semibold select-none">
            Sign on the line above
          </div>
        </div>

        {/* Form controls */}
        <div className="flex items-center justify-between pt-2 border-t border-cream-200">
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-xs text-charcoal-500">
            <Eraser className="h-3.5 w-3.5" /> Clear Sign-off
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} isLoading={isSubmitting} className="gap-1.5 font-semibold px-4">
              <CheckSquare className="h-4 w-4" /> Sign & Complete
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
