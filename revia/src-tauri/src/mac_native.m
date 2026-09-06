#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <ApplicationServices/ApplicationServices.h>
#import <AppKit/AppKit.h>
#import <Speech/Speech.h>
#import <WebKit/WebKit.h>

// 0: Not Determined, 1: Restricted, 2: Denied, 3: Authorized
int mac_check_microphone_permission(void) {
    if (@available(macOS 10.14, *)) {
        AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeAudio];
        return (int)status;
    }
    return 3;
}

typedef void (*MicRequestCallback)(bool granted);

void mac_request_microphone_permission(MicRequestCallback callback) {
    if (@available(macOS 10.14, *)) {
        [AVCaptureDevice requestAccessForMediaType:AVMediaTypeAudio completionHandler:^(BOOL granted) {
            if (callback) {
                callback(granted ? true : false);
            }
        }];
    } else {
        if (callback) {
            callback(true);
        }
    }
}

bool mac_check_accessibility_permission(void) {
    return AXIsProcessTrusted();
}

bool mac_request_accessibility_permission(void) {
    NSDictionary *options = @{(__bridge id)kAXTrustedCheckOptionPrompt: @YES};
    return AXIsProcessTrustedWithOptions((__bridge CFDictionaryRef)options);
}

void mac_open_privacy_settings(const char *pane) {
    if (!pane) return;
    NSString *urlString = [NSString stringWithUTF8String:pane];
    NSURL *url = [NSURL URLWithString:urlString];
    if (url) {
        [[NSWorkspace sharedWorkspace] openURL:url];
    }
}

#import <objc/runtime.h>

static BOOL Swizzled_canBecomeKeyWindow(id self, SEL _cmd) {
    return YES;
}

static BOOL Swizzled_canBecomeMainWindow(id self, SEL _cmd) {
    return YES;
}

void mac_configure_transparent_window(void *ns_window_ptr) {
    if (!ns_window_ptr) return;
    NSWindow *window = (__bridge NSWindow *)ns_window_ptr;
    void (^block)(void) = ^{
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            Class cls = [window class];
            Method m1 = class_getInstanceMethod(cls, @selector(canBecomeKeyWindow));
            if (m1) {
                class_replaceMethod(cls, @selector(canBecomeKeyWindow), (IMP)Swizzled_canBecomeKeyWindow, "c@:");
            } else {
                class_addMethod(cls, @selector(canBecomeKeyWindow), (IMP)Swizzled_canBecomeKeyWindow, "c@:");
            }
            Method m2 = class_getInstanceMethod(cls, @selector(canBecomeMainWindow));
            if (m2) {
                class_replaceMethod(cls, @selector(canBecomeMainWindow), (IMP)Swizzled_canBecomeMainWindow, "c@:");
            } else {
                class_addMethod(cls, @selector(canBecomeMainWindow), (IMP)Swizzled_canBecomeMainWindow, "c@:");
            }
        });

        [window setOpaque:NO];
        [window setBackgroundColor:[NSColor clearColor]];
        [window setHasShadow:NO];
        
        NSView *contentView = [window contentView];
        if (contentView) {
            [contentView setWantsLayer:YES];
            contentView.layer.backgroundColor = [[NSColor clearColor] CGColor];
            
            // Find and configure WKWebView cleanly without traversing internal private layers
            NSMutableArray *stack = [NSMutableArray arrayWithObject:contentView];
            while ([stack count] > 0) {
                NSView *v = [stack lastObject];
                [stack removeLastObject];
                
                Class wkClass = NSClassFromString(@"WKWebView");
                if (wkClass && [v isKindOfClass:wkClass]) {
                    @try {
                        [v setValue:@NO forKey:@"drawsBackground"];
                    } @catch (NSException *e) {}

                    SEL selDraws = NSSelectorFromString(@"_setDrawsBackground:");
                    if ([v respondsToSelector:selDraws]) {
                        typedef void (*SetDrawsBackgroundFn)(id, SEL, BOOL);
                        SetDrawsBackgroundFn fn = (SetDrawsBackgroundFn)[v methodForSelector:selDraws];
                        if (fn) {
                            fn(v, selDraws, NO);
                        }
                    }

                    SEL selUnder = NSSelectorFromString(@"setUnderPageBackgroundColor:");
                    if ([v respondsToSelector:selUnder]) {
                        typedef void (*SetUnderPageBgFn)(id, SEL, NSColor*);
                        SetUnderPageBgFn fn = (SetUnderPageBgFn)[v methodForSelector:selUnder];
                        if (fn) {
                            fn(v, selUnder, [NSColor clearColor]);
                        }
                    }
                    // Do NOT traverse into WKWebView's private render hierarchy
                    continue;
                }
                
                [v setWantsLayer:YES];
                v.layer.backgroundColor = [[NSColor clearColor] CGColor];
                [stack addObjectsFromArray:[v subviews]];
            }
        }
    };
    if ([NSThread isMainThread]) {
        block();
    } else {
        dispatch_sync(dispatch_get_main_queue(), block);
    }
}

