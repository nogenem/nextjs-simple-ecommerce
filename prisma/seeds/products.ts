import type { Attribute, Category, Prisma, PrismaClient } from '@prisma/client';
import { AttributeType } from '@prisma/client';

import { getRandomArbitrary } from '../utils';

export const seeder = async (prisma: PrismaClient) => {
  // Categories
  console.log('>> Creating categories...');
  const categoriesPromises: Promise<Category>[] = CATEGORIES.map((category) =>
    prisma.category.create({
      data: {
        name: category,
      },
    }),
  );
  const categoriesObj: Record<Category['name'], Category> = {};

  (await Promise.all(categoriesPromises)).forEach((category) => {
    categoriesObj[category.name] = category;
  });

  // Attributes
  console.log('>> Creating attributes...');
  const attrPromisses: Promise<Attribute>[] = [];

  SIZES.forEach((size) => {
    attrPromisses.push(
      prisma.attribute.create({
        data: {
          type: AttributeType.Size,
          name: size,
          value: size,
        },
      }),
    );
  });

  COLORS.forEach((color) => {
    attrPromisses.push(
      prisma.attribute.create({
        data: {
          type: AttributeType.Color,
          name: color.name,
          value: color.value,
        },
      }),
    );
  });
  const attributesObj: Record<Attribute['name'], Attribute['id']> = {};

  (await Promise.all(attrPromisses)).forEach((attribute) => {
    attributesObj[attribute.name] = attribute.id;
  });

  // Products
  const productsPromises = PRODUCTS.map((p, idx) =>
    createProduct(prisma, idx, attributesObj, categoriesObj),
  );

  await Promise.all(productsPromises);
};

async function createProduct(
  prisma: PrismaClient,
  prodIdx: number,
  attributesObj: Record<Attribute['name'], Attribute['id']>,
  categoriesObj: Record<Category['name'], Category>,
) {
  const PRODUCT = PRODUCTS[prodIdx];

  if (typeof PRODUCT === 'undefined') {
    throw new Error(`PRODUCTS[prodIdx] is undefined; prodIdx = ${prodIdx}`);
  }

  const categoryId = categoriesObj[PRODUCT.category]?.id;

  if (typeof categoryId === 'undefined') {
    throw new Error(
      `PRODUCT.category isn't a valid CATEGORY; prodIdx = ${prodIdx}`,
    );
  }

  if (PRODUCT.images.length !== PRODUCT.colors.length) {
    throw new Error(
      `This product has less images than the number of colors; prodIdx = ${prodIdx}`,
    );
  }

  // discount
  let discountId: string | undefined = undefined;
  if (PRODUCT.discount) {
    console.log(`>> Creating product ${prodIdx}' discount...`);
    discountId = (
      await prisma.discount.create({
        data: PRODUCT.discount,
      })
    ).id;
  }

  // variants
  const variants: Prisma.VariantCreateWithoutProductInput[] = [];

  PRODUCT.sizes.forEach((size, i) => {
    PRODUCT.colors.forEach((color, j) => {
      const image = PRODUCT.images[
        j
      ] as Prisma.VariantImageCreateWithoutVariantInput;

      variants.push({
        price: getRandomArbitrary(1000, 2000),
        sku: `p${prodIdx}-variant-${i}-${j}`,
        quantity_in_stock: getRandomArbitrary(10, 25),
        sold_amount: getRandomArbitrary(0, 10),
        attributes: {
          connect: [{ id: attributesObj[size] }, { id: attributesObj[color] }],
        },
        images: {
          create: [image, image, image],
        },
      });
    });
  });

  console.log(`>> Creating product ${prodIdx}...`);
  return prisma.product.create({
    data: {
      ...PRODUCT.data,
      categoryId,
      variants: {
        create: variants,
      },
      discountId,
    },
  });
}

const CATEGORIES = ['Animal', 'Home', 'Toys'] as const;

const SIZES = ['2 x 5 cm', '4 x 10 cm', '6 x 12 cm'] as const;

