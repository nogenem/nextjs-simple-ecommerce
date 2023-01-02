/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  Attribute,
  Category,
  Discount,
  Product,
  Variant,
  VariantImage,
} from '@prisma/client';
import { AttributeType, Prisma } from '@prisma/client';
import { z } from 'zod';

import { type Context } from '~/server/trpc/context';
import { publicProcedure, router } from '~/server/trpc/trpc';

import {
  URL_QUERY_KEYS,
  URL_QUERY_KEYS_SCHEME,
} from '../filters/constants/url-query-keys';

type THomeProductVariant = Variant & {
  attributes: Attribute[];
  images: VariantImage[];
};

type THomeProduct = Product & {
  category: Category;
  discount: Discount | null;
  variants: THomeProductVariant[];
};

const MYSQL_MAX_INT_VALUE = 2147483647;

export const productsRouter = router({
  home: publicProcedure
    .input(URL_QUERY_KEYS_SCHEME)
    .query(async ({ ctx, input }) => {
      const categoryId = input[URL_QUERY_KEYS.CATEGORY_ID]?.toString();
      const minPrice = +(input[URL_QUERY_KEYS.MIN_PRICE] || '') * 100;
      let maxPrice: number | undefined =
        +(input[URL_QUERY_KEYS.MAX_PRICE] || '') * 100;
      if (maxPrice <= minPrice) {
        maxPrice = undefined;
      }
      const colorId = input[URL_QUERY_KEYS.COLOR_ID]?.toString();
      const sizeId = input[URL_QUERY_KEYS.SIZE_ID]?.toString();

      // If no one answers, then i will keep this version with `queryRaw`
      // PS: https://github.com/prisma/prisma/discussions/16808
      return getHomeProducts(ctx, {
        categoryId,
        minPrice,
        maxPrice,
        colorId,
        sizeId,
      });
    }),
  bySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findFirst({
        include: {
          variants: {
            include: {
              attributes: true,
              images: true,
            },
            where: {
              available_for_sale: true,
            },
          },
          category: true,
          discount: true,
        },
        where: {
          slug: input.slug,
        },
      });

      if (
        product &&
        product.discount &&
        product.discount.valid_until <= new Date()
      ) {
        product.discount = null;
      }

      return product;
    }),
});

