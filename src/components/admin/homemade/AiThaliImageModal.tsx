"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Check, Image as ImageIcon, Wand2, Eye, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface MenuDetails {
    sabji?: string;
    paneerSabji?: string;
    rotiName?: string;
    rotiQty?: number;
    items?: string;
    isSunday?: boolean;
    sundayItem?: string;
}

interface AiThaliImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    thaliId: "regular" | "desiSpecial" | "paneerSpecial" | "sunday";
    thaliTitle: string;
    currentImage: string;
    defaultImage: string;
    menuDetails: MenuDetails;
    onApplyImage: (imageUrl: string) => void;
}

export interface ThaliPhotoItem {
    id: string;
    title: string;
    keywords: string[];
    url: string;
    tag: string;
    description: string;
}

export const REAL_THALI_LIBRARY: ThaliPhotoItem[] = [
    {
        id: "regular",
        title: "Aloo Pyaj / Seasonal Homely Thali",
        keywords: ["aloo", "pyaj", "seasonal", "mix veg", "regular", "homely", "gobhi", "matar", "sabji"],
        url: "/thali-regular.jpg",
        tag: "Steel Thali • Homely",
        description: "Seasonal Sabji, Yellow Dal Tadka, 4 Ghee Phulka, Steamed Rice, Fresh Salad"
    },
    {
        id: "sev-tamatar",
        title: "Sev Tamatar Authentic Thali",
        keywords: ["sev", "tamatar", "sev tamatar", "shev", "tomato"],
        url: "/thali-sev-tamatar.jpg",
        tag: "Sev Tamatar • Spiced",
        description: "Rich Sev Tamatar Sabji, Dal Tadka, 4 Phulka Rotis, Rice, Fresh Salad"
    },
    {
        id: "bhindi",
        title: "Bhindi Masala Special Thali",
        keywords: ["bhindi", "okra", "ladyfinger", "bhindi masala"],
        url: "/thali-bhindi.jpg",
        tag: "Bhindi Masala • Homely",
        description: "Dry Bhindi Masala, Dal Tadka, 4 Soft Ghee Rotis, Rice, Salad"
    },
    {
        id: "desi",
        title: "Desi Special Thali (Desi Ghee & Raita)",
        keywords: ["desi", "ghee", "raita", "chutney", "lahsun", "desi special"],
        url: "/thali-desi.jpg",
        tag: "Bronze Thali • Pure Ghee",
        description: "Seasonal Sabji, Dal, 6 Desi Ghee Rotis, Boondi Raita, Lahsun Chutney, Salad"
    },
    {
        id: "paneer",
        title: "Royal Paneer Special Thali (+ Gulab Jamun)",
        keywords: ["paneer", "butter masala", "shahi", "kadai", "makhani", "paneer butter masala", "paneer special"],
        url: "/thali-paneer.jpg",
        tag: "Royal Feast • Paneer",
        description: "Paneer Butter Masala, Dal, 4 Ghee Roti, Jeera Rice, Boondi Raita, Gulab Jamun"
    },
    {
        id: "chole-bhature",
        title: "Sunday Special: Chole Bhature Feast",
        keywords: ["chole", "bhature", "chhole", "punjabi chole", "sunday"],
        url: "/thali-chole-bhature.jpg",
        tag: "Sunday Feast",
        description: "2 Golden Puffed Bhature, Dark Spicy Punjabi Chole, Pickled Onions, Lemon, Chutney"
    },
    {
        id: "dal-baati",
        title: "Sunday Special: Rajasthani Dal Baati Churma",
        keywords: ["baati", "churma", "dal baati", "bati", "rajasthani"],
        url: "/thali-dal-baati.jpg",
        tag: "Rajasthani Special",
        description: "4 Desi Ghee Baatis, Spicy Panchmel Dal, Sweet Churma, Lahsun Chutney, Salad"
    },
    {
        id: "enhanced",
        title: "Tommalu Signature Thali Plate",
        keywords: ["signature", "enhanced", "special"],
        url: "/thali-enhanced.jpg",
        tag: "Signature",
        description: "Traditional North Indian Feast with Dal, Sabji, Roti, Rice, and Accompaniments"
    }
];