void mac_center_window(void *ns_window_ptr, double target_width, double target_height) {
    if (!ns_window_ptr) return;
    NSWindow *window = (__bridge NSWindow *)ns_window_ptr;
    
    CGFloat effective_height = target_height > 0.0 ? (CGFloat)target_height : 470.0;
    CGFloat effective_width = target_width > 0.0 ? (CGFloat)target_width : 590.0;

    NSPoint mouseLoc = [NSEvent mouseLocation];
    NSScreen *targetScreen = nil;
    for (NSScreen *s in [NSScreen screens]) {
        if (NSPointInRect(mouseLoc, [s frame])) {
            targetScreen = s;
            break;
        }
    }
    if (!targetScreen) targetScreen = [window screen];
    if (!targetScreen) targetScreen = [NSScreen mainScreen];
    if (!targetScreen) return;

    NSRect visibleFrame = [targetScreen visibleFrame];
    CGFloat x = visibleFrame.origin.x + (visibleFrame.size.width - effective_width) / 2.0;
    CGFloat y = visibleFrame.origin.y + (visibleFrame.size.height - effective_height) / 2.0;

    NSRect newFrame = NSMakeRect(x, y, effective_width, effective_height);
    void (^block)(void) = ^{
        mac_configure_transparent_window(ns_window_ptr);
        [window setFrame:newFrame display:YES animate:NO];
        [window setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary | NSWindowCollectionBehaviorIgnoresCycle];
        [window setLevel:NSStatusWindowLevel];
        [window setIsVisible:YES];
        [window orderFrontRegardless];
        [window makeKeyAndOrderFront:nil];
        [NSApp activateIgnoringOtherApps:YES];
    };
    if ([NSThread isMainThread]) {
        block();
    } else {
        dispatch_sync(dispatch_get_main_queue(), block);
    }
}

void mac_anchor_window_top_right(void *ns_window_ptr, double target_width, double target_height, double margin_right, double margin_top) {
    if (!ns_window_ptr) return;
    NSWindow *window = (__bridge NSWindow *)ns_window_ptr;
    
    CGFloat effective_height = target_height > 0.0 ? (CGFloat)target_height : 72.0;
    if (effective_height < 52.0) effective_height = 52.0;

    CGFloat effective_width = target_width > 0.0 ? (CGFloat)target_width : 440.0;

    // Find the screen containing the cursor, or the window's screen, or the main screen
    NSPoint mouseLoc = [NSEvent mouseLocation];
    NSScreen *targetScreen = nil;
    for (NSScreen *s in [NSScreen screens]) {
        if (NSPointInRect(mouseLoc, [s frame])) {
            targetScreen = s;
            break;
        }
    }
    if (!targetScreen) {
        targetScreen = [window screen];
    }
    if (!targetScreen) {
        targetScreen = [NSScreen mainScreen];
    }
    if (!targetScreen) return;

    NSRect visibleFrame = [targetScreen visibleFrame];
    
    // In Cocoa: y=0 is bottom of screen.
    // visibleFrame.origin.y + visibleFrame.size.height is the top of the visible area (below menu bar).
    CGFloat top = visibleFrame.origin.y + visibleFrame.size.height - margin_top;
    CGFloat x = visibleFrame.origin.x + visibleFrame.size.width - effective_width - margin_right;
    CGFloat y = top - effective_height; // Expand DOWNWARDS so the top remains fixed at `top`!

    NSRect newFrame = NSMakeRect(x, y, effective_width, effective_height);
    void (^block)(void) = ^{
        mac_configure_transparent_window(ns_window_ptr);
        [window setFrame:newFrame display:YES animate:NO];
        [window setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary | NSWindowCollectionBehaviorIgnoresCycle];
        [window setLevel:NSStatusWindowLevel];
        if ([window isVisible]) {
            [window orderFrontRegardless];
        }
    };
    if ([NSThread isMainThread]) {
        block();
    } else {
        dispatch_sync(dispatch_get_main_queue(), block);
    }
}

