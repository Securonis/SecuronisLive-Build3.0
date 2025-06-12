#!/usr/bin/env python3
# OpenMammoth-Lite - Simple Network Security Tool

from scapy.all import sniff, IP, TCP, UDP, ICMP
from collections import defaultdict
import time, os, threading, atexit, signal
import subprocess
import argparse
import re
import datetime
import platform

# Colors for terminal output
COLORS = {
    'red': '\033[91m',
    'green': '\033[92m',
    'yellow': '\033[93m',
    'blue': '\033[94m',
    'magenta': '\033[95m',
    'cyan': '\033[96m',
    'white': '\033[97m',
    'reset': '\033[0m'
}

# Attack detection counters and settings
syn_counts = defaultdict(lambda: [0, time.time(), []])
connection_attempts = defaultdict(lambda: [set(), time.time(), {}])
icmp_flood_counts = defaultdict(lambda: [0, time.time()])
udp_flood_counts = defaultdict(lambda: [0, time.time(), 0])  # [count, last_time, total_bytes]
http_flood_counts = defaultdict(lambda: [0, time.time(), set()])  # [count, last_time, user_agents]
authentication_failures = defaultdict(lambda: [0, time.time()])

# Advanced attack detection counters
dns_amp_counts = defaultdict(lambda: [0, time.time(), 0])  # [count, last_time, total_bytes]
arp_spoofing_attempts = defaultdict(lambda: [set(), time.time()])  # [claimed_macs, last_time]
ssl_attacks = defaultdict(lambda: [0, time.time(), set()])  # [count, last_time, ssl_versions]
brute_force_attempts = defaultdict(lambda: [{}, time.time()])  # [user_attempts, last_time]

# Global settings
blocklist = set()
BLOCK_THRESHOLD = 100         # SYN floods
PORT_SCAN_THRESHOLD = 20      # Port scans
ICMP_FLOOD_THRESHOLD = 50     # ICMP/ping floods
UDP_FLOOD_THRESHOLD = 100     # UDP floods
HTTP_FLOOD_THRESHOLD = 50     # HTTP floods (same IP, port 80/443)
AUTH_FAILURE_THRESHOLD = 5    # Authentication failures
DNS_AMP_THRESHOLD = 15       # DNS amplification attacks
ARPSPOOF_MAC_THRESHOLD = 2   # ARP spoofing (multiple MACs for same IP)
SSL_SCAN_THRESHOLD = 5       # SSL scans or downgrade attempts
BRUTE_FORCE_THRESHOLD = 10   # Brute force login attempts
TIME_WINDOW = 60             # Time window for rate-based detection (seconds)
FINSCAN_THRESHOLD = 10       # FIN scan detection
XMAS_THRESHOLD = 8           # XMAS scan detection
NULLSCAN_THRESHOLD = 8       # NULL scan detection

# Local network settings
TRUST_LOCAL_NETWORK = True   # Set to False if you want to monitor local network too
# Use super robust iptables commands that avoid bad rule errors
BLOCK_COMMAND = "iptables -C INPUT -s {} -j DROP 2>/dev/null || iptables -A INPUT -s {} -j DROP 2>/dev/null"
BLOCK_COMMAND_FALLBACK = "iptables -C INPUT -s {} -j REJECT 2>/dev/null || iptables -I INPUT -s {} -j REJECT 2>/dev/null"
# Direct command versions for subprocess use
DIRECT_DROP_COMMAND = ["iptables", "-A", "INPUT", "-s", "{}", "-j", "DROP"]
DIRECT_REJECT_COMMAND = ["iptables", "-I", "INPUT", "-s", "{}", "-j", "REJECT"]
IP_TIMEOUT = 300  # seconds
BLOCKLIST_FILE = "/var/log/openmammoth_lite.blocklist"
LOG_FILE = "/var/log/openmammoth_lite.log"

# Global monitoring state
monitoring_active = False
detection_running = False
whitelist = set(['127.0.0.1', '192.168.1.1'])  # Default whitelist
selected_interface = None  # Selected network interface
program_start_time = time.time()  # Program start time