const getHomeProducts = async (
  ctx: Context,
  {
    categoryId,
    minPrice,
    maxPrice,
    colorId,
    sizeId,
  }: {
    categoryId?: string;
    minPrice: number;
    maxPrice?: number;
    colorId?: string;
    sizeId?: string;
  },
) => {
  minPrice = minPrice || 0;
  maxPrice = maxPrice || MYSQL_MAX_INT_VALUE;

  const categoryClause = categoryId
    ? Prisma.sql`c.id = ${categoryId}`
    : Prisma.sql`c.id IS NOT NULL`;
  const aColorClause = colorId
    ? Prisma.sql`(a.type = ${AttributeType.Color} AND a.id = ${colorId})`
    : Prisma.sql`(a.type = ${AttributeType.Color} AND a.id IS NOT NULL)`;
  const a1ColorClause = colorId
    ? Prisma.sql`(a1.type = ${AttributeType.Color} AND a1.id = ${colorId})`
    : Prisma.sql`(a1.type = ${AttributeType.Color} AND a1.id IS NOT NULL)`;
  const aSizeClause = sizeId
    ? Prisma.sql`(a.type = ${AttributeType.Size} AND a.id = ${sizeId})`
    : Prisma.sql`(a.type = ${AttributeType.Size} AND a.id IS NOT NULL)`;
  const a2SizeClause = sizeId
    ? Prisma.sql`(a2.type = ${AttributeType.Size} AND a2.id = ${sizeId})`
    : Prisma.sql`(a2.type = ${AttributeType.Size} AND a2.id IS NOT NULL)`;
  const discountedPriceClause = Prisma.sql`
  v.price * (1 - IFNULL(d.percent, 0) / 100)
  `;
  // If out of stock, then i want it showing up at the bottom, hence the multiplication by 10
  const discountedPriceWithStockClause = Prisma.sql`
  IF(v.quantity_in_stock > 0, 1, 10) * v.price * (1 - IFNULL(d.percent, 0) / 100)
  `;

  // Find the products
  const productsResults: (Product & { minDiscountedPrice: number })[] =
    await ctx.prisma.$queryRaw`SELECT
    p.id,
    p.slug,
    p.name,
    p.description,
    p.description_html,
    p.created_at,
    p.updated_at,
    p.categoryId,
    p.discountId,
    MIN(${discountedPriceWithStockClause}) minDiscountedPrice
  FROM
    Product p
    INNER JOIN Variant v ON v.productId = p.id
    INNER JOIN _AttributeToVariant a2v1 ON a2v1.B = v.id
    INNER JOIN Attribute a1 ON a1.id = a2v1.A
    INNER JOIN _AttributeToVariant a2v2 ON a2v2.B = v.id
    INNER JOIN Attribute a2 ON a2.id = a2v2.A
    INNER JOIN _VariantToVariantImage v2vi ON v2vi.A = v.id
    INNER JOIN VariantImage vi ON vi.id = v2vi.B
    INNER JOIN Category c ON c.id = p.categoryId
    LEFT JOIN Discount d ON d.id = p.discountId AND d.valid_until >= NOW()
  WHERE
    v.available_for_sale = TRUE AND
    ${categoryClause} AND
    ${a1ColorClause} AND 
    ${a2SizeClause} AND
    ${discountedPriceClause} >= ${minPrice} AND
    ${discountedPriceClause} <= ${maxPrice}
  GROUP BY p.id
  ORDER BY minDiscountedPrice ASC, p.name ASC`;

  if (productsResults.length === 0) {
    return [] as THomeProduct[];
  }

  // Select the categories
  const categoriesIds = productsResults.map((p) => p.categoryId);
  const categoriesResultsPromise = ctx.prisma.category.findMany({
    where: {
      id: {
        in: categoriesIds,
      },
    },
  });

  // Select the discounts
  const discountsIds = productsResults
    .map((p) => p.discountId)
    .filter((id) => typeof id === 'string') as string[];
  const discountsResultsPromise = ctx.prisma.discount.findMany({
    where: {
      id: {
        in: discountsIds,
      },
      valid_until: {
        gt: new Date(),
      },
    },
  });

  // Select the variants
  const productsIds = productsResults.map((p) => p.id);
  const variantsResultsPromise: Promise<
    (Variant & { discountedPrice: number })[]
  > = ctx.prisma.$queryRaw`SELECT
    v.*,
    ${discountedPriceWithStockClause} discountedPrice
  FROM
    Variant v
    INNER JOIN Product p ON p.id = v.productId
    INNER JOIN _AttributeToVariant a2v1 ON a2v1.B = v.id
    INNER JOIN Attribute a1 ON a1.id = a2v1.A
    INNER JOIN _AttributeToVariant a2v2 ON a2v2.B = v.id
    INNER JOIN Attribute a2 ON a2.id = a2v2.A
    INNER JOIN _VariantToVariantImage v2vi ON v2vi.A = v.id
    INNER JOIN VariantImage vi ON vi.id = v2vi.B
    INNER JOIN Category c ON c.id = p.categoryId
    LEFT JOIN Discount d ON d.id = p.discountId AND d.valid_until >= NOW()
  WHERE
    v.available_for_sale = TRUE AND
    ${a1ColorClause} AND
    ${a2SizeClause} AND
    v.productId IN (${Prisma.join(productsIds)}) AND
    ${discountedPriceClause} >= ${minPrice} AND
    ${discountedPriceClause} <= ${maxPrice}
  ORDER BY discountedPrice ASC, p.name ASC
  `;

  // Find the categories, discounts and variants
  const [categoriesResults, discountsResults, variantsResults] =
    await Promise.all([
      categoriesResultsPromise,
      discountsResultsPromise,
      variantsResultsPromise,
    ]);

  // Find the attributes
  const variantsIds = variantsResults.map((v) => v.id);
  const attributesResults: (Attribute & { variantId: string })[] = await ctx
    .prisma.$queryRaw`
    SELECT
      a.*,
      a2v.B as variantId
    FROM
      Attribute a
      INNER JOIN _AttributeToVariant a2v 
        ON a2v.A = a.id AND a2v.B IN (${Prisma.join(variantsIds)})
    WHERE
      (${aColorClause} OR ${aSizeClause})
    GROUP BY a.id, variantId
    `;

  // Find the variants' images
  const variantImagesResults: (VariantImage & { variantId: string })[] =
    await ctx.prisma.$queryRaw`
      SELECT
        vi.*,
        v2vi.A as variantId
      FROM
        VariantImage vi
        INNER JOIN _VariantToVariantImage v2vi 
          ON v2vi.B = vi.id AND v2vi.A IN (${Prisma.join(variantsIds)})
      GROUP BY vi.id, variantId
    `;

  // Transform all data from array to indexed object
  const categoriesObj = categoriesResults.reduce((prev, curr) => {
    if (!prev[curr.id]) {
      prev[curr.id] = curr;
    }
    return prev;
  }, {} as Record<string, Category>);

  const discountsObj = discountsResults.reduce((prev, curr) => {
    if (!prev[curr.id]) {
      prev[curr.id] = curr;
    }
    return prev;
  }, {} as Record<string, Discount>);

  const attributesObj = attributesResults.reduce(
    (prev, { variantId, ...rest }) => {
      const tmp = prev[variantId];
      if (!tmp) {
        prev[variantId] = [rest];
        return prev;
      }
      tmp.push(rest);
      return prev;
    },
    {} as Record<string, Attribute[]>,
  );

  const variantImagesObj = variantImagesResults.reduce(
    (prev, { variantId, ...rest }) => {
      const tmp = prev[variantId];
      if (!tmp) {
        prev[variantId] = [rest];
        return prev;
      }
      tmp.push(rest);
      return prev;
    },
    {} as Record<string, VariantImage[]>,
  );

  const productId2VariantsObj = variantsResults.reduce(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (prev, { discountedPrice, ...rest }) => {
      const val: THomeProductVariant = {
        ...rest,
        attributes: attributesObj[rest.id]!,
        images: variantImagesObj[rest.id]!,
      };

      const tmp = prev[rest.productId];
      if (!tmp) {
        prev[rest.productId] = [val];
        return prev;
      }
      tmp.push(val);
      return prev;
    },
    {} as Record<string, THomeProductVariant[]>,
  );

  // Assemble the final object
  const finalResults: THomeProduct[] = productsResults.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ minDiscountedPrice, ...rest }) => {
      return {
        ...rest,
        category: categoriesObj[rest.categoryId]!,
        discount: discountsObj[rest.discountId || ''] || null,
        variants: productId2VariantsObj[rest.id]!,
      };
    },
  );

  return finalResults;
};
