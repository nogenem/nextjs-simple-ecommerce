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

import type { SORT_OPTIONS } from '~/features/filters/constants/url-query-keys';
import { prisma } from '~/server/db/client';

type THomeProductVariant = Variant & {
  attributes: Attribute[];
  images: VariantImage[];
};

type THomeProduct = Product & {
  category: Category;
  discount: Discount | null;
  variants: THomeProductVariant[];
};

export const getHomeProducts = async ({
  categoryId,
  minPrice,
  maxPrice,
  colorId,
  sizeId,
  search,
  sort,
}: {
  categoryId?: string;
  minPrice: number;
  maxPrice?: number;
  colorId?: string;
  sizeId?: string;
  search?: string;
  sort: typeof SORT_OPTIONS[number];
}) => {
  minPrice = minPrice || 0;
  maxPrice = maxPrice || MYSQL_MAX_INT_VALUE;
  search = search ? `%${search}%` : search;

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
  const searchClause = search
    ? Prisma.sql`p.name LIKE ${search}`
    : Prisma.sql`p.name IS NOT NULL`;
  const sortClause = SORT_CLAUSES[sort];
  const discountedPriceClause = Prisma.sql`
  v.price * (1 - IFNULL(d.percent, 0) / 100)
  `;
  // If out of stock, then i want it showing up at the bottom, hence the multiplication by 10/-10
  const minDiscountedPriceWithStockClause = Prisma.sql`
  IF(v.quantity_in_stock > 0, 1, 10) * v.price * (1 - IFNULL(d.percent, 0) / 100)
  `;
  const maxDiscountedPriceWithStockClause = Prisma.sql`
  IF(v.quantity_in_stock > 0, 1, -10) * v.price * (1 - IFNULL(d.percent, 0) / 100)
  `;

  // Find the products
  const productsResults: (Product & {
    minDiscountedPrice: number;
    maxDiscountedPrice: number;
  })[] = await prisma.$queryRaw`SELECT
    p.id,
    p.slug,
    p.name,
    p.description,
    p.description_html,
    p.created_at,
    p.updated_at,
    p.categoryId,
    p.discountId,
    MIN(${minDiscountedPriceWithStockClause}) minDiscountedPrice,
    MAX(${maxDiscountedPriceWithStockClause}) maxDiscountedPrice
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
    ${discountedPriceClause} <= ${maxPrice} AND
    ${searchClause}
  GROUP BY p.id
  ${sortClause}
  `;

  if (productsResults.length === 0) {
    return [] as THomeProduct[];
  }

  // Select the categories
  const categoriesIds = productsResults.map((p) => p.categoryId);
  const categoriesResultsPromise = prisma.category.findMany({
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
  const discountsResultsPromise = prisma.discount.findMany({
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
    (Variant & { minDiscountedPrice: number; maxDiscountedPrice: number })[]
  > = prisma.$queryRaw`SELECT
    v.*,
    ${minDiscountedPriceWithStockClause} minDiscountedPrice,
    ${maxDiscountedPriceWithStockClause} maxDiscountedPrice
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
    ${discountedPriceClause} <= ${maxPrice} AND
    ${searchClause}
  ${sortClause}
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
  const attributesResults: (Attribute & { variantId: string })[] =
    await prisma.$queryRaw`
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
    await prisma.$queryRaw`
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
    (prev, { minDiscountedPrice, maxDiscountedPrice, ...rest }) => {
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
    ({ minDiscountedPrice, maxDiscountedPrice, ...rest }) => {
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

const MYSQL_MAX_INT_VALUE = 2147483647;

const SORT_CLAUSES: {
  [s in typeof SORT_OPTIONS[number]]: ReturnType<typeof Prisma.sql>;
} = {
  ['price-asc']: Prisma.sql`ORDER BY minDiscountedPrice ASC, p.name ASC`,
  ['price-desc']: Prisma.sql`ORDER BY maxDiscountedPrice DESC, p.name ASC`,
  ['name-asc']: Prisma.sql`ORDER BY p.name ASC, minDiscountedPrice ASC`,
  ['name-desc']: Prisma.sql`ORDER BY p.name DESC, minDiscountedPrice ASC`,
};
