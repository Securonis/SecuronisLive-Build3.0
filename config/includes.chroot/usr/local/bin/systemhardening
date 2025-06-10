#!/bin/bash

# Securonis Linux - System and Kernel Hardening
# Developer : root0emir

# Check if running in live mode
check_live_system() {
    if grep -q "overlayfs" /proc/mounts || grep -q "overlay" /proc/mounts || [ -f /usr/bin/ubiquity ] || [ -f /usr/bin/casper ]; then
        echo -e "\e[31m[!] WARNING: You appear to be running in a live environment!\e[0m"
        echo -e "\e[33m[!] If you plan to install this system later, remember to restore kernel settings to default before installation.\e[0m"
        echo -e "\e[33m[!] Otherwise, the installation process might fail.\e[0m"
        echo
        read -p "Press Enter to continue..."
    fi
}

# this script need a root permission
if [[ $EUID -ne 0 ]]; then
   echo "!-This script requires root permissions. Please run it with 'sudo'." 
   exit 1
fi

# Run live system check
check_live_system

# ASCII Art Function
ascii_art() {
    cat << "EOF"
    
           @@@@@@@@@@           
           @@      @@           
   @@@@@  @@@      @@@  @@@@@   
  @@@@@@@@@@        @@@@@@@@@@  
 @@@                        @@@ 
@@@         @@@@@@@@         @@@
@@@@      @@@@    @@@@      @@@@
  @@@@   @@@        @@@   @@@@  
   @@@   @@          @@   @@@   
  @@@@   @@@        @@@   @@@@  
@@@@      @@@@    @@@@      @@@@
@@@         @@@@@@@@         @@@
 @@@                        @@@ 
  @@@@@@@@@@        @@@@@@@@@@  
   @@@@@ @@@@      @@@@ @@@@@   
           @@      @@           
           @@@@@@@@@@           
EOF
}

# Current Settings Status
CURRENT_PROFILE="none"

# Help Menu Function
show_help() {
    clear
    ascii_art
    echo -e "\e[33m===== Securonis Linux - System Hardening Help =====\e[0m"
    
    echo -e "\n\e[1;36mHARDENING PROFILES EXPLAINED:\e[0m"
    
    echo -e "\n\e[1m1) Standard System Hardening:\e[0m"
    echo "   - Basic security settings for everyday use"
    echo "   - Balances security and usability"
    echo "   - Secures common network protocols"
    echo "   - Implements kernel hardening with minimal impact"
    echo "   - Recommended for most desktop and server systems"
    
    echo -e "\n\e[1m2) Performance Hardening:\e[0m"
    echo "   - Optimized for older/low-resource systems"
    echo "   - Prioritizes performance while maintaining basic security"
    echo "   - Reduces memory swapping and improves caching"
    echo "   - Optimizes file descriptor limits for better performance"
    echo "   - Ideal for systems with limited resources"
    
    echo -e "\n\e[1m3) Maximum System Hardening:\e[0m"
    echo "   - Aggressive security settings for high-security environments"
    echo "   - Restricts network activity and kernel parameters"
    echo "   - May impact system performance and functionality"
    echo "   - Adds protection against common attacks and exploits"
    echo "   - Recommended for systems requiring high security"
    
    echo -e "\n\e[1m4) Extreme Kernel Hardening:\e[0m"
    echo "   - Enhanced security profile with system stability in mind"
    echo "   - Implements strict network protection rules"
    echo "   - Restricts uncommon network protocols"
    echo "   - Disables unnecessary filesystem support"
    echo "   - Suitable for security-focused servers and workstations"
    
    echo -e "\n\e[1;33mIMPORTANT NOTES:\e[0m"
    echo "   - Only one hardening profile can be active at a time"
    echo "   - Applying a new profile will replace any previous settings"
    echo "   - Always reboot after changing profiles for full effect"
    echo "   - If system issues occur, restore default settings (Option 5)"
    
    echo -e "\n\e[1mPress Enter to return to main menu\e[0m"
    read -n 1 -s -r
}