void mac_show_and_order_front(void *ns_window_ptr) {
    if (!ns_window_ptr) return;
    NSWindow *window = (__bridge NSWindow *)ns_window_ptr;
    void (^block)(void) = ^{
        mac_configure_transparent_window(ns_window_ptr);
        [NSApp activateIgnoringOtherApps:YES];
        [window setCollectionBehavior:NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorFullScreenAuxiliary | NSWindowCollectionBehaviorIgnoresCycle];
        [window setIsVisible:YES];
        [window setLevel:NSStatusWindowLevel];
        [window orderFrontRegardless];
        [window makeKeyAndOrderFront:nil];
    };
    if ([NSThread isMainThread]) {
        block();
    } else {
        dispatch_sync(dispatch_get_main_queue(), block);
    }
}

static AVAudioEngine *g_audioEngine = nil;
static SFSpeechRecognizer *g_speechRecognizer = nil;
static SFSpeechAudioBufferRecognitionRequest *g_recognitionRequest = nil;
static SFSpeechRecognitionTask *g_recognitionTask = nil;
static void (*g_transcript_callback)(const char *text, bool is_final) = NULL;
static void (*g_error_callback)(const char *err) = NULL;

int mac_check_speech_permission(void) {
    if (@available(macOS 10.15, *)) {
        return (int)[SFSpeechRecognizer authorizationStatus];
    }
    return 3;
}

void mac_request_speech_permission(void (*callback)(bool granted)) {
    if (@available(macOS 10.15, *)) {
        [SFSpeechRecognizer requestAuthorization:^(SFSpeechRecognizerAuthorizationStatus status) {
            if (callback) {
                callback(status == SFSpeechRecognizerAuthorizationStatusAuthorized);
            }
        }];
    } else {
        if (callback) callback(true);
    }
}

void mac_stop_speech_recognition(void) {
    if (@available(macOS 10.15, *)) {
        if (g_audioEngine) {
            if (g_audioEngine.isRunning) {
                [g_audioEngine stop];
            }
            @try {
                [g_audioEngine.inputNode removeTapOnBus:0];
            } @catch (NSException *e) {}
            g_audioEngine = nil;
        }
        if (g_recognitionRequest) {
            [g_recognitionRequest endAudio];
            g_recognitionRequest = nil;
        }
        if (g_recognitionTask) {
            [g_recognitionTask cancel];
            g_recognitionTask = nil;
        }
    }
}

void mac_start_speech_recognition(void (*on_transcript)(const char *text, bool is_final), void (*on_error)(const char *err)) {
    if (@available(macOS 10.15, *)) {
        g_transcript_callback = on_transcript;
        g_error_callback = on_error;

        mac_stop_speech_recognition();

        if (!g_speechRecognizer) {
            g_speechRecognizer = [[SFSpeechRecognizer alloc] initWithLocale:[NSLocale localeWithLocaleIdentifier:@"en-US"]];
        }

        if (!g_speechRecognizer.isAvailable) {
            if (g_error_callback) g_error_callback("Speech recognition is temporarily unavailable.");
            return;
        }

        NSError *engineError = nil;
        g_audioEngine = [[AVAudioEngine alloc] init];
        AVAudioInputNode *inputNode = g_audioEngine.inputNode;
        if (!inputNode) {
            if (g_error_callback) g_error_callback("Audio input hardware unavailable.");
            return;
        }

        g_recognitionRequest = [[SFSpeechAudioBufferRecognitionRequest alloc] init];
        g_recognitionRequest.shouldReportPartialResults = YES;

        AVAudioFormat *recordingFormat = [inputNode outputFormatForBus:0];
        if (!recordingFormat || recordingFormat.sampleRate == 0) {
            recordingFormat = [inputNode inputFormatForBus:0];
        }
        if (!recordingFormat || recordingFormat.sampleRate == 0) {
            recordingFormat = [[AVAudioFormat alloc] initStandardFormatWithSampleRate:44100.0 channels:1];
        }

        @try {
            [inputNode removeTapOnBus:0];
        } @catch (NSException *e) {}

        @try {
            [inputNode installTapOnBus:0 bufferSize:1024 format:recordingFormat block:^(AVAudioPCMBuffer *buffer, __unused AVAudioTime *when) {
                if (g_recognitionRequest) {
                    [g_recognitionRequest appendAudioPCMBuffer:buffer];
                }
            }];
        } @catch (NSException *e) {
            if (g_error_callback) {
                g_error_callback([[NSString stringWithFormat:@"Audio tap error: %@", e.reason] UTF8String]);
            }
            return;
        }

        [g_audioEngine prepare];
        BOOL started = [g_audioEngine startAndReturnError:&engineError];
        if (!started || engineError) {
            if (g_error_callback) {
                NSString *errStr = engineError ? [engineError localizedDescription] : @"Failed to start audio engine";
                g_error_callback([errStr UTF8String]);
            }
            return;
        }

        g_recognitionTask = [g_speechRecognizer recognitionTaskWithRequest:g_recognitionRequest resultHandler:^(SFSpeechRecognitionResult *result, NSError *taskError) {
            if (result) {
                NSString *str = result.bestTranscription.formattedString;
                BOOL isFinal = result.isFinal;
                if (g_transcript_callback && str.length > 0) {
                    g_transcript_callback([str UTF8String], isFinal);
                }
            }
            if (taskError) {
                if (taskError.code != 216 && taskError.code != 1110) {
                    if (g_error_callback) {
                        g_error_callback([[taskError localizedDescription] UTF8String]);
                    }
                }
            }
        }];
    }
}

