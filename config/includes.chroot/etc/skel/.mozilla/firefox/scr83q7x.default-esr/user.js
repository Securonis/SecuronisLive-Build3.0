/**
 * Securonis FireScorpion Browser - user.js
 * 
 * This file contains primary security and privacy hardening settings
 * for the browser. This is where most hardening settings should be placed.
 * 
 * These settings are inspired by Tor Browser and
 * optimized to create minimal issues in daily usage.
 */

// ===== Telemetry and Data Collection Protection =====
// Disable all telemetry and data collection features to maximize privacy

// Prevent data submission to Mozilla
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.firstRunURL", "");
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.server", "");
user_pref("toolkit.telemetry.archive.enabled", false);
user_pref("toolkit.telemetry.newProfilePing.enabled", false);
user_pref("toolkit.telemetry.updatePing.enabled", false);
user_pref("toolkit.telemetry.bhrPing.enabled", false);
user_pref("toolkit.telemetry.firstShutdownPing.enabled", false);
user_pref("toolkit.telemetry.shutdownPingSender.enabled", false);
user_pref("toolkit.telemetry.pioneer-new-studies-available", false);
user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);
user_pref("toolkit.telemetry.coverage.opt-out", true);
user_pref("toolkit.coverage.opt-out", true);
user_pref("toolkit.coverage.endpoint.base", "");
user_pref("beacon.enabled", false);
user_pref("browser.uitour.enabled", false);
user_pref("browser.uitour.url", "");

// Disable studies and experiments
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("app.normandy.enabled", false);
user_pref("app.normandy.api_url", "");

// Disable crash reporter
user_pref("breakpad.reportURL", "");
user_pref("browser.tabs.crashReporting.sendReport", false);
user_pref("browser.crashReports.unsubmittedCheck.enabled", false);
user_pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false);

// ===== Disable Mozilla and Third-Party Integrations =====
// Disable Pocket
user_pref("extensions.pocket.enabled", false);

// Disable Mozilla accounts
user_pref("identity.fxaccounts.enabled", false);

// Disable Firefox Sync
user_pref("services.sync.enabled", false);
user_pref("identity.sync.tokenserver.uri", "");

// Disable access to Firefox Sync server
user_pref("services.sync.serverURL", "");

// Disable form autofill and browser history suggestions
user_pref("browser.formfill.enable", false);
user_pref("extensions.formautofill.addresses.enabled", false);
user_pref("extensions.formautofill.creditCards.enabled", false);
user_pref("extensions.formautofill.heuristics.enabled", false);

// Disable password manager
user_pref("signon.rememberSignons", false);
user_pref("signon.autofillForms", false);
user_pref("signon.formlessCapture.enabled", false);

// Disable addon recommendations
user_pref("extensions.getAddons.showPane", false);
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);
user_pref("browser.discovery.enabled", false);

// ===== HTTPS and TLS Hardening =====
// Force HTTPS-only mode for maximum security
user_pref("dom.security.https_only_mode", true);
user_pref("dom.security.https_only_mode.upgrade_local", true);

// Disable TLS 1.0 and 1.1 (keep TLS 1.2 and 1.3 only)
user_pref("security.tls.version.min", 3);
user_pref("security.tls.version.max", 4);

// OCSP hardening - must staple
user_pref("security.ssl.enable_ocsp_must_staple", true);
user_pref("security.OCSP.require", true);

// Disable insecure passive content
user_pref("security.mixed_content.block_display_content", true);
user_pref("security.mixed_content.block_object_subrequest", true);

// Disable insecure downloads from secure sites
user_pref("dom.block_download_insecure", true);

// Disable TLS Session Tickets
user_pref("security.ssl.disable_session_identifiers", true);

// Strict TLS negotiations
user_pref("security.ssl.treat_unsafe_negotiation_as_broken", true);
user_pref("security.ssl.require_safe_negotiation", true);

// ===== Privacy and Tracking Protection =====
// First-Party Isolation
user_pref("privacy.firstparty.isolate", true);
user_pref("privacy.firstparty.isolate.restrict_opener_access", true);

// Tracking Protection
user_pref("privacy.trackingprotection.enabled", true);
user_pref("privacy.trackingprotection.pbmode.enabled", true);
user_pref("privacy.trackingprotection.fingerprinting.enabled", true);
user_pref("privacy.trackingprotection.cryptomining.enabled", true);
user_pref("privacy.donottrackheader.enabled", true);
user_pref("privacy.donottrackheader.value", 1);

