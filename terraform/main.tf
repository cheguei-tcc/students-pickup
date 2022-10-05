terraform {
  backend "s3" {
    bucket = "swarm-machines-tf"
    key    = "terraform-students-pickup.tfstate"
    region = "sa-east-1"
  }
}

provider "aws" {
  region = "sa-east-1"
}

resource "aws_sqs_queue" "students_pickup_queue_fifo" {
  name                      = "students-pickup-queue.fifo"
  delay_seconds             = 0
  receive_wait_time_seconds = 5
  visibility_timeout_seconds = 180
  message_retention_seconds = 10800 # 3 hours
  
  fifo_queue                  = true
  content_based_deduplication = true

  # High-throughput FIFO queue config
  deduplication_scope   = "messageGroup"
  fifo_throughput_limit = "perMessageGroupId"
  
  tags = {
    owner = "students-pickup-app"
  }
}

resource "aws_sqs_queue" "update_responsible_queue" {
  name                      = "update-responsible-queue"
  delay_seconds             = 0
  receive_wait_time_seconds = 5
  visibility_timeout_seconds = 180

  tags = {
    owner = "students-pickup-app"
  }
}

resource "aws_sns_topic_subscription" "responsible_updates_sqs_target" {
  topic_arn = var.sns_update_responsible_topic_arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.update_responsible_queue.arn
}

resource aws_sqs_queue_policy "allow_publish_from_sns" {
  queue_url = aws_sqs_queue.update_responsible_queue.id
  policy = <<POLICY
  {
    "Version": "2012-10-17",
    "Id": "allow_sns_publish",
    "Statement": [{
      "Sid": "1",
      "Effect":"Allow",
      "Principal": {
        "Service": "sns.amazonaws.com"
      },
      "Action":"sqs:SendMessage",
      "Resource":"${aws_sqs_queue.update_responsible_queue.arn}",
      "Condition":{
        "ArnEquals":{
          "aws:SourceArn":"${var.sns_update_responsible_topic_arn}"
        }
      }
    }]
  }
  POLICY
}