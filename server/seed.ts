import { storage } from "./storage";
import { db } from "./db";
import { services, products, clients, books, paintings } from "@shared/schema";

export async function seedDatabase() {
  const existingServices = await storage.getServices();
  const shouldSeedBase = existingServices.length === 0;

  if (shouldSeedBase) {
    console.log("Seeding database with initial data...");
  }

  await seedBooks();
  await seedPaintings();

  if (!shouldSeedBase) {
    return;
  }

  const seedServices = [
    {
      name: "Shampoo & Blowdry",
      description: "A refreshing shampoo and professional blowdry for a polished, salon-fresh look. Perfect for any occasion.",
      duration: 30,
      price: "0.00",
      category: "Hair",
      imageUrl: "/images/service-hair.png",
      isActive: true,
    },
    {
      name: "Signature Haircut & Style",
      description: "A personalized haircut and blow-dry style tailored to your face shape, hair texture, and lifestyle. Includes consultation and finishing touches.",
      duration: 60,
      price: "0.00",
      category: "Hair",
      imageUrl: "/images/service-hair.png",
      isActive: true,
    },
    {
      name: "Full Color Treatment",
      description: "Complete hair color transformation including roots, full coverage, and glossing treatment for a rich, vibrant finish that lasts.",
      duration: 120,
      price: "0.00",
      category: "Hair",
      imageUrl: "/images/service-color.png",
      isActive: true,
    },
  ];

  const seedProducts = [
    {
      name: "Moroccan Argan Oil Serum",
      description: "Premium argan oil that tames frizz, adds shine, and protects hair from heat damage. A must-have for silky smooth locks.",
      price: "34.99",
      imageUrl: "/images/products-banner.png",
      category: "Hair Care",
      amazonUrl: "https://www.amazon.com",
      inStock: true,
      featured: true,
    },
    {
      name: "Keratin Repair Shampoo",
      description: "Professional-grade shampoo infused with keratin protein to strengthen and repair damaged hair from root to tip.",
      price: "28.50",
      imageUrl: "/images/products-banner.png",
      category: "Hair Care",
      amazonUrl: "https://www.amazon.com",
      inStock: true,
      featured: true,
    },
    {
      name: "Hydrating Hair Mask",
      description: "Deep conditioning mask with avocado oil and biotin for intense moisture repair. Use weekly for transformative results.",
      price: "42.00",
      imageUrl: "/images/products-banner.png",
      category: "Hair Care",
      amazonUrl: "https://www.amazon.com",
      inStock: true,
      featured: true,
    },
    {
      name: "Heat Protectant Spray",
      description: "Lightweight thermal protectant spray that shields hair up to 450F. Prevents damage from blow dryers and flat irons.",
      price: "19.99",
      imageUrl: "/images/products-banner.png",
      category: "Styling",
      amazonUrl: "https://www.amazon.com",
      inStock: true,
      featured: false,
    },
    {
      name: "Vitamin E Cuticle Oil",
      description: "Nourishing cuticle oil enriched with vitamin E and jojoba oil. Keeps nails and cuticles healthy and hydrated.",
      price: "14.99",
      imageUrl: "/images/products-banner.png",
      category: "Nail Care",
      amazonUrl: "https://www.amazon.com",
      inStock: true,
      featured: false,
    },
    {
      name: "Hydrating Face Serum",
      description: "Lightweight hyaluronic acid serum that delivers deep hydration for plump, dewy skin. Perfect for all skin types.",
      price: "38.00",
      imageUrl: "/images/products-banner.png",
      category: "Skin Care",
      amazonUrl: "https://www.amazon.com",
      inStock: true,
      featured: false,
    },
  ];

  const seedClients = [
    {
      firstName: "Maria",
      lastName: "Rodriguez",
      email: "maria.rodriguez@email.com",
      phone: "(555) 234-5678",
      membershipTier: "gold" as const,
      notes: "Prefers organic products. Loyal client for 3 years.",
      allergies: "Sensitive to sulfates",
      preferredServices: "Balayage, Luxury Facial",
      birthdate: "1988-03-15",
      avatarUrl: null,
      stripeCustomerId: null,
    },
    {
      firstName: "Jessica",
      lastName: "Chen",
      email: "jessica.chen@email.com",
      phone: "(555) 345-6789",
      membershipTier: "platinum" as const,
      notes: "VIP client. Comes in every 3 weeks for color touch-up.",
      allergies: null,
      preferredServices: "Full Color, Signature Haircut",
      birthdate: "1992-07-22",
      avatarUrl: null,
      stripeCustomerId: null,
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 456-7890",
      membershipTier: "silver" as const,
      notes: "New member. Interested in nail services.",
      allergies: "Latex allergy",
      preferredServices: "Gel Manicure",
      birthdate: "1995-11-08",
      avatarUrl: null,
      stripeCustomerId: null,
    },
    {
      firstName: "Amanda",
      lastName: "Williams",
      email: "amanda.w@email.com",
      phone: "(555) 567-8901",
      membershipTier: "bronze" as const,
      notes: "First-time client referred by Jessica Chen.",
      allergies: null,
      preferredServices: "Express Facial",
      birthdate: "1990-01-30",
      avatarUrl: null,
      stripeCustomerId: null,
    },
    {
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@email.com",
      phone: "(555) 678-9012",
      membershipTier: "gold" as const,
      notes: "Regular monthly appointments. Prefers morning slots.",
      allergies: "Fragrance sensitivity",
      preferredServices: "Luxury Facial, Deep Conditioning",
      birthdate: "1985-06-12",
      avatarUrl: null,
      stripeCustomerId: null,
    },
  ];

  for (const service of seedServices) {
    await storage.createService(service);
  }

  for (const product of seedProducts) {
    await storage.createProduct(product);
  }

  for (const client of seedClients) {
    await storage.createClient(client);
  }

  console.log("Database seeded successfully!");
}