// Enhanced Tracking Protection (strict)
user_pref("browser.contentblocking.category", "strict");
user_pref("browser.contentblocking.features.strict", "tp,tpPrivate,cookieBehavior5,cookieBehaviorPBM5,cm,fp,stp");

// ===== Comprehensive Browser Fingerprinting Protections =====
user_pref("privacy.resistFingerprinting", true);                // Main fingerprinting resistance
user_pref("privacy.resistFingerprinting.letterboxing", false);    // Disabled letterboxing to allow full screen usage
user_pref("privacy.fingerprintingProtection.enabled", true);      // Additional fingerprinting protection (new feature)
user_pref("privacy.window.maxInnerWidth", 1600);                  // Maximum window width limitation
user_pref("privacy.window.maxInnerHeight", 900);                  // Maximum window height limitation
user_pref("privacy.resistFingerprinting.block_mozAddonManager", true); // Prevent fingerprinting via add-on detection
user_pref("browser.display.use_document_fonts", 1);              // Value 0 broke Google Meet
user_pref("device.sensors.enabled", false);                      // Disable device sensors
user_pref("geo.enabled", false);                                 // Disable geolocation
user_pref("webgl.disabled", true);                               // Disable WebGL

// Canvas fingerprint protection
user_pref("privacy.resistFingerprinting.autoDeclineNoUserInputCanvasPrompts", true); // Auto-decline canvas access
user_pref("canvas.capturestream.enabled", false);                // Disable canvas capture stream

// ===== WebRTC Protection =====
user_pref("media.peerconnection.enabled", true);                // Allow WebRTC but with protections
user_pref("media.peerconnection.ice.default_address_only", true); // Use default IP address only
user_pref("media.peerconnection.ice.no_host", true);          // Disable host ICE candidates
user_pref("media.navigator.enabled", false);                   // Disable navigator.mediaDevices
user_pref("media.peerconnection.turn.disable", true);         // Disable TURN servers
user_pref("media.peerconnection.use_document_iceservers", false); // Don't use document provided ICE servers
user_pref("media.peerconnection.video.enabled", false);        // Disable video in WebRTC

// ===== Network Settings =====
// Disable prefetching to prevent network leaks
user_pref("network.dns.disablePrefetch", true);                // Disable DNS prefetching
user_pref("network.dns.disablePrefetchFromHTTPS", true);       // Disable DNS prefetching from HTTPS
user_pref("network.predictor.enabled", false);                 // Disable network prediction
user_pref("network.predictor.enable-prefetch", false);         // Disable prefetch
user_pref("network.prefetch-next", false);                     // Disable link prefetching
user_pref("network.http.speculative-parallel-limit", 0);       // Disable speculative connections
user_pref("browser.urlbar.speculativeConnect.enabled", false); // Disable speculative connections from URL bar

// Disable DNS over HTTPS (preventing Cloudflare DNS)
user_pref("network.trr.mode", 5);                              // Disable DNS over HTTPS
user_pref("network.trr.uri", "");                              // Clear DoH URI
user_pref("network.trr.bootstrapAddress", "");                // Clear DoH bootstrap address
user_pref("network.trr.default_provider_uri", "");            // Clear DoH provider URI

// ===== Advanced Network Isolation =====
user_pref("privacy.partition.network_state", true);               // Network state partitioning
user_pref("privacy.partition.always_partition_third_party_non_cookie_storage", true);  // Partition 3rd party storage
user_pref("privacy.partition.serviceWorkers", true);              // Service Worker isolation
user_pref("privacy.storagePrincipal.enabledForTrackers", true);   // Storage isolation for trackers

// ===== Cookie and Storage Improvements =====
user_pref("privacy.sanitize.sanitizeOnShutdown", true);           // Clean on shutdown
user_pref("privacy.clearOnShutdown.offlineApps", true);           // Clear offline application data
user_pref("privacy.clearOnShutdown.siteSettings", false);         // Preserve site settings (for usability)
user_pref("privacy.sanitize.timeSpan", 0);                        // Clear all history

