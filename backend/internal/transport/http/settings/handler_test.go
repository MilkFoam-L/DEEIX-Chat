package settings

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	appsettings "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/application/settings"
	domainsettings "github.com/DEEIX-AI/DEEIX-Chat/backend/internal/domain/settings"
	"github.com/gin-gonic/gin"
)

type testSettingsRepository struct {
	byNamespace map[string][]domainsettings.SystemSetting
}

func (r *testSettingsRepository) ListAll(ctx context.Context) ([]domainsettings.SystemSetting, error) {
	var result []domainsettings.SystemSetting
	for _, items := range r.byNamespace {
		result = append(result, items...)
	}
	return result, nil
}

func (r *testSettingsRepository) ListByNamespace(ctx context.Context, namespace string) ([]domainsettings.SystemSetting, error) {
	return r.byNamespace[namespace], nil
}

func (r *testSettingsRepository) Upsert(ctx context.Context, items []domainsettings.SystemSetting) error {
	return nil
}

func (r *testSettingsRepository) UpsertWithDescription(ctx context.Context, items []domainsettings.SystemSetting) error {
	return nil
}

func (r *testSettingsRepository) Delete(ctx context.Context, namespace, key string) error {
	return nil
}

func TestGetLoginPageSettingsReturnsLogoURL(t *testing.T) {
	gin.SetMode(gin.TestMode)
	repo := &testSettingsRepository{byNamespace: map[string][]domainsettings.SystemSetting{
		"auth": {
			{Namespace: "auth", Key: "login_page_title", Value: "Sign in"},
			{Namespace: "auth", Key: "login_default_next_path", Value: "/chat"},
			{Namespace: "auth", Key: "logo_url", Value: "https://example.com/logo.svg"},
		},
	}}
	service := appsettings.NewService(repo, "test-data-encryption-key")
	handler := NewHandler(service, nil, nil, nil)
	router := gin.New()
	router.GET("/settings/login-page", handler.GetLoginPageSettings)

	request := httptest.NewRequest(http.MethodGet, "/settings/login-page", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", response.Code, response.Body.String())
	}
	var payload struct {
		ErrorMsg string `json:"errorMsg"`
		Data     struct {
			Title           string `json:"title"`
			DefaultNextPath string `json:"defaultNextPath"`
			LogoURL         string `json:"logoURL"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.ErrorMsg != "" {
		t.Fatalf("expected empty errorMsg, got %q", payload.ErrorMsg)
	}
	if payload.Data.LogoURL != "https://example.com/logo.svg" {
		t.Fatalf("expected custom logo URL, got %q", payload.Data.LogoURL)
	}
}
