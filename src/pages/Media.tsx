import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { X, Play, Quote, ChevronLeft, ChevronRight, Upload, Loader2, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

// Product Gallery Images
import workshopPieces1 from "@/assets/gallery/workshop-pieces-1.png";
import workshopPieces2 from "@/assets/gallery/workshop-pieces-2.png";
import workshopPieces3 from "@/assets/gallery/workshop-pieces-3.png";
import workshopPieces4 from "@/assets/gallery/workshop-pieces-4.png";
import workshopPieces5 from "@/assets/gallery/workshop-pieces-5.png";
import workshopPieces6 from "@/assets/gallery/workshop-pieces-6.png";
import workshopPieces7 from "@/assets/gallery/workshop-pieces-7.png";
import workshopPieces8 from "@/assets/gallery/workshop-pieces-8.png";
import workshopPieces9 from "@/assets/gallery/workshop-pieces-9.png";
import workshopPieces10 from "@/assets/gallery/workshop-pieces-10.png";
import workshopPieces11 from "@/assets/gallery/workshop-pieces-11.png";
import workshopPieces12 from "@/assets/gallery/workshop-pieces-12.png";
import workshopPieces13 from "@/assets/gallery/workshop-pieces-13.png";
import workshopPieces14 from "@/assets/gallery/workshop-pieces-14.png";
import workshopPieces15 from "@/assets/gallery/workshop-pieces-15.png";
import workshopPieces16 from "@/assets/gallery/workshop-pieces-16.png";
import workshopPieces17 from "@/assets/gallery/workshop-pieces-17.png";
import workshopPieces18 from "@/assets/gallery/workshop-pieces-18.png";
import workshopPieces21 from "@/assets/gallery/workshop-pieces-21.png";
import workshopPieces22 from "@/assets/gallery/workshop-pieces-22.png";

// Workshop Images
import beginnerPottery from "@/assets/workshops/beginner-pottery.jpg";
import couplePottery from "@/assets/workshops/couple-pottery-date.jpg";
import kidsClayPlay from "@/assets/workshops/kids-clay-play.jpg";
import masterClass from "@/assets/workshops/master-class.jpg";

// Studio Images
import studioInterior from "@/assets/studio/studio-interior.jpg";
import kiln from "@/assets/studio/kiln.jpg";
import potteryDrying from "@/assets/studio/pottery-drying.jpg";
import potteryGlazing from "@/assets/studio/pottery-glazing.jpg";
import potteryTools from "@/assets/studio/pottery-tools.jpg";
import rawClayTexture from "@/assets/studio/raw-clay-texture.jpg";

interface GalleryImage {
  src: string;
  alt: string;
  category: "products" | "workshops" | "studio";
}

interface VideoTestimonial {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  customer_name: string | null;
  experience_type: string | null;
}

const galleryImages: GalleryImage[] = [
  // Products
  { src: workshopPieces1, alt: "Blue striped ceramic mugs and tray set", category: "products" },
  { src: workshopPieces2, alt: "Yellow striped pottery with palm tree design", category: "products" },
  { src: workshopPieces3, alt: "Pastel ceramic pitchers gift set", category: "products" },
  { src: workshopPieces4, alt: "Terracotta and cream stacking bowls", category: "products" },
  { src: workshopPieces5, alt: "Two-tone ceramic plates with hands", category: "products" },
  { src: workshopPieces6, alt: "Pink and green glazed dinnerware set", category: "products" },
  { src: workshopPieces7, alt: "Terracotta bowl with green interior", category: "products" },
  { src: workshopPieces8, alt: "Ceramic grater plates with garlic", category: "products" },
  { src: workshopPieces9, alt: "Olive green ceramic bowl and plate set", category: "products" },
  { src: workshopPieces10, alt: "Blue and pink chip and dip platter", category: "products" },
  { src: workshopPieces11, alt: "Turquoise and pink glazed ceramic trays gift set", category: "products" },
  { src: workshopPieces12, alt: "Rustic terracotta salt and pepper shakers with cork", category: "products" },
  { src: workshopPieces13, alt: "Ceramic tic-tac-toe game boards with heart pieces", category: "products" },
  { src: workshopPieces14, alt: "White ceramic mug with red lips design", category: "products" },
  { src: workshopPieces15, alt: "Ceramic plates with lips design in wicker basket", category: "products" },
  { src: workshopPieces16, alt: "White ceramic planter with saucer and plant", category: "products" },
  { src: workshopPieces17, alt: "Minimalist cream stoneware plate", category: "products" },
  { src: workshopPieces18, alt: "Ceramic pitcher vase with sunflowers", category: "products" },
  { src: workshopPieces21, alt: "Abstract terracotta figure sculptures", category: "products" },
  { src: workshopPieces22, alt: "Heart-shaped bowls with red heart accents", category: "products" },
  // Workshops
  { src: beginnerPottery, alt: "Beginner learning pottery on the wheel", category: "workshops" },
  { src: couplePottery, alt: "Couple enjoying a pottery date experience", category: "workshops" },
  { src: kidsClayPlay, alt: "Children exploring clay in a creative session", category: "workshops" },
  { src: masterClass, alt: "Master potter demonstrating advanced techniques", category: "workshops" },
  // Studio
  { src: studioInterior, alt: "Inside the pottery studio workspace", category: "studio" },
  { src: kiln, alt: "Ceramic kiln ready for firing", category: "studio" },
  { src: potteryDrying, alt: "Pottery pieces drying on shelves", category: "studio" },
  { src: potteryGlazing, alt: "Glazing process on ceramic pieces", category: "studio" },
  { src: potteryTools, alt: "Traditional pottery tools and equipment", category: "studio" },
  { src: rawClayTexture, alt: "Raw clay texture and material", category: "studio" },
];

const testimonials = [
  {
    quote: "The experience felt grounding and thoughtful. I left with more than a pot—I left with a memory.",
    context: "Studio Experience",
    name: "Ananya",
  },
  {
    quote: "Every piece tells a story. The mugs we bought have become our morning ritual.",
    context: "Tableware Collection",
    name: "Rahul & Priya",
  },
  {
    quote: "The workshop was meditative. My daughter and I finally found something we both love.",
    context: "Family Workshop",
    name: "Meera",
  },
  {
    quote: "I've gifted their pottery to three friends now. Each time, the reaction is pure joy.",
    context: "Gift Purchase",
    name: "Vikram",
  },
  {
    quote: "The attention to detail is remarkable. You can feel the care in every curve.",
    context: "Custom Order",
    name: "Sanjana",
  },
  {
    quote: "We chose Mitti Mahal for our corporate gifts. Our clients loved the personal touch.",
    context: "Corporate Gifting",
    name: "Arjun",
  },
];

const customerStories = [
  {
    title: "A Birthday That Became a Tradition",
    story: "Maya booked a wheel-throwing session for her partner's birthday. What started as a one-time experience has become their annual ritual—three years and counting.",
    type: "Couple's Experience",
  },
  {
    title: "Finding Calm in Clay",
    story: "After months of burnout, Rohan signed up for a beginner's workshop. He describes that first hour with clay as 'the first time my mind went quiet in years.'",
    type: "Solo Workshop",
  },
  {
    title: "A Table Set with Meaning",
    story: "When Kavitha moved into her new home, she wanted tableware that felt intentional. Her custom set of six plates and bowls now hosts every family dinner.",
    type: "Custom Order",
  },
  {
    title: "Team Building, Reimagined",
    story: "A startup of 12 people came for a team day. They left with handmade planters and a shared experience that still comes up in meetings months later.",
    type: "Corporate Event",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "products", label: "Products" },
  { id: "workshops", label: "Workshops" },
  { id: "studio", label: "Studio & Events" },
];

const Media = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  // Upload state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    customerName: "",
    experienceType: "",
  });
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  // Fetch video testimonials
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('video_testimonials')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideoTestimonials(data || []);
      } catch (error) {
        console.error('Error fetching video testimonials:', error);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  const openLightbox = (image: GalleryImage, index: number) => {
    setLightboxImage(image);
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "auto";
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" 
      ? (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
      : (lightboxIndex + 1) % filteredImages.length;
    setLightboxIndex(newIndex);
    setLightboxImage(filteredImages[newIndex]);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video must be under 50MB");
        return;
      }
      if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
        toast.error("Only MP4, WebM, or MOV formats allowed");
        return;
      }
      setSelectedVideo(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to upload a video");
      return;
    }

    if (!selectedVideo) {
      toast.error("Please select a video");
      return;
    }

    if (!uploadForm.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsUploading(true);

    try {
      // Upload video to storage
      const fileExt = selectedVideo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('video-testimonials')
        .upload(fileName, selectedVideo);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-testimonials')
        .getPublicUrl(fileName);

      // Insert record
      const { error: insertError } = await supabase
        .from('video_testimonials')
        .insert({
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim() || null,
          video_url: publicUrl,
          customer_name: uploadForm.customerName.trim() || null,
          experience_type: uploadForm.experienceType.trim() || null,
          uploaded_by: user.id,
          is_approved: false,
        });

      if (insertError) throw insertError;

      toast.success("Video uploaded successfully! It will appear after admin approval.");
      setIsUploadDialogOpen(false);
      setUploadForm({ title: "", description: "", customerName: "", experienceType: "" });
      setSelectedVideo(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVideoPlay = (videoId: string) => {
    if (playingVideoId === videoId) {
      setPlayingVideoId(null);
    } else {
      setPlayingVideoId(videoId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gallery & Stories | Mitti Mahal</title>
        <meta name="description" content="Explore moments from our studio, workshops, and experiences. Real craft, real people, real stories." />
      </Helmet>

      <Navigation />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground mb-6">
              Craft in practice.
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              Moments from the studio, workshops, and experiences.
            </p>
          </motion.div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Category Filter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>

            {/* Masonry Grid */}
            <motion.div 
              layout
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.src}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="break-inside-avoid group cursor-pointer"
                    onClick={() => openLightbox(image, index)}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-muted">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-sm text-foreground/90 font-medium">
                            {image.alt}
                          </p>
                          <span className="text-xs text-muted-foreground capitalize">
                            {image.category === "studio" ? "Studio & Events" : image.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
                What people say
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Real words from real experiences.
              </p>
            </motion.div>

            {/* Text Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300"
                >
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-foreground font-medium mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {testimonial.name}
                    </span>
                    <span className="text-xs text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
                      {testimonial.context}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Video Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-2xl text-foreground">
                  Moments captured
                </h3>
                {isAdmin && (
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Share Your Story
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share Your Experience</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="video">Video (max 50MB)</Label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            id="video"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleVideoSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-1"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {selectedVideo ? selectedVideo.name : "Select Video"}
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="My pottery experience"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Tell us about your experience..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customerName">Your Name</Label>
                            <Input
                              id="customerName"
                              value={uploadForm.customerName}
                              onChange={(e) => setUploadForm(prev => ({ ...prev, customerName: e.target.value }))}
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <Label htmlFor="experienceType">Experience Type</Label>
                            <Input
                              id="experienceType"
                              value={uploadForm.experienceType}
                              onChange={(e) => setUploadForm(prev => ({ ...prev, experienceType: e.target.value }))}
                              placeholder="e.g., Workshop"
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isUploading}>
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Submit for Review"
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Videos are reviewed before appearing on the page.
                        </p>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {isLoadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : videoTestimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTestimonials.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-muted group"
                    >
                      {playingVideoId === video.id ? (
                        <video
                          src={video.video_url}
                          className="w-full h-full object-cover"
                          autoPlay
                          controls
                          onEnded={() => setPlayingVideoId(null)}
                        />
                      ) : (
                        <>
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={video.video_url}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                          )}
                          <div 
                            className="absolute inset-0 bg-background/40 flex items-center justify-center cursor-pointer group-hover:bg-background/30 transition-colors duration-300"
                            onClick={() => toggleVideoPlay(video.id)}
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <Play className="w-6 h-6 text-primary-foreground ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-foreground text-sm font-medium">
                              {video.title}
                            </p>
                            {video.customer_name && (
                              <span className="text-foreground/70 text-xs">
                                {video.customer_name}
                                {video.experience_type && ` • ${video.experience_type}`}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-background/50 rounded-2xl border border-border/30">
                  <Play className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No video testimonials yet.</p>
                  {isAdmin && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a video to share customer stories!
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Customer Stories */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-display text-2xl text-foreground text-center mb-10">
                Stories that stay
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {customerStories.map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className="relative p-8 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/30"
                  >
                    <span className="inline-block text-xs text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                      {story.type}
                    </span>
                    <h4 className="font-display text-xl text-foreground mb-3">
                      {story.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {story.story}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors z-10"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-muted/80 hover:bg-muted transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-muted/80 hover:bg-muted transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>

            <motion.img
              key={lightboxImage.src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-foreground font-medium mb-1">{lightboxImage.alt}</p>
              <span className="text-sm text-muted-foreground">
                {lightboxIndex + 1} / {filteredImages.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Media;
