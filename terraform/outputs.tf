output "sqs_queue_arn" {
  description = "The ARN of the SQS queue"
  value = aws_sqs_queue.students_pickup_queue.arn
}

output "sqs_queue_url" {
  description = "The URL of the SQS queue"
  value = aws_sqs_queue.students_pickup_queue.url
}