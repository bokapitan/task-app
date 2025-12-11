import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Ensure you have this installed
import { Wand2, Sparkles } from "lucide-react";

interface CreateTaskFormProps {
  // Update the contract to accept the boolean
  onSubmit: (title: string, description: string, useAI: boolean) => Promise<void>;
}

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useAI, setUseAI] = useState(true); // Default to TRUE because it's cool
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // Pass the state to the parent
      await onSubmit(title, description, useAI);
      setTitle("");
      setDescription("");
      // We don't reset useAI so the user's preference sticks
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Plan a birthday party"
          required
          className="bg-background/50"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={3}
          className="bg-background/50"
        />
      </div>

      {/* --- NEW: The AI Toggle Switch --- */}
      <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card/50">
        <div className="space-y-0.5">
            <Label htmlFor="ai-mode" className="text-base flex items-center gap-2">
                AI Assistant <Wand2 className="h-4 w-4 text-primary" />
            </Label>
            <div className="text-xs text-muted-foreground">
                Auto-generate subtasks and labels
            </div>
        </div>
        <Switch
            id="ai-mode"
            checked={useAI}
            onCheckedChange={setUseAI}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full relative overflow-hidden group"
      >
        {isSubmitting ? (
            "Creating..."
        ) : (
            <span className="flex items-center gap-2">
                Create Task 
                {useAI && <Sparkles className="h-4 w-4 animate-pulse text-yellow-300" />}
            </span>
        )}
        
        {/* Subtle glow effect on hover if AI is on */}
        {useAI && !isSubmitting && (
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        )}
      </Button>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
}