data "aws_caller_identity" "current" {}

output "account_id" {
  description = "AWS account Terraform is connected to"
  value       = data.aws_caller_identity.current.account_id
}

output "repository_url" {
  description = "ECR repository for the backend image"
  value       = aws_ecr_repository.api.repository_url
}

output "api_url" {
  description = "Public URL of the API through the load balancer"
  value       = "http://${aws_lb.main.dns_name}"
}