#!/bin/sh

ENVIRONMENT="$1"
AWS_PROFILE="$2"

aws s3 cp ./scripts/platinumenoch-blog-post-seed.png s3://"$ENVIRONMENT"-platinumenoch-media/posts/images/ --profile $AWS_PROFILE
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudformation list-exports --query "Exports[?Name=='${ENVIRONMENT}-BariumNahumCDNDistributionId'].Value" --output text --profile $AWS_PROFILE)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/*' --profile $AWS_PROFILE