# Menu Function
menu() {
    # Check which profile is active
    if [ -f "/etc/securonis/hardening_profile" ]; then
        CURRENT_PROFILE=$(cat /etc/securonis/hardening_profile)
    fi
    
    ascii_art
    echo -e "\e[32m[Securonis Linux - System and Kernel Hardening]\e[0m"
    
    # Show active profile if any
    case "$CURRENT_PROFILE" in
        "standard")  echo -e "\e[33mActive Profile: \e[32mStandard Hardening\e[0m" ;;
        "performance")  echo -e "\e[33mActive Profile: \e[32mPerformance Hardening\e[0m" ;;
        "maximum")   echo -e "\e[33mActive Profile: \e[32mMaximum Hardening\e[0m" ;;
        "extreme")   echo -e "\e[33mActive Profile: \e[31mExtreme Hardening\e[0m" ;;
        "none"|*)    echo -e "\e[33mActive Profile: \e[36mNone (Default Settings)\e[0m" ;;
    esac
    
    echo -e "\n\e[1mHardening Profiles:\e[0m"
    echo "1) Enable Standard System Hardening"
    echo "2) Enable Performance Hardening (for older systems)"
    echo "3) Enable Maximum System Hardening"
    echo "4) Enable Extreme Kernel Hardening"
    echo "5) Restore Default Kernel Settings"
    
    echo -e "\n\e[1mFirewall Management:\e[0m"
    echo "6) Enable Firewall"
    echo "7) Disable Firewall"
    echo "8) Check Firewall Status"
    
    echo -e "\n\e[1mHelp & Exit:\e[0m"
    echo "9) Show Help"
    echo "0) Exit"
}

# Create necessary directories and back up configuration
setup_environment() {
    # Create directories if they don't exist
    mkdir -p /etc/sysctl.d
    mkdir -p /etc/modprobe.d
    mkdir -p /etc/security/limits.d
    mkdir -p /etc/securonis
}

# Backup current configuration
backup_config() {
    # Create backup directory if it doesn't exist
    BACKUP_DIR="/etc/securonis/backup"
    mkdir -p $BACKUP_DIR
    
    # Backup sysctl configuration with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    if [ -f "/etc/sysctl.conf" ]; then
        cp /etc/sysctl.conf "$BACKUP_DIR/sysctl.conf.$TIMESTAMP"
    fi
    
    # Backup any existing hardening config
    if [ -f "/etc/sysctl.d/99-securonis-hardening.conf" ]; then
        cp /etc/sysctl.d/99-securonis-hardening.conf "$BACKUP_DIR/99-securonis-hardening.conf.$TIMESTAMP"
    fi
    
    echo "[*] Configuration backup created at $BACKUP_DIR"
}

# Check for required dependencies
check_dependencies() {
    DEPS_NEEDED=""
    
    # Check for required tools
    if ! command -v sysctl &>/dev/null; then DEPS_NEEDED="$DEPS_NEEDED procps"; fi
    if ! command -v ufw &>/dev/null; then DEPS_NEEDED="$DEPS_NEEDED ufw"; fi
    
    # Install missing dependencies if needed
    if [ ! -z "$DEPS_NEEDED" ]; then
        echo "[!] Missing dependencies: $DEPS_NEEDED"
        echo "[*] Installing required packages..."
        apt-get update
        apt-get install -y $DEPS_NEEDED
    fi
}

# Apply hardening profile and record it
apply_profile() {
    PROFILE=$1
    echo "$PROFILE" > /etc/securonis/hardening_profile
    echo "[*] Applied $PROFILE profile"
    
    # Set last modified timestamp
    date +"%Y-%m-%d %H:%M:%S" > /etc/securonis/last_modified
}

