import { UserReviews, type UserReviewsProps } from "./index";
import { userReviewsExamples } from "./fixtures";

export function UserReviewsExample({ locale = "zh" }: Pick<UserReviewsProps, "locale">) {
  return <UserReviews {...userReviewsExamples[locale]} />;
}
