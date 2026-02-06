import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (PNG, JPG, WEBP).",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image must be less than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${nanoid()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("portfolio")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from("portfolio")
                .getPublicUrl(filePath);

            onChange(data.publicUrl);
            toast({
                title: "Image uploaded",
                description: "Image uploaded successfully.",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Upload failed",
                description: error.message || "Something went wrong during upload.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            // Reset input so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className="space-y-4 w-full">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={disabled || isUploading}
            />

            {!value ? (
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex gap-2 border-dashed h-24 hover:bg-secondary/50"
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <Upload className="h-6 w-6" />
                            <span>Click to upload image</span>
                        </div>
                    )}
                </Button>
            ) : (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-secondary/30 group">
                    <img
                        src={value}
                        alt="Upload"
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemove}
                            disabled={disabled || isUploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