static id g_globalFlagsMonitor = nil;
static id g_localFlagsMonitor = nil;
static int64_t g_lastCtrlReleaseTime = 0;
static BOOL g_ctrlWasDown = NO;
static void (*g_shortcutCallback)(void) = NULL;

void mac_install_modifier_monitor(void (*callback)(void)) {
    g_shortcutCallback = callback;
    dispatch_async(dispatch_get_main_queue(), ^{
        if (g_globalFlagsMonitor) return;
        
        void (^flagsHandler)(NSEvent *) = ^(NSEvent *event) {
            NSEventModifierFlags flags = [event modifierFlags];
            unsigned short keyCode = [event keyCode];
            BOOL isCtrlKey = (keyCode == 59 || keyCode == 62);
            BOOL hasCtrlFlag = (flags & NSEventModifierFlagControl) != 0;
            
            // Exclude other modifiers (Cmd, Alt, Shift)
            NSEventModifierFlags otherMask = NSEventModifierFlagCommand | NSEventModifierFlagOption | NSEventModifierFlagShift;
            if ((flags & otherMask) != 0) {
                g_ctrlWasDown = NO;
                g_lastCtrlReleaseTime = 0;
                return;
            }
            
            if (isCtrlKey || (hasCtrlFlag != g_ctrlWasDown)) {
                int64_t now = (int64_t)([[NSDate date] timeIntervalSince1970] * 1000.0);
                if (hasCtrlFlag) {
                    if (!g_ctrlWasDown) {
                        g_ctrlWasDown = YES;
                        int64_t diff = now - g_lastCtrlReleaseTime;
                        if (diff >= 40 && diff <= 650) {
                            g_lastCtrlReleaseTime = 0;
                            if (g_shortcutCallback) {
                                g_shortcutCallback();
                            }
                        }
                    }
                } else {
                    if (g_ctrlWasDown) {
                        g_ctrlWasDown = NO;
                        g_lastCtrlReleaseTime = now;
                    }
                }
            }
        };

        g_globalFlagsMonitor = [NSEvent addGlobalMonitorForEventsMatchingMask:NSEventMaskFlagsChanged handler:flagsHandler];
        g_localFlagsMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskFlagsChanged handler:^NSEvent *(NSEvent *event) {
            flagsHandler(event);
            return event;
        }];
    });
}

static void (*g_dismissCallback)(void) = NULL;

void mac_set_dismiss_callback(void (*callback)(void)) {
    g_dismissCallback = callback;
    dispatch_async(dispatch_get_main_queue(), ^{
        [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskKeyDown handler:^NSEvent *(NSEvent *event) {
            if ([event keyCode] == 53) { // Escape
                if (g_dismissCallback) {
                    g_dismissCallback();
                    return nil; // Consume Escape
                }
            }
            return event;
        }];
    });
}

