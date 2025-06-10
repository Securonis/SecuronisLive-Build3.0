#!/bin/bash

# SECURONIS LINUX - PARANOIA MODE 
# This script enables extreme security measures by blocking all external connections,
# raising kernel security levels, and cutting network connections.

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please use sudo."
    exit 1
 fi


display_banner() {
    clear
    cat << "EOF"
============================================================
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡖⠁⠀⠀⠀⠀⠀⠀⠈⢲⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣼⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣧⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣸⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⢀⣀⣤⣤⣤⣤⣀⡀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣔⢿⡿⠟⠛⠛⠻⢿⡿⣢⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣤⣶⣾⣿⣿⣿⣷⣤⣀⡀⢀⣀⣤⣾⣿⣿⣿⣷⣶⣤⡀⠀⠀⠀⠀
⠀⠀⢠⣾⣿⡿⠿⠿⠿⣿⣿⣿⣿⡿⠏⠻⢿⣿⣿⣿⣿⠿⠿⠿⢿⣿⣷⡀⠀⠀ 
⠀⢠⡿⠋⠁⠀⠀⢸⣿⡇⠉⠻⣿⠇⠀⠀⠸⣿⡿⠋⢰⣿⡇⠀⠀⠈⠙⢿⡄⠀
⠀⡿⠁⠀⠀⠀⠀⠘⣿⣷⡀⠀⠰⣿⣶⣶⣿⡎⠀⢀⣾⣿⠇⠀⠀⠀⠀⠈⢿⠀
⠀⡇⠀⠀⠀⠀⠀⠀⠹⣿⣷⣄⠀⣿⣿⣿⣿⠀⣠⣾⣿⠏⠀⠀⠀⠀⠀⠀⢸⠀
⠀⠁⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⢇⣿⣿⣿⣿⡸⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠈⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣿⣿⣿⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠐⢤⣀⣀⢀⣀⣠⣴⣿⣿⠿⠋⠙⠿⣿⣿⣦⣄⣀⠀⠀⣀⡠⠂⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠛⠛⠛⠛⠉⠀⠀⠀⠀⠀⠈⠉⠛⠛⠛⠛⠋⠁⠀⠀⠀⠀⠀
============================================================
This utility will implement extreme security measures that
isolate your system from all external connections.
EOF

    # Display current status prominently
    if [ -f /etc/securonis/paranoia_mode_enabled ]; then
        echo "============================================================"
        echo "             [!] PARANOIA MODE: ACTIVE [!]                 "
        echo "============================================================"
    else
        echo "============================================================"
        echo "             [*] PARANOIA MODE: INACTIVE [*]               "
        echo "============================================================"
    fi
    echo
}

