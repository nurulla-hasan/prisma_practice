interface IPaginationOptions {
  page?: number;
  limit?: number;
  total?: number;
}

interface IPaginationResult {
  skip: number;
  take: number;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

const pagination = (options: IPaginationOptions): IPaginationResult => {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(Math.max(1, options.limit ?? 10), 100);
  const skip = (page - 1) * limit;
  const total = options.total ?? 0;
  const totalPage = total > 0 ? Math.ceil(total / limit) : 0;

  return {
    skip,
    take: limit,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

export default pagination;