def detect_tor_connection():
    """Detect if Tor is running on the system using multiple detection methods"""
    tor_detected = False
    detection_messages = []
    
    # Method 1: Check using systemctl if available (most reliable)
    try:
        # Check for tor.service
        systemctl_output = subprocess.run(["systemctl", "is-active", "tor.service"], 
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        if systemctl_output.stdout.strip() == "active":
            detection_messages.append(f"{COLORS['yellow']}[!] Tor service is active (systemctl reports tor.service running){COLORS['reset']}")
            tor_detected = True
    except Exception:
        pass
        
    # Try again with just "tor" instead of "tor.service"
    if not tor_detected:
        try:
            systemctl_output = subprocess.run(["systemctl", "is-active", "tor"], 
                                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
            if systemctl_output.stdout.strip() == "active":
                detection_messages.append(f"{COLORS['yellow']}[!] Tor service is active (systemctl reports tor running){COLORS['reset']}")
                tor_detected = True
        except Exception:
            pass
        
    # Method 2: Check running processes for 'tor' using 'ps'
    if not tor_detected:
        try:
            ps_output = subprocess.run(["ps", "aux"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
            output_text = ps_output.stdout.lower()
            if "tor " in output_text or "/tor" in output_text:
                detection_messages.append(f"{COLORS['yellow']}[!] Tor process found in running processes{COLORS['reset']}")
                tor_detected = True
        except Exception:
            pass
            
    # Method 3: Check for open Tor ports using netstat
    # Tor default ports: 9050 (SOCKS), 9051 (Control), 9150 (Browser Bundle)
    if not tor_detected:
        try:
            netstat_output = subprocess.run(["netstat", "-tunlp"], 
                                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
            output_text = netstat_output.stdout
            if ":9050" in output_text or ":9051" in output_text or ":9150" in output_text:
                detection_messages.append(f"{COLORS['yellow']}[!] Tor network ports detected (9050/9051/9150){COLORS['reset']}")
                tor_detected = True
        except Exception:
            pass
    
    # Method 4: Check if we can connect to the Tor SOCKS port
    if not tor_detected:
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            result = s.connect_ex(('127.0.0.1', 9050))
            s.close()
            if result == 0:
                detection_messages.append(f"{COLORS['yellow']}[!] Tor SOCKS port 9050 is open and accepting connections{COLORS['reset']}")
                tor_detected = True
        except Exception:
            pass
    
    # Print all detection messages
    for message in detection_messages:
        print(message)
        
    if tor_detected:
        print(f"{COLORS['yellow']}[!] TOR NETWORK DETECTED! This may conflict with iptables rules.{COLORS['reset']}")
        return True
        
    return False


def log_message(message, level="INFO"):
    """Log a message to the log file"""
    try:
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(LOG_FILE, "a") as f:
            f.write(f"[{timestamp}] [{level}] {message}\n")
    except Exception as e:
        print(f"{COLORS['red']}[!] Error writing to log file: {str(e)}{COLORS['reset']}")


def notify_block(ip, reason):
    """Notify and log when an IP is blocked"""
    message = f"Blocked IP: {ip} - Reason: {reason}"
    print(f"{COLORS['red']}[!] {message}{COLORS['reset']}")
    log_message(message, "BLOCK")

def is_private_ip(ip):
    """Check if an IP address is a private/local network address"""
    # RFC1918 private IP ranges
    private_ranges = [
        ('10.0.0.0', '10.255.255.255'),     # 10.0.0.0/8
        ('172.16.0.0', '172.31.255.255'),   # 172.16.0.0/12
        ('192.168.0.0', '192.168.255.255')  # 192.168.0.0/16
    ]
    
    # Convert IP string to integer for range comparison
    ip_parts = ip.split('.')
    if len(ip_parts) != 4:
        return False
        
    try:
        ip_int = (int(ip_parts[0]) << 24) + (int(ip_parts[1]) << 16) + \
                (int(ip_parts[2]) << 8) + int(ip_parts[3])
                
        # Check each private IP range
        for start_range, end_range in private_ranges:
            start_parts = start_range.split('.')
            start_int = (int(start_parts[0]) << 24) + (int(start_parts[1]) << 16) + \
                       (int(start_parts[2]) << 8) + int(start_parts[3])
                       
            end_parts = end_range.split('.')
            end_int = (int(end_parts[0]) << 24) + (int(end_parts[1]) << 16) + \
                     (int(end_parts[2]) << 8) + int(end_parts[3])
            
            if start_int <= ip_int <= end_int:
                return True
    except Exception:
        pass
        
    return False

def detect_attack(packet):
    """Detect various network attacks from packet analysis with enhanced detection logic"""
    global blocklist
    
    # Skip packets from whitelisted IPs
    if packet.haslayer(IP) and packet[IP].src in whitelist:
        return
        
    # Skip local network IPs ONLY if TRUST_LOCAL_NETWORK is enabled
    if packet.haslayer(IP) and is_private_ip(packet[IP].src) and TRUST_LOCAL_NETWORK:
        return
    
    now = time.time()
    
    # TCP-based attacks
    if packet.haslayer(IP) and packet.haslayer(TCP):
        src = packet[IP].src
        dst_port = packet[TCP].dport
        dst_ip = packet[IP].dst
        flags = packet[TCP].flags
        
        # Skip if already blocked
        if src in blocklist:
            return
            
        # Enhanced SYN Flood detection (rate-based) - Fix to properly distinguish from port scans
        if flags == 'S':
            # Record packet timestamp for rate analysis
            if len(syn_counts[src][2]) > 20:  # Keep only last 20 timestamps
                syn_counts[src][2].pop(0)
            syn_counts[src][2].append(now)
            
            syn_counts[src][0] += 1
            syn_counts[src][1] = now
            
            # Detect rapid SYN bursts - More aggressive detection for SYN floods
            if len(syn_counts[src][2]) >= 5:  # Need at least 5 samples
                time_window = max(0.1, syn_counts[src][2][-1] - syn_counts[src][2][0])  # Avoid division by zero
                rate = len(syn_counts[src][2]) / time_window
                
                # Check if this is likely a SYN flood rather than port scan
                # SYN floods typically target the same port repeatedly
                is_flood = False
                if len(connection_attempts[src][0]) < 5:  # Few unique ports = likely flood not scan
                    is_flood = True
                    
                # High rate of SYNs to one or few ports = SYN flood
                if rate > 10:  # More than 10 SYNs per second is suspicious
                    log_message(f"High-rate SYN from {src}: {rate:.2f}/sec to {len(connection_attempts[src][0])} ports", "WARNING")
                    if is_flood and syn_counts[src][0] > BLOCK_THRESHOLD/2:  # Lower threshold for confirmed floods
                        block_ip(src, f"SYN Flood Attack: {syn_counts[src][0]} SYNs at {rate:.1f}/sec")
                        return  # Prevent port scan detection for SYN floods
                        
            # Standard volume-based detection
            if syn_counts[src][0] > BLOCK_THRESHOLD:
                block_ip(src, f"SYN Flood Attack: {syn_counts[src][0]} attempts")
                return  # Prevent port scan detection for SYN floods

        # Advanced Port Scan detection
        connection_attempts[src][0].add(dst_port)
        connection_attempts[src][1] = now
        
        # Track per-port scan frequency
        if dst_port not in connection_attempts[src][2]:
            connection_attempts[src][2][dst_port] = 1
        else:
            connection_attempts[src][2][dst_port] += 1
            
        # More sophisticated port scan detection
        unique_ports = len(connection_attempts[src][0])
        if unique_ports > PORT_SCAN_THRESHOLD:
            # Calculate sequential port ratio
            sorted_ports = sorted(list(connection_attempts[src][0]))
            sequential = 0
            for i in range(1, len(sorted_ports)):
                if sorted_ports[i] == sorted_ports[i-1] + 1:
                    sequential += 1
            
            seq_ratio = sequential / max(len(sorted_ports) - 1, 1)
            scan_type = "Random Port Scan"
            if seq_ratio > 0.7:
                scan_type = "Sequential Port Scan"
                
            block_ip(src, f"{scan_type}: {unique_ports} ports probed")
        
        # FIN Scan detection (flags = FIN only)
        if flags == 'F':
            if 'finscan' not in connection_attempts[src][2]:
                connection_attempts[src][2]['finscan'] = 1
            else:
                connection_attempts[src][2]['finscan'] += 1
                
            if connection_attempts[src][2]['finscan'] > FINSCAN_THRESHOLD:
                block_ip(src, "FIN Scan Attack")
                
        # XMAS Scan detection (flags = FIN, PSH, URG)
        if flags == 'FPU':
            if 'xmasscan' not in connection_attempts[src][2]:
                connection_attempts[src][2]['xmasscan'] = 1
            else:
                connection_attempts[src][2]['xmasscan'] += 1
                
            if connection_attempts[src][2]['xmasscan'] > XMAS_THRESHOLD:
                block_ip(src, "XMAS Scan Attack")
        
        # NULL Scan detection (no flags)
        if flags == '':
            if 'nullscan' not in connection_attempts[src][2]:
                connection_attempts[src][2]['nullscan'] = 1
            else:
                connection_attempts[src][2]['nullscan'] += 1
                
            if connection_attempts[src][2]['nullscan'] > NULLSCAN_THRESHOLD:
                block_ip(src, "NULL Scan Attack")
        
        # Enhanced HTTP Flood detection (DOS)
        if dst_port in (80, 443, 8080):
            http_flood_counts[src][0] += 1
            http_flood_counts[src][1] = now
            
            # Extract and track HTTP User-Agent (if present in payload)
            if packet.haslayer('Raw'):
                payload = str(packet['Raw'].load)
                user_agent = re.search(r'User-Agent: (.*?)\\r\\n', payload)
                if user_agent:
                    http_flood_counts[src][2].add(user_agent.group(1))
                    
            # Detect DoS with multiple user agents or high request rate
            if http_flood_counts[src][0] > HTTP_FLOOD_THRESHOLD:
                reason = "HTTP Flood Attack"
                if len(http_flood_counts[src][2]) > 5:  # Multiple user agents
                    reason += " with multiple User-Agents"
                block_ip(src, reason)
                
        # SSL/TLS Attack detection
        if dst_port == 443 and packet.haslayer('Raw'):
            ssl_attacks[src][0] += 1
            ssl_attacks[src][1] = now
            
            payload = str(packet['Raw'].load)
            
            # Check for SSL/TLS version indicators
            if b'\x03\x00' in packet['Raw'].load:  # SSLv3
                ssl_attacks[src][2].add('SSLv3')
            if b'\x03\x01' in packet['Raw'].load:  # TLSv1.0
                ssl_attacks[src][2].add('TLSv1.0')
                
            # Check for downgrade attempts or version scanning
            if len(ssl_attacks[src][2]) >= SSL_SCAN_THRESHOLD:
                block_ip(src, f"SSL/TLS version scanning detected ({len(ssl_attacks[src][2])} versions)")
                
    # Enhanced ICMP flood detection (Ping flood)
    if packet.haslayer(IP) and packet.haslayer(ICMP):
        src = packet[IP].src
        if src in blocklist:
            return
            
        icmp_flood_counts[src][0] += 1
        icmp_flood_counts[src][1] = now
        
        # Check both count and rate
        if icmp_flood_counts[src][0] > ICMP_FLOOD_THRESHOLD:
            block_ip(src, f"ICMP/Ping Flood Attack: {icmp_flood_counts[src][0]} packets")
    
    # Enhanced UDP flood detection
    if packet.haslayer(IP) and packet.haslayer(UDP):
        src = packet[IP].src
        dst_port = packet[UDP].dport
        
        if src in blocklist:
            return
            
        udp_flood_counts[src][0] += 1
        udp_flood_counts[src][1] = now
        
        # Calculate total bytes as well
        if packet.haslayer('Raw'):
            udp_flood_counts[src][2] += len(packet['Raw'].load)
        
        # DNS Amplification detection
        if dst_port == 53 and packet.haslayer('Raw'):
            dns_amp_counts[src][0] += 1
            dns_amp_counts[src][1] = now
            
            if packet.haslayer('Raw'):
                dns_amp_counts[src][2] += len(packet['Raw'].load)
                
            # DNS query amplification - looking for suspicious DNS traffic
            if dns_amp_counts[src][0] > DNS_AMP_THRESHOLD:
                # High number of DNS queries
                block_ip(src, f"DNS Amplification Attack: {dns_amp_counts[src][0]} queries")
        
        # Standard UDP flood
        if udp_flood_counts[src][0] > UDP_FLOOD_THRESHOLD:
            flood_size = "unknown"
            if udp_flood_counts[src][2] > 0:
                flood_size = f"{udp_flood_counts[src][2]/1024:.2f} KB"
                
            block_ip(src, f"UDP Flood Attack: {udp_flood_counts[src][0]} packets ({flood_size})")

def block_ip(ip, reason):
    """Block an IP address using iptables with maximum reliability"""
    if ip in whitelist:
        log_message(f"Attempted to block whitelisted IP {ip}", "WARNING")
        return
        
    if ip in blocklist:
        return  # Already blocked
        
    # Only skip blocking private IPs if TRUST_LOCAL_NETWORK is enabled
    if is_private_ip(ip) and TRUST_LOCAL_NETWORK:
        log_message(f"Not blocking local network IP: {ip} (Local Network Trust is enabled)", "INFO")
        return
    elif is_private_ip(ip) and not TRUST_LOCAL_NETWORK:
        log_message(f"Blocking local network IP: {ip} (Local Network Trust is disabled)", "WARNING")
    
    blocking_success = False
    
    try:
        # Validate IP address format before blocking
        if not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip):
            log_message(f"Invalid IP format, not blocking: {ip}", "WARNING")
            return
        
        # APPROACH 1: Try using subprocess directly with DROP action (most reliable)
        try:
            # First check if rule already exists to avoid duplicates
            check_cmd = ["iptables", "-C", "INPUT", "-s", ip, "-j", "DROP"]
            check_result = subprocess.run(check_cmd, 
                                        stdout=subprocess.DEVNULL,
                                        stderr=subprocess.DEVNULL)
            
            # Rule doesn't exist, add it
            if check_result.returncode != 0:
                add_cmd = ["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"]
                subprocess.run(add_cmd, check=True, 
                              stdout=subprocess.DEVNULL,
                              stderr=subprocess.DEVNULL)
            
            # Success either way
            blocking_success = True
        except Exception as e1:
            log_message(f"First blocking method failed for {ip}: {str(e1)}", "WARNING")
            
        # APPROACH 2: Try shell command with redirection if first approach failed
        if not blocking_success:
            try:
                block_cmd = BLOCK_COMMAND.format(ip, ip)
                os.system(block_cmd)
                # Check if rule got added successfully
                check_cmd = ["iptables", "-C", "INPUT", "-s", ip, "-j", "DROP"]
                check_result = subprocess.run(check_cmd, 
                                            stdout=subprocess.DEVNULL, 
                                            stderr=subprocess.DEVNULL)
                if check_result.returncode == 0:
                    blocking_success = True
            except Exception as e2:
                log_message(f"Second blocking method failed for {ip}: {str(e2)}", "WARNING")
                
        # APPROACH 3: Try REJECT action as last resort
        if not blocking_success:
            try:
                # Try adding rule with REJECT instead of DROP
                check_cmd = ["iptables", "-C", "INPUT", "-s", ip, "-j", "REJECT"]
                check_result = subprocess.run(check_cmd, 
                                            stdout=subprocess.DEVNULL, 
                                            stderr=subprocess.DEVNULL)
                
                # Rule doesn't exist, add it
                if check_result.returncode != 0:
                    add_cmd = ["iptables", "-I", "INPUT", "-s", ip, "-j", "REJECT"]
                    subprocess.run(add_cmd, check=True, 
                                 stdout=subprocess.DEVNULL, 
                                 stderr=subprocess.DEVNULL)
                
                # Success either way
                blocking_success = True
            except Exception as e3:
                log_message(f"All blocking methods failed for {ip}: {str(e3)}", "ERROR")
        
        # APPROACH 4: If all else failed, try using iptables-save/restore
        if not blocking_success:
            try:
                # Save current rules
                temp_rules = "/tmp/iptables_rules_temp"
                os.system(f"iptables-save > {temp_rules}")
                
                # Append our rule and restore
                with open(temp_rules, "a") as f:
                    f.write(f"-A INPUT -s {ip} -j DROP\n")
                    
                os.system(f"iptables-restore < {temp_rules}")
                os.remove(temp_rules)
                
                # Verify it worked
                check_cmd = ["iptables", "-C", "INPUT", "-s", ip, "-j", "DROP"]
                check_result = subprocess.run(check_cmd, 
                                           stdout=subprocess.DEVNULL, 
                                           stderr=subprocess.DEVNULL)
                if check_result.returncode == 0:
                    blocking_success = True
            except Exception as e4:
                log_message(f"Emergency blocking method failed for {ip}: {str(e4)}", "ERROR")
                
        # If any method succeeded, update the state
        if blocking_success:
            blocklist.add(ip)
            notify_block(ip, reason)
            log_block(ip, reason)
            return True
        else:
            log_message(f"All blocking attempts failed for {ip}", "ERROR")
            return False
                
    except Exception as e:
        log_message(f"Error in IP blocking logic: {str(e)}", "ERROR")
        return False


def log_block(ip, reason):
    """Save blocked IP to blocklist file"""
    try:
        os.makedirs(os.path.dirname(BLOCKLIST_FILE), exist_ok=True)
        with open(BLOCKLIST_FILE, "a") as f:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"{ip},{timestamp},{reason}\n")
    except Exception as e:
        log_message(f"Error writing to blocklist file: {str(e)}", "ERROR")


def load_blocklist():
    """Load previously blocked IPs from file"""
    try:
        if os.path.exists(BLOCKLIST_FILE):
            with open(BLOCKLIST_FILE, "r") as f:
                for line in f:
                    parts = line.strip().split(",")
                    if parts and parts[0] and parts[0] not in blocklist:
                        blocklist.add(parts[0])
                        # Re-apply the block
                        os.system(BLOCK_COMMAND.format(parts[0]))
            log_message(f"Loaded {len(blocklist)} IPs from blocklist file")
    except Exception as e:
        log_message(f"Error loading blocklist: {str(e)}", "ERROR")


def cleanup():
    """Clean up stale entries from tracking dictionaries"""
    while True:
        time.sleep(60)
        now = time.time()
        
        # Clean up all tracking dictionaries
        dictionaries = [
            syn_counts, 
            connection_attempts,
            icmp_flood_counts,
            udp_flood_counts,
            http_flood_counts,
            authentication_failures
        ]
        
        for dictionary in dictionaries:
            for ip in list(dictionary):
                if now - dictionary[ip][1] > IP_TIMEOUT:
                    del dictionary[ip]
        
        log_message(f"Cleanup completed", "DEBUG")


def cleanup_firewall():
    """Clean up iptables rules when shutting down"""
    print(f"{COLORS['yellow']}[*] IDS shutting down, cleaning up iptables rules...{COLORS['reset']}")
    for ip in blocklist:
        os.system(f"iptables -D INPUT -s {ip} -j DROP")
    log_message("Firewall cleanup complete", "INFO")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        # Check iptables
        subprocess.check_output(["iptables", "-V"])
        
        # Check if running as root
        if os.geteuid() != 0:
            print(f"{COLORS['red']}[!] This tool needs to run as root!{COLORS['reset']}")
            print(f"    Please run with: sudo python3 {os.path.basename(__file__)}")
            return False
            
        return True
    except Exception as e:
        print(f"{COLORS['red']}[!] Error checking dependencies: {str(e)}{COLORS['reset']}")
        print(f"    Please make sure iptables is installed.")
        return False


def start_monitoring():
    """Start network monitoring"""
    global monitoring_active, sniff_thread
    
    # Force interface selection before monitoring
    if not selected_interface:
        print(f"{COLORS['yellow']}[!] You need to select a network interface before monitoring.{COLORS['reset']}")
        input("Press Enter to select an interface...")
        select_network_interface()
        if not selected_interface:  # User cancelled interface selection
            return
    
    if not monitoring_active:
        # Initial attack checks - Run with foreground detection
        print(f"{COLORS['cyan']}[*] Performing initial security checks...{COLORS['reset']}")
        is_tor_running = detect_tor_connection()
        if is_tor_running:
            print(f"{COLORS['red']}[!] IMPORTANT: Tor network detected! Some firewall rules may not work correctly.{COLORS['reset']}")
            proceed = input("Do you want to continue anyway? (y/n): ")
            if proceed.lower() != 'y':
                print(f"{COLORS['yellow']}[*] Monitoring cancelled.{COLORS['reset']}")
                input("Press Enter to continue...")
                return
                
        if not TRUST_LOCAL_NETWORK:
            print(f"{COLORS['yellow']}[!] WARNING: Local Network Trust is disabled. Your local network devices may be blocked!{COLORS['reset']}")
            proceed = input("Do you want to continue anyway? (y/n): ")
            if proceed.lower() != 'y':
                print(f"{COLORS['yellow']}[*] Monitoring cancelled.{COLORS['reset']}")
                input("Press Enter to continue...")
                return
        
        monitoring_active = True
        print(f"{COLORS['green']}[+] Starting network monitoring on {selected_interface}...{COLORS['reset']}")
        
        # Start packet sniffing in a separate thread
        sniff_thread = threading.Thread(target=start_sniffing)
        sniff_thread.daemon = True
        sniff_thread.start()
        
        print(f"{COLORS['green']}[+] Monitoring started. Press Ctrl+C to return to menu.{COLORS['reset']}")
        input("Press Enter to return to menu...")
    else:
        print(f"{COLORS['yellow']}[!] Monitoring is already active{COLORS['reset']}")
        input("Press Enter to continue...")


def start_sniffing():
    """Start packet sniffing using Scapy"""
    global monitoring_active, selected_interface
    try:
        # Log the start of sniffing
        log_message(f"Starting packet sniffing on interface: {selected_interface}")
        
        # Start sniffing packets on the selected interface
        # The sniff function will continue until monitoring_active becomes False
        sniff(iface=selected_interface, 
              filter="ip", 
              prn=detect_attack, 
              store=0,
              stop_filter=lambda x: not monitoring_active)
              
    except Exception as e:
        log_message(f"Error in packet sniffing: {str(e)}", "ERROR")
        print(f"{COLORS['red']}[!] Sniffing error: {str(e)}{COLORS['reset']}")
        monitoring_active = False


def stop_monitoring():
    """Stop network monitoring"""
    global monitoring_active, detection_running
    
    if monitoring_active:
        print(f"{COLORS['yellow']}[*] Stopping network monitoring...{COLORS['reset']}")
        monitoring_active = False
        detection_running = False
        log_message("Network monitoring stopped")
        print(f"{COLORS['green']}[+] Monitoring stopped{COLORS['reset']}")
        input("Press Enter to continue...")
    else:
        print(f"{COLORS['yellow']}[*] Monitoring is not active{COLORS['reset']}")
        input("Press Enter to continue...")


def show_stats():
    """Show enhanced attack statistics"""
    print(f"{COLORS['cyan']}\n===== OpenMammoth-Lite Statistics ====={COLORS['reset']}")
    print(f"\n{COLORS['white']}General Statistics:{COLORS['reset']}")
    print(f"Blocked IPs: {len(blocklist)}")
    
    # Basic attack stats
    print(f"\n{COLORS['white']}Basic Attack Detection:{COLORS['reset']}")
    print(f"SYN Flood Attacks: {len([ip for ip in syn_counts if syn_counts[ip][0] > BLOCK_THRESHOLD])}")
    print(f"Port Scans: {len([ip for ip in connection_attempts if len(connection_attempts[ip][0]) > PORT_SCAN_THRESHOLD])}")
    print(f"ICMP Flood Attacks: {len([ip for ip in icmp_flood_counts if icmp_flood_counts[ip][0] > ICMP_FLOOD_THRESHOLD])}")
    print(f"UDP Flood Attacks: {len([ip for ip in udp_flood_counts if udp_flood_counts[ip][0] > UDP_FLOOD_THRESHOLD])}")
    print(f"HTTP Flood Attacks: {len([ip for ip in http_flood_counts if http_flood_counts[ip][0] > HTTP_FLOOD_THRESHOLD])}")
    
    # Advanced attack stats
    print(f"\n{COLORS['white']}Advanced Attack Detection:{COLORS['reset']}")
    print(f"DNS Amplification Attacks: {len([ip for ip in dns_amp_counts if dns_amp_counts[ip][0] > DNS_AMP_THRESHOLD])}")
    print(f"ARP Spoofing Attempts: {len([ip for ip in arp_spoofing_attempts if len(arp_spoofing_attempts[ip][0]) > ARPSPOOF_MAC_THRESHOLD])}")
    print(f"SSL/TLS Version Scans: {len([ip for ip in ssl_attacks if len(ssl_attacks[ip][2]) >= SSL_SCAN_THRESHOLD])}")
    
    # Stealth scan stats
    print(f"\n{COLORS['white']}Stealth Scan Detection:{COLORS['reset']}")
    fin_scans = 0
    xmas_scans = 0
    null_scans = 0
    
    for ip in connection_attempts:
        scan_data = connection_attempts[ip][2]
        if scan_data.get('finscan', 0) > FINSCAN_THRESHOLD: 
            fin_scans += 1
        if scan_data.get('xmasscan', 0) > XMAS_THRESHOLD: 
            xmas_scans += 1
        if scan_data.get('nullscan', 0) > NULLSCAN_THRESHOLD: 
            null_scans += 1
            
    print(f"FIN Scans: {fin_scans}")
    print(f"XMAS Scans: {xmas_scans}")
    print(f"NULL Scans: {null_scans}")
    
    # Performance stats
    stats = {
        "memory_entries": len(syn_counts) + len(connection_attempts) + len(icmp_flood_counts) + 
                         len(udp_flood_counts) + len(http_flood_counts) + len(dns_amp_counts) + 
                         len(ssl_attacks) + len(arp_spoofing_attempts),
    }
    
    print(f"\n{COLORS['white']}Performance:{COLORS['reset']}")
    print(f"Tracking {stats['memory_entries']} unique IPs")
    print(f"Running since: {datetime.datetime.fromtimestamp(program_start_time).strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Uptime: {int(time.time() - program_start_time)} seconds")
    
    # Show blocked IP details
    if blocklist:
        print(f"\n{COLORS['cyan']}===== Blocked IPs ====={COLORS['reset']}")
        
        try:
            with open(BLOCKLIST_FILE, "r") as f:
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) >= 3:
                        ip, timestamp, reason = parts[0], parts[1], parts[2]
                        print(f"{COLORS['red']}{ip}{COLORS['reset']} - {timestamp} - {reason}")
        except Exception:
            for ip in blocklist:
                print(f"{COLORS['red']}{ip}{COLORS['reset']}")
    
    # Log file size
    try:
        if os.path.exists(LOG_FILE):
            log_size = os.path.getsize(LOG_FILE) / 1024  # KB
            print(f"\nLog size: {log_size:.2f} KB")  
    except:
        pass


def manage_whitelist():
    """Manage IP whitelist"""
    while True:
        print(f"{COLORS['cyan']}\n===== IP Whitelist Management ====={COLORS['reset']}")
        print(f"\nCurrent whitelisted IPs: {len(whitelist)}")
        
        for ip in whitelist:
            print(f"- {ip}")
        
        print("\n1. Add IP to whitelist")
        print("2. Remove IP from whitelist")
        print("0. Back to main menu")
        
        choice = input("\nSelect an option: ")
        
        if choice == "1":
            ip = input("Enter IP address to whitelist: ")
            if ip and re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip):
                whitelist.add(ip)
                log_message(f"Added {ip} to whitelist")
                print(f"{COLORS['green']}[+] Added {ip} to whitelist{COLORS['reset']}")
            else:
                print(f"{COLORS['red']}[!] Invalid IP address format{COLORS['reset']}")
        elif choice == "2":
            ip = input("Enter IP address to remove from whitelist: ")
            if ip in whitelist:
                whitelist.remove(ip)
                log_message(f"Removed {ip} from whitelist")
                print(f"{COLORS['green']}[+] Removed {ip} from whitelist{COLORS['reset']}")
            else:
                print(f"{COLORS['red']}[!] IP not found in whitelist{COLORS['reset']}")
        elif choice == "0":
            break


def manage_blocklist():
    """Manage blocked IPs"""
    while True:
        print(f"{COLORS['cyan']}\n===== IP Blocklist Management ====={COLORS['reset']}")
        print(f"\nCurrent blocked IPs: {len(blocklist)}")
        
        # Show first 10 blocked IPs
        count = 0
        for ip in sorted(list(blocklist)):
            print(f"- {ip}")
            count += 1
            if count >= 10:
                print(f"... and {len(blocklist) - 10} more")
                break
        
        print("\n1. Block an IP manually")
        print("2. Unblock an IP")
        print("3. Export blocklist")
        print("0. Back to main menu")
        
        choice = input("\nSelect an option: ")
        
        if choice == "1":
            ip = input("Enter IP address to block: ")
            if ip and re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip):
                block_ip(ip, "Manual block")
                print(f"{COLORS['green']}[+] Blocked {ip}{COLORS['reset']}")
            else:
                print(f"{COLORS['red']}[!] Invalid IP address format{COLORS['reset']}")
        elif choice == "2":
            ip = input("Enter IP address to unblock: ")
            if ip in blocklist:
                blocklist.remove(ip)
                os.system(f"iptables -D INPUT -s {ip} -j DROP")
                log_message(f"Manually unblocked IP: {ip}")
                print(f"{COLORS['green']}[+] Unblocked {ip}{COLORS['reset']}")
            else:
                print(f"{COLORS['red']}[!] IP not found in blocklist{COLORS['reset']}")
        elif choice == "3":
            filename = input("Enter file path to export blocklist: ")
            try:
                with open(filename, "w") as f:
                    for ip in sorted(list(blocklist)):
                        f.write(f"{ip}\n")
                print(f"{COLORS['green']}[+] Exported {len(blocklist)} IPs to {filename}{COLORS['reset']}")
            except Exception as e:
                print(f"{COLORS['red']}[!] Error exporting blocklist: {str(e)}{COLORS['reset']}")
        elif choice == "0":
            break


