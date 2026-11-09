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

variable "image_tag" {
  description = "Tag of the backend image in ECR"
  type        = string
  default     = "v2"
}

variable "stripe_secret_key" {
  description = "Stripe TEST secret key, passed through TF_VAR_stripe_secret_key"
  type        = string
  sensitive   = true

  validation {
    condition     = startswith(var.stripe_secret_key, "sk_test_")
    error_message = "Only Stripe test keys (sk_test_) are allowed in this demo environment."
  }
}

variable "stripe_prices" {
  description = "Stripe price IDs (not secret), passed through TF_VAR_stripe_prices"
  type = object({
    monthly  = string
    yearly   = string
    lifetime = string
  })
}