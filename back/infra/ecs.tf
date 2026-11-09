resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project}-back"
  retention_in_days = 1
}

resource "aws_ecs_cluster" "main" {
  name = var.project
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-back"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name         = "api"
      image        = "${aws_ecr_repository.api.repository_url}:${var.image_tag}"
      essential    = true
      portMappings = [{ containerPort = 8080, protocol = "tcp" }]

      environment = [
        { name = "PORT", value = "8080" },
        { name = "AVATAR_UPLOAD_DIR", value = "/tmp/avatars" },
        { name = "STRIPE_PRICE_MONTHLY", value = var.stripe_prices.monthly },
        { name = "STRIPE_PRICE_YEARLY", value = var.stripe_prices.yearly },
        { name = "STRIPE_PRICE_LIFETIME", value = var.stripe_prices.lifetime },
      ]

      secrets = [
        for key in ["DATABASE_URL", "JWT_SECRET", "STRIPE_SECRET_KEY"] : {
          name      = key
          valueFrom = "${aws_secretsmanager_secret.api.arn}:${key}::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "api"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name                              = "${var.project}-back"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.api.arn
  desired_count                     = 1
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = true

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.http,
    aws_secretsmanager_secret_version.api,
    aws_iam_role_policy.read_api_secret,
    aws_iam_role_policy_attachment.ecs_execution_managed,
  ]
}