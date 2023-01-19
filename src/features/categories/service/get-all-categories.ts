import { prisma } from '~/server/db/client';

export const getAllCategories = () =>
  prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
