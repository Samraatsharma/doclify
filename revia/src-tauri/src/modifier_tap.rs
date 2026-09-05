use std::sync::atomic::{AtomicBool, AtomicI64};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::AppHandle;

#[cfg(target_os = "macos")]
use std::ffi::c_void;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModifierTarget {
    Control,
    Option,
    Command,
    Shift,
    None,
}

impl ModifierTarget {
    pub fn from_str(s: &str) -> Self {
        let clean = s.trim().to_lowercase().replace(" ", "").replace("_", "");
        if clean.contains("control") || clean.contains("ctrl") || clean.contains("⌃") {
            ModifierTarget::Control
        } else if clean.contains("option") || clean.contains("alt") || clean.contains("⌥") {
            ModifierTarget::Option
        } else if clean.contains("command") || clean.contains("cmd") || clean.contains("⌘") {
            ModifierTarget::Command
        } else if clean.contains("shift") || clean.contains("⇧") {
            ModifierTarget::Shift
        } else {
            ModifierTarget::None
        }
    }
}

pub struct ModifierState {
    pub target: ModifierTarget,
    pub last_tap_time_ms: AtomicI64,
    pub is_modifier_down: AtomicBool,
}

impl ModifierState {
    pub fn new(target: ModifierTarget) -> Self {
        Self {
            target,
            last_tap_time_ms: AtomicI64::new(0),
            is_modifier_down: AtomicBool::new(false),
        }
    }
}

#[cfg(target_os = "macos")]
pub fn check_accessibility() -> bool {
    extern "C" {
        fn AXIsProcessTrusted() -> bool;
    }
    unsafe { AXIsProcessTrusted() }
}

#[cfg(not(target_os = "macos"))]
pub fn check_accessibility() -> bool {
    true
}

#[cfg(target_os = "macos")]
pub fn request_accessibility() -> bool {
    extern "C" {
        fn AXIsProcessTrustedWithOptions(options: *const c_void) -> bool;
        static kAXTrustedCheckOptionPrompt: *const c_void;
        fn CFDictionaryCreate(
            allocator: *const c_void,
            keys: *const *const c_void,
            values: *const *const c_void,
            numValues: isize,
            keyCallBacks: *const c_void,
            valueCallBacks: *const c_void,
        ) -> *const c_void;
        static kCFTypeDictionaryKeyCallBacks: c_void;
        static kCFTypeDictionaryValueCallBacks: c_void;
        static kCFBooleanTrue: *const c_void;
        fn CFRelease(cf: *const c_void);
    }

    unsafe {
        let keys = [kAXTrustedCheckOptionPrompt];
        let values = [kCFBooleanTrue];
        let dict = CFDictionaryCreate(
            std::ptr::null(),
            keys.as_ptr(),
            values.as_ptr(),
            1,
            &kCFTypeDictionaryKeyCallBacks,
            &kCFTypeDictionaryValueCallBacks,
        );
        let trusted = AXIsProcessTrustedWithOptions(dict);
        if !dict.is_null() {
            CFRelease(dict);
        }
        trusted
    }
}

#[cfg(not(target_os = "macos"))]
pub fn request_accessibility() -> bool {
    true
}

#[cfg(target_os = "macos")]
fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

pub fn log_diagnostic(msg: &str) {
    use std::io::Write;
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let line = format!("[{}] {}\n", ts, msg);
    eprint!("{}", line);
    let log_path = std::env::temp_dir().join("revia_event_tap.log");
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
    {
        let _ = f.write_all(line.as_bytes());
    }
}