// ===== HTTP Security Headers =====
user_pref("network.http.referer.XOriginPolicy", 2);               // Limit referer information to same origin
user_pref("network.http.referer.XOriginTrimmingPolicy", 2);       // Trim cross-origin referer header to domain
user_pref("network.http.referer.defaultPolicy.trackers", 1);      // Limit referer sending to trackers
user_pref("network.http.referer.defaultPolicy.trackers.pbmode", 1); // Limit referer to trackers in private mode

// ===== WebRTC Additional Security =====
user_pref("media.peerconnection.ice.default_address_only", true);  // Use default IP only (reduce IP leakage)
user_pref("media.peerconnection.ice.proxy_only_if_behind_proxy", true); // Use proxy only when behind proxy

// ===== Hardware Information Leak Protection =====
user_pref("media.navigator.mediacapabilities.enabled", false);     // Hide media capabilities
user_pref("dom.gamepad.enabled", false);                          // Disable gamepad API
user_pref("media.mediasource.enabled", true);                     // Keep Media Source Extensions enabled (for video)
user_pref("dom.w3c_touch_events.enabled", 0);                     // Disable touch screen API

// ===== DOM Security Improvements =====
user_pref("dom.targetBlankNoOpener.enabled", true);               // Apply noopener for target=_blank
user_pref("dom.popup_allowed_events", "click dblclick");          // Only allow popups on click events
user_pref("dom.disable_window_move_resize", true);                // Prevent window size/position changes
user_pref("dom.allow_scripts_to_close_windows", false);           // Prevent scripts from closing windows

// ===== Cache and Storage Limitations =====
user_pref("browser.sessionstore.privacy_level", 2);               // Session storage privacy (maximum)
user_pref("browser.sessionstore.interval", 30000);                // Session save interval (seconds)
user_pref("browser.sessionhistory.max_entries", 10);              // Keep fewer page history entries
user_pref("browser.sessionhistory.max_total_viewers", 4);         // Number of cached pages

// ===== Security Improvements =====
user_pref("security.tls.version.fallback-limit", 4);              // TLS fallback limit: TLS 1.3
user_pref("security.cert_pinning.enforcement_level", 2);          // Certificate pinning mandatory
user_pref("security.pki.sha1_enforcement_level", 1);              // Don't allow SHA-1 certificates
user_pref("security.ssl3.dhe_rsa_aes_128_sha", false);            // Disable weak cipher suite
user_pref("security.ssl3.dhe_rsa_aes_256_sha", false);            // Disable weak cipher suite

// ===== Privacy Improvements =====
user_pref("browser.link.open_newwindow.restriction", 0);          // Restrict new window opening
user_pref("permissions.default.geo", 2);                          // Deny location sharing by default
user_pref("permissions.default.camera", 2);                       // Deny camera access by default
user_pref("permissions.default.microphone", 2);                   // Deny microphone access by default
user_pref("permissions.default.desktop-notification", 2);         // Deny notifications by default
user_pref("permissions.default.xr", 2);                           // Deny VR access by default

// ===== JavaScript Security Balanced Settings =====
// Note: JIT engines are enabled for better web performance
// Comment these out if you need maximum security but reduced performance
// user_pref("javascript.options.wasm_baselinejit", false);
// user_pref("javascript.options.ion", false);
// user_pref("javascript.options.asmjs", false);
// user_pref("javascript.options.baselinejit", false);

// Alternative safer approach with better performance
user_pref("javascript.options.jit.content", true);               // Keep content JIT enabled
user_pref("javascript.options.jit.chrome", false);               // Disable UI JIT (security improvement)
user_pref("javascript.options.wasm_caching", false);             // Disable WASM caching for security

// ===== Tor Browser-like Additional Settings =====
user_pref("network.captive-portal-service.enabled", false);       // Disable captive portal detection
user_pref("network.connectivity-service.enabled", false);         // Disable connectivity checking
user_pref("network.dns.disableIPv6", true);                       // Disable IPv6 DNS
user_pref("network.IDN_show_punycode", true);                     // Show punycode (URL phishing protection)

// ===== Cache Improvements =====
user_pref("browser.cache.memory.capacity", 65536);                // Limit memory cache (64MB)
user_pref("browser.cache.memory.max_entry_size", 5120);           // Limit maximum cache entry size
user_pref("browser.privatebrowsing.forceMediaMemoryCache", true); // Force media cache in RAM