def toggle_local_network_trust():
    """Toggle whether to trust (ignore) local network traffic"""
    global TRUST_LOCAL_NETWORK
    
    print(f"{COLORS['cyan']}\n===== Local Network Trust Settings ====={COLORS['reset']}")
    print("Current setting:")
    current_status = "Enabled" if TRUST_LOCAL_NETWORK else "Disabled"
    print(f"Trust local network IPs (ignore them in detection): {current_status}")
    
    choice = input("\nToggle setting? (y/n): ")
    if choice.lower() == 'y':
        TRUST_LOCAL_NETWORK = not TRUST_LOCAL_NETWORK
        new_status = "enabled" if TRUST_LOCAL_NETWORK else "disabled"
        print(f"{COLORS['green']}[+] Local network trust {new_status}. {COLORS['reset']}")
        if TRUST_LOCAL_NETWORK:
            print(f"{COLORS['yellow']}[*] IPs like 192.168.x.x, 10.x.x.x will be ignored in attack detection{COLORS['reset']}")
        else:
            print(f"{COLORS['red']}[*] All IPs will be monitored, including local network{COLORS['reset']}")
            print(f"{COLORS['red']}[*] WARNING: This may result in blocking your own devices!{COLORS['reset']}")
    
    input("Press Enter to continue...")


