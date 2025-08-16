"use client";

import { useState, useRef, ChangeEvent, CSSProperties } from "react";
import Image from "next/image";
import {
  Camera,
  UploadCloud,
  Loader2,
  Wand2,
  Download,
  Share2,
  Instagram,
  Twitter,
  Facebook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { magicEnhance } from "@/ai/flows/magic-enhance";

type FilterType = "none" | "vintage" | "crisp" | "urban";

const PRESETS: { id: FilterType; name: string }[] = [
  { id: "vintage", name: "Vintage Vibes" },
  { id: "crisp", name: "Crisp & Clean" },
  { id: "urban", name: "Urban Cool" },
];

export default function InstaTransformPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [showWatermark, setShowWatermark] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("none");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setEnhancedImage(null);
        setActiveFilter("none");
        setSliderValue(50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceClick = async () => {
    if (!originalImage) return;
    setIsLoading(true);
    try {
      const result = await magicEnhance({ photoDataUri: originalImage });
      setEnhancedImage(result.enhancedPhotoDataUri);
    } catch (error) {
      console.error("Enhancement failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to enhance the photo. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getProcessedImage = async (): Promise<string> => {
    return new Promise((resolve) => {
      const imageToProcess = new (window.Image)();
      imageToProcess.crossOrigin = "anonymous";
      imageToProcess.src = enhancedImage || originalImage || '';
      
      imageToProcess.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = imageToProcess.naturalWidth;
        canvas.height = imageToProcess.naturalHeight;
        
        const filterStyle = getFilterStyle(activeFilter);
        if (filterStyle.filter) {
          ctx.filter = filterStyle.filter;
        }

        ctx.drawImage(imageToProcess, 0, 0);

        if (showWatermark && enhancedImage) {
          ctx.filter = 'none'; // Reset filter for watermark
          ctx.font = `bold ${Math.max(24, canvas.width / 40)}px Poppins`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.fillText("InstaTransform", canvas.width - 20, canvas.height - 20);
        }
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      imageToProcess.onerror = () => {
        resolve(enhancedImage || originalImage || '');
      };
    });
  };

  const handleDownload = async () => {
    if (!enhancedImage) return;
    const finalImage = await getProcessedImage();
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = "InstaTransform_enhanced.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async (platform: 'facebook' | 'twitter') => {
      const shareText = "Check out my enhanced photo! #InstaTransform";
      const url = "https://app.firebase.google.com"; // Replace with actual app URL when deployed
      let shareUrl = '';
      if(platform === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
      } else if (platform === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
      }
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const getFilterStyle = (filter: FilterType): CSSProperties => {
    switch (filter) {
      case "vintage":
        return { filter: "sepia(0.6) brightness(0.9) contrast(1.2)" };
      case "crisp":
        return { filter: "saturate(1.2) contrast(1.1)" };
      case "urban":
        return { filter: "grayscale(0.5) contrast(1.2) brightness(0.9)" };
      default:
        return {};
    }
  };

  const finalImageStyle = getFilterStyle(activeFilter);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 container mx-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl shadow-2xl">
          {!originalImage ? (
             <CardContent className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="p-6 bg-primary/10 rounded-full">
                        <UploadCloud className="h-16 w-16 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold font-headline">Upload a Photo to Transform</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI will magically enhance your image in one tap. See the before and after with an interactive slider.
                </p>
                <Button size="lg" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-5 w-5" /> Select Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </CardContent>
          ) : (
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative w-full aspect-[4/3] bg-card-foreground/5 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={originalImage}
                    alt="Original"
                    layout="fill"
                    objectFit="contain"
                    className="transition-opacity duration-500"
                  />

                  {enhancedImage && (
                    <div
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                    >
                      <Image
                        src={enhancedImage}
                        alt="Enhanced"
                        layout="fill"
                        objectFit="contain"
                        style={finalImageStyle}
                        className="transition-opacity duration-500"
                      />
                    </div>
                  )}

                  <div
                    className="absolute inset-0 bg-transparent"
                    style={{
                      '--slider-value': `${sliderValue}%`,
                    } as React.CSSProperties}
                  >
                    <div className="absolute top-0 bottom-0 w-1 bg-accent" style={{ left: `calc(var(--slider-value) - 2px)` }}>
                      <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 bg-accent rounded-full flex items-center justify-center cursor-pointer shadow-lg text-accent-foreground">
                        <Wand2 size={18}/>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <Slider
                    value={[sliderValue]}
                    onValueChange={(value) => setSliderValue(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                    disabled={!enhancedImage}
                  />
                </div>
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">BEFORE</div>
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">AFTER</div>

              </div>

              <div className="p-6 flex flex-col justify-between bg-card">
                <div>
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="font-headline text-2xl">Transform Your Photo</CardTitle>
                        <CardDescription>Apply an enhancement or choose a preset filter.</CardDescription>
                    </CardHeader>

                    <div className="space-y-6">
                        <Button
                            onClick={handleEnhanceClick}
                            disabled={isLoading}
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                            <Wand2 className="mr-2 h-5 w-5" />
                            )}
                            {enhancedImage ? 'Re-Enhance with AI' : 'Magic Enhance'}
                        </Button>

                        {enhancedImage && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Preset Filters</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                {PRESETS.map((preset) => (
                                    <Button
                                    key={preset.id}
                                    variant={activeFilter === preset.id ? "default" : "secondary"}
                                    onClick={() => setActiveFilter(preset.id)}
                                    className="text-xs h-9"
                                    >
                                    {preset.name}
                                    </Button>
                                ))}
                                </div>
                                <Button variant="link" size="sm" onClick={() => setActiveFilter("none")} className="mt-1 px-0">Remove filter</Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="watermark-switch">Add "InstaTransform" Watermark</Label>
                                <Switch
                                id="watermark-switch"
                                checked={showWatermark}
                                onCheckedChange={setShowWatermark}
                                />
                            </div>
                        </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={handleDownload}
                      disabled={!enhancedImage}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground mr-2">Share:</p>
                    <Button onClick={() => handleShare('twitter')} variant="outline" size="icon" disabled={!enhancedImage}><Twitter className="h-4 w-4"/></Button>
                    <Button onClick={() => handleShare('facebook')} variant="outline" size="icon" disabled={!enhancedImage}><Facebook className="h-4 w-4"/></Button>
                    <Button onClick={() => {}} variant="outline" size="icon" disabled={!enhancedImage}><Instagram className="h-4 w-4" /></Button>

                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
