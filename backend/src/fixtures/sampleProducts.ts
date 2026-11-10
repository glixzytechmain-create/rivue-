import { ProductInfo } from '../types';

export const SAMPLE_PRODUCTS: Record<string, ProductInfo> = {
  'amazon-earbuds': {
    url: 'https://www.amazon.com/dp/B09V3K4XYZ',
    productId: 'B09V3K4XYZ',
    title: 'SonicPulse Pro True Wireless Noise Cancelling Earbuds with 40H Playtime',
    marketplace: 'amazon',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    price: '$39.99',
    originalRating: 4.8,
    originalReviewCount: 2450,
    reviews: [
      {
        id: 'rev-amz-01',
        author: 'Amazon Customer',
        rating: 5,
        date: '2024-10-12',
        title: 'Five stars best product ever',
        text: 'five stars best product ever! Great item arrived on time will buy again.',
        isVerifiedPurchase: false,
        helpfulVotes: 0
      },
      {
        id: 'rev-amz-02',
        author: 'user89123',
        rating: 5,
        date: '2024-10-12',
        title: 'Great product',
        text: 'five stars best product ever! Great item arrived on time will buy again.',
        isVerifiedPurchase: false,
        helpfulVotes: 0
      },
      {
        id: 'rev-amz-03',
        author: 'Customer',
        rating: 5,
        date: '2024-10-13',
        title: 'Loved it',
        text: 'amazing quality very fast shipping thank you seller! Must buy product good quality nice sound nice battery.',
        isVerifiedPurchase: false,
        helpfulVotes: 1
      },
      {
        id: 'rev-amz-04',
        author: 'David M.',
        rating: 2,
        date: '2024-09-18',
        title: 'Poor microphone and connectivity issues',
        text: 'The sound quality is acceptable for music, but the battery life drains in less than 2 hours with ANC on. Microphones pick up too much wind noise on calls. Definitely not 40 hours of battery as advertised.',
        isVerifiedPurchase: true,
        helpfulVotes: 34
      },
      {
        id: 'rev-amz-05',
        author: 'Sarah Jenkins',
        rating: 3,
        date: '2024-09-02',
        title: 'Decent sound, uncomfortable fit after an hour',
        text: 'Sound quality is okay with heavy bass, but the ear tips are stiff and cause ear fatigue after 45 minutes. The charging case lid feels like cheap plastic. Okay for the price but not a premium device.',
        isVerifiedPurchase: true,
        helpfulVotes: 19
      },
      {
        id: 'rev-amz-06',
        author: 'Amazon Customer',
        rating: 5,
        date: '2024-10-13',
        title: 'Worth every penny',
        text: 'Worth every single penny absolutely love it! Super fast delivery genuine product awesome.',
        isVerifiedPurchase: false,
        helpfulVotes: 0
      },
      {
        id: 'rev-amz-07',
        author: 'Marcus Vance',
        rating: 1,
        date: '2024-08-25',
        title: 'Left earbud died after 3 weeks',
        text: 'Worked fine initially, then the left earbud stopped charging completely. Resetting according to manual did not help. Customer support never replied. Waste of money.',
        isVerifiedPurchase: true,
        helpfulVotes: 52
      },
      {
        id: 'rev-amz-08',
        author: 'Reviewer99',
        rating: 5,
        date: '2024-10-14',
        title: 'Super fast delivery',
        text: 'Super fast delivery genuine product awesome. Works as expected no issues so far five stars.',
        isVerifiedPurchase: false,
        helpfulVotes: 0
      },
      {
        id: 'rev-amz-09',
        author: 'Elena Rostova',
        rating: 4,
        date: '2024-07-14',
        title: 'Good value for budget earbuds',
        text: 'For $40, you get decent active noise cancellation and easy bluetooth pairing. Battery life lasts around 5 hours per charge. Sound is slightly bass-heavy, but clear enough for podcasts and casual music.',
        isVerifiedPurchase: true,
        helpfulVotes: 12
      },
      {
        id: 'rev-amz-10',
        author: 'TechGuru_AI',
        rating: 5,
        date: '2024-10-13',
        title: 'A Quintessential Audio Experience',
        text: 'As an avid enthusiast of acoustic engineering, I find this item superlative in every conceivable dimension. It stands as a testament to modern audio fidelity, unparalleled in its category. In conclusion, buy with utmost confidence.',
        isVerifiedPurchase: false,
        helpfulVotes: 2
      }
    ]
  },

  'flipkart-smartwatch': {
    url: 'https://www.flipkart.com/chronopro-amoled-smartwatch/p/itm123456789',
    productId: 'itm123456789',
    title: 'ChronoPro 1.43" AMOLED Display Bluetooth Calling Smartwatch with SpO2',
    marketplace: 'flipkart',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    price: '₹2,499',
    originalRating: 4.6,
    originalReviewCount: 1820,
    reviews: [
      {
        id: 'rev-fk-01',
        author: 'Flipkart Buyer',
        rating: 5,
        date: '2024-10-01',
        title: 'Super product',
        text: 'Osm watch nice display good battery must buy product don\'t think just buy it.',
        isVerifiedPurchase: false,
        helpfulVotes: 0
      },
      {
        id: 'rev-fk-02',
        author: 'Flipkart Customer',
        rating: 5,
        date: '2024-10-01',
        title: 'Best watch',
        text: 'Super fast delivery genuine product awesome. Must buy product good quality nice sound nice battery.',
        isVerifiedPurchase: false,
        helpfulVotes: 0
      },
      {
        id: 'rev-fk-03',
        author: 'Rohit Sharma',
        rating: 3,
        date: '2024-09-11',
        title: 'Display is good, step counter inaccurate',
        text: 'The AMOLED screen looks vibrant and bright outdoors. However, the step tracker counts hand movements while driving as steps. Battery lasts about 3 days with always-on display turned off.',
        isVerifiedPurchase: true,
        helpfulVotes: 15
      },
      {
        id: 'rev-fk-04',
        author: 'Ananya Roy',
        rating: 4,
        date: '2024-08-20',
        title: 'Good budget smartwatch for calling',
        text: 'Speaker and mic are clear enough for indoor calls. Companion app has clean UI, though watch faces take a while to sync over Bluetooth. Good value for money.',
        isVerifiedPurchase: true,
        helpfulVotes: 8
      },
      {
        id: 'rev-fk-05',
        author: 'Vikram Singh',
        rating: 2,
        date: '2024-08-05',
        title: 'Heart rate monitor unreliable',
        text: 'Tested the heart rate sensor against a medical oximeter and found huge variations of up to 25 BPM during workouts. Strap quality feels cheap plastic and caused slight skin itching after sweating.',
        isVerifiedPurchase: true,
        helpfulVotes: 23
      }
    ]
  },

  'walmart-chair': {
    url: 'https://www.walmart.com/ip/ErgoMax-Mesh-Office-Chair/55481923',
    productId: '55481923',
    title: 'ErgoMax High-Back Ergonomic Breathable Mesh Executive Office Chair with Lumbar Support',
    marketplace: 'walmart',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=400&q=80',
    price: '$149.00',
    originalRating: 4.5,
    originalReviewCount: 890,
    reviews: [
      {
        id: 'rev-wm-01',
        author: 'Jennifer K.',
        rating: 5,
        date: '2024-07-10',
        title: 'Saved my back during remote work',
        text: 'I sit 8 hours a day coding and this chair has been fantastic. Lumbar support is adjustable and the mesh back keeps you cool during hot summer days. Assembly took about 25 minutes with clear instructions.',
        isVerifiedPurchase: true,
        helpfulVotes: 42
      },
      {
        id: 'rev-wm-02',
        author: 'Robert Taylor',
        rating: 4,
        date: '2024-06-22',
        title: 'Solid ergonomic chair for the price',
        text: 'Sturdy metal base, smooth rolling casters on hardwood floor, and comfortable seat cushion. Armrests only adjust vertically and cannot slide forwards or backwards, which is my only slight drawback.',
        isVerifiedPurchase: true,
        helpfulVotes: 18
      },
      {
        id: 'rev-wm-03',
        author: 'Daniel Craig',
        rating: 4,
        date: '2024-05-15',
        title: 'Good build quality',
        text: 'Mesh material has held up well over 4 months without sagging. Recline tension knob works smoothly. Recommend getting rollerblade style wheels if you have thick carpets.',
        isVerifiedPurchase: true,
        helpfulVotes: 11
      },
      {
        id: 'rev-wm-04',
        author: 'Lisa Montgomery',
        rating: 3,
        date: '2024-04-18',
        title: 'A bit firm on the seat cushion',
        text: 'The back support is excellent, but the seat foam is somewhat firmer than expected. If you prefer plush soft padding, you might need an extra seat cushion.',
        isVerifiedPurchase: true,
        helpfulVotes: 7
      }
    ]
  }
};
