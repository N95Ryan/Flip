resource "aws_ecr_repository" "api" {
  name                 = "${var.project}-back"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}