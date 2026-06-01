package handlers

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/spring-street-backend/models"
	"github.com/yourusername/spring-street-backend/services"
)

type portfolioResponse struct {
	Tickers []string                   `json:"tickers"`
	History []models.PortfolioSnapshot `json:"history"`
}

func GetPortfolio(c *gin.Context) {
	allBars, err := fetchPortfolioBars()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	history := services.BuildPortfolioHistory(allBars, 100000)
	c.JSON(http.StatusOK, portfolioResponse{
		Tickers: services.PortfolioTickers,
		History: history,
	})
}

func fetchPortfolioBars() (map[string][]models.OHLCBar, error) {
	var wg sync.WaitGroup
	var mu sync.Mutex
	allBars := make(map[string][]models.OHLCBar)
	errChan := make(chan error, len(services.PortfolioTickers))

	for _, ticker := range services.PortfolioTickers {
		wg.Add(1)
		go func(t string) {
			defer wg.Done()
			bars, err := services.FetchOHLC(t, 5)
			if err != nil {
				errChan <- fmt.Errorf("%s: %w", t, err)
				return
			}
			mu.Lock()
			allBars[t] = bars
			mu.Unlock()
		}(ticker)
	}

	wg.Wait()
	close(errChan)

	if err := <-errChan; err != nil {
		return nil, err
	}

	return allBars, nil
}