// ===== Preferences - For Better Usability =====
user_pref("accessibility.blockautorefresh", false);                // Block auto-refresh
user_pref("browser.backspace_action", 2);                         // Don't use backspace as back navigation
user_pref("browser.tabs.warnOnClose", false);                     // Disable warning when closing multiple tabs
user_pref("browser.tabs.warnOnCloseOtherTabs", false);            // Disable warning when closing other tabs
user_pref("full-screen-api.warning.delay", 0);                    // Remove fullscreen warning delay
user_pref("full-screen-api.warning.timeout", 0);                  // Remove fullscreen warning timeout
user_pref("security.warn_about_mime_changes", false);            // Disable MIME type warnings
user_pref("security.warn_viewing_mixed", false);                 // Disable mixed content warnings
user_pref("security.dialog_enable_delay", 0);                    // Remove delay for security dialogs
user_pref("browser.xul.error_pages.enabled", true);              // Enable built-in error pages
user_pref("network.http.prompt-temp-redirect", false);           // Disable prompts for temporary redirects
user_pref("security.insecure_connection_text.enabled", false);   // Disable insecure connection warnings

// ===== Safe Browsing Privacy =====
// Disable Google Safe Browsing and phishing protection to prevent data sharing with Google
user_pref("browser.safebrowsing.enabled", false);
user_pref("browser.safebrowsing.phishing.enabled", false);
user_pref("browser.safebrowsing.malware.enabled", false);
user_pref("browser.safebrowsing.downloads.enabled", false);
user_pref("browser.safebrowsing.downloads.remote.enabled", false);
user_pref("browser.safebrowsing.downloads.remote.url", "");
user_pref("browser.safebrowsing.provider.google.updateURL", "");
user_pref("browser.safebrowsing.provider.google.gethashURL", "");
user_pref("browser.safebrowsing.provider.google4.updateURL", "");
user_pref("browser.safebrowsing.provider.google4.gethashURL", "");

// ===== Cookie and Storage Policies =====
// Default daily usage configuration - allows cookies with tracking protection
user_pref("network.cookie.cookieBehavior", 5);                    // Block all cross-site cookies
user_pref("network.cookie.lifetimePolicy", 0);                    // Accept cookies normally
user_pref("network.cookie.thirdparty.sessionOnly", false);         // Allow third-party cookies to persist
user_pref("network.cookie.thirdparty.nonsecureSessionOnly", true); // Still limit insecure third-party cookies to session

// Cookie partitioning settings
user_pref("privacy.partition.network_state", true);                // Partition network state
user_pref("privacy.partition.serviceWorkers.by_top_and_top", true); // Partition service workers
user_pref("privacy.partition.persistentStorageAccess.omitUserActivation", true); // Enhanced storage access partitioning

// ===== Cache Settings - Daily Mode =====
user_pref("browser.cache.disk.capacity", 1024000);                // Enable disk cache (1GB)
user_pref("browser.cache.disk.enable", true);                    // Enable disk cache
user_pref("browser.cache.disk.smart_size.enabled", true);        // Enable smart sizing of cache

// ===== DuckDuckGo Search Integration =====
// Set DuckDuckGo as default search engine
user_pref("browser.search.defaultenginename", "DuckDuckGo");
user_pref("browser.search.defaultenginename.US", "DuckDuckGo");
user_pref("browser.search.defaulturl", "https://duckduckgo.com/");
user_pref("keyword.URL", "https://duckduckgo.com/");

// DuckDuckGo as new tab page
user_pref("browser.startup.homepage", "https://duckduckgo.com/");
user_pref("browser.newtabpage.enabled", false);
user_pref("browser.newtab.url", "https://duckduckgo.com/");
user_pref("browser.search.hiddenOneOffs", "Google,Amazon.com,Bing,Yahoo,eBay,Twitter");

// ===== Theme Support Settings =====
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true); // default is false
user_pref("svg.context-properties.content.enabled", true);

// ===== Add-on Settings =====
user_pref("extensions.autoDisableScopes", 0);
user_pref("extensions.enabledScopes", 15);
user_pref("extensions.installDistroAddons", true);
user_pref("xpinstall.signatures.required", false);
// Prevent extensions from opening their pages after installation
user_pref("extensions.ui.notifyHidden", true);
user_pref("extensions.webextensions.restrictedDomains", "");
user_pref("browser.startup.upgradeDialog.enabled", false);
user_pref("extensions.getAddons.showPane", false);
user_pref("extensions.getAddons.cache.enabled", false);
user_pref("extensions.getAddons.link.url", "");
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);
