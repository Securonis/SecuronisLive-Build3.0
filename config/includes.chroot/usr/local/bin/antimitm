#!/usr/bin/env python3

import os
import sys
import signal
import subprocess
import threading
import time
import argparse
import json
from datetime import datetime
from termcolor import colored
from tabulate import tabulate

# Dependency checking function
def check_dependencies():
    missing_packages = []
    
    try:
        import scapy.all as scapy
    except ImportError:
        missing_packages.append("scapy")
    
    try:
        from termcolor import colored
    except ImportError:
        missing_packages.append("termcolor")
    
    try:
        from tabulate import tabulate
    except ImportError:
        missing_packages.append("tabulate")
    
    if missing_packages:
        print("[!] Missing required packages. Please install the following:")
        for package in missing_packages:
            print(f"    - {package}")
        print("\nInstallation command: apt-get install python3-pip && pip3 install " + " ".join(missing_packages))
        sys.exit(1)
    
    return True

# Check dependencies
check_dependencies()

# Now import required modules
import scapy.all as scapy
from termcolor import colored
from tabulate import tabulate

# Global variables
is_running = False
detection_count = 0
blocked_ips = set()
known_hosts = {}
start_time = None
verbose_mode = False
log_file_path = "antimitm.log"  # Default log file
report_dir = "reports"  # Default report directory

def check_root():
    """Check if script is running with root privileges"""
    if os.geteuid() != 0:
        return False
    return True

def print_banner():
    banner = '''
    ╔═══════════════════════════════════════════════════╗
    ║                   AntiMITM Tool                   ║
    ║      ARP Spoofing & MITM Attack Detection         ║
    ║               Developer: root0emir                ║
    ╚═══════════════════════════════════════════════════╝
    '''
    print(colored(banner, 'cyan'))

def print_success(message):
    print(colored(f"[+] {message}", 'green'))

def print_info(message):
    print(colored(f"[*] {message}", 'blue'))

def print_warning(message):
    print(colored(f"[!] {message}", 'yellow'))

def print_error(message):
    print(colored(f"[!] {message}", 'red'))

def log_message(message, level="INFO"):
    """Log messages to console and file if logging is enabled"""
    global verbose_mode, log_file_path
    
    # Don't log if logging is disabled
    if log_file_path is None:
        return
    
    color_map = {
        "INFO": "blue",
        "SUCCESS": "green",
        "WARNING": "yellow", 
        "ERROR": "red",
        "ALERT": "magenta"
    }
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Only print INFO messages if in verbose mode
    if level != "INFO" or verbose_mode:
        if level in color_map:
            print(colored(f"[{timestamp}] {message}", color_map[level]))
        else:
            print(f"[{timestamp}] {message}")
    
    # Only write to log file if logging is enabled
    if log_file_path:
        try:    
            with open(log_file_path, "a") as log_file:
                log_file.write(f"{timestamp} - [{level}] {message}\n")
        except Exception as e:
            print(colored(f"[!] Log file write error: {e}", "red"))
            # Disable logging if there's an error writing to the log file
            log_file_path = None

def cache_mac_address(ip, mac):
    """Cache MAC addresses to reduce network requests"""
    known_hosts[ip] = {
        'mac': mac,
        'first_seen': datetime.now(),
        'last_seen': datetime.now()
    }
    
def get_mac(ip):
    """Get MAC address for an IP address, with caching to improve performance"""
    # Check cache first
    if ip in known_hosts and known_hosts[ip]['mac']:
        known_hosts[ip]['last_seen'] = datetime.now()
        return known_hosts[ip]['mac']
    
    try:
        arp_request = scapy.ARP(pdst=ip)
        broadcast = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
        arp_request_broadcast = broadcast / arp_request
        answered_list = scapy.srp(arp_request_broadcast, timeout=1, verbose=False)[0]
        
        if answered_list:
            mac_address = answered_list[0][1].hwsrc
            cache_mac_address(ip, mac_address)
            return mac_address
        return None
    except Exception as e:
        log_message(f"Error getting MAC address for IP {ip}: {e}", "ERROR")
        return None

