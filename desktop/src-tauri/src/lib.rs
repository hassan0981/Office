use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[allow(non_snake_case)]
struct Task {
    id: String,
    title: String,
    description: Option<String>,
    status: String, // "TODO" | "IN_PROGRESS" | "DONE"
    priority: String, // "LOW" | "MEDIUM" | "HIGH"
    dueDate: Option<String>,
    createdAt: String,
    userId: String,
}

// Tauri command that takes user tasks and computes the pending task count
#[tauri::command]
fn get_pending_task_count(tasks: Vec<Task>) -> usize {
    // Filter tasks where status is NOT "DONE"
    tasks.iter()
        .filter(|t| t.status != "DONE")
        .count()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_pending_task_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