# Standard System Hardening
enable_standard_hardening() {
    echo "[+] Standard Kernel Hardening is Starting..."
    
    # Setup and backup
    setup_environment
    backup_config
    check_dependencies

    if ! sysctl --system; then
        echo "[!] Error applying sysctl settings"
        return 1
    fi

    echo "[*] This script developed by root0emir"

    # Kernel-level security settings
    cat <<EOF > /etc/sysctl.d/99-securonis-hardening.conf
# IPv4 Network Security
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048

# Memory Protection
kernel.randomize_va_space = 2
vm.mmap_min_addr = 65536
vm.swappiness = 30
vm.dirty_ratio = 30
vm.dirty_background_ratio = 10

# Kernel Security
kernel.kptr_restrict = 1
kernel.dmesg_restrict = 1
kernel.unprivileged_bpf_disabled = 1
kernel.yama.ptrace_scope = 1
kernel.sysrq = 1
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.suid_dumpable = 0
EOF

    # Apply settings
    sysctl --system

    # Set secure permissions
    chmod 600 /etc/shadow
    chmod 600 /etc/gshadow
    chmod 644 /etc/passwd
    chmod 644 /etc/group

    echo "[+] Verifying changes..."
    if ! sysctl -a | grep -q "kernel.randomize_va_space = 2"; then
        echo "[!] Warning: Some settings may not have been applied correctly"
    fi

    echo "[+] Standard Kernel Hardening Completed."
    
    # Record the current profile
    apply_profile "standard"
}

# Performance Hardening for older systems
enable_performance_hardening() {
    echo "[+] Performance Hardening for Older Systems is Starting..."
    
    # Setup and backup
    setup_environment
    backup_config
    check_dependencies
    
    if ! sysctl --system; then
        echo "[!] Error applying sysctl settings"
        return 1
    fi

    # Kernel-level security settings optimized for performance
    cat <<EOF > /etc/sysctl.d/99-securonis-hardening.conf
# IPv4 Network Security (Minimal but effective settings)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Safe TCP Performance Optimizations
net.core.rmem_max = 8388608
net.core.wmem_max = 8388608
net.core.rmem_default = 131072
net.core.wmem_default = 131072
net.ipv4.tcp_rmem = 4096 65536 8388608
net.ipv4.tcp_wmem = 4096 65536 8388608
net.ipv4.tcp_max_syn_backlog = 4096
net.core.somaxconn = 4096
net.ipv4.tcp_fin_timeout = 15

# Safe I/O Performance Settings
vm.dirty_ratio = 20
vm.dirty_background_ratio = 10
vm.swappiness = 20
vm.vfs_cache_pressure = 100

# Kernel Security with Performance
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.suid_dumpable = 0
kernel.randomize_va_space = 1
EOF

    # Apply settings
    sysctl --system

    # Set optimized process limits for performance
    cat <<EOF > /etc/security/limits.d/99-performance.conf
* soft nofile 32768
* hard nofile 65536
* soft nproc 2048
* hard nproc 4096
EOF

    # Add safe scheduler and filesystem performance tweaks
    cat <<EOF > /etc/sysctl.d/98-securonis-performance.conf
# Safe Filesystem Performance
fs.inotify.max_user_watches = 262144
fs.file-max = 524288
EOF

    echo "[+] Performance Hardening Completed."
    echo "[*] Your system is now optimized for better performance with basic security."
    
    # Record the current profile
    apply_profile "performance"
}