def select_network_interface():
    """Allow user to select a network interface for monitoring"""
    global selected_interface
    
    print(f"{COLORS['cyan']}\n===== Network Interface Selection ====={COLORS['reset']}")
    print("Available network interfaces:")
    
    interfaces = []
    try:
        # Get available interfaces using scapy's get_if_list
        from scapy.arch import get_if_list
        interfaces = get_if_list()
        
        if not interfaces:
            print(f"{COLORS['red']}[!] No network interfaces detected. This may be a permissions issue.{COLORS['reset']}")
            print(f"{COLORS['yellow']}[*] Try running the program with administrator/root privileges.{COLORS['reset']}")
            selected_interface = None
            input("Press Enter to continue...")
            return
        
        # List all interfaces with numbers
        for i, iface in enumerate(interfaces, 1):
            print(f"{i}. {iface}")
            
        print(f"Current interface: {selected_interface if selected_interface else 'None selected'}")
        
        # Let user select an interface
        while True:  # Keep asking until valid selection
            choice = input("\nSelect interface number: ")
            
            if choice.isdigit() and 1 <= int(choice) <= len(interfaces):
                selected_interface = interfaces[int(choice)-1]
                print(f"{COLORS['green']}[+] Selected interface: {selected_interface}{COLORS['reset']}")
                break
            else:
                print(f"{COLORS['red']}[!] Invalid choice. Please select a valid interface number.{COLORS['reset']}")
            
    except Exception as e:
        print(f"{COLORS['red']}[!] Error getting network interfaces: {str(e)}{COLORS['reset']}")
        print(f"{COLORS['yellow']}[*] Cannot proceed without selecting an interface{COLORS['reset']}")
    
    input("Press Enter to continue...")