async function seedBooks() {
  const existingBooks = await storage.getBooks();
  if (existingBooks.length > 0) return;

  console.log("Seeding books...");
  const booksData = [
      {
        title: "The Sound of an Ordinary Life",
        author: "Alis Cerrahyan",
        description: "A powerful memoir exploring inner healing and spiritual growth. Alis shares her deeply personal journey of overcoming a painful childhood, navigating dysfunctional family dynamics, motherhood, migration, and building her salon business — all through the lens of faith and resilience. A story of finding God's unconditional love amidst life's deepest struggles.",
        coverImageUrl: "/images/book-sound-ordinary-life.png",
        amazonUrl: "https://www.amazon.com/Sound-Ordinary-Life-Alis-Cerrahyan/dp/B0DKCK72HB",
        isbn: "9798343576689",
        genre: "Memoir / Spiritual",
        year: 2024,
        publisher: null,
        awards: "Literary Titan Gold Book Award (Non-Fiction), International Impact Book Awards Winner",
        featured: true,
        sortOrder: 1,
      },
      {
        title: "Dance Like Nobody's Watching",
        author: "Alis Cerrahyan",
        description: "An inspirational memoir about living authentically and overcoming limitations. Alis invites readers to embrace who they truly are, let go of fear and self-doubt, and dance through life with faith, courage, and self-acceptance. A heartfelt call to personal authenticity.",
        coverImageUrl: "/images/book-dance.png",
        amazonUrl: "https://www.amazon.com/Dance-Like-Nobodys-Watching-Cerrahyan/dp/1643005731",
        isbn: "9781643005737",
        genre: "Memoir / Inspirational",
        year: 2018,
        publisher: "Covenant Books",
        awards: null,
        featured: true,
        sortOrder: 2,
      },
      {
        title: "Shadows Prove the Sunlight",
        author: "Alis Cerrahyan",
        description: "A collection of reflective, metaphorical, and thought-provoking essays drawn from personal experience. Alis explores how life's darkest moments can become proof of the light that exists beyond them — offering hope, wisdom, and spiritual insight to readers seeking encouragement.",
        coverImageUrl: "/images/book-shadows.png",
        amazonUrl: "https://www.amazon.com/s?k=alis+cerrahyan+shadows+prove+the+sunlight",
        isbn: null,
        genre: "Inspirational / Spiritual",
        year: null,
        publisher: null,
        awards: null,
        featured: true,
        sortOrder: 3,
      },
      {
        title: "Heaven On Earth",
        author: "Alis Cerrahyan",
        description: "A spiritual and faith-based exploration of finding heaven in our everyday lives. Alis writes about God's unconditional love, helping readers who struggle with discouragement or defeat discover spiritual growth, resilience, and inner peace right where they are.",
        coverImageUrl: "/images/book-heaven.png",
        amazonUrl: "https://www.amazon.com/Heaven-Earth-Alis-Cerrahyan/dp/1093127813",
        isbn: "9781093127812",
        genre: "Spiritual / Faith-based",
        year: 2019,
        publisher: null,
        awards: null,
        featured: true,
        sortOrder: 4,
      },
    ];

  for (const book of booksData) {
    await storage.createBook(book);
  }
  console.log("Books seeded successfully!");
}

