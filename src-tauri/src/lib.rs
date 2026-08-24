mod commands;

/// Placeholder IPC command used to verify the frontend <-> backend bridge.
/// Real request execution and persistence will be wired up in later phases.
#[tauri::command]
fn ping() -> String {
    format!(
        "pong from API Studio backend v{}",
        env!("CARGO_PKG_VERSION")
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            ping,
            commands::send_request::send_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ping_returns_backend_banner() {
        let msg = ping();
        assert!(msg.starts_with("pong from API Studio backend v"));
    }
}