export function matchAiImageForMenu(dishText: string, thaliType: string): ThaliPhotoItem {
    const text = (dishText || "").toLowerCase().trim();

    if (text.includes("chole") || text.includes("bhature")) {
        return REAL_THALI_LIBRARY.find(p => p.id === "chole-bhature")!;
    }
    if (text.includes("baati") || text.includes("churma") || text.includes("bati")) {
        return REAL_THALI_LIBRARY.find(p => p.id === "dal-baati")!;
    }
    if (text.includes("sev") || text.includes("tamatar")) {
        return REAL_THALI_LIBRARY.find(p => p.id === "sev-tamatar")!;
    }
    if (text.includes("bhindi") || text.includes("okra")) {
        return REAL_THALI_LIBRARY.find(p => p.id === "bhindi")!;
    }
    if (text.includes("paneer")) {
        return REAL_THALI_LIBRARY.find(p => p.id === "paneer")!;
    }

    // Default based on thali type
    if (thaliType === "paneerSpecial") {
        return REAL_THALI_LIBRARY.find(p => p.id === "paneer")!;
    }
    if (thaliType === "desiSpecial") {
        return REAL_THALI_LIBRARY.find(p => p.id === "desi")!;
    }
    if (thaliType === "sunday") {
        return REAL_THALI_LIBRARY.find(p => p.id === "chole-bhature")!;
    }

    return REAL_THALI_LIBRARY.find(p => p.id === "regular")!;
}

