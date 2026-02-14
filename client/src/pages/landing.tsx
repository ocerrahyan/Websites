import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar, Clock, Sparkles, Star, ShoppingBag, ArrowRight, Phone, Mail, MapPin, Menu, X, Palette } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Service, Product, Painting } from "@shared/schema";

function FaceSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M120 12c-8 2-16 8-22 16-4 6-7 12-9 20-3 10-3 18-1 26 1 4 2 8 4 11 1 2 1 4 0 6-2 4-5 8-6 13-1 4-1 8 0 12 1 3 2 6 4 8l2 3c0 1-1 3-2 5-3 6-5 12-6 19-1 6 0 12 2 17 2 4 4 8 7 11 4 4 8 7 13 9 5 2 11 3 16 2 6-1 11-3 15-7 4-3 7-7 9-12 2-5 3-10 2-16-1-5-3-10-6-14l-3-4c1-1 2-3 3-5 3-5 5-10 5-16 0-4-1-7-2-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.15"
      />
      <path
        d="M95 55c-2 6-2 13-1 19 1 5 3 9 6 12 2 2 4 3 6 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.12"
      />
      <path
        d="M100 95c4 1 8 1 12 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.1"
      />
      <path
        d="M88 72c3-1 6-1 9 0"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.15"
      />
      <path
        d="M80 18c6-8 14-13 24-15 12-2 22 2 30 10 6 6 10 14 12 24 1 8 0 16-3 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.1"
      />
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/hero-salon.png"
          alt="Alis' Salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <p className="text-white/80 text-sm tracking-[0.3em] uppercase mb-4 font-sans">
            45+ Years of Artistry
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
            Alis'
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
            Where beauty meets expertise. Over four decades dedicated to making
            you look and feel extraordinary.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/booking">
              <Button size="lg" data-testid="button-book-now">
                Book Appointment
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/membership">
              <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="button-join-membership">
                Join Membership
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const displayServices = services?.slice(0, 4) || [];

  return (
    <section className="py-20 px-6 bg-background" id="services">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">What We Offer</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Our Services</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-visible group hover-elevate" data-testid={`card-service-${service.id}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-t-md">
                  <img
                    src={service.imageUrl || "/images/service-hair.png"}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-serif text-lg text-foreground">{service.name}</h3>
                    <Badge variant="secondary">{service.category}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {service.duration} min
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" data-testid="button-view-all-services">
              View All Services <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsSection() {
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const featured = products?.filter((p) => p.featured).slice(0, 3) || [];

  if (featured.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-card" id="shop">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Curated Collection</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Shop Our Products</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-visible group hover-elevate" data-testid={`card-product-${product.id}`}>
                <div className="aspect-square overflow-hidden rounded-t-md">
                  <img
                    src={product.imageUrl || "/images/products-banner.png"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                  <h3 className="font-serif text-lg text-foreground mb-1">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {product.amazonUrl && (
                      <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" data-testid={`button-buy-${product.id}`}>
                          <ShoppingBag className="w-3 h-3 mr-1" /> Buy Now
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/shop">
            <Button variant="outline" data-testid="button-view-all-products">
              View All Products <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  const tiers = [
    {
      name: "Bronze",
      color: "bg-amber-700/10 dark:bg-amber-700/20",
      features: ["Priority booking", "Birthday special", "Exclusive updates"],
    },
    {
      name: "Silver",
      color: "bg-gray-300/20 dark:bg-gray-400/10",
      features: ["10% off all services", "Free consultations", "Early product access", "Monthly newsletter"],
      popular: true,
    },
    {
      name: "Gold",
      color: "bg-yellow-500/10 dark:bg-yellow-500/15",
      features: ["20% off all services", "Free monthly treatment", "VIP scheduling", "Product samples", "Referral rewards"],
    },
    {
      name: "Platinum",
      color: "bg-purple-500/10 dark:bg-purple-400/15",
      features: ["30% off everything", "Unlimited consultations", "Personal stylist", "Premium gift box", "Exclusive events", "Priority everything"],
    },
  ];

  return (
    <section className="py-20 px-6 bg-background" id="membership">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Join the Family</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Membership Tiers</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`p-5 relative overflow-visible hover-elevate ${tier.popular ? "border-primary" : ""}`} data-testid={`card-tier-${tier.name.toLowerCase()}`}>
                {tier.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <div className={`w-10 h-10 rounded-md ${tier.color} flex items-center justify-center mb-3`}>
                  <Star className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{tier.name}</h3>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/membership">
                  <Button variant={tier.popular ? "default" : "outline"} className="w-full mt-5" data-testid={`button-join-${tier.name.toLowerCase()}`}>
                    Join {tier.name}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-20 px-6 bg-card" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Our Story</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">Meet Alis</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              With over 45 years of experience in the beauty industry, Alis has built a legacy
              of excellence, artistry, and deeply personalized care. Every client who walks through our
              doors becomes part of the Alis' family.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              At Alis', we believe beauty is personal. That's why every service is tailored to your
              unique needs, using only premium techniques refined over decades. From haircuts and
              color to facials and nails, we're here to help you feel your absolute best.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-3xl font-serif text-primary" data-testid="text-years">45+</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-serif text-primary">5K+</p>
                <p className="text-sm text-muted-foreground">Happy Clients</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-serif text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Services Offered</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-md overflow-hidden"
          >
            <img
              src="/images/service-color.png"
              alt="Alis at work"
              className="w-full h-full object-cover"
            />
            <FaceSilhouette className="absolute top-4 right-4 w-20 h-auto text-white opacity-60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PaintingsSection() {
  const { data: paintings } = useQuery<Painting[]>({ queryKey: ["/api/paintings"] });
  const featured = paintings?.filter((p) => p.featured).slice(0, 6) || [];

  if (featured.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-background" id="paintings">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Oils & More with Alis</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Original Paintings</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((painting, i) => (
            <motion.div
              key={painting.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-visible group hover-elevate" data-testid={`card-painting-${painting.id}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-t-md">
                  <img
                    src={painting.imageUrl || ""}
                    alt={painting.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-serif text-lg text-foreground">{painting.title}</h3>
                    {painting.isSold && (
                      <Badge variant="destructive">SOLD</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {painting.size && <Badge variant="secondary">{painting.size}</Badge>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/paintings">
            <Button variant="outline" data-testid="button-view-all-paintings">
              <Palette className="w-4 h-4 mr-1.5" />
              View All Artwork <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="py-20 px-6 bg-background" id="contact">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Get in Touch</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Contact Us</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          <Card className="p-5 text-center hover-elevate" data-testid="card-contact-phone">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Phone</h3>
            <p className="text-sm text-muted-foreground">(555) 123-4567</p>
          </Card>
          <Card className="p-5 text-center hover-elevate" data-testid="card-contact-email">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">hello@alissalon.com</p>
          </Card>
          <Card className="p-5 text-center hover-elevate" data-testid="card-contact-address">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Location</h3>
            <p className="text-sm text-muted-foreground">123 Beauty Lane</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 px-6 bg-card border-t">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FaceSilhouette className="w-6 h-auto text-primary" />
          <span className="font-serif text-xl text-foreground">Alis'</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Alis' Salon. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

const navItems = [
  { label: "Services", href: "/services" },
  { label: "Shop", href: "/shop" },
  { label: "Books", href: "/books" },
  { label: "Paintings", href: "/paintings" },
  { label: "Membership", href: "/membership" },
  { label: "Subscribe", href: "/subscribe" },
  { label: "Book Now", href: "/booking" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || mobileOpen ? "bg-background/95 backdrop-blur-md border-b" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <FaceSilhouette className={`w-5 h-auto transition-colors ${scrolled || mobileOpen ? "text-primary" : "text-white/80"}`} />
          <span className={`font-serif text-xl ${scrolled || mobileOpen ? "text-foreground" : "text-white"}`}>Alis'</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
              }`}
              data-testid={`link-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/booking" className="hidden sm:block">
            <Button size="sm" data-testid="button-nav-book">
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className={`md:hidden ${scrolled || mobileOpen ? "text-foreground" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t">
          <div className="flex flex-col px-6 py-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-3 border-b border-border/50 transition-colors"
                onClick={() => setMobileOpen(false)}
                data-testid={`link-mobile-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <PaintingsSection />
      <FeaturedProductsSection />
      <MembershipSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