def block_attacker(ip):
    """Block attacker using iptables and log for reporting"""
    if ip in blocked_ips:
        log_message(f"IP {ip} is already blocked", "WARNING")
        return
        
    try:
        # Blocking for Debian Linux using iptables
        subprocess.run(["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"], check=True)
        subprocess.run(["iptables", "-A", "FORWARD", "-s", ip, "-j", "DROP"], check=True)
        
        # Use iptables-persistent to add permanent rule (if installed)
        try:
            subprocess.run(["dpkg", "-l", "iptables-persistent"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            # If iptables-persistent is installed, save rules
            subprocess.run(["sh", "-c", "iptables-save > /etc/iptables/rules.v4"], check=True)
            log_message(f"Permanent iptables rule added: {ip}", "SUCCESS")
        except:
            # If iptables-persistent is not installed, warn
            log_message("iptables-persistent is not installed, rules will be lost on system restart", "WARNING")
            log_message("For permanent rules: apt-get install iptables-persistent", "INFO")
        
        # Add attacker to blocked list
        blocked_ips.add(ip)
        
        # Log the block action
        log_message(f"Attacker IP blocked: {ip}", "SUCCESS")
        
        # Save information about blocked IPs for reporting
        save_blocked_ips()
    except subprocess.CalledProcessError as e:
        log_message(f"Error blocking IP {ip}: {e}", "ERROR")
    except Exception as e:
        log_message(f"Unexpected error blocking IP {ip}: {e}", "ERROR")

def save_blocked_ips():
    """Save blocked IPs permanently to JSON file"""
    try:
        config_dir = "/etc/securonis/antimitm"
        
        # If default /etc/securonis/antimitm directory does not exist, save to local directory
        if not os.access(config_dir, os.W_OK):
            config_dir = "config"
            
        # Ensure config directory exists
        if not os.path.exists(config_dir):
            os.makedirs(config_dir)
            
        file_path = os.path.join(config_dir, "blocked_ips.json")
        
        data = {
            "blocked_ips": list(blocked_ips),
            "last_updated": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
            
        log_message(f"Blocked IPs saved to {file_path}", "INFO")
    except Exception as e:
        log_message(f"Error saving blocked IPs: {e}", "ERROR")

def load_blocked_ips():
    """Load previously blocked IPs"""
    try:
        # First check system-wide configuration files
        config_dirs = ["/etc/securonis/antimitm", "config"]
        
        for config_dir in config_dirs:
            file_path = os.path.join(config_dir, "blocked_ips.json")
            
            if os.path.exists(file_path):
                with open(file_path, "r") as f:
                    data = json.load(f)
                    for ip in data.get("blocked_ips", []):
                        blocked_ips.add(ip)
                log_message(f"{len(blocked_ips)} previously blocked IPs loaded - source: {file_path}", "INFO")
                break
    except Exception as e:
        log_message(f"Error loading blocked IPs: {e}", "ERROR")

def restore_network(gateway_ip, gateway_mac, target_ip, target_mac):
    """Restore ARP tables to correct state after attack detection"""
    try:
        # Send ARP packets to correct the poisoned entries
        packet = scapy.ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip, hwsrc=gateway_mac)
        scapy.send(packet, count=4, verbose=False)
        
        # Also restore the gateway's ARP entry
        packet = scapy.ARP(op=2, pdst=gateway_ip, hwdst=gateway_mac, psrc=target_ip, hwsrc=target_mac)
        scapy.send(packet, count=4, verbose=False)
        
        log_message("Network restored to original state", "SUCCESS")
    except Exception as e:
        log_message(f"Error restoring network: {e}", "ERROR")

def process_packet(packet, gateway_ip, gateway_mac, target_ip, target_mac):
    """Analyze ARP packets for spoofing detection"""
    global detection_count
    
    if packet.haslayer(scapy.ARP) and packet[scapy.ARP].op == 2:  # ARP Reply
        try:
            # Source IP from ARP packet
            source_ip = packet[scapy.ARP].psrc
            # Claimed MAC (said to be its own MAC)
            response_mac = packet[scapy.ARP].hwsrc
            
            # Real MAC in the network (correct)
            real_mac = get_mac(source_ip)
            
            # Is this our gateway or target (normal traffic)
            is_gateway = source_ip == gateway_ip
            is_target = source_ip == target_ip
            
            # Update our known devices table
            if real_mac:
                if source_ip not in known_hosts:
                    cache_mac_address(source_ip, real_mac)
                else:
                    known_hosts[source_ip]['last_seen'] = datetime.now()
            
            # Potential spoofing detection
            if real_mac and real_mac != response_mac:
                detection_count += 1
                
                # Create detailed alert message
                alert_msg = f"ARP spoofing detected!"
                details = [
                    f"Attack #{detection_count}",
                    f"Source IP: {source_ip}",
                    f"Real MAC: {real_mac}",
                    f"Fake MAC: {response_mac}"
                ]
                
                if is_gateway:
                    details.append("Target gateway (router poisoning)")
                
                # Log with high priority
                log_message(alert_msg, "ALERT")
                for detail in details:
                    log_message(f"  {detail}", "ALERT")
                
                # Block attacker
                block_attacker(source_ip)
                
                # Try to restore network to normal state
                restore_network(gateway_ip, gateway_mac, target_ip, target_mac)
            else:
                # Just for detailed monitoring - log normal ARP traffic
                if is_gateway or is_target:
                    log_message(f"Valid ARP: {'gateway' if is_gateway else 'target'}: {source_ip}", "INFO")
        except Exception as e:
            log_message(f"Error processing packet: {e}", "ERROR")

def sniff_packets(interface, gateway_ip, gateway_mac, target_ip, target_mac):
    """Listen for network packets for spoofing detection"""
    global is_running, start_time
    
    try:
        is_running = True
        start_time = datetime.now()
        log_message(f"{interface} interface packet listening started", "INFO")
        log_message(f"Monitoring network traffic between {target_ip} and {gateway_ip}", "INFO")
        log_message("Press Ctrl+C to stop monitoring", "INFO")
        
        # Start listening without blocking
        scapy.sniff(
            iface=interface, 
            store=False, 
            prn=lambda packet: process_packet(packet, gateway_ip, gateway_mac, target_ip, target_mac), 
            filter="arp",
            stop_filter=lambda x: not is_running
        )
    except KeyboardInterrupt:
        log_message("Packet listening stopped by user", "INFO")
    except Exception as e:
        log_message(f"{interface} interface packet listening error: {e}", "ERROR")
    finally:
        is_running = False

def start_background_monitoring(interface, gateway_ip, gateway_mac, target_ip, target_mac):
    """Start background monitoring"""
    global is_running
    
    if is_running:
        log_message("Monitoring already running", "WARNING")
        return False
        
    # Create thread for packet listening
    sniff_thread = threading.Thread(
        target=sniff_packets,
        args=(interface, gateway_ip, gateway_mac, target_ip, target_mac),
        daemon=True
    )
    
    # Start thread
    sniff_thread.start()
    log_message("Background monitoring started", "SUCCESS")
    return True

def stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac):
    """Stop background monitoring safely"""
    global is_running
    
    if not is_running:
        log_message("No active monitoring to stop", "WARNING")
        return False
        
    is_running = False
    time.sleep(1)  # Wait for thread to finish
    
    # Restore network
    restore_network(gateway_ip, gateway_mac, target_ip, target_mac)
    log_message("Background monitoring stopped", "SUCCESS")
    return True

def get_network_info(interface):
    """Get network information for selected interface"""
    try:
        # Check if interface is active
        if not scapy.get_if_addr(interface):
            log_message(f"Interface '{interface}' is not active or has no IP address", "ERROR")
            return None, None, None, None

        # Get gateway IP address
        gateway_ip = scapy.conf.route.route("0.0.0.0")[2]
        if not gateway_ip:
            log_message("Gateway IP address could not be determined", "ERROR")
            return None, None, None, None
            
        # Get gateway MAC address
        gateway_mac = get_mac(gateway_ip)
        if not gateway_mac:
            log_message("Gateway MAC address could not be obtained. Please check your network connection", "ERROR")
            return None, None, None, None

        # Get interface IP and MAC addresses
        target_ip = scapy.get_if_addr(interface)
        target_mac = scapy.get_if_hwaddr(interface)
        
        if not target_ip or not target_mac:
            log_message(f"IP or MAC address could not be obtained for interface '{interface}'", "ERROR")
            return None, None, None, None

        # Cache gateway MAC address
        cache_mac_address(gateway_ip, gateway_mac)
        
        # Log success
        log_message(f"Network information successfully obtained", "SUCCESS")
        log_message(f"Gateway: {gateway_ip} ({gateway_mac})", "INFO")
        log_message(f"Interface: {interface} - {target_ip} ({target_mac})", "INFO")
        
        # Firewall check
        try:
            subprocess.run(["iptables", "-L"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        except:
            log_message("iptables not accessible! Attackers may not be blocked.", "WARNING")
            log_message("For iptables installation: apt-get install iptables", "INFO")
        
        # Check Securonis Linux version (for informational purposes)
        try:
            with open("/etc/securonis-release", "r") as f:
                version = f.read().strip()
                log_message(f"Securonis Linux version: {version}", "INFO")
        except:
            log_message("Securonis Linux version not detected, using standard Debian-based distribution", "INFO")
        
        return gateway_ip, gateway_mac, target_ip, target_mac
    except Exception as e:
        log_message(f"Error getting network information: {e}", "ERROR")
        return None, None, None, None

def list_interfaces():
    """List all available network interfaces"""
    interfaces = []
    try:
        interfaces = scapy.get_if_list()
        
        # Add more information for each interface
        detailed_interfaces = []
        for iface in interfaces:
            ip = scapy.get_if_addr(iface)
            mac = None
            try:
                mac = scapy.get_if_hwaddr(iface)
            except:
                pass
                
            # Linux specific: check if wireless
            is_wireless = False
            try:
                with open(f"/sys/class/net/{iface}/wireless", "r") as f:
                    is_wireless = True
            except:
                pass
                
            # Check if interface is active
            is_up = False
            try:
                with open(f"/sys/class/net/{iface}/operstate", "r") as f:
                    state = f.read().strip()
                    is_up = state == "up"
            except:
                pass
                
            status = "Active" if ip and is_up else "Inactive"
            type_info = "Wireless" if is_wireless else "Cabled"
            
            # Ignore loopback interface
            if iface != "lo":
                detailed_interfaces.append((iface, ip, mac, status, type_info))
            
        return detailed_interfaces
    except Exception as e:
        log_message(f"Error listing interfaces: {e}", "ERROR")
        return []

def select_interface():
    """Interactive interface selection"""
    interfaces = list_interfaces()
    
    if not interfaces:
        log_message("No interface found", "ERROR")
        return None
        
    print_info("\nAvailable network interfaces:")
    
    # Create table with interface information
    table_data = []
    for idx, (iface, ip, mac, status, type_info) in enumerate(interfaces):
        table_data.append([
            colored(f"{idx + 1}", "cyan"),
            colored(f"{iface}", "green" if status == "Active" else "red"),
            ip if ip else colored("N/A", "red"),
            mac if mac else colored("N/A", "red"),
            colored(status, "green" if status == "Active" else "red"),
            colored(type_info, "cyan")
        ])
    
    # Print interface information table
    headers = ["#", "Interface", "IP Address", "MAC Address", "Status", "Type"]
    print(tabulate(table_data, headers=headers, tablefmt="pretty"))
    
    # Get user selection
    while True:
        try:
            choice = input(colored("\nSelect a network interface (number): ", "cyan"))
            
            # Allow exit
            if choice.lower() in ('q', 'exit', 'quit', 'back'):
                return None
                
            choice = int(choice)
            if 1 <= choice <= len(interfaces):
                selected = interfaces[choice - 1]
                if selected[3] == "Inactive":
                    log_message(f"Warning: Selected interface '{selected[0]}' appears to be inactive", "WARNING")
                    confirm = input(colored("Continue with this interface? (y/n): ", "yellow"))
                    if confirm.lower() != 'y':
                        continue
                        
                return selected[0]
            else:
                print_error("Invalid choice. Please select a valid interface.")
        except ValueError:
            print_error("Please enter a number or 'q' to exit.")

def show_statistics():
    """Display monitoring session statistics"""
    global start_time, detection_count
    
    if not start_time:
        log_message("No monitoring session statistics available", "WARNING")
        return
        
    current_time = datetime.now()
    elapsed = current_time - start_time
    
    print_info("\n=== AntiMITM Statistics ===")
    
    # Create statistics table
    table_data = [
        ["Started", start_time.strftime('%Y-%m-%d %H:%M:%S')],
        ["Running time", f"{elapsed.seconds // 3600}h {(elapsed.seconds // 60) % 60}m {elapsed.seconds % 60}s"],
        ["Attacks detected", colored(str(detection_count), "red" if detection_count > 0 else "green")],
        ["Attackers blocked", colored(str(len(blocked_ips)), "yellow")],
        ["Hosts monitored", str(len(known_hosts))],
        ["Status", colored("ACTIVE", "green") if is_running else colored("INACTIVE", "red")]
    ]
    
    print(tabulate(table_data, tablefmt="grid"))
    
    # Show blocked IPs
    if blocked_ips:
        print_info("\nBlocked IP Addresses:")
        for ip in blocked_ips:
            print(colored(f"  - {ip}", "red"))
    
    print()

def show_hosts():
    """Show all hosts discovered on the network"""
    if not known_hosts:
        log_message("No hosts have been discovered yet", "WARNING")
        return
        
    print_info("\n=== Discovered Network Hosts ===")
    
    # Create hosts table
    table_data = []
    for ip, info in known_hosts.items():
        first_seen = info['first_seen'].strftime('%Y-%m-%d %H:%M:%S')
        last_seen = info['last_seen'].strftime('%Y-%m-%d %H:%M:%S')
        in_blocked = "Yes" if ip in blocked_ips else "No"
        
        table_data.append([
            ip,
            info['mac'],
            first_seen,
            last_seen,
            colored(in_blocked, "red" if in_blocked == "Yes" else "green")
        ])
    
    # Sort by IP address
    table_data.sort(key=lambda x: x[0])
    
    # Print table
    headers = ["IP Address", "MAC Address", "First Seen", "Last Seen", "Blocked"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    print()

def generate_report():
    """Generate and save a detailed report"""
    global start_time, detection_count, report_dir
    
    if not start_time:
        log_message("No monitoring data available for reporting", "WARNING")
        return
        
    try:
        # Ensure report directory exists
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)
            
        current_time = datetime.now()
        elapsed = current_time - start_time
        
        report_filename = os.path.join(report_dir, f"antimitm_report_{current_time.strftime('%Y%m%d_%H%M%S')}.txt")
        
        with open(report_filename, "w") as f:
            f.write("=" * 50 + "\n")
            f.write("              AntiMITM Monitoring Report               \n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Report generated: {current_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Monitoring started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total monitoring time: {elapsed.seconds // 3600}h {(elapsed.seconds // 60) % 60}m {elapsed.seconds % 60}s\n\n")
            
            f.write("Summary:\n")
            f.write(f"- Attacks detected: {detection_count}\n")
            f.write(f"- Attackers blocked: {len(blocked_ips)}\n")
            f.write(f"- Hosts discovered: {len(known_hosts)}\n\n")
            
            if blocked_ips:
                f.write("Blocked IP addresses:\n")
                for ip in blocked_ips:
                    f.write(f"- {ip}\n")
                f.write("\n")
            
            if known_hosts:
                f.write("Discovered hosts:\n")
                for ip, info in sorted(known_hosts.items()):
                    blocked = "BLOCKED" if ip in blocked_ips else ""
                    f.write(f"- {ip} ({info['mac']}) {blocked}\n")
                    f.write(f"  First seen: {info['first_seen'].strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"  Last seen: {info['last_seen'].strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        log_message(f"Report generated and saved to {report_filename}", "SUCCESS")
    except Exception as e:
        log_message(f"Error generating report: {e}", "ERROR")

def menu():
    """Display enhanced menu with color and options"""
    # Using clear numbers instead of emojis for the monitoring status
    if is_running:
        status_line = colored("[MONITORING ACTIVE]", "green", attrs=["bold"])
        if start_time:
            elapsed = datetime.now() - start_time
            elapsed_str = f"{elapsed.seconds // 3600}h {(elapsed.seconds // 60) % 60}m {elapsed.seconds % 60}s"
            status_line += colored(f" (Running: {elapsed_str})", "cyan")
        print(status_line)
    else:
        print(colored("[MONITORING INACTIVE]", "yellow"))
    
    print("\n" + "=" * 60)
    print(colored("AntiMITM Tool - ARP Spoofing & MITM Attack Detection", "cyan", attrs=["bold"]))
    print("=" * 60 + "\n")
    
    menu_options = [
        ("1", "Select Network Interface", "Choose a network interface to monitor"),
        ("2", "Start Active Monitoring", "Start interactive ARP spoofing detection"),
        ("3", "Start Background Monitoring", "Run detector in the background"),
        ("4", "Stop Monitoring", "Stop all monitoring activities"),
        ("5", "Show Statistics", "Display detection statistics"),
        ("6", "Show Discovered Hosts", "List all hosts discovered on the network"),
        ("7", "Generate Report", "Create a detailed report file"),
        ("8", "Toggle Logging", "Enable/Disable logging to file"),
        ("9", "Exit", "Exit the application")
    ]
    
    # Create formatted menu
    for option, title, description in menu_options:
        option_text = colored(f"[{option}]", "cyan")
        title_text = colored(f" {title}", "white")
        print(f"{option_text} {title_text}")
        print(colored(f"     {description}", "white"))
    
    print("=" * 60)
    
    # Show current logging status
    if log_file_path:
        print(colored(f"Logging: ENABLED ({log_file_path})", "green"))
    else:
        print(colored("Logging: DISABLED", "yellow"))
    
    choice = input(colored("\nEnter your choice: ", "green"))
    return choice

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='AntiMITM - ARP Spoofing & MITM Attack Detection Tool (Developer: root0emir)')
    
    parser.add_argument('-i', '--interface', help='Network interface to use')
    parser.add_argument('-b', '--background', action='store_true', help='Start monitoring in the background')
    parser.add_argument('-v', '--verbose', action='store_true', help='Enable verbose output')
    parser.add_argument('-r', '--report', action='store_true', help='Generate a report after monitoring')
    parser.add_argument('-s', '--stats', action='store_true', help='Show statistics')
    parser.add_argument('-l', '--list-interfaces', action='store_true', help='List all available network interfaces')
    parser.add_argument('-t', '--time', type=int, help='Duration in seconds to run the monitoring (0 for indefinite)')
    parser.add_argument('--log-file', default="antimitm.log", 
                       help='Log file path (default: antimitm.log) or "none" to disable logging')
    parser.add_argument('--report-dir', default="reports", 
                       help='Directory to save reports (default: reports)')
    parser.add_argument('--config-dir', default="config", 
                       help='Configuration files directory (default: config)')
    parser.add_argument('--no-log', action='store_true', help='Disable logging to file')
    parser.add_argument('--version', action='version', version='AntiMITM v2.0 - Developed by root0emir')
    
    return parser.parse_args()

def display_system_info():
    """Display basic system information only once at startup"""
    print_banner()
    print_info(f"AntiMITM v2.0 - Running")
    if log_file_path:
        print_info(f"Logging enabled: {log_file_path}")
    else:
        print_info("Logging disabled")
    print_info(f"Report directory: {report_dir}")
    
    # Check for iptables
    try:
        subprocess.run(["iptables", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except:
        print_error("iptables not found! IP blocking may not work.")
        print_warning("To install iptables: apt-get install iptables")

def main():
    """Main application function with improved flow and error handling"""
    global is_running, verbose_mode, log_file_path, report_dir
    
    # Check for root privileges
    if not check_root():
        print(colored("[!] This program requires root privileges.", "red"))
        print(colored("[!] Please use 'sudo python3 antimitm.py'", "yellow"))
        sys.exit(1)

    # Parse command line arguments
    args = parse_arguments()
    
    # Set verbose mode
    verbose_mode = args.verbose
    
    # Handle logging options
    if args.no_log:
        log_file_path = None
        print(colored("[*] Logging disabled by command line option", "blue"))
    elif args.log_file.lower() == "none":
        log_file_path = None
        print(colored("[*] Logging disabled by command line option", "blue"))
    else:
        # Check if log file is writable
        log_dir = os.path.dirname(args.log_file) if os.path.dirname(args.log_file) else "."
        if not os.path.exists(log_dir) or not os.access(log_dir, os.W_OK):
            log_file_path = "antimitm.log"
            print(colored(f"[!] Cannot write to {args.log_file}. Using log file: {log_file_path}", "yellow"))
        else:
            log_file_path = args.log_file
    
    # Check report directory
    report_dir_path = args.report_dir
    report_dir_parent = os.path.dirname(report_dir_path) if os.path.dirname(report_dir_path) else "."
    if not os.path.exists(report_dir_parent) or not os.access(report_dir_parent, os.W_OK):
        report_dir = "reports"
        print(colored(f"[!] Cannot write to {args.report_dir}. Using report directory: {report_dir}", "yellow"))
    else:
        report_dir = report_dir_path
    
    # Check and create directories
    for directory in [report_dir]:
        if not os.path.exists(directory):
            try:
                os.makedirs(directory)
            except Exception as e:
                print_error(f"Could not create directory {directory}: {e}")
    
    # Set up signal handler
    signal.signal(signal.SIGINT, lambda sig, frame: signal_handler())
    
    # Load previously blocked IPs
    load_blocked_ips()
    
    # Show welcome message (only once at startup)
    display_system_info()
    
    # Handle command line interface mode
    if args.list_interfaces:
        interfaces = list_interfaces()
        if interfaces:
            print_info("Available network interfaces:")
            table_data = []
            for idx, (iface, ip, mac, status, type_info) in enumerate(interfaces):
                table_data.append([
                    idx + 1,
                    iface,
                    ip if ip else "N/A",
                    mac if mac else "N/A",
                    status,
                    type_info
                ])
            headers = ["#", "Interface", "IP Address", "MAC Address", "Status", "Type"]
            print(tabulate(table_data, headers=headers, tablefmt="pretty"))
        sys.exit(0)
    
    # If interface is provided via command line, use it directly
    interface = None
    gateway_ip = None
    gateway_mac = None
    target_ip = None
    target_mac = None
    
    if args.interface:
        interface = args.interface
        print_info(f"Using interface: {interface}")
        gateway_ip, gateway_mac, target_ip, target_mac = get_network_info(interface)
        if not all([gateway_ip, gateway_mac, target_ip, target_mac]):
            print_error(f"Failed to get network information for interface {interface}")
            sys.exit(1)
    
    # Start background monitoring if requested
    if args.background and interface:
        print_info(f"Starting background monitoring on interface {interface}")
        start_background_monitoring(interface, gateway_ip, gateway_mac, target_ip, target_mac)
        
        # If time limit specified
        if args.time and args.time > 0:
            print_info(f"Monitoring will run for {args.time} seconds")
            try:
                time.sleep(args.time)
                stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac)
                print_info("Monitoring stopped after timeout")
                
                if args.report:
                    generate_report()
                if args.stats:
                    show_statistics()
                    
                sys.exit(0)
            except KeyboardInterrupt:
                print_info("\nMonitoring interrupted by user")
                stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac)
                if args.report:
                    generate_report()
                sys.exit(0)
        
        # Just show stats and exit if only showing stats
        if args.stats:
            show_statistics()
            sys.exit(0)
        
        # If we're here, we're running in background mode with no time limit
        print_info("Monitoring running in background. Press Ctrl+C to stop.")
        try:
            while is_running:
                time.sleep(1)
        except KeyboardInterrupt:
            print_info("\nMonitoring interrupted by user")
            stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac)
            if args.report:
                generate_report()
            sys.exit(0)
    
    # If we get here, show interactive menu
    interactive_menu(interface, gateway_ip, gateway_mac, target_ip, target_mac)

def interactive_menu(interface, gateway_ip, gateway_mac, target_ip, target_mac):
    """Interactive menu function separated to avoid duplicate banner display"""
    global is_running, log_file_path
    
    # Clear screen before first menu display
    os.system('clear' if os.name != 'nt' else 'cls')
    
    while True:
        try:
            # Display interface information if one is selected
            if interface:
                print(colored(f"\nSelected interface: {interface}", "green"))
                if all([gateway_ip, gateway_mac, target_ip, target_mac]):
                    print(colored(f"Connected as: {target_ip} ({target_mac})", "green"))
                    print(colored(f"Gateway: {gateway_ip} ({gateway_mac})", "green"))
                else:
                    print(colored("Network information incomplete. Please reselect interface.", "yellow"))
            else:
                print(colored("\nNo interface selected. Please select a network interface first.", "yellow"))
                
            # Show menu and get choice
            choice = menu()
            
            if choice == "1":
                interface = select_interface()
                if interface:
                    print_success(f"Selected network interface: {interface}")
                    # Get network information
                    gateway_ip, gateway_mac, target_ip, target_mac = get_network_info(interface)
                    if not all([gateway_ip, gateway_mac, target_ip, target_mac]):
                        print_error("Failed to get network information")
                        interface = None
            
            elif choice == "2":
                if not interface:
                    print_error("Please select a network interface first.")
                else:
                    if is_running:
                        print_warning("Monitoring is already running. Please stop it first.")
                    else:
                        print_info("Starting active packet sniffing...")
                        try:
                            sniff_packets(interface, gateway_ip, gateway_mac, target_ip, target_mac)
                        except KeyboardInterrupt:
                            print_info("\nStopping monitoring...")
                            restore_network(gateway_ip, gateway_mac, target_ip, target_mac)
            
            elif choice == "3":
                if not interface:
                    print_error("Please select a network interface first.")
                else:
                    start_background_monitoring(interface, gateway_ip, gateway_mac, target_ip, target_mac)
            
            elif choice == "4":
                if not is_running:
                    print_warning("No active monitoring to stop.")
                else:
                    stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac)
            
            elif choice == "5":
                show_statistics()
                
            elif choice == "6":
                show_hosts()
                
            elif choice == "7":
                generate_report()
                
            elif choice == "8":
                # Toggle logging
                if log_file_path:
                    log_file_path = None
                    print_success("Logging disabled")
                else:
                    log_file_path = "antimitm.log"
                    print_success(f"Logging enabled: {log_file_path}")
                
            elif choice == "9":
                print_info("Exiting...")
                if is_running:
                    stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac)
                sys.exit(0)
                
            else:
                print_error("Invalid choice. Please try again.")
                
            # Clear screen before displaying the menu again
            input(colored("\nPress Enter to continue...", "cyan"))
            os.system('clear' if os.name != 'nt' else 'cls')
                
        except KeyboardInterrupt:
            print_info("\nExiting...")
            if is_running:
                stop_background_monitoring(gateway_ip, gateway_mac, target_ip, target_mac)
            sys.exit(0)
        except Exception as e:
            print_error(f"An unexpected error occurred: {e}")
            input(colored("\nPress Enter to continue...", "cyan"))
            os.system('clear' if os.name != 'nt' else 'cls')

def signal_handler():
    """Handle interrupt signals gracefully"""
    print_info("\nReceived interrupt signal. Closing...")
    if is_running:
        print_info("Stopping active monitoring...")
    sys.exit(0)

if __name__ == "__main__":
    main()
