package config

import (
	"fmt"
	"os"
)

type Config struct {
	StripePriceMonthly  string
	StripePriceYearly   string
	StripePriceLifetime string
}

func Load() (*Config, error) {
	cfg := &Config{
		StripePriceMonthly:  os.Getenv("STRIPE_PRICE_MONTHLY"),
		StripePriceYearly:   os.Getenv("STRIPE_PRICE_YEARLY"),
		StripePriceLifetime: os.Getenv("STRIPE_PRICE_LIFETIME"),
	}

	// Legacy Render env: single STRIPE_PRICE_ID used as monthly plan.
	if cfg.StripePriceMonthly == "" {
		cfg.StripePriceMonthly = os.Getenv("STRIPE_PRICE_ID")
	}

	if cfg.StripePriceMonthly == "" {
		return nil, fmt.Errorf("STRIPE_PRICE_MONTHLY (or STRIPE_PRICE_ID) is required")
	}
	if cfg.StripePriceYearly == "" {
		return nil, fmt.Errorf("STRIPE_PRICE_YEARLY is required")
	}
	if cfg.StripePriceLifetime == "" {
		return nil, fmt.Errorf("STRIPE_PRICE_LIFETIME is required")
	}

	return cfg, nil
}
