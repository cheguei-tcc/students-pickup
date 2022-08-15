output "students_pickup_sqs_queue_arn" {
  description = "The ARN of the SQS queue"
  value = aws_sqs_queue.students_pickup_queue.arn
}

output "students_pickup_sqs_queue_url" {
  description = "The URL of the SQS queue"
  value = aws_sqs_queue.students_pickup_queue.url
}

output "update_responsible_sqs_queue_arn" {
  description = "The ARN of the SQS queue"
  value = aws_sqs_queue.update_responsible_queue.arn
}

output "update_responsible_sqs_queue_url" {
  description = "The URL of the SQS queue"
  value = aws_sqs_queue.update_responsible_queue.url
}