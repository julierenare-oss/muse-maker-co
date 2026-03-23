import { useState } from "react";
import { Star, Copy, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  modality: string;
  tags: string[];
  isFavorite: boolean;
}

const mockPrompts: SavedPrompt[] = [
  { id: "1", title: "Product Description", prompt: "Write a compelling product description for {product}. Include key features, benefits, and a call to action.", modality: "text", tags: ["marketing", "e-commerce"], isFavorite: true },
  { id: "2", title: "Brand Logo", prompt: "Create a minimalist logo for {brand}. Use clean geometric shapes, limited color palette, and modern typography.", modality: "image", tags: ["branding", "design"], isFavorite: true },
  { id: "3", title: "Social Post", prompt: "Write an engaging social media post about {topic}. Keep it under 280 characters, include relevant emojis.", modality: "text", tags: ["social media"], isFavorite: false },
  { id: "4", title: "Explainer Video", prompt: "Create a 15-second explainer video showing {feature}. Start with the problem, show the solution, end with CTA.", modality: "video", tags: ["marketing", "video"], isFavorite: false },
];

const PromptLibraryPage = () => {
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filtered = mockPrompts.filter((p) => {
    if (showFavoritesOnly && !p.isFavorite) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Prompt Library</h1>
          <p className="text-sm text-muted-foreground">Save and reuse your best prompts</p>
        </div>
        <Button variant="glow">
          <Plus className="h-4 w-4 mr-1" />
          New Prompt
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star className="h-4 w-4 mr-1" />
          Favorites
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group animate-slide-up"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">{p.title}</h3>
              <button className={p.isFavorite ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}>
                <Star className="h-4 w-4" fill={p.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.prompt}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">{p.modality}</Badge>
                {p.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm"><Copy className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptLibraryPage;
