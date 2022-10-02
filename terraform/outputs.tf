output "students_pickup_sqs_queue_fifo_arn" {
  description = "The ARN of the SQS queue"
  value = aws_sqs_queue.students_pickup_queue_fifo.arn
}

output "students_pickup_sqs_queue_fifo_url" {
  description = "The URL of the SQS queue"
  value = aws_sqs_queue.students_pickup_queue_fifo.url
}

output "update_responsible_sqs_queue_arn" {
  description = "The ARN of the SQS queue"
  value = aws_sqs_queue.update_responsible_queue.arn
}

output "update_responsible_sqs_queue_url" {
  description = "The URL of the SQS queue"
  value = aws_sqs_queue.update_responsible_queue.url
}