/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; alt: string };

export function ProjectGallery({ images, className }: { images: GalleryImage[]; className?: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorVisibleRef = useRef(false);

    useEffect(() => setMounted(true), []);

    const hideCursor = useCallback(() => {
        cursorVisibleRef.current = false;
        const cursor = cursorRef.current;
        if (cursor) gsap.to(cursor, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
    }, []);

    const handleCursorMove = useCallback((e: React.MouseEvent) => {
        const cursor = cursorRef.current;
        if (!cursor) return;
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        if (cursorVisibleRef.current) return;
        cursorVisibleRef.current = true;
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
    }, []);

    return (
        <>
            <div
                className={cn("grid grid-cols-2 gap-3", className)}
                onMouseMove={handleCursorMove}
                onMouseLeave={hideCursor}
            >
                {images.map((img, i) => (
                    <button
                        key={img.src}
                        type="button"
                        onClick={() => { hideCursor(); setOpenIndex(i); }}
                        className="group relative w-full aspect-video rounded-lg overflow-hidden cursor-none"
                    >
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            sizes="(min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                    </button>
                ))}
            </div>
            {mounted && createPortal(
                <div
                    ref={cursorRef}
                    className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white opacity-0"
                    style={{ top: -100, left: -100, zIndex: 300 }}
                >
                    <ZoomIn className="text-zinc-950" size={20} strokeWidth={1.5} />
                </div>,
                document.body
            )}
            {openIndex !== null && (
                <GalleryLightbox
                    images={images}
                    startIndex={openIndex}
                    onClose={() => setOpenIndex(null)}
                />
            )}
        </>
    );
}

function GalleryLightbox({
    images,
    startIndex,
    onClose,
}: {
    images: GalleryImage[];
    startIndex: number;
    onClose: () => void;
}) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(startIndex);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const closingRef = useRef(false);

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setCurrent(api.selectedScrollSnap());
        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    useEffect(() => {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
        gsap.fromTo(contentRef.current,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
        );
    }, []);

    const close = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        gsap.to(contentRef.current, { opacity: 0, scale: 0.97, duration: 0.25, ease: "power2.in" });
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: onClose });
    }, [onClose]);

    // Capture phase so the page-level key handlers (project close/navigation)
    // never see keys while the lightbox is topmost.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === "Escape" || e.key === "Backspace") close();
            if (e.key === "ArrowLeft") api?.scrollPrev();
            if (e.key === "ArrowRight") api?.scrollNext();
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [api, close]);

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 flex flex-col bg-zinc-950/95 backdrop-blur-sm"
            style={{ zIndex: 200 }}
            onClick={close}
        >
            <div className="flex w-full items-center justify-end p-2">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={close}
                    className="text-white/60 hover:text-white"
                >
                    <X />
                    <span className="sr-only">Close</span>
                </Button>
            </div>
            <div
                ref={contentRef}
                className="flex-1 min-h-0 px-4 pb-6 pt-2 md:px-16"
                onClick={(e) => e.stopPropagation()}
            >
                <Carousel
                    setApi={setApi}
                    opts={{ startIndex, loop: images.length > 1 }}
                    className="h-full [&>div[data-slot=carousel-content]]:h-full"
                >
                    <CarouselContent className="h-full">
                        {images.map((img) => (
                            <CarouselItem key={img.src} className="h-full">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        sizes="100vw"
                                        className="object-contain"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious
                                variant="ghost"
                                className="left-0 md:-left-12 bg-zinc-950/60 text-white/70 hover:text-white border-white/10"
                            />
                            <CarouselNext
                                variant="ghost"
                                className="right-0 md:-right-12 bg-zinc-950/60 text-white/70 hover:text-white border-white/10"
                            />
                        </>
                    )}
                </Carousel>
            </div>
            {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 pb-5" onClick={(e) => e.stopPropagation()}>
                    {images.map((img, i) => (
                        <button
                            key={img.src}
                            type="button"
                            onClick={() => api?.scrollTo(i)}
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                i === current ? "w-6 bg-white/80" : "w-2 bg-white/25 hover:bg-white/40"
                            )}
                        >
                            <span className="sr-only">Go to image {i + 1}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
}
