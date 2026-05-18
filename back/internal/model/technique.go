package model

// Technique represents a judo technique in the catalog.
type Technique struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Category    string   `json:"category"`    // "nage-waza" | "katame-waza" | "atemi-waza"
	Subcategory string   `json:"subcategory"` // e.g. "te-waza", "koshi-waza", "ashi-waza"
	Description string   `json:"description"`
	Difficulty  string   `json:"difficulty"` // "beginner" | "intermediate" | "advanced"
	Tags        []string `json:"tags"`
}