# Function to enable paranoia mode
enable_paranoia_mode() {
    echo "Enabling Paranoia Mode..."
    echo "This will disconnect your system from all networks and block all connections."
    echo
    
    # Save current firewall state
    echo "Saving current firewall state..."
    mkdir -p /etc/securonis/backup
    iptables-save > /etc/securonis/backup/iptables-backup.rules
    ip6tables-save > /etc/securonis/backup/ip6tables-backup.rules
    
    # Block all incoming and outgoing connections
    echo "Setting up strict firewall rules..."
    
    # Flush existing rules
    iptables -F
    iptables -X
    ip6tables -F
    ip6tables -X
    
    # Set default policies to DROP
    iptables -P INPUT DROP
    iptables -P FORWARD DROP
    iptables -P OUTPUT DROP
    ip6tables -P INPUT DROP
    ip6tables -P FORWARD DROP
    ip6tables -P OUTPUT DROP
    
    # Allow loopback
    iptables -A INPUT -i lo -j ACCEPT
    iptables -A OUTPUT -o lo -j ACCEPT
    ip6tables -A INPUT -i lo -j ACCEPT
    ip6tables -A OUTPUT -o lo -j ACCEPT
    
    echo "Firewall configured to block all external connections."
    
    # Disable network interfaces
    echo "Disabling all network interfaces..."
    for iface in $(ip -o link show | awk -F': ' '{print $2}' | grep -v 'lo'); do
        ip link set $iface down
        echo "Disabled interface: $iface"
    done
    
    # Harden kernel parameters
    echo "Hardening kernel security parameters..."
    
    # Create backup of sysctl.conf
    cp /etc/sysctl.conf /etc/securonis/backup/sysctl.conf.backup
    
    # Apply kernel hardening
    cat > /etc/sysctl.d/99-securonis-paranoia.conf << EOF
# Kernel hardening parameters

# Restrict dmesg access
kernel.dmesg_restrict = 1

# Restrict kernel pointers
kernel.kptr_restrict = 2

# Disable unprivileged user namespaces
kernel.unprivileged_userns_clone = 0

# Disable SysRq key
kernel.sysrq = 0

# Protect against core dumps
fs.suid_dumpable = 0

# Restrict ptrace scope
kernel.yama.ptrace_scope = 3

# Disable IPv4 forwarding
net.ipv4.ip_forward = 0

# Disable IPv6
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1

# Protect against IP spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP requests
net.ipv4.icmp_echo_ignore_all = 1
net.ipv6.icmp.echo_ignore_all = 1

# Ignore broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Disable TCP timestamps
net.ipv4.tcp_timestamps = 0

# Enable TCP SYN cookies
net.ipv4.tcp_syncookies = 1

# Disable SACK
net.ipv4.tcp_sack = 0

# Disable TCP window scaling
net.ipv4.tcp_window_scaling = 0
EOF
    
    # Apply sysctl changes
    sysctl -p /etc/sysctl.d/99-securonis-paranoia.conf
    
    # Disable potentially vulnerable services
    echo "Disabling potentially vulnerable services..."
    for service in avahi-daemon cups bluetooth NetworkManager wpa_supplicant dhcpcd dhclient; do
        systemctl stop $service 2>/dev/null
        systemctl mask $service 2>/dev/null
        echo "Stopped and masked service: $service"
    done
    
    # Kill all network-related processes
    echo "Terminating network-related processes..."
    pkill -9 firefox 2>/dev/null
    pkill -9 chrome 2>/dev/null
    pkill -9 chromium 2>/dev/null
    pkill -9 thunderbird 2>/dev/null
    pkill -9 transmission 2>/dev/null
    pkill -9 wget 2>/dev/null
    pkill -9 curl 2>/dev/null
    
    # Create paranoia mode status file
    touch /etc/securonis/paranoia_mode_enabled
    
    echo
    echo "Paranoia Mode successfully enabled."
    echo "Your system is now isolated from all networks and external connections."
    echo "Kernel security has been maximized."
    echo
    read -p "Press Enter to return to the menu..."
}

# Function to disable paranoia mode
disable_paranoia_mode() {
    echo "Disabling Paranoia Mode..."
    echo
    
    # Check if paranoia mode is enabled
    if [ ! -f /etc/securonis/paranoia_mode_enabled ]; then
        echo "Paranoia Mode is not currently enabled."
        read -p "Press Enter to return to the menu..."
        return
    fi
    
    # Restore firewall rules
    echo "Restoring firewall rules..."
    if [ -f /etc/securonis/backup/iptables-backup.rules ]; then
        iptables-restore < /etc/securonis/backup/iptables-backup.rules
        echo "IPv4 firewall rules restored."
    fi
    
    if [ -f /etc/securonis/backup/ip6tables-backup.rules ]; then
        ip6tables-restore < /etc/securonis/backup/ip6tables-backup.rules
        echo "IPv6 firewall rules restored."
    fi
    
    # Re-enable network interfaces
    echo "Re-enabling network interfaces..."
    for iface in $(ip -o link show | awk -F': ' '{print $2}' | grep -v 'lo'); do
        ip link set $iface up
        echo "Enabled interface: $iface"
    done
    
    # Restore kernel parameters
    echo "Restoring kernel security parameters..."
    if [ -f /etc/securonis/backup/sysctl.conf.backup ]; then
        cp /etc/securonis/backup/sysctl.conf.backup /etc/sysctl.conf
        rm -f /etc/sysctl.d/99-securonis-paranoia.conf
        sysctl -p
        echo "Kernel parameters restored."
    fi
    
    # Re-enable services
    echo "Re-enabling system services..."
    for service in NetworkManager wpa_supplicant dhcpcd avahi-daemon cups bluetooth; do
        systemctl unmask $service 2>/dev/null
        systemctl start $service 2>/dev/null
        echo "Started service: $service"
    done
    
    # Remove paranoia mode status file
    rm -f /etc/securonis/paranoia_mode_enabled
    
    echo
    echo "Paranoia Mode successfully disabled."
    echo "Your system has been returned to normal operation."
    echo "Network connections have been restored."
    echo
    read -p "Press Enter to return to the menu..."
}

# Main menu loop
while true; do
    display_banner
    echo
    
    echo "Select an option:"
    echo "1) Enable Paranoia Mode"
    echo "2) Disable Paranoia Mode"
    echo "3) Exit"
    echo
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            enable_paranoia_mode
            ;;
        2)
            disable_paranoia_mode
            ;;
        3)
            echo "Exiting Paranoia Mode utility."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            sleep 2
            ;;
    esac
done