def show_attack_statistics():
    """Alias for show_stats with improved formatting"""
    show_stats()
    

def display_banner():
    """Display ASCII art banner without syntax issues"""
    banner_lines = [
        "  ____                   __  __                                 _   _     ",
        " / __ \\                 |  \\/  |                               | | | |   ",
        "| |  | |_ __   ___ _ __ | \\  / | __ _ _ __ ___  _ __ ___   ___ | |_| |__  ",
        "| |  | | '_ \\ / _ \\ '_ \\| |\\/| |/ _` | '_ ` _ \\| '_ ` _ \\ / _ \\| __| '_ \\ ",
        "| |__| | |_) |  __/ | | | |  | | (_| | | | | | | | | | | | (_) | |_| | | |",
        " \\____/| .__/ \\___|_| |_|_|  |_|\\__,_|_| |_| |_|_| |_| |_|\\___/ \\__|_| |_|",
        "       | |                                                                ",
        "       |_|               L I T E  E D I T I O N                          "
    ]
    
    # Safe printing of banner
    print(f"{COLORS['cyan']}")
    for line in banner_lines:
        print(line)
    print(f"{COLORS['reset']}")
    
    # Subtitle without special characters
    print(f"{COLORS['yellow']}Network Security and Intrusion Detection System{COLORS['reset']}")
    print(f"Version 1.0 | Running as: {os.getlogin()}")
    print("--------------------------------------------------------")