const COLORS = [
  { name: 'Pink', value: 'rgba(255, 192, 203, 1)' },
  { name: 'Red', value: 'rgba(255, 0, 0, 1)' },
  { name: 'Blue', value: 'rgba(0, 0, 255, 1)' },
  { name: 'Purple', value: 'rgba(128, 0, 128, 1)' },
  { name: 'Green', value: 'rgba(0, 255, 0, 1)' },
  { name: 'Orange', value: 'rgba(255, 165, 0, 1)' },
  { name: 'Black', value: 'rgba(0, 0, 0, 1)' },
] as const;

const THIRTY_DAYS = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

// Source: https://github.com/antkaynak/Keyist-Ecommerce
const PRODUCTS: {
  sizes: typeof SIZES[number][];
  colors: typeof COLORS[number]['name'][];
  images: Prisma.VariantImageCreateWithoutVariantInput[];
  category: typeof CATEGORIES[number];
  discount?: Prisma.DiscountCreateWithoutProductsInput;
  data: Omit<Prisma.ProductUncheckedCreateInput, 'categoryId'>;
}[] = [
  // Cute Owl
  {
    sizes: [...SIZES],
    colors: ['Pink', 'Red', 'Blue', 'Purple'],
    images: [
      {
        alternative_text:
          'A image of the pink variation of the cute owl keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318985/cute-owl_pink_ltj92x.jpg',
      },
      {
        alternative_text:
          'A image of the red variation of the cute owl keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603397939/cute-owl_red_lm7su7.jpg',
      },
      {
        alternative_text:
          'A image of the blue variation of the cute owl keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318981/cute-owl_blue_hgtkyt.jpg',
      },
      {
        alternative_text:
          'A image of the purple variation of the cute owl keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318980/cute-owl_purple_navcqu.jpg',
      },
    ],
    category: 'Animal',
    discount: {
      percent: 10.0,
      valid_until: THIRTY_DAYS,
    },
    data: {
      slug: 'cute-owl-keychain',
      name: 'Cute Owl',
      description: `A cute owl keychain`,
      description_html: `A cute owl keychain`,
    },
  },
  // Teddy bear
  {
    sizes: [...SIZES],
    colors: ['Pink', 'Blue', 'Purple'],
    images: [
      {
        alternative_text:
          'A image of the pink variation of the teddy bear keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319074/teddy-bear_pink_navkta.jpg',
      },
      {
        alternative_text:
          'A image of the blue variation of the teddy bear keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319076/teddy-bear_blue_spzaj6.jpg',
      },
      {
        alternative_text:
          'A image of the purple variation of the teddy bear keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319073/teddy-bear_purple_hdycaa.jpg',
      },
    ],
    category: 'Toys',
    data: {
      slug: 'teddy-bear-keychain',
      name: 'Teddy Bear',
      description: `A teddy bear keychain`,
      description_html: `A teddy bear keychain`,
    },
  },
  // Sweetie Bird
  {
    sizes: [...SIZES],
    colors: ['Pink', 'Red', 'Blue', 'Green'],
    images: [
      {
        alternative_text:
          'A image of the pink variation of the sweetie bird keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319055/sweetie-bird_pink_cbvfqg.jpg',
      },
      {
        alternative_text:
          'A image of the red variation of the sweetie bird keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319056/sweetie-bird_red_drblu9.jpg',
      },
      {
        alternative_text:
          'A image of the blue variation of the sweetie bird keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319055/sweetie-bird_blue_oqpiwe.jpg',
      },
      {
        alternative_text:
          'A image of the green variation of the sweetie bird keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319054/sweetie-bird_green_av3tzo.jpg',
      },
    ],
    category: 'Animal',
    data: {
      slug: 'sweetie-bird-keychain',
      name: 'Sweetie Bird',
      description: `A sweetie bird keychain`,
      description_html: `A sweetie bird keychain`,
    },
  },
  // Cutie Cat
  {
    sizes: [...SIZES],
    colors: ['Pink', 'Red', 'Blue', 'Green'],
    images: [
      {
        alternative_text:
          'A image of the pink variation of the cutie cat keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319001/cutie-cat_pink_opysqj.jpg',
      },
      {
        alternative_text:
          'A image of the red variation of the cutie cat keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318998/cutie-cat_red_zc668w.jpg',
      },
      {
        alternative_text:
          'A image of the blue variation of the cutie cat keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318994/cutie-cat_blue_vrekyd.jpg',
      },
      {
        alternative_text:
          'A image of the green variation of the cutie cat keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318995/cutie-cat_green_z5tntz.jpg',
      },
    ],
    category: 'Animal',
    data: {
      slug: 'cutie-cat-keychain',
      name: 'Cutie Cat',
      description: `A cutie cat keychain`,
      description_html: `A cutie cat keychain`,
    },
  },
  // Baby Bear
  {
    sizes: [...SIZES],
    colors: ['Red', 'Orange', 'Blue'],
    images: [
      {
        alternative_text:
          'A image of the red variation of the baby bear keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318858/baby-bear_red_md62f5.jpg',
      },
      {
        alternative_text:
          'A image of the orange variation of the baby bear keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318858/baby-bear_orange_ou70cv.jpg',
      },
      {
        alternative_text:
          'A image of the blue variation of the baby bear keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318857/baby-bear_blue_h6f3qg.jpg',
      },
    ],
    category: 'Toys',
    data: {
      slug: 'baby-bear-keychain',
      name: 'Baby Bear',
      description: `A baby bear keychain`,
      description_html: `A baby bear keychain`,
    },
  },
  // Cartoon House
  {
    sizes: [...SIZES],
    colors: ['Purple', 'Pink', 'Red', 'Blue', 'Green'],
    images: [
      {
        alternative_text:
          'A image of the purple variation of the cartoon house keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318934/cartoon-house_purple_dulsoy.jpg',
      },
      {
        alternative_text:
          'A image of the pink variation of the cartoon house keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318926/cartoon-house_pink_qil4av.jpg',
      },
      {
        alternative_text:
          'A image of the red variation of the cartoon house keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318923/cartoon-house_red_rqkwps.jpg',
      },
      {
        alternative_text:
          'A image of the blue variation of the cartoon house keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318921/cartoon-house_blue_be2r4q.jpg',
      },
      {
        alternative_text:
          'A image of the green variation of the cartoon house keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603318921/cartoon-house_green_gneghk.jpg',
      },
    ],
    category: 'Home',
    data: {
      slug: 'cartoon-house-keychain',
      name: 'Cartoon House',
      description: `A cartoon house keychain`,
      description_html: `A cartoon house keychain`,
    },
  },
  // Sweet Home
  {
    sizes: [...SIZES],
    colors: ['Black'],
    images: [
      {
        alternative_text:
          'A image of the black variation of the sweet home keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319043/sweet-home_black_t4zooe.jpg',
      },
    ],
    category: 'Home',
    data: {
      slug: 'sweet-home-keychain',
      name: 'Sweet Home',
      description: `A sweet home keychain`,
      description_html: `A sweet home keychain`,
    },
  },
  // Cutie Dog
  {
    sizes: [...SIZES],
    colors: ['Pink', 'Purple'],
    images: [
      {
        alternative_text:
          'A image of the pink variation of the cutie dog keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319014/cutie-dog_pink_puaumb.jpg',
      },
      {
        alternative_text:
          'A image of the purple variation of the cutie dog keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603319014/cutie-dog_purple_jxlo82.jpg',
      },
    ],
    category: 'Animal',
    data: {
      slug: 'cutie-dog-keychain',
      name: 'Cutie Dog',
      description: `A cutie dog keychain`,
      description_html: `A cutie dog keychain`,
    },
  },
  // My Home
  {
    sizes: [...SIZES],
    colors: ['Pink', 'Purple'],
    images: [
      {
        alternative_text:
          'A image of the pink variation of the my home keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603401003/my-home_pink_r6rmfo.jpg',
      },
      {
        alternative_text:
          'A image of the purple variation of the my home keychain',
        url: 'https://res.cloudinary.com/keyist/image/upload/v1603401003/my-home_purple_ct68mm.jpg',
      },
    ],
    category: 'Home',
    data: {
      slug: 'my-home-keychain',
      name: 'My Home',
      description: `A my home keychain`,
      description_html: `A my home keychain`,
    },
  },
];