async function seedPaintings() {
  const existingPaintings = await storage.getPaintings();
  if (existingPaintings.length > 0) return;

  console.log("Seeding paintings...");
  const paintingsData = [
    {
      title: "Mountain Sunset Landscape",
      description: "A breathtaking oil painting capturing the warm glow of sunset over majestic mountains, with rich golden and purple tones reflecting off peaceful waters below.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis11.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: true,
      externalUrl: "https://alis.webador.com/page-2",
      featured: true,
      sortOrder: 1,
    },
    {
      title: "Autumn River Scene",
      description: "A serene autumn landscape with golden and amber trees lining a gentle river, painted with soft, expressive brushwork.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis12-1.jpg",
      size: '11" x 14"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: false,
      externalUrl: "https://alis.webador.com/page-2",
      featured: true,
      sortOrder: 2,
    },
    {
      title: "Cherry Tree with Birds",
      description: "A vibrant cherry blossom tree alive with colorful birds perched among pink and white blooms against a soft sky.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/cherrytreebirds-standard.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: false,
      externalUrl: "https://alis.webador.com/page-2",
      featured: true,
      sortOrder: 3,
    },
    {
      title: "Misty Mountain Lake",
      description: "A tranquil mountain lake scene with misty peaks reflected in still waters, evoking a sense of peace and natural wonder.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis13.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: true,
      externalUrl: "https://alis.webador.com/page-2",
      featured: true,
      sortOrder: 4,
    },
    {
      title: "Golden Meadow Path",
      description: "A sunlit path winding through golden meadows with wildflowers, leading the eye toward a distant horizon under a luminous sky.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis14.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: true,
      externalUrl: "https://alis.webador.com/page-2",
      featured: false,
      sortOrder: 5,
    },
    {
      title: "Woodland Stream",
      description: "A peaceful woodland scene with a gentle stream flowing through autumn-colored trees, capturing the beauty of nature's quiet moments.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis15.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: true,
      externalUrl: "https://alis.webador.com/page-2",
      featured: false,
      sortOrder: 6,
    },
    {
      title: "Twilight Forest",
      description: "An enchanting forest scene bathed in twilight hues, with tall trees casting long shadows over a carpet of fallen leaves.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis16.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: false,
      externalUrl: "https://alis.webador.com/page-2",
      featured: false,
      sortOrder: 7,
    },
    {
      title: "Countryside Cottage",
      description: "A charming countryside cottage nestled among lush greenery and colorful flowers, painted with warm, inviting tones.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis17.jpg",
      size: '14" x 18"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: false,
      externalUrl: "https://alis.webador.com/page-2",
      featured: false,
      sortOrder: 8,
    },
    {
      title: "River Valley Vista",
      description: "A panoramic river valley view with rolling hills and dramatic cloud formations, showcasing the grandeur of the natural landscape.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/alis18.jpg",
      size: '14" x 18"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: false,
      externalUrl: "https://alis.webador.com/page-2",
      featured: false,
      sortOrder: 9,
    },
    {
      title: "Birds in Spring",
      description: "Colorful birds perched on flowering branches, a celebration of spring's arrival with delicate blossoms and vibrant plumage.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/birds-1.jpg",
      size: '16" x 20"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: true,
      externalUrl: "https://alis.webador.com/page-2",
      featured: true,
      sortOrder: 10,
    },
    {
      title: "Cardinal Pair",
      description: "A striking pair of cardinals perched together among pine branches, their brilliant red plumage standing out against the winter greenery.",
      imageUrl: "https://primary.jwwb.nl/public/i/h/r/temp-adpaktvvshxsioqjiwik/cardinals-standard.jpg",
      size: '11" x 14"',
      medium: "Oil on Canvas",
      year: null,
      price: null,
      isSold: true,
      externalUrl: "https://alis.webador.com/page-2",
      featured: true,
      sortOrder: 11,
    },
  ];

  for (const painting of paintingsData) {
    await storage.createPainting(painting);
  }
  console.log("Paintings seeded successfully!");
}