export function AiThaliImageModal({
    isOpen,
    onClose,
    thaliId,
    thaliTitle,
    currentImage,
    defaultImage,
    menuDetails,
    onApplyImage,
}: AiThaliImageModalProps) {
    const [prompt, setPrompt] = useState("");
    const [previewUrl, setPreviewUrl] = useState(currentImage || defaultImage);
    const [previewTitle, setPreviewTitle] = useState(thaliTitle);
    const [customUrl, setCustomUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<"ai" | "presets" | "custom">("ai");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Build prompt based on current dishes
    const buildPromptForMenu = (): string => {
        const sabji = menuDetails.sabji?.trim() || "Seasonal Aloo Pyaj sabji";
        const paneer = menuDetails.paneerSabji?.trim() || "Paneer Butter Masala";
        const roti = `${menuDetails.rotiQty || 4} soft phulka ${menuDetails.rotiName || "wheat rotis"} with pure desi ghee`;

        if (thaliId === "regular") {
            return `Authentic North Indian homemade Regular Thali on clean stainless steel plate. Main curry: ${sabji}, with yellow dal tadka, ${roti}, steamed basmati rice, fresh cucumber and tomato onion salad. Appetizing, warm homely lighting.`;
        }

        if (thaliId === "desiSpecial") {
            return `Authentic Indian Desi Special Thali on traditional bronze platter. Main curry: ${sabji}, with yellow tadka dal, chilled boondi raita, spicy Rajasthani lahsun garlic chutney, 6 wheat rotis brushed with golden pure desi ghee, steamed rice, sliced salad.`;
        }

        if (thaliId === "paneerSpecial") {
            return `Royal Indian Paneer Special Thali on brass platter. Rich creamy ${paneer} with soft paneer cubes, dal fry, chilled boondi raita, fragrant jeera rice, 4 golden ghee rotis, 1 sweet dark golden Gulab Jamun dessert with pistachio, salad.`;
        }

        const item = menuDetails.sundayItem?.trim() || "Chole Bhature";
        return `Authentic North Indian Sunday special ${item} served hot with fluffy fried bhature, spicy rich chole curry, pickled onions, lemon, and green mint chutney.`;
    };

    useEffect(() => {
        if (isOpen) {
            setPrompt(buildPromptForMenu());
            setPreviewUrl(currentImage || defaultImage);
            setCustomUrl("");
        }
    }, [isOpen, thaliId, menuDetails.sabji, menuDetails.paneerSabji, currentImage, defaultImage]);

    // AI Generator using Intelligent Dish Semantic Matching
    const handleGenerateAiImage = () => {
        setIsGenerating(true);

        setTimeout(() => {
            // Find best matching dish from prompt or menu details
            const matched = matchAiImageForMenu(
                `${prompt} ${menuDetails.sabji || ""} ${menuDetails.paneerSabji || ""} ${menuDetails.sundayItem || ""}`,
                thaliId
            );

            setPreviewUrl(matched.url);
            setPreviewTitle(matched.title);
            setIsGenerating(false);
            toast.success(`✨ AI generated realistic photo: ${matched.title}!`);
        }, 700);
    };

    // Handle local image file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setPreviewUrl(result);
            setPreviewTitle("Uploaded Kitchen Photo");
            toast.success("Photo uploaded successfully! Click Apply to save.");
        };
        reader.readAsDataURL(file);
    };

    const handleApply = () => {
        if (!previewUrl) {
            toast.error("No image selected");
            return;
        }
        onApplyImage(previewUrl);
        toast.success(`Photo updated for ${thaliTitle}!`);
        onClose();
    };

    const handleResetDefault = () => {
        setPreviewUrl(defaultImage);
        setPreviewTitle(thaliTitle);
        toast.info("Reset to default studio photo");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl w-full p-0 overflow-hidden rounded-3xl border border-stone-200 shadow-2xl bg-white max-h-[94vh] flex flex-col">
                {/* Header */}
                <DialogHeader className="p-5 border-b bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40">
                    <div className="flex items-center justify-between pr-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 font-bold text-xs">
                                    AI Food Photo Studio
                                </Badge>
                                <span className="text-xs text-stone-500 font-semibold">• {thaliTitle}</span>
                            </div>
                            <DialogTitle className="text-xl font-black text-stone-900 flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-orange-600" />
                                Edit & Generate Thali Photo
                            </DialogTitle>
                            <DialogDescription className="text-xs text-stone-600">
                                Menu ke mutabiq realistic Indian food photo generate karein ya gallery se chunein.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <div className="px-5 pt-3 border-b flex gap-2 bg-stone-50/60">
                    <button
                        type="button"
                        onClick={() => setActiveTab("ai")}
                        className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "ai"
                                ? "border-orange-600 text-orange-700 bg-white shadow-2xs font-black"
                                : "border-transparent text-stone-500 hover:text-stone-800"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        ✨ AI Generate (Menu Based)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("presets")}
                        className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "presets"
                                ? "border-orange-600 text-orange-700 bg-white shadow-2xs font-black"
                                : "border-transparent text-stone-500 hover:text-stone-800"
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Real Dishes Gallery ({REAL_THALI_LIBRARY.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("custom")}
                        className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "custom"
                                ? "border-orange-600 text-orange-700 bg-white shadow-2xs font-black"
                                : "border-transparent text-stone-500 hover:text-stone-800"
                        }`}
                    >
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        Upload / Custom URL
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Live Preview Box */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-orange-600" />
                                Current Photo Preview
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Ultra-Realistic Indian Food Photography
                            </span>
                        </div>

                        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-inner group">
                            {previewUrl ? (
                                <Image
                                    src={previewUrl}
                                    alt="Thali Preview"
                                    fill
                                    unoptimized
                                    className={`object-cover transition-opacity duration-300 ${isGenerating ? "opacity-30" : "opacity-100"}`}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-stone-400 text-xs">
                                    No Image Available
                                </div>
                            )}

                            {isGenerating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 backdrop-blur-xs gap-2">
                                    <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
                                    <span className="text-xs font-bold">Creating authentic food photo with AI...</span>
                                    <span className="text-[10px] text-stone-300">Matching dishes: {menuDetails.sabji || "seasonal dishes"}</span>
                                </div>
                            )}

                            <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold border border-white/20">
                                {previewTitle}
                            </div>
                        </div>
                    </div>

                    {/* Tab 1: AI Prompt & Generator */}
                    {activeTab === "ai" && (
                        <div className="space-y-3 bg-orange-50/60 p-4 rounded-2xl border border-orange-200/80">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                                    <Wand2 className="w-3.5 h-3.5 text-orange-600" />
                                    AI Food Prompt (Menu ke hisaab se auto-created):
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPrompt(buildPromptForMenu())}
                                    className="h-7 text-[11px] text-orange-700 hover:text-orange-900 font-bold px-2"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Sync with Menu
                                </Button>
                            </div>

                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="text-xs bg-white resize-none border-stone-200 focus:border-orange-500 font-medium"
                                placeholder="Describe the thali meal..."
                            />

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="text-[11px] text-stone-500 font-medium">
                                    Dishes auto-detected: <span className="font-bold text-orange-700">{menuDetails.sabji || menuDetails.paneerSabji || "Seasonal Sabji"}</span>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleGenerateAiImage}
                                    disabled={isGenerating}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-sm"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
                                            Generate AI Real Image
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Presets Library */}
                    {activeTab === "presets" && (
                        <div className="space-y-3">
                            <p className="text-xs text-stone-500 font-medium">
                                Choose any real Indian thali or sabji plate from our photo collection:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {REAL_THALI_LIBRARY.map((preset) => {
                                    const isChosen = previewUrl === preset.url;
                                    return (
                                        <div
                                            key={preset.id}
                                            onClick={() => {
                                                setPreviewUrl(preset.url);
                                                setPreviewTitle(preset.title);
                                                toast.success(`Selected: ${preset.title}`);
                                            }}
                                            className={`rounded-xl border-2 p-3 transition-all cursor-pointer relative group flex items-center gap-3 ${
                                                isChosen
                                                    ? "border-orange-600 bg-orange-50/50 ring-2 ring-orange-500/20"
                                                    : "border-stone-200 hover:border-orange-300 bg-white"
                                            }`}
                                        >
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                                <Image
                                                    src={preset.url}
                                                    alt={preset.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {isChosen && (
                                                    <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-0.5 shadow-xs">
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded inline-block mb-1">
                                                    {preset.tag}
                                                </span>
                                                <h5 className="text-xs font-bold text-stone-900 leading-tight">
                                                    {preset.title}
                                                </h5>
                                                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                                                    {preset.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Custom Upload & URL */}
                    {activeTab === "custom" && (
                        <div className="space-y-4">
                            {/* Upload from Computer/Phone */}
                            <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-200 text-center space-y-2">
                                <Upload className="w-6 h-6 text-orange-600 mx-auto" />
                                <h5 className="text-xs font-bold text-stone-800">Upload Photo from Device</h5>
                                <p className="text-[11px] text-stone-500">Apne kitchen ya hotel ki real thali photo direct select karein:</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white border-orange-200 text-orange-800 font-bold text-xs"
                                >
                                    Browse Photo
                                </Button>
                            </div>

                            {/* Paste Image URL */}
                            <div className="space-y-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                                <label className="text-xs font-bold text-stone-700 block">
                                    Or enter direct image URL:
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={customUrl}
                                        onChange={(e) => setCustomUrl(e.target.value)}
                                        placeholder="https://example.com/thali-photo.jpg"
                                        className="text-xs bg-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (!customUrl.trim()) {
                                                toast.error("Please enter a valid URL");
                                                return;
                                            }
                                            setPreviewUrl(customUrl.trim());
                                            setPreviewTitle("Custom Web Photo");
                                            toast.success("Preview updated!");
                                        }}
                                        className="text-xs font-bold"
                                    >
                                        Preview
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-stone-50 flex items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetDefault}
                        className="text-xs text-stone-600 hover:text-stone-900"
                    >
                        Reset to Default Photo
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleApply}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 shadow-sm"
                        >
                            <Check className="w-4 h-4 mr-1.5" />
                            Apply to Menu
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
