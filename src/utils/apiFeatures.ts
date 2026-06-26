import { pagination, pick } from ".";

interface IQueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  search?: string;
  [key: string]: unknown;
}

interface IApiFeaturesResult<T> {
  where: object;
  orderBy: object;
  skip: number;
  take: number;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

class ApiFeatures<T> {
  private queryParams: IQueryParams;
  private where: object = {};
  private orderBy: object = { createdAt: "desc" };
  private skip: number = 0;
  private take: number = 10;
  private meta = { page: 1, limit: 10, total: 0, totalPage: 0 };
  private searchableFields: string[] = [];
  private filterableFields: string[] = [];

  constructor(queryParams: IQueryParams) {
    this.queryParams = queryParams;
  }

  /**
   * Set which fields can be searched via the `search` query param.
   * Example: .searchable(["name", "email"])
   */
  searchable(fields: string[]): this {
    this.searchableFields = fields;
    return this;
  }

  /**
   * Set which fields can be filtered via exact-match query params.
   * Example: .filterable(["status", "role"])
   */
  filterable(fields: string[]): this {
    this.filterableFields = fields;
    return this;
  }

  /**
   * Build the `where` clause based on search + filter.
   * Must call .searchable() and .filterable() before this.
   */
  filter(): this {
    const conditions: object[] = [];

    // Search condition
    const searchTerm = this.queryParams.search as string | undefined;
    if (searchTerm && this.searchableFields.length > 0) {
      conditions.push({
        OR: this.searchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      });
    }

    // Filter conditions (exact match)
    const filterValues = pick(
      this.queryParams as Record<string, unknown>,
      this.filterableFields as string[],
    );
    const filterKeys = Object.keys(filterValues);
    if (filterKeys.length > 0) {
      const exactFilters: Record<string, unknown> = {};
      for (const key of filterKeys) {
        exactFilters[key] = filterValues[key];
      }
      conditions.push(exactFilters);
    }

    // Combine conditions
    if (conditions.length === 1 && conditions[0]) {
      this.where = conditions[0];
    } else if (conditions.length > 1) {
      this.where = { AND: conditions };
    }

    return this;
  }

  /**
   * Build the `orderBy` clause from the `sort` query param.
   * Format: "field" (asc) or "-field" (desc). Default: "-createdAt"
   */
  sort(): this {
    const sort = this.queryParams.sort as string | undefined;
    if (sort) {
      const sortFields = sort.split(",").map((s) => s.trim()).filter(Boolean);
      const orderByArr = sortFields.map((field) => {
        if (field.startsWith("-")) {
          return { [field.slice(1)]: "desc" as const };
        }
        return { [field]: "asc" as const };
      });
      if (orderByArr.length === 1) {
        this.orderBy = orderByArr[0]!;
      } else if (orderByArr.length > 1) {
        this.orderBy = orderByArr;
      }
    }
    return this;
  }

  /**
   * Build pagination (skip, take) from `page` and `limit` query params.
   */
  paginate(): this {
    const page = Math.max(1, Number(this.queryParams.page) || 1);
    const limit = Math.min(Math.max(1, Number(this.queryParams.limit) || 10), 100);
    const { skip, take, meta } = pagination({ page, limit });
    this.skip = skip;
    this.take = take;
    this.meta = { ...meta, total: 0, totalPage: 0 };
    return this;
  }

  /**
   * Call this after executing the Prisma query to set total counts.
   */
  setTotal(total: number): this {
    this.meta.total = total;
    this.meta.totalPage = total > 0 ? Math.ceil(total / this.take) : 0;
    return this;
  }

  /**
   * Returns the final Prisma query clauses.
   */
  build(): IApiFeaturesResult<T> {
    return {
      where: this.where,
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take,
      meta: this.meta,
    };
  }

  /**
   * Get the built `where` clause (useful for count queries).
   */
  getWhere(): object {
    return this.where;
  }
}

export default ApiFeatures;
