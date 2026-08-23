#[cfg(test)]
mod tests {
    use super::super::send_request::*;
    use std::collections::HashMap;
    use std::time::Duration;
    use wiremock::matchers::{method, path};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    #[tokio::test]
    async fn send_request_valid_get() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/test"))
            .respond_with(ResponseTemplate::new(200).set_body_string("Hello, World!"))
            .mount(&mock_server)
            .await;

        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: format!("{}/test", mock_server.uri()),
            headers: None,
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await.unwrap();
        assert_eq!(result.status, 200);
        assert!(matches!(result.body, ResponseBody::Text(ref t) if t == "Hello, World!"));
    }

    #[tokio::test]
    async fn send_request_json_response() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/json"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_string(r#"{"name": "test", "value": 42}"#)
                    .insert_header("content-type", "application/json"),
            )
            .mount(&mock_server)
            .await;

        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: format!("{}/json", mock_server.uri()),
            headers: None,
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await.unwrap();
        assert_eq!(result.status, 200);
        match result.body {
            ResponseBody::Json(val) => {
                assert_eq!(val["name"], "test");
                assert_eq!(val["value"], 42);
            }
            _ => panic!("Expected JSON response"),
        }
    }

    #[tokio::test]
    async fn send_request_with_headers() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/headers"))
            .respond_with(ResponseTemplate::new(200).set_body_string("OK"))
            .mount(&mock_server)
            .await;

        let mut headers = HashMap::new();
        headers.insert("x-custom".to_string(), "test-value".to_string());

        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: format!("{}/headers", mock_server.uri()),
            headers: Some(headers),
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await.unwrap();
        assert_eq!(result.status, 200);
    }

    #[tokio::test]
    async fn send_request_post_with_body() {
        let mock_server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/post"))
            .respond_with(ResponseTemplate::new(201).set_body_string("Created"))
            .mount(&mock_server)
            .await;

        let args = SendRequestArgs {
            method: "POST".to_string(),
            url: format!("{}/post", mock_server.uri()),
            headers: None,
            body: Some(r#"{"key": "value"}"#.to_string()),
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await.unwrap();
        assert_eq!(result.status, 201);
    }

    #[tokio::test]
    async fn send_request_invalid_url() {
        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: "not-a-valid-url".to_string(),
            headers: None,
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await;
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert_eq!(err.kind, "invalid_url");
    }

    #[tokio::test]
    async fn send_request_connection_failure() {
        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: "http://192.0.2.1:1/test".to_string(),
            headers: None,
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await;
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(
            err.kind == "connection" || err.kind == "timeout",
            "Expected connection or timeout, got: {}",
            err.kind
        );
    }

    #[tokio::test]
    async fn send_request_timeout() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/slow"))
            .respond_with(
                ResponseTemplate::new(200).set_delay(Duration::from_secs(10)),
            )
            .mount(&mock_server)
            .await;

        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: format!("{}/slow", mock_server.uri()),
            headers: None,
            body: None,
            timeout_seconds: Some(1),
        };

        let result = send_request(args).await;
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert_eq!(err.kind, "timeout");
    }

    #[tokio::test]
    async fn send_request_response_headers() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/with-headers"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_string("OK")
                    .insert_header("x-request-id", "12345")
                    .insert_header("content-type", "text/plain"),
            )
            .mount(&mock_server)
            .await;

        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: format!("{}/with-headers", mock_server.uri()),
            headers: None,
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await.unwrap();
        assert_eq!(result.status, 200);
        assert_eq!(result.headers.get("x-request-id").unwrap(), "12345");
    }

    #[tokio::test]
    async fn send_request_404_status() {
        let mock_server = MockServer::start().await;

        Mock::given(method("GET"))
            .and(path("/not-found"))
            .respond_with(ResponseTemplate::new(404).set_body_string("Not Found"))
            .mount(&mock_server)
            .await;

        let args = SendRequestArgs {
            method: "GET".to_string(),
            url: format!("{}/not-found", mock_server.uri()),
            headers: None,
            body: None,
            timeout_seconds: Some(5),
        };

        let result = send_request(args).await.unwrap();
        assert_eq!(result.status, 404);
    }
}