# Maximum System Hardening
enable_maximum_hardening() {
    echo "[+] Maximum Security Kernel Hardening is Starting..."
    echo "[*] Warning: This may affect system usability!"
    
    # Setup and backup
    setup_environment
    backup_config
    check_dependencies


    # Kernel-level security settings
    cat <<EOF > /etc/sysctl.d/99-securonis-hardening.conf
# IPv4 Network Security
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
# net.ipv4.icmp_echo_ignore_all = 1  # Commented out to allow ping for network troubleshooting
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_max_tw_buckets = 1440000
net.ipv4.tcp_timestamps = 0
net.ipv4.tcp_sack = 0
net.ipv4.tcp_dsack = 0

# IPv6 Security
net.ipv6.conf.all.disable_ipv6 = 0
net.ipv6.conf.default.disable_ipv6 = 0
net.ipv6.conf.lo.disable_ipv6 = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Memory Protection
kernel.randomize_va_space = 2
vm.mmap_min_addr = 65536
vm.swappiness = 10
vm.dirty_ratio = 20
vm.dirty_background_ratio = 5
vm.panic_on_oom = 0

# Kernel Security
kernel.kptr_restrict = 1
kernel.dmesg_restrict = 1
kernel.unprivileged_bpf_disabled = 1
kernel.yama.ptrace_scope = 1
kernel.sysrq = 1
kernel.core_uses_pid = 1
kernel.panic = 10
kernel.panic_on_oops = 10
fs.suid_dumpable = 0
# kernel.modules_disabled = 1  # Commented out as it prevents loading essential modules
dev.tty.ldisc_autoload = 1

# Additional Security
kernel.perf_event_paranoid = 2  
kernel.unprivileged_userns_clone = 0
EOF

    # Apply settings
    sysctl --system

    # Set strict permissions
    chmod 600 /etc/shadow
    chmod 600 /etc/gshadow
    chmod 644 /etc/passwd
    chmod 644 /etc/group

    # Configure strict system limits
    cat <<EOF > /etc/security/limits.d/99-security.conf
* hard core 0
* soft nproc 1024
* hard nproc 4096
* soft nofile 4096
* hard nofile 16384
EOF

    # Enable process accounting and auditing
    if ! systemctl is-active --quiet acct; then
        apt-get install -y acct auditd
        systemctl enable acct auditd
        systemctl start acct auditd
        
        # Strict audit rules
        cat <<EOF > /etc/audit/rules.d/99-security.rules
-D
-b 8192
-a always,exit -F arch=b64 -S mount -F auid>=1000 -F auid!=4294967295 -k mounts
-w /etc/sudoers -p wa -k scope
-w /etc/sudoers.d/ -p wa -k scope
-w /etc/pam.d/ -p wa -k pam
-w /etc/nsswitch.conf -p wa -k nsswitch
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/group -p wa -k group_changes
-w /etc/ssh/sshd_config -p wa -k sshd_config
-a always,exit -F path=/usr/bin/sudo -F perm=x -F auid>=1000 -F auid!=4294967295 -k sudo_usage
EOF
        augenrules --load
    fi

    echo "[+] Maximum Security Kernel Hardening Completed."
    echo "[!] Warning: Some features may be restricted and system usability may be affected."
    echo "[!] Note: System reboot is recommended for all changes to take effect."
    
    # Record the current profile
    apply_profile "maximum"
}

# Extreme Kernel Hardening (highest security, may break functionality)
enable_extreme_hardening() {
    echo "[+] Extreme Kernel Hardening is Starting..."
    echo "[!] WARNING: This will significantly restrict system functionality!"
    echo "[!] This profile is ONLY recommended for high-security environments."
    read -p "Are you sure you want to continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "[*] Extreme hardening cancelled."
        return 0
    fi
    
    # Setup and backup
    setup_environment
    backup_config
    check_dependencies
    
    # Create the extreme hardening config
    cat <<EOF > /etc/sysctl.d/99-securonis-hardening.conf
# Maximum IPv4 Network Security - Safe settings
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_max_tw_buckets = 1440000

# Enhanced Memory Protection - Safe settings
kernel.randomize_va_space = 2
vm.mmap_min_addr = 65536
vm.swappiness = 10
vm.dirty_ratio = 20
vm.dirty_background_ratio = 10

# Enhanced Kernel Security - Safe settings
kernel.kptr_restrict = 1
kernel.dmesg_restrict = 1
kernel.unprivileged_bpf_disabled = 1
kernel.perf_event_paranoid = 2
kernel.yama.ptrace_scope = 1
kernel.sysrq = 176
kernel.kexec_load_disabled = 1
kernel.unprivileged_userns_clone = 0
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
dev.tty.ldisc_autoload = 0

# IPv6 Security - Safer settings but not completely disabled
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0
EOF

    # Apply settings
    sysctl --system

    # Set very restrictive process limits
    cat <<EOF > /etc/security/limits.d/99-security-extreme.conf
* hard core 0
* soft nproc 500
* hard nproc 800
* soft nofile 1024
* hard nofile 2048
EOF

    # Disable uncommon filesystems - Keeping essential ones
    cat <<EOF > /etc/modprobe.d/uncommon-fs.conf
install cramfs /bin/true
install freevxfs /bin/true
install jffs2 /bin/true
install hfs /bin/true
install hfsplus /bin/true
# Keeping squashfs enabled for compatibility with some systems
# Keeping udf enabled for DVD/optical media support
EOF

    # Disable uncommon network protocols
    cat <<EOF > /etc/modprobe.d/uncommon-net.conf
install dccp /bin/true
install sctp /bin/true
install rds /bin/true
install tipc /bin/true
install n-hdlc /bin/true
install ax25 /bin/true
install netrom /bin/true
install x25 /bin/true
install rose /bin/true
install decnet /bin/true
install econet /bin/true
install af_802154 /bin/true
install ipx /bin/true
install appletalk /bin/true
install psnap /bin/true
install p8023 /bin/true
install p8022 /bin/true
install can /bin/true
install atm /bin/true
EOF

    echo "[+] Extreme Kernel Hardening Completed."
    echo "[!] WARNING: Many system features may now be restricted or disabled."
    echo "[!] A system reboot is REQUIRED for all changes to take effect."
    echo "[!] Some applications may no longer function as expected."
    
    # Record the current profile
    apply_profile "extreme"
}

