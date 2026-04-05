package model

// QuizStatsDTO contains aggregate statistics for the quizzes list page
type QuizStatsDTO struct {
	Total            int64 `json:"total"`
	Active           int64 `json:"active"`
	TotalQuestions   int64 `json:"total_questions"`
	TotalSubmissions int64 `json:"total_submissions"`
}

// ClassAnalyticsDTO contains per-student performance data for scatter chart
type StudentPerformanceDTO struct {
	StudentID   string  `json:"student_id"`
	StudentName string  `json:"student_name"`
	AvgScore    float64 `json:"avg_score"`
	Attempts    int64   `json:"attempts"`
}

// ClassAnalyticsDTO wraps all analytics data for the Analytics tab
type ClassAnalyticsDTO struct {
	TotalStudents    int64                   `json:"total_students"`
	TotalSubmissions int64                   `json:"total_submissions"`
	AvgScore         float64                 `json:"avg_score"`
	PassRate         float64                 `json:"pass_rate"`
	Students         []StudentPerformanceDTO `json:"students"`
}
