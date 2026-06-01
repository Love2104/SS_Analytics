package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/spring-street-backend/models"
	"github.com/yourusername/spring-street-backend/services"
)

func GetOHLC(c *gin.Context) {
	ticker := strings.ToUpper(strings.TrimSpace(c.Query("ticker")))
	if ticker == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticker query parameter is required"})
		return
	}

	bars, err := services.FetchOHLC(ticker, 5)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.TickerOHLC{
		Ticker: ticker,
		Bars:   bars,
	})
}
