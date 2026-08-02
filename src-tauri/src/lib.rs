// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
        .invoke_handler(tauri::generate_handler![greet, ping])
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

    #[test]
    fn greet_formats_name() {
        assert_eq!(greet("Ada"), "Hello, Ada! You've been greeted from Rust!");
    }
}
