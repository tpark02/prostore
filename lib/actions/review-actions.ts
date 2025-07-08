'use server';

import z from 'zod';
import { insertReviewSchema } from '../validators';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { userInfo } from 'os';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

// create & update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error('Use is not authenticated');
    // validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    });

    // get product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error('Product not found');

    // check if use already review
    const reviewExist = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExist) {
        // update review
        await tx.review.update({
          where: { id: reviewExist.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // create review
        await tx.review.create({
          data: review,
        });
      }

      // get avg rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // get number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // update the rating and numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: { rating: averageRating._avg.rating || 0, numReviews },
      });
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true, message: 'Review Updated Successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { data };
}

// get a review written by current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();
  if (!session) throw new Error('User is not authenticated');

  return await prisma.review.findFirst({
    where: { productId: productId, userId: session?.user?.id },
  });
}
