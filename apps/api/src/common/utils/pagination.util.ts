export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Reusable utility to handle pagination for Prisma models returning the exact requested structure.
 */
export async function paginate<T>(
  modelDelegate: any,
  options: { page?: number; limit?: number },
  findOptions: any = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));
  const skip = (page - 1) * limit;

  // Prisma native implementation for findAndCount equivalent
  const [items, totalItems] = await Promise.all([
    modelDelegate.findMany({
      ...findOptions,
      skip,
      take: limit,
    }),
    modelDelegate.count({
      where: findOptions.where,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    pagination: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