#[cfg(target_os = "macos")]
pub fn start_modifier_listener(app: AppHandle, target: ModifierTarget) {
    if target == ModifierTarget::None {
        return;
    }

    std::thread::spawn(move || {
        use std::ptr;

        type CGEventRef = *mut c_void;
        type CGEventTapProxy = *mut c_void;
        type CGEventType = u32;

        const K_CG_EVENT_FLAGS_CHANGED: u32 = 12;
        const K_CG_EVENT_KEY_DOWN: u32 = 10;
        const K_CG_SESSION_EVENT_TAP: u32 = 1;
        const K_CG_HEAD_INSERT_EVENT_TAP: u32 = 0;
        const K_CG_EVENT_TAP_OPTION_LISTEN_ONLY: u32 = 1;

        // Flags masks
        const K_CG_EVENT_FLAG_MASK_CONTROL: u64 = 0x00040000;
        const K_CG_EVENT_FLAG_MASK_ALTERNATE: u64 = 0x00080000; // Option
        const K_CG_EVENT_FLAG_MASK_COMMAND: u64 = 0x00100000;
        const K_CG_EVENT_FLAG_MASK_SHIFT: u64 = 0x00020000;

        extern "C" {
            fn CGEventTapCreate(
                tap: u32,
                place: u32,
                options: u32,
                eventsOfInterest: u64,
                callback: extern "C" fn(
                    proxy: CGEventTapProxy,
                    event_type: CGEventType,
                    event: CGEventRef,
                    refcon: *mut c_void,
                ) -> CGEventRef,
                refcon: *mut c_void,
            ) -> *mut c_void;

            fn CGEventTapEnable(tap: *mut c_void, enable: bool);
            fn CGEventGetFlags(event: CGEventRef) -> u64;
            fn CGEventGetIntegerValueField(event: CGEventRef, field: u32) -> i64;
            fn CFMachPortCreateRunLoopSource(
                allocator: *const c_void,
                port: *mut c_void,
                order: isize,
            ) -> *mut c_void;
            fn CFRunLoopGetCurrent() -> *mut c_void;
            fn CFRunLoopAddSource(rl: *mut c_void, source: *mut c_void, mode: *const c_void);
            fn CFRunLoopRun();
            static kCFRunLoopCommonModes: *const c_void;
            static kCFRunLoopDefaultMode: *const c_void;
        }

        let target_flag_mask: u64 = match target {
            ModifierTarget::Control => K_CG_EVENT_FLAG_MASK_CONTROL,
            ModifierTarget::Option => K_CG_EVENT_FLAG_MASK_ALTERNATE,
            ModifierTarget::Command => K_CG_EVENT_FLAG_MASK_COMMAND,
            ModifierTarget::Shift => K_CG_EVENT_FLAG_MASK_SHIFT,
            ModifierTarget::None => 0,
        };

        struct TapContext {
            app: AppHandle,
            #[allow(dead_code)]
            target_mask: u64,
            was_down: bool,
            last_release_time: i64,
            tap_port: *mut c_void,
        }

        let ctx = Box::into_raw(Box::new(TapContext {
            app,
            target_mask: target_flag_mask,
            was_down: false,
            last_release_time: 0,
            tap_port: std::ptr::null_mut(),
        }));

        extern "C" fn tap_callback(
            proxy: CGEventTapProxy,
            event_type: CGEventType,
            event: CGEventRef,
            refcon: *mut c_void,
        ) -> CGEventRef {
            if refcon.is_null() {
                return event;
            }
            let ctx = unsafe { &mut *(refcon as *mut TapContext) };

            // Re-enable tap if disabled by system timeout
            if event_type == 0xFFFFFFFE || event_type == 0xFFFFFFFF {
                log_diagnostic("[EVENT TAP] Tap disabled by macOS, re-enabling...");
                if !ctx.tap_port.is_null() {
                    unsafe { CGEventTapEnable(ctx.tap_port, true) };
                } else if !proxy.is_null() {
                    unsafe { CGEventTapEnable(proxy as *mut c_void, true) };
                }
                return event;
            }

            // If an ordinary key is pressed in between, reset double tap state
            if event_type == K_CG_EVENT_KEY_DOWN {
                if ctx.was_down || ctx.last_release_time > 0 {
                    ctx.last_release_time = 0;
                    ctx.was_down = false;
                }
                return event;
            }

            if event_type == K_CG_EVENT_FLAGS_CHANGED {
                let flags = unsafe { CGEventGetFlags(event) };
                let keycode = unsafe { CGEventGetIntegerValueField(event, 9) }; // kCGKeyboardEventKeycode = 9

                // Keycode 59 = Left Control, Keycode 62 = Right Control
                let is_ctrl_key = keycode == 59 || keycode == 62;
                let has_ctrl_flag = (flags & K_CG_EVENT_FLAG_MASK_CONTROL) != 0;

                // Ensure other modifiers (Cmd, Alt, Shift) are not held during Control double-tap
                let other_mask = K_CG_EVENT_FLAG_MASK_COMMAND | K_CG_EVENT_FLAG_MASK_ALTERNATE | K_CG_EVENT_FLAG_MASK_SHIFT;
                if (flags & other_mask) != 0 {
                    if ctx.was_down || ctx.last_release_time > 0 {
                        ctx.last_release_time = 0;
                        ctx.was_down = false;
                    }
                    return event;
                }

                // Detect control key transition either by keycode or by flag state change
                let is_ctrl_event = is_ctrl_key || (has_ctrl_flag != ctx.was_down);

                if is_ctrl_event {
                    let t = now_ms();
                    if has_ctrl_flag {
                        // Physical press DOWN
                        if !ctx.was_down {
                            ctx.was_down = true;
                            let diff = t - ctx.last_release_time;
                            crate::commands::log_runtime(
                                "SHORTCUT_KEY_DOWN",
                                &format!("Control down (diff={}ms, keycode={})", diff, keycode),
                            );

                            // Double tap cadence: 40ms to 650ms
                            if diff >= 40 && diff <= 650 {
                                crate::commands::log_runtime(
                                    "SHORTCUT_TRIGGERED",
                                    "Double-Control (⌃ ⌃) detected! Invoking capsule with voice...",
                                );
                                ctx.last_release_time = 0;
                                let app = ctx.app.clone();
                                crate::handle_double_control_shortcut(&app);
                            }
                        }
                    } else {
                        // Physical release UP
                        if ctx.was_down {
                            ctx.was_down = false;
                            ctx.last_release_time = t;
                            crate::commands::log_runtime(
                                "SHORTCUT_KEY_UP",
                                &format!("Control up (keycode={})", keycode),
                            );
                        }
                    }
                }
            }

            event
        }

        let events_mask = (1u64 << K_CG_EVENT_FLAGS_CHANGED) | (1u64 << K_CG_EVENT_KEY_DOWN);
        let mut tap = unsafe {
            CGEventTapCreate(
                K_CG_SESSION_EVENT_TAP,
                K_CG_HEAD_INSERT_EVENT_TAP,
                K_CG_EVENT_TAP_OPTION_LISTEN_ONLY,
                events_mask,
                tap_callback,
                ctx as *mut c_void,
            )
        };

        if tap.is_null() {
            crate::commands::log_runtime(
                "SHORTCUT_INITIALIZATION_START",
                "Accessibility permission required for Double-Control. Waiting for permission in background...",
            );

            // Indefinite background retry loop: seamlessly attaches as soon as permission is granted
            loop {
                std::thread::sleep(std::time::Duration::from_millis(1500));
                if check_accessibility() {
                    tap = unsafe {
                        CGEventTapCreate(
                            K_CG_SESSION_EVENT_TAP,
                            K_CG_HEAD_INSERT_EVENT_TAP,
                            K_CG_EVENT_TAP_OPTION_LISTEN_ONLY,
                            events_mask,
                            tap_callback,
                            ctx as *mut c_void,
                        )
                    };
                    if !tap.is_null() {
                        crate::commands::log_runtime(
                            "SHORTCUT_INITIALIZATION_COMPLETE",
                            "Accessibility permission granted! Event tap attached successfully.",
                        );
                        break;
                    }
                }
            }
        }

        unsafe {
            (*ctx).tap_port = tap;
            let run_loop_source = CFMachPortCreateRunLoopSource(ptr::null(), tap, 0);
            if !run_loop_source.is_null() {
                let current_loop = CFRunLoopGetCurrent();
                CFRunLoopAddSource(current_loop, run_loop_source, kCFRunLoopDefaultMode);
                CFRunLoopAddSource(current_loop, run_loop_source, kCFRunLoopCommonModes);
                crate::commands::log_runtime(
                    "SHORTCUT_INITIALIZATION_COMPLETE",
                    "Event tap running on CFRunLoop (default & common modes). Listening for ⌃ ⌃.",
                );
                CFRunLoopRun();
                crate::commands::log_runtime("WARNING", "CFRunLoopRun() exited unexpectedly!");
            } else {
                crate::commands::log_runtime("ERROR", "CFMachPortCreateRunLoopSource returned NULL!");
            }
        }
    });
}

#[cfg(not(target_os = "macos"))]
pub fn start_modifier_listener(_app: AppHandle, _target: ModifierTarget) {}

