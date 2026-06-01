package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/spring-street-backend/models"
	"github.com/yourusername/spring-street-backend/services"
)

func GetMetrics(c *gin.Context) {
	allBars, err := fetchPortfolioBars()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.InsightsResponse{
		GeneratedAt:      time.Now().UTC().Format(time.RFC3339),
		Tickers:          services.PortfolioTickers,
		Portfolio:        services.ComputePortfolioMetrics(allBars),
		PortfolioHistory: services.BuildPortfolioHistory(allBars, 100000),
	})
}