# Restore Default Kernel Settings
restore_default_kernel_settings() {
    echo "[!] Restoring default kernel settings..."
    
    # Remove custom hardening settings
    rm -f /etc/sysctl.d/99-securonis-hardening.conf
    rm -f /etc/security/limits.d/99-security.conf
    rm -f /etc/security/limits.d/99-performance.conf
    rm -f /etc/security/limits.d/99-security-extreme.conf
    rm -f /etc/modprobe.d/uncommon-fs.conf
    rm -f /etc/modprobe.d/uncommon-net.conf

    # Apply default settings
    sysctl --system
    
    # Remove current profile info
    if [ -f "/etc/securonis/hardening_profile" ]; then
        rm -f /etc/securonis/hardening_profile
    fi

    echo "[✔] Default kernel settings have been restored!"
    echo "[*] A system reboot is recommended for all changes to take effect."
    
    # Update profile status
    CURRENT_PROFILE="none"
}

# Enable Firewall
enable_firewall() {
    echo "[+] Enabling firewall..."
    
    # Check if UFW is installed
    if ! command -v ufw >/dev/null 2>&1; then
        echo "[!] UFW is not installed"
        read -p "Would you like to install UFW? (y/n): " install_ufw
        if [ "$install_ufw" == "y" ]; then
            apt-get update
            apt-get install -y ufw
        else
            echo "[!] Cannot proceed without UFW"
            return 1
        fi
    fi
    

    ufw default deny incoming
    ufw default allow outgoing
    

    ufw allow ssh
    

    echo "y" | ufw enable
    

    if ufw status | grep -q "Status: active"; then
        echo "[✔] Firewall enabled and configured!"
    else
        echo "[!] Failed to enable firewall"
        return 1
    fi
}


disable_firewall() {
    echo "[!] Disabling firewall..."
    sudo ufw disable
    echo "[✔] Firewall disabled!"
}

# Check Firewall Status
check_firewall_status() {
    echo "[*] Checking firewall status..."
    sudo ufw status 
}


while true; do
    menu
    read -p "Enter your choice: " choice

    case $choice in
        1) enable_standard_hardening ;;
        2) enable_performance_hardening ;;
        3) enable_maximum_hardening ;;
        4) enable_extreme_hardening ;;
        5) restore_default_kernel_settings ;;
        6) enable_firewall ;;
        7) disable_firewall ;;
        8) check_firewall_status ;;
        9) show_help ;;
        0) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice! Please select a valid option.";;
    esac

    echo -e "\nPress any key to continue..."
    read -n 1 -s -r
done
