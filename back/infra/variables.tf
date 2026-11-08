variable "region" {
  description = "AWS region for every resource"
  type        = string
  default     = "us-east-2"
}

variable "project" {
  description = "Prefix used to name resources"
  type        = string
  default     = "flip"
}