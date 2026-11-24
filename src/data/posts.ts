/**
 * Starter blog articles. With a database they are copied into MongoDB by `npm run db:seed` and
 * managed in the admin (Blog); without one the website shows these. Article text is English.
 */
export interface Post {
  slug: string;
  /** ISO date */
  date: string;
  topic: 'guides' | 'private-label' | 'factory';
  minutes: number;
  cover: string;
  title: string;
  excerpt: string;
  sections: { heading?: string; paragraphs: string[]; points?: string[] }[];
  /** False = draft, only visible in the admin. Default true. */
  published?: boolean;
}

export const POSTS: Post[] = [
  {
    slug: 'choosing-a-bjj-gi-fabric',
    date: '2026-11-10',
    topic: 'guides',
    minutes: 5,
    cover: '/products/jiu-jitsu-uniforms-si-jju-1001-631636-1775541913.webp',
    title: 'Pearl, gold or all-play: choosing the right BJJ gi fabric',
    excerpt:
      'The weave decides how a gi feels, how long it lasts and how hard it is to grip. Here is how the three most common BJJ weaves compare for academies and brands.',
    sections: [
      {
        paragraphs: [
          'When an academy or a brand orders its own gi, the first real decision is the weave. It shapes the weight, the comfort in a long session, how quickly the jacket dries and how easy it is for a training partner to grip.',
        ],
      },
      {
        heading: 'Pearl weave: the all-rounder',
        paragraphs: [
          'Pearl weave is the most popular choice for academy gis. The small, tight pattern makes the jacket light (around 280 to 350 GSM) but still strong, and it is comfortable from the first class.',
        ],
        points: ['Light and soft, good for daily training', 'Dries quickly after washing', 'Accepted at most competitions'],
      },
      {
        heading: 'Gold weave: heavier and tougher',
        paragraphs: [
          'Gold weave uses a thicker, honeycomb-like pattern. The jacket is heavier and harder to grip, which many competitors like. It also takes longer to dry and costs more to make.',
        ],
      },
      {
        heading: 'All-play weave: for hard use',
        paragraphs: [
          'All-play weave sits between the two: dense enough to last through hard training, light enough to wear every day. It is a good fit for schools whose students train several times a week.',
        ],
      },
      {
        heading: 'Pants matter too',
        paragraphs: [
          'Most of our BJJ gis come with ripstop pants: light, quick to dry and resistant to tearing at the knees. Cotton ripstop is the comfortable option; 10 oz ripstop is the tougher one.',
          'Not sure which to choose? Start with a sample in two weaves and let your instructors decide on the mat.',
        ],
      },
    ],
  },
  {
    slug: 'judo-gi-weights-explained',
    date: '2026-11-03',
    topic: 'guides',
    minutes: 4,
    cover: '/products/judo-uniforms-si-ju-1005-190467-1775543959.webp',
    title: 'Judo gi weights explained: 450, 550 or 700 GSM?',
    excerpt:
      'GSM tells you how heavy a judo gi is, and that changes everything from grip fights to price. A short guide to picking the right weight for your club.',
    sections: [
      {
        paragraphs: [
          'GSM means grams per square metre: the higher the number, the thicker and heavier the fabric. For judo uniforms it is the single most useful number on the label.',
        ],
      },
      {
        heading: '450 GSM: for beginners and kids',
        paragraphs: [
          'A 450 GSM single-weave uniform is light, comfortable and affordable. It is the right choice for children, beginners and clubs that buy uniforms in large numbers.',
        ],
      },
      {
        heading: '550 GSM: the club standard',
        paragraphs: [
          'At 550 GSM the jacket is noticeably stronger and harder to grip, but still comfortable for daily training. This is the weight most adult club members end up with.',
        ],
      },
      {
        heading: '700 GSM: for competition',
        paragraphs: [
          'Double-weave 700 GSM uniforms are built for competition and hard randori. They last for years, but they are heavier, take longer to dry and cost more.',
        ],
        points: ['Kids and beginners: 450 GSM', 'Regular club training: 550 GSM', 'Competitors and black belts: 700 GSM'],
      },
      {
        paragraphs: [
          'All three weights can be made in white or blue, with your club logo embroidered on the jacket and pants in 100% cotton drill.',
        ],
      },
    ],
  },
  {
    slug: 'private-label-from-artwork-to-first-order',
    date: '2026-10-27',
    topic: 'private-label',
    minutes: 6,
    cover: '/products/jiu-jitsu-uniform-si-jju-1002-118840-1775542142.webp',
    title: 'Private label uniforms: from your artwork to the first order',
    excerpt:
      'Launching your own gi line is simpler than it looks. This is how a private label order runs at Spotex, step by step, from the first sketch to delivery.',
    sections: [
      {
        paragraphs: [
          'Many of our customers are academies and small brands launching their first own-label uniforms. Because every step of production happens in our own factory, we can guide you from idea to delivery without middlemen.',
        ],
      },
      {
        heading: '1. Send your artwork',
        paragraphs: [
          'Share your logo, colours and the products you have in mind. A rough sketch is enough: our design team turns it into production-ready files.',
        ],
      },
      {
        heading: '2. Design mock-up',
        paragraphs: [
          'We prepare a mock-up that shows where each logo, label and patch goes, and suggest fabrics and weights that suit how the uniform will be used.',
        ],
      },
      {
        heading: '3. Approve the sample',
        paragraphs: [
          'Before any bulk production we make a real sample. You check the fit, the fabric and the branding, and we adjust until it is right.',
        ],
      },
      {
        heading: '4. Production and shipping',
        paragraphs: [
          'Once the sample is approved, your order is woven, dyed, cut, stitched, checked and packed in our factory in Gujranwala, then shipped to your door.',
        ],
        points: ['Woven labels, hang tags and branded packaging', 'Embroidery, screen print, sublimation or patches', 'One contact person from first message to delivery'],
      },
    ],
  },
];

