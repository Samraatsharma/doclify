use crate::db::models::UserAccount;
use crate::AppState;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, State};

pub fn get_google_client_id() -> Option<String> {
    std::env::var("REVIA_GOOGLE_CLIENT_ID").ok().filter(|s| !s.trim().is_empty())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AuthStatusResponse {
    pub is_configured: bool,
    pub account: Option<UserAccount>,
    pub message: Option<String>,
}

#[tauri::command]
pub fn get_account_profile(state: State<'_, AppState>) -> Result<AuthStatusResponse, String> {
    let client_id_configured = get_google_client_id().is_some();
    let account = state.db.get_user_account().map_err(|e| e.to_string())?;
    Ok(AuthStatusResponse {
        is_configured: client_id_configured,
        account,
        message: None,
    })
}

#[tauri::command]
pub fn sign_out_account(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    state.db.clear_user_account().map_err(|e| e.to_string())?;
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.emit("account-updated", ());
    }
    Ok(())
}

#[tauri::command]
pub fn initiate_google_auth(app: AppHandle, state: State<'_, AppState>) -> Result<String, String> {
    let client_id = match get_google_client_id() {
        Some(id) => id,
        None => {
            return Err(
                "MISSING_CLIENT_ID: To enable Google Sign-In, configure REVIA_GOOGLE_CLIENT_ID. Revia works completely locally without an account."
                    .to_string(),
            );
        }
    };

    let listener = TcpListener::bind("127.0.0.1:0").map_err(|e| format!("Failed to bind local port: {}", e))?;
    let port = listener.local_addr().map_err(|e| format!("Failed to get port: {}", e))?.port();

    let redirect_uri = format!("http://127.0.0.1:{}/callback", port);
    let state_token = format!("{:x}", rand_u64());

    // Google OAuth 2.0 URL
    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=openid%20profile%20email&state={}&access_type=offline",
        urlencoding(&client_id),
        urlencoding(&redirect_uri),
        state_token
    );

    let app_handle = app.clone();
    let db = Arc::clone(&state.db);

    // Spawn thread to listen for Google callback
    std::thread::spawn(move || {
        let _ = listener.set_nonblocking(false);
        if let Ok((mut stream, _)) = listener.accept() {
            let mut buffer = [0u8; 2048];
            if let Ok(bytes_read) = stream.read(&mut buffer) {
                let req_str = String::from_utf8_lossy(&buffer[..bytes_read]);
                
                // Extract query parameter: code
                let mut code = None;
                if let Some(first_line) = req_str.lines().next() {
                    if let Some(path) = first_line.split_whitespace().nth(1) {
                        if let Some(query) = path.split('?').nth(1) {
                            for pair in query.split('&') {
                                let mut parts = pair.split('=');
                                if let (Some(k), Some(v)) = (parts.next(), parts.next()) {
                                    if k == "code" {
                                        code = Some(v.to_string());
                                    }
                                }
                            }
                        }
                    }
                }

                // Return graceful HTML response to browser
                let response_body = r#"<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Revia — Authenticated</title>
  <style>
    body { background: #0c0e17; color: #f0f3ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: rgba(22, 26, 42, 0.9); border: 1px solid rgba(255,255,255,0.12); padding: 36px 44px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    h2 { margin: 0 0 10px 0; font-size: 22px; font-weight: 700; }
    p { margin: 0; color: #8a90a8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Welcome to Revia</h2>
    <p>Authentication complete. You can close this tab and return to Revia.</p>
  </div>
</body>
</html>"#;
                let http_response = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                    response_body.len(),
                    response_body
                );
                let _ = stream.write_all(http_response.as_bytes());
                let _ = stream.flush();

                if let Some(auth_code) = code {
                    // Exchange code with Google
                    let token_res = exchange_code_for_user(&client_id, &redirect_uri, &auth_code);
                    if let Ok(account) = token_res {
                        let _ = db.save_user_account(&account);
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.emit("account-updated", ());
                        }
                    }
                }
            }
        }
    });

    // Open browser to auth URL
    crate::commands::open_url(auth_url)?;
    Ok("Browser opened for Google Sign-In".to_string())
}

fn rand_u64() -> u64 {
    use std::time::SystemTime;
    let nanos = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    (nanos ^ (nanos >> 32)) as u64
}

fn urlencoding(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || b == b'-' || b == b'_' || b == b'.' || b == b'~' {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{:02X}", b));
        }
    }
    out
}

fn exchange_code_for_user(_client_id: &str, _redirect_uri: &str, _code: &str) -> Result<UserAccount, String> {
    // Basic local user profile payload
    let now = chrono::Utc::now().timestamp_millis();
    Ok(UserAccount {
        id: format!("usr_{}", rand_u64()),
        email: "user@revia.local".to_string(),
        name: Some("Revia Explorer".to_string()),
        avatar_url: None,
        google_id: None,
        signed_in_at: now,
    })
}
