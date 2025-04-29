import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import errorCodes from '../errorCodes/errorCodes';

interface Population {
  path: string;
  model?: string;
  select?: string;
  localField?: string;
  foreignField?: string;
  populate?: Population;
}

export type queryType = {
  page: number;
  limit: number;
  search?: string;
  sort?: {
    [key: string]: string | number;
  };
  select?: string;
  populate?: 'true' | 'false';
  skipTotals?: boolean;
  skipCollation?: boolean;
  skipCaseSensitiveRegex?: boolean;
  skipRegex?: boolean;
  searchWithTextIndex?: boolean;
};

export default async (reqObject: {
  model: Model<any>;
  query: queryType;
  searchFields: string[];
  extraQueries: any;
  addedFilters?: {
    [key: string]: any;
  };
  populate?: 'true' | 'false';
  population?: Population[];
  selectFields?: string;
  skipPaginate?: boolean;
  numberSearchFields?: string[];
  skipTotals?: boolean;
  skipCollation?: boolean;
  skipCaseSensitiveRegex?: boolean;
  skipRegex?: boolean;
  searchWithTextIndex?: boolean;
  addIdToSearchText?: boolean;
}) => {
  const {
    model,
    query,
    extraQueries,
    searchFields,
    selectFields,
    numberSearchFields,
    skipTotals,
    skipCollation,
    skipCaseSensitiveRegex,
    skipRegex,
    searchWithTextIndex,
    populate,
    population,
    addIdToSearchText,
  } = reqObject;

  let finalPage = query.page ? query.page : 1;
  let finalLimit = query.limit ? query.limit : 10;

  if (finalLimit > 100) {
    throw new BadRequestException({
      errorCode: errorCodes.LIMIT_TOO_HIGH,
      message: "Limit can't be higher than 100",
      statusCode: 400,
    });
  }

  let queryObject: any = {};

  if (extraQueries) {
    queryObject = {
      ...queryObject,
      ...extraQueries,
    };
  }

  if (
    query.search &&
    typeof query.search === 'string' &&
    (searchFields.length > 0 || searchWithTextIndex)
  ) {
    if (
      Number.isNaN(Number(query.search)) === false &&
      numberSearchFields &&
      numberSearchFields.length > 0
    ) {
      const number = Number(query.search);

      queryObject = {
        ...queryObject,
        $or: [
          ...numberSearchFields.map((field) => ({
            [field]: number,
          })),
        ],
      };
    } else {
      if (searchWithTextIndex) {
        if (addIdToSearchText) {
          queryObject = {
            ...queryObject,
            $or: [
              {
                $text: {
                  $search: `"${query.search.toLocaleLowerCase('tr').trim()}"`,
                },
              },
              {
                _id: query.search,
              },
            ],
          };
        } else {
          queryObject = {
            ...queryObject,

            $text: {
              $search: `"${query.search.toLocaleLowerCase('tr').trim()}"`,
            },
          };
        }
      } else if (skipCaseSensitiveRegex) {
        if (skipRegex) {
          queryObject = {
            ...queryObject,
            $or: [
              ...searchFields.map((field) => ({
                [field]: query.search.trim(),
              })),
            ],
          };
        } else {
          queryObject = {
            ...queryObject,
            $or: [
              ...searchFields.map((field) => ({
                [field]: { $regex: query.search.trim() },
              })),
            ],
          };
        }
      } else {
        query.search = query.search.trim();
        if (query.search.includes('i') || query.search.includes('İ')) {
          queryObject = {
            ...queryObject,
            $or: [
              ...searchFields.map((field) => ({
                [field]: { $regex: query.search.trim(), $options: 'i' },
              })),
              ...searchFields.map((field) => ({
                [field]: {
                  $regex: query.search.trim().toLocaleUpperCase('tr'),
                  $options: 'i',
                },
              })),
              ...searchFields.map((field) => ({
                [field]: {
                  $regex: query.search.trim().toLocaleLowerCase('tr'),
                  $options: 'i',
                },
              })),
              ...searchFields.map((field) => ({
                [field]: {
                  $regex:
                    query.search[0].toLocaleUpperCase('tr') +
                    query.search.slice(1).toLocaleLowerCase('tr'),
                  $options: 'i',
                },
              })),
            ],
          };
        } else {
          queryObject = {
            ...queryObject,
            $or: [
              ...searchFields.map((field) => ({
                [field]: { $regex: query.search, $options: 'i' },
              })),
            ],
          };
        }
      }
    }
  }

  let totalItems = -1;

  if (!skipTotals) {
    totalItems = await model.countDocuments(queryObject);
  }

  const totalPages = Math.ceil(totalItems / finalLimit);

  let modelQuery: any;

  if (reqObject.skipPaginate) {
    modelQuery = model
      .find(queryObject)
      .select(query.select ? query.select : selectFields ? selectFields : null);
  } else {
    modelQuery = model
      .find(queryObject)
      .skip((query.page - 1) * finalLimit)
      .limit(finalLimit)
      .select(query.select ? query.select : selectFields ? selectFields : null);
  }

  if (query.sort) {
    for (const key in query.sort) {
      const value = query.sort[key];

      if (value !== 'asc' && value !== 'desc' && value !== 1 && value !== -1) {
        throw new BadRequestException({
          errorCode: errorCodes.SORTING_NOT_VALID,
          message: 'Sortings can only be asc or desc',
          statusCode: 400,
        });
      }

      if (skipCollation) {
        modelQuery.sort({
          [key]: value as any,
        });
      } else {
        modelQuery
          .sort({
            [key]: value as any,
          })
          .collation({ locale: 'tr', caseLevel: true });
      }
    }
  }

  if (population) {
    for (let pop of population) {
      modelQuery.populate(pop);
    }
  }

  const result = await modelQuery;

  let finalFilters = {
    search: query.search,
  };

  if (reqObject.addedFilters) {
    finalFilters = {
      ...finalFilters,
      ...reqObject.addedFilters,
    };
  }

  return {
    pagination: {
      page: +finalPage,
      limit: +finalLimit,
      totalItems,
      totalPages,
      showing: result.length,
    },
    sort: query.sort ? query.sort : {},
    filters: finalFilters,
    result,
  };
};
