import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { CONFIG } from "@/config"
import { fetchSheetData, type SheetData, cleanLink } from "@/lib/sheets"
import { Instagram, X, Bold, Italic, Underline, Link2, Send, ShoppingBag, Video, MessageCircle, Github, Linkedin, Globe } from "lucide-react"
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

// Fallback data in case sheet fetch fails or is not configured
const FALLBACK_DATA: SheetData[] = [
  {
    section: "Bio",
    title: "Welcome",
    description: "I am a developer building cool things. Configure your Google Sheet to update this text!",
    image: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=3270&auto=format&fit=crop"]
  }
]

function App() {
  const [sheetData, setSheetData] = useState<SheetData[]>([])
  const [loading, setLoading] = useState(true)

  const [cursorText, setCursorText] = useState<string | React.ReactNode>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // WhatsApp Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    inquiry: ""
  });
  const [messageCode, setMessageCode] = useState("");
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);



  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // Load Sheets Data
      try {
        const data = await fetchSheetData(CONFIG.GOOGLE_SHEET_URL)
        if (data.length > 0) {
          setSheetData(data)
        } else {
          // Sheet is connected but empty
          setSheetData([{
            section: "Bio",
            title: "Setup Required",
            description: "Successfully connected to Google Sheets! But the sheet is empty. Please add rows with 'Bio', 'Timeline', or 'Social' in the Section column.",
          }])
        }
      } catch (e) {
        console.error("Failed to load sheet data", e)
        setSheetData(FALLBACK_DATA)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // Extract Header/Hero section if it exists
  const headerData = sheetData.find(item => item.section.toLowerCase() === "header" || item.section.toLowerCase() === "hero");

  // Group rows by section (excluding Header/Hero sections)
  const sectionGroups = sheetData
    .filter(item => item.section.toLowerCase() !== "header" && item.section.toLowerCase() !== "hero")
    .filter(item => item.title)
    .reduce((acc, item) => {
      const section = item.section || "Uncategorized";
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    }, {} as Record<string, SheetData[]>);

  const sectionOrder = Array.from(new Set(
    sheetData
      .filter(item => item.section.toLowerCase() !== "header" && item.section.toLowerCase() !== "hero")
      .map(item => item.section || "Uncategorized")
  ));

  const totalProductCount = sectionOrder.reduce((count, section) => {
    return count + (sectionGroups[section]?.length || 0);
  }, 0);

  // Prepare Tooltip Data
  const tooltipData = sheetData
    .filter(item => item.section.toLowerCase() === "tooltip" || item.section.toLowerCase() === "team")
    .map((item, idx) => ({
      id: idx,
      name: item.title,
      designation: item.description,
      image: item.image ? item.image[0] : "",
    }));

  // Fallback for Tooltip if empty
  if (tooltipData.length === 0) {
    const bio = sheetData.find(item => item.section === "Bio");
    if (bio && bio.image && bio.image.length > 0) {
      tooltipData.push({
        id: 1,
        name: bio.title,
        designation: "Store Owner",
        image: bio.image[0]
      });
    }
  }

  const handleContextMenu = async (e: React.MouseEvent) => {
    // Allow default context menu for links and images
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.tagName === 'IMG') {
      return;
    }

    e.preventDefault();
    const selection = window.getSelection()?.toString();
    if (selection) {
      setCursorText("Searching...");
      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selection)}`);
        const data = await response.json();
        if (data.extract) {
          setCursorText(
            <div className="max-w-xs text-xs">
              <p className="line-clamp-3">{data.extract}</p>
            </div>
          );
        } else {
          setCursorText("No definition found");
        }
      } catch (error) {
        setCursorText("Error fetching definition");
      }
    }
  };

  // Reset cursor text when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      if (typeof cursorText !== 'string' || (cursorText !== "" && !cursorText.includes("novalurehijab"))) {
        setCursorText("");
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [cursorText]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div
        className="min-h-screen"
        onContextMenu={handleContextMenu}
      >
        <div className="glow-border fixed top-4 right-4 z-50 rounded-full">
          <ModeToggle />
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-screen bg-transparent">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-rose-500"></div>
              <span className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">novalurehijab</span>
            </div>
          </div>
        ) : (
          <FollowerPointerCard
            title={
              cursorText ? (
                typeof cursorText === 'string' ? (
                  <span className="font-bold text-sm">{cursorText}</span>
                ) : cursorText
              ) : (
                <span className="font-bold text-sm">{headerData?.title || "novalurehijab"}</span>
              )
            }
            className="w-full"
          >
            {/* Header Section */}
            {headerData && (
              <div className="relative bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 py-6 px-4">
                <div className="max-w-6xl mx-auto text-center">
                  <div className="mx-auto mb-3 w-14 h-14 rounded-3xl bg-white dark:bg-neutral-900 flex items-center justify-center shadow-lg border border-rose-100 dark:border-pink-900">
                    <img src="/assets/novalure-logo.svg" alt="novalurehijab logo" className="w-9 h-9" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {headerData.title}
                  </h1>
                  {headerData.description && (
                    <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
                      {headerData.description}
                    </p>
                  )}
                  {(headerData.type || (headerData.link && headerData.link.length > 0)) && (
                    <div className="mt-4 space-y-2">
                      {headerData.type && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                          {headerData.type}
                        </p>
                      )}
                      {headerData.link && headerData.link.length > 0 && (
                        <div className="flex flex-col items-center gap-2">
                          {headerData.link.map((link, linkIdx) => (
                            <a
                              key={linkIdx}
                              href={cleanLink(link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline text-sm"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {headerData.image && headerData.image.length > 0 && (
                    <div className="mt-4">
                      <img
                        src={headerData.image[0]}
                        alt={headerData.title}
                        className="w-20 h-20 md:w-28 md:h-28 rounded-full mx-auto object-cover shadow-lg border-2 border-white dark:border-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-10">
              {sectionOrder.map((section) => (
                <section key={section} className="space-y-4 section-neon">
                  <div className="flex items-center justify-between flex-wrap gap-3 rounded-full bg-rose-100/80 dark:bg-pink-950/80 border border-rose-200 dark:border-pink-800 px-4 py-3 shadow-sm">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{section}</h2>
                    </div>
                    {section.toLowerCase() === "contact" ? (
                      <span className="rounded-full bg-white/90 dark:bg-neutral-900/80 px-3 py-1 text-sm text-rose-700 dark:text-pink-100 font-medium shadow-sm">
                        {sectionGroups[section]?.length || 0} contact{sectionGroups[section]?.length === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/90 dark:bg-neutral-900/80 px-3 py-1 text-sm text-rose-700 dark:text-pink-100 font-medium shadow-sm">
                        {sectionGroups[section]?.length || 0} item{sectionGroups[section]?.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionGroups[section]?.map((product, idx) => {
                      if (section.toLowerCase() === "contact") {
                        const type = product.type?.toLowerCase() || "link";
                        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                          instagram: Instagram,
                          shopee: ShoppingBag,
                          tiktok: Video,
                          whatsapp: MessageCircle,
                          discord: MessageCircle,
                          linkedin: Linkedin,
                          github: Github,
                          website: Globe,
                          portfolio: Globe,
                          link: Link2,
                        };
                        const Icon = iconMap[type] || Link2;

                        return (
                          <div
                            key={idx}
                            className="group bg-white dark:bg-neutral-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-neutral-200 dark:border-neutral-800"
                          >
                            <div className="p-5 flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-pink-900/40 text-rose-600 dark:text-pink-300">
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                    {product.title}
                                  </h3>
                                  {product.description && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {product.link && product.link.length > 0 && (
                                <a
                                  href={cleanLink(product.link[0])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-100 px-4 py-2 text-sm font-semibold hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                                >
                                  Visit
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="group bg-white dark:bg-neutral-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-neutral-200 dark:border-neutral-800"
                          onMouseEnter={() => setCursorText(product.title)}
                          onMouseLeave={() => setCursorText("")}
                        >
                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={product.image![0]}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                              referrerPolicy="no-referrer"
                              onClick={() => setSelectedImage(product.image![0])}
                            />
                            {product.image && product.image.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                +{product.image.length - 1}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                              {product.title}
                            </h3>
                            {product.description && (
                              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3 line-clamp-3">
                                {product.description}
                              </p>
                            )}

                            {/* Product Links */}
                            {product.link && product.link.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {product.link.map((link, linkIdx) => (
                                  <a
                                    key={linkIdx}
                                    href={cleanLink(link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors text-sm font-medium text-pink-800 dark:text-pink-300"
                                    onMouseEnter={() => setCursorText(`Buy ${product.title}`)}
                                    onMouseLeave={() => setCursorText("")}
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                    {product.link!.length === 1 ? "Shop Now" : `Option ${linkIdx + 1}`}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              {totalProductCount === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    No products available. Please check your Google Sheet configuration.
                  </p>
                </div>
              )}
            </div>

            {tooltipData.length > 0 && (
              <div className="flex flex-row items-center justify-center py-10 w-full">
                <AnimatedTooltip items={tooltipData} />
              </div>
            )}
          </FollowerPointerCard>
        )}

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center gap-2 bg-rose-50/95 dark:bg-pink-950/95 rounded-full px-2 py-2 sm:px-2 sm:py-1.5 shadow-xl border border-rose-100 dark:border-pink-900 backdrop-blur-md w-[calc(100vw-2rem)] max-w-[46rem]">
          {[
            { icon: Instagram, label: "Instagram", href: "https://instagram.com/hijabynvlr" },
            { icon: ShoppingBag, label: "Shopee", href: "https://shopee.co.id/nvlrhijab" },
            { icon: Video, label: "TikTok", href: "https://www.tiktok.com/@novalurehijab?_r=1&_t=zs-94z7z2bopts" },
            { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/+6285128028989" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-rose-100/90 dark:bg-pink-950/80 px-2 py-2 sm:px-1.5 sm:py-1 text-neutral-700 dark:text-neutral-200 hover:bg-rose-200 dark:hover:bg-pink-900/70 hover:text-pink-600 dark:hover:text-pink-300 transition-all duration-200 shadow-sm min-w-[3rem] justify-center"
              title={item.label}
              onMouseEnter={() => setCursorText(item.label)}
              onMouseLeave={() => setCursorText("")}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </div>
        
        <AnimatePresence>
          {showWhatsAppPopup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWhatsAppPopup(false)}
                className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div
                  className="pointer-events-auto relative w-full max-w-sm"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="relative rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg p-3">
                    <span className="absolute inset-0 rounded-lg ring-2 ring-pink-400/30 animate-pulse pointer-events-none" />
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">WhatsApp Inquiry Form</h4>
                      <button
                        onClick={() => setShowWhatsAppPopup(false)}
                        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 p-1 rounded"
                        aria-label="Close WhatsApp popup"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full max-w-md bg-transparent">

                      {/* Name Field */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">👤 Name</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">✉️ Email</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                      </div>

                      {/* WhatsApp Field */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">💬 WhatsApp</label>
                        <input
                          type="tel"
                          placeholder="+62 812345678"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                      </div>

                      {/* Rich Text Editor for Inquiry */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">📝 Inquiry</label>
                        <div className="rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900">
                          {/* Toolbar */}
                          <div className="flex gap-1 p-2 border-b border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex-wrap">
                            <button
                              onClick={() => document.execCommand("bold")}
                              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                              title="Bold"
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => document.execCommand("italic")}
                              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                              title="Italic"
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => document.execCommand("underline")}
                              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                              title="Underline"
                            >
                              <Underline className="w-4 h-4" />
                            </button>
                            <div className="w-px bg-neutral-300 dark:bg-neutral-700"></div>
                            <button
                              onClick={() => {
                                const url = prompt("Enter URL:");
                                if (url) document.execCommand("createLink", false, url);
                              }}
                              className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                              title="Add Link"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Editor */}
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => setFormData({ ...formData, inquiry: e.currentTarget.innerHTML })}
                            className="w-full p-3 min-h-20 max-h-32 overflow-y-auto focus:outline-none text-neutral-900 dark:text-white text-sm"
                            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={() => {
                          if (!formData.name || !formData.whatsapp || !formData.inquiry) {
                            alert("Please fill in all fields");
                            return;
                          }

                          // Generate simple message code: DD/MM/YYYY-FirstName (max 5 chars)
                          const now = new Date();
                          const day = String(now.getDate()).padStart(2, '0');
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          const year = now.getFullYear();
                          const firstName = formData.name.split(' ')[0].slice(0, 5);
                          const code = `${day}${month}${year}-${firstName}`;
                          setMessageCode(code);

                          // Format the message for WhatsApp with all field details
                          const cleanInquiry = formData.inquiry.replace(/<[^>]*>/g, ""); // Remove HTML tags
                          const message = `${code}\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*WhatsApp:* ${formData.whatsapp}\n\n*Inquiry:*\n${cleanInquiry}`;

                          // Send to fixed WhatsApp number: +6285128028989
                          const targetPhoneNumber = "6285128028989";
                          const encodedMessage = encodeURIComponent(message);
                          const whatsappLink = `https://wa.me/${targetPhoneNumber}?text=${encodedMessage}`;

                          // Open WhatsApp and close popup
                          window.open(whatsappLink, "_blank");
                          setShowWhatsAppPopup(false);

                          // Reset form
                          setFormData({ name: "", email: "", whatsapp: "", inquiry: "" });
                        }}
                        className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:shadow-pink-500/50"
                      >
                        <Send className="w-4 h-4" />
                        Send via WhatsApp
                      </button>

                      {messageCode && (
                        <div className="mt-4 p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-sm text-pink-800 dark:text-pink-300 text-center font-mono font-bold">
                          {messageCode}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-3 bg-white text-black hover:bg-neutral-200 rounded-full shadow-lg transition-colors z-50"
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage}
                alt="Full screen preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  )
}

// Helper to map string types to Lucide icons


export default App