def show_menu():
    """Show the main menu interface"""
    try:
        # Run Tor detection at startup
        if detect_tor_connection():
            input(f"{COLORS['red']}Tor network detected at startup! This may affect firewall functionality.{COLORS['reset']}\nPress Enter to continue...")
    except Exception as e:
        # Silently handle any startup errors
        log_message(f"Tor detection error at startup: {str(e)}", "ERROR")
    
    while True:
        os.system('clear' if os.name == 'posix' else 'cls')
        
        # Display banner using the separate function
        display_banner()
        
        # Status info
        status = f"{COLORS['green']}ACTIVE{COLORS['reset']}" if monitoring_active else f"{COLORS['red']}INACTIVE{COLORS['reset']}"
        print(f"Monitoring Status: {status}")
        if selected_interface:
            print(f"Network Interface: {selected_interface}")
        print(f"Blocked IPs: {len(blocklist)}")
        print("--------------------------------------------------------")
        
        # Menu options
        print("\n1. Start Network Monitoring")
        print("2. Stop Network Monitoring")
        print("3. Show Attack Statistics")
        print("4. Manage IP Whitelist")
        print("5. Manage Blocked IPs")
        print("6. View System Logs")
        print("7. Select Network Interface")
        print("8. Toggle Local Network Trust")
        print("0. Exit")
        
        choice = input("\nSelect an option: ")
        
        if choice == "1":
            start_monitoring()
        elif choice == "2":
            stop_monitoring()
        elif choice == "3":
            show_attack_statistics()
            input("\nPress Enter to continue...")
        elif choice == "4":
            manage_whitelist()
        elif choice == "5":
            manage_blocklist()
        elif choice == "6":
            try:
                if os.path.exists(LOG_FILE):
                    print(f"{COLORS['cyan']}\n===== Log File Viewer ====={COLORS['reset']}")
                    print(f"Viewing: {LOG_FILE}\n")
                    print(f"{COLORS['yellow']}Select viewing option:{COLORS['reset']}")
                    print("1. View with cat (display entire file)")
                    print("2. View with less (scrollable view)")
                    print("3. View last 20 lines only")
                    print("4. Search logs for a keyword")
                    print("0. Return to main menu")
                    
                    log_choice = input("\nSelect option: ")
                    
                    if log_choice == "1":
                        # Use cat to display the entire file
                        os.system(f"cat {LOG_FILE}")
                    elif log_choice == "2":
                        # Use less for scrollable viewing
                        os.system(f"less {LOG_FILE}")
                    elif log_choice == "3":
                        # Show last 20 lines
                        os.system(f"tail -n 20 {LOG_FILE}")
                    elif log_choice == "4":
                        # Search logs for keyword
                        keyword = input("Enter search term: ")
                        os.system(f"grep -i '{keyword}' {LOG_FILE} | cat")
                    elif log_choice == "0":
                        continue
                    else:
                        print(f"{COLORS['red']}[!] Invalid option{COLORS['reset']}")
                else:
                    print(f"{COLORS['yellow']}[*] No log file found at {LOG_FILE}{COLORS['reset']}")
                input("\nPress Enter to continue...")
            except Exception as e:
                print(f"{COLORS['red']}[!] Error viewing logs: {str(e)}{COLORS['reset']}")
                input("\nPress Enter to continue...")
        elif choice == "7":
            select_network_interface()
        elif choice == "8":
            toggle_local_network_trust()
        elif choice == "0":
            if monitoring_active:
                confirm = input("Network monitoring is active. Are you sure you want to exit? (y/n): ")
                if confirm.lower() != 'y':
                    continue
            print(f"{COLORS['yellow']}[*] Exiting OpenMammoth-Lite{COLORS['reset']}")
            break
        else:
            print(f"{COLORS['red']}[!] Invalid option{COLORS['reset']}")
            time.sleep(1)


if __name__ == "__main__":
    # Initialize
    print(f"{COLORS['cyan']}[*] Starting OpenMammoth-Lite v1.0...{COLORS['reset']}")
    
    # Check dependencies
    if not check_dependencies():
        exit(1)
    
    # Check for Tor connections
    detect_tor_connection()
    
    # Load previously blocked IPs
    load_blocklist()
    
    try:
        # Launch the menu interface
        show_menu()
    except KeyboardInterrupt:
        print(f"\n{COLORS['yellow']}[*] Interrupted by user{COLORS['reset']}")
    except Exception as e:
        print(f"\n{COLORS['red']}[!] Error: {str(e)}{COLORS['reset']}")
    finally:
        # Ensure clean shutdown
        stop_monitoring()
        cleanup_firewall()
