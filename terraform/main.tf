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

resource "aws_sqs_queue" "students_pickup_queue" {
  name                      = "students-pickup-queue"
  delay_seconds             = 0
  receive_wait_time_seconds = 5
  visibility_timeout_seconds = 180

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