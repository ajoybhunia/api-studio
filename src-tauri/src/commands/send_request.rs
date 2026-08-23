use std::collections::HashMap;
use std::time::Duration;

use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendRequestArgs {
    pub method: String,
    pub url: String,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    pub timeout_seconds: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: ResponseBody,
    pub time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum ResponseBody {
    Json(serde_json::Value),
    Text(String),
    Empty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestError {
    pub kind: String,
    pub message: String,
}

pub fn classify_error(err: &reqwest::Error) -> String {
    if err.is_timeout() {
        "timeout".to_string()
    } else if err.is_connect() {
        "connection".to_string()
    } else if let Some(url_err) = err.url() {
        let _ = url_err;
        "invalid_url".to_string()
    } else if err.is_builder() {
        "invalid_url".to_string()
    } else {
        "unknown".to_string()
    }
}

pub fn format_error_message(err: &reqwest::Error, kind: &str) -> String {
    match kind {
        "timeout" => "Request timed out".to_string(),
        "connection" => {
            if let Some(url) = err.url() {
                format!("Could not connect to {}", url.host_str().unwrap_or("host"))
            } else {
                "Could not connect to host".to_string()
            }
        }
        "invalid_url" => {
            if let Some(url) = err.url() {
                format!("Invalid URL: {}", url)
            } else {
                "Invalid URL".to_string()
            }
        }
        _ => format!("Request failed: {}", err),
    }
}

pub fn detect_json(body: &str) -> ResponseBody {
    let trimmed = body.trim();
    if trimmed.is_empty() {
        return ResponseBody::Empty;
    }

    if let Ok(value) = serde_json::from_str(trimmed) {
        ResponseBody::Json(value)
    } else {
        ResponseBody::Text(trimmed.to_string())
    }
}

pub fn parse_headers(
    headers: &reqwest::header::HeaderMap,
) -> HashMap<String, String> {
    headers
        .iter()
        .filter_map(|(k, v)| {
            v.to_str()
                .ok()
                .map(|val| (k.as_str().to_string(), val.to_string()))
        })
        .collect()
}

#[tauri::command]
pub async fn send_request(args: SendRequestArgs) -> Result<SendResponse, RequestError> {
    let timeout = args.timeout_seconds.unwrap_or(30);
    let client = Client::builder()
        .timeout(Duration::from_secs(timeout))
        .build()
        .map_err(|e| RequestError {
            kind: "unknown".to_string(),
            message: format!("Failed to create client: {}", e),
        })?;

    let method = args
        .method
        .to_uppercase()
        .parse::<reqwest::Method>()
        .map_err(|_| RequestError {
            kind: "invalid_url".to_string(),
            message: format!("Invalid HTTP method: {}", args.method),
        })?;

    let mut request = client.request(method, &args.url);

    if let Some(headers) = &args.headers {
        for (key, value) in headers {
            request = request.header(key.as_str(), value.as_str());
        }
    }

    if let Some(body) = &args.body {
        request = request.body(body.clone());
    }

    let start = std::time::Instant::now();
    let response = request.send().await.map_err(|e| {
        let kind = classify_error(&e);
        let message = format_error_message(&e, &kind);
        RequestError { kind, message }
    })?;
    let time_ms = start.elapsed().as_millis() as u64;

    let status = response.status().as_u16();
    let headers = parse_headers(response.headers());

    let body_text = response.text().await.map_err(|e| RequestError {
        kind: "unknown".to_string(),
        message: format!("Failed to read response body: {}", e),
    })?;

    let body = detect_json(&body_text);

    Ok(SendResponse {
        status,
        headers,
        body,
        time_ms,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn classify_error_timeout() {
        let client = Client::builder()
            .timeout(Duration::from_millis(1))
            .build()
            .unwrap();
        let err = client
            .get("http://127.0.0.1:1")
            .send()
            .await
            .unwrap_err();
        let kind = classify_error(&err);
        assert!(
            kind == "timeout" || kind == "connection",
            "Expected timeout or connection, got: {}",
            kind
        );
    }

    #[tokio::test]
    async fn classify_error_connection() {
        let client = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .unwrap();
        let err = client
            .get("http://192.0.2.1:1")
            .send()
            .await
            .unwrap_err();
        let kind = classify_error(&err);
        assert!(
            kind == "connection" || kind == "timeout",
            "Expected connection or timeout, got: {}",
            kind
        );
    }

    #[test]
    fn detect_json_valid() {
        let result = detect_json(r#"{"key": "value"}"#);
        match result {
            ResponseBody::Json(val) => {
                assert_eq!(val["key"], "value");
            }
            _ => panic!("Expected Json variant"),
        }
    }

    #[test]
    fn detect_json_invalid() {
        let result = detect_json("not json");
        assert!(matches!(result, ResponseBody::Text(_)));
    }

    #[test]
    fn detect_json_empty() {
        let result = detect_json("");
        assert!(matches!(result, ResponseBody::Empty));
    }

    #[test]
    fn parse_headers_basic() {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert("content-type", "application/json".parse().unwrap());
        headers.insert("x-custom", "test-value".parse().unwrap());

        let result = parse_headers(&headers);
        assert_eq!(result.get("content-type").unwrap(), "application/json");
        assert_eq!(result.get("x-custom").unwrap(), "test-value");
    }

    #[test]
    fn detect_json_array() {
        let result = detect_json(r#"[1, 2, 3]"#);
        match result {
            ResponseBody::Json(val) => {
                assert!(val.is_array());
            }
            _ => panic!("Expected Json variant"),
        }
    }

    #[test]
    fn detect_json_whitespace() {
        let result = detect_json("  \n  {\"key\": \"value\"}  \n  ");
        assert!(matches!(result, ResponseBody::Json(_)));
    }

    #[tokio::test]
    async fn format_error_message_timeout() {
        let client = Client::builder()
            .timeout(Duration::from_millis(1))
            .build()
            .unwrap();
        let err = client
            .get("http://127.0.0.1:1")
            .send()
            .await
            .unwrap_err();
        let kind = classify_error(&err);
        let msg = format_error_message(&err, &kind);
        assert!(!msg.is_empty());
    }

    #[tokio::test]
    async fn format_error_message_connection() {
        let client = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .unwrap();
        let err = client
            .get("http://192.0.2.1:1")
            .send()
            .await
            .unwrap_err();
        let msg = format_error_message(&err, "connection");
        assert!(msg.starts_with("Could not connect to"));
    }
}
