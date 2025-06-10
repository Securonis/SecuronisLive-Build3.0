#!/usr/bin/env python3
import sys
import os
import subprocess
import psutil
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QLabel, QPushButton, QTextEdit,
                           QMessageBox, QFrame, QProgressBar)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QPixmap, QPalette, QColor

class ModernButton(QPushButton):
    def __init__(self, text, parent=None):
        super().__init__(text, parent)
        self.setStyleSheet("""
            QPushButton {
                background-color: #2d2d2d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                min-width: 150px;
            }
            QPushButton:hover {
                background-color: #3d3d3d;
                border: 1px solid #4d4d4d;
            }
            QPushButton:pressed {
                background-color: #1d1d1d;
            }
        """)
        self.setCursor(Qt.PointingHandCursor)

class SystemMonitor(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
        # Set up timer for system stats
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_stats)
        self.timer.start(2000)  # Update every 2 seconds
        
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # Progress bar styling
        progress_style = """
            QProgressBar {
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                text-align: center;
                background-color: #2d2d2d;
            }
            QProgressBar::chunk {
                background-color: #42d4d4;
            }
        """
        
        # Only CPU and RAM monitors
        for name in ["CPU", "RAM"]:
            item_layout = QHBoxLayout()
            label = QLabel(f"{name}:")
            label.setStyleSheet("color: white; font-weight: bold;")
            progress = QProgressBar()
            progress.setStyleSheet(progress_style)
            item_layout.addWidget(label)
            item_layout.addWidget(progress)
            layout.addLayout(item_layout)
            setattr(self, f"{name.lower()}_bar", progress)
        
        self.setLayout(layout)
        
    def update_stats(self):
        # CPU usage
        cpu_percent = psutil.cpu_percent()
        self.cpu_bar.setValue(int(cpu_percent))
        self.cpu_bar.setFormat(f"CPU: {cpu_percent}%")
        
        # RAM usage
        ram = psutil.virtual_memory()
        self.ram_bar.setValue(int(ram.percent))
        self.ram_bar.setFormat(f"RAM: {ram.percent}%")

class SystemManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Securonis Linux System Manager")
        self.setGeometry(100, 100, 755, 400)
        
        # Main widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(10, 10, 10, 10)
        
        # Left panel setup
        left_panel = QWidget()
        left_panel.setFixedWidth(300)
        left_layout = QVBoxLayout(left_panel)
        left_layout.setSpacing(10)
        
        # Logo
        self.logo_label = QLabel()
        logo_pixmap = QPixmap("/usr/share/icons/securonis/newlogopng.png")
        if not logo_pixmap.isNull():
            self.logo_pixmap = logo_pixmap.scaled(150, 150, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            self.logo_label.setPixmap(self.logo_pixmap)
        self.logo_label.setAlignment(Qt.AlignCenter)
        left_layout.addWidget(self.logo_label)
        
        # System monitor
        self.system_monitor = SystemMonitor()
        left_layout.addWidget(self.system_monitor)
        
        # Button layout
        button_layout = QVBoxLayout()
        button_layout.setSpacing(5)
        
        # Simplified menu - removed unwanted functions
        menu_buttons = [
            ("Update System", lambda: self.safe_execute(self.update_system)),
            ("System Info", lambda: self.safe_execute(self.system_info)),
            ("Network", lambda: self.safe_execute(self.network_connections)),
            ("Exit", self.close)
        ]
        
        self.buttons = {}
        
        # Create buttons
        for text, callback in menu_buttons:
            button = ModernButton(text)
            button.clicked.connect(callback)
            button_layout.addWidget(button)
            self.buttons[text] = button
        
        left_layout.addLayout(button_layout)
        left_layout.addStretch()
        main_layout.addWidget(left_panel)
        
        # Right panel setup
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        
        # Logs label
        logs_label = QLabel("Logs:")
        logs_label.setStyleSheet("color: white; font-weight: bold; font-size: 14px; padding: 5px;")
        right_layout.addWidget(logs_label)
        
        # Status label
        self.status_label = QLabel("")
        self.status_label.setStyleSheet("color: #42d4d4; font-weight: bold; font-size: 12px; padding: 5px;")
        right_layout.addWidget(self.status_label)
        
        # Output frame
        output_frame = QFrame()
        output_frame.setStyleSheet("background-color: #1e1e1e; border: 1px solid #3d3d3d; border-radius: 4px;")
        output_frame_layout = QVBoxLayout(output_frame)
        output_frame_layout.setContentsMargins(0, 0, 0, 0)
        
        # Output text area
        self.output_text = QTextEdit()
        self.output_text.setReadOnly(True)
        self.output_text.setStyleSheet("""
            QTextEdit {
                background-color: #1e1e1e;
                color: #ffffff;
                border: none;
                padding: 12px;
                font-family: 'Consolas', monospace;
                font-size: 12px;
                line-height: 1.6;
                selection-background-color: #3d3d3d;
                selection-color: #ffffff;
            }
            QTextEdit:focus { border: none; }
            QScrollBar:vertical {
                border: none;
                background-color: #1e1e1e;
                width: 10px;
                margin: 0px;
            }
            QScrollBar::handle:vertical {
                background-color: #3d3d3d;
                border-radius: 5px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover { background-color: #4d4d4d; }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical { height: 0px; }
        """)
        output_frame_layout.addWidget(self.output_text)
        
        right_layout.addWidget(output_frame)
        main_layout.addWidget(right_panel)
        
        # Apply dark theme
        self.set_dark_theme()
        
    def set_dark_theme(self):
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(18, 18, 18))         
        palette.setColor(QPalette.WindowText, Qt.white)
        palette.setColor(QPalette.Base, QColor(12, 12, 12))           
        palette.setColor(QPalette.AlternateBase, QColor(24, 24, 24))  
        palette.setColor(QPalette.ToolTipBase, QColor(18, 18, 18))
        palette.setColor(QPalette.ToolTipText, Qt.white)
        palette.setColor(QPalette.Text, Qt.white)
        palette.setColor(QPalette.Button, QColor(32, 32, 32))       
        palette.setColor(QPalette.ButtonText, Qt.white)
        palette.setColor(QPalette.BrightText, Qt.red)
        palette.setColor(QPalette.Highlight, QColor(0, 120, 212))     
        palette.setColor(QPalette.HighlightedText, Qt.white)
        self.setPalette(palette)
        
    def safe_execute(self, function):
        """Error handling wrapper for button functions"""
        try:
            return function()
        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.output_text.append(f"Error: {str(e)}")
            QMessageBox.critical(self, "Error", f"An error occurred: {str(e)}")
            return None
    
    def run_command(self, command, button_text=None):
        """Run a command and display the output"""
        if button_text:
            self.output_text.clear()
            button = self.buttons.get(button_text)
            if button:
                button.setEnabled(False)
        
        try:
            process = subprocess.Popen(
                command, 
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True
            )
            
            # Display output in real-time
            while True:
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    self.output_text.append(output.strip())
                    QApplication.processEvents()
            
            # Also capture any error output
            for line in process.stderr:
                self.output_text.append(line.strip())
                QApplication.processEvents()
                    
            return_code = process.poll()
            
            if button_text and button:
                button.setEnabled(True)
                
            return return_code == 0
        except Exception as e:
            self.output_text.append(f"Error running command: {str(e)}")
            if button_text and button:
                button.setEnabled(True)
            return False
    
    def update_system(self):
        """Update system packages"""
        self.status_label.setText("Updating system...")
        # Using apt-get instead of apt to avoid CLI interface warning
        command = "apt-get update && apt-get upgrade -y"
        
        success = self.run_command(command, "Update System")
        
        if success:
            self.status_label.setText("System updated successfully")
        else:
            self.status_label.setText("System update failed")
    
    def system_info(self):
        """Show system information"""
        self.status_label.setText("Gathering system information...")
        self.output_text.clear()
        
        try:
            # Get hostname
            hostname = subprocess.check_output("hostname", shell=True).decode().strip()
            self.output_text.append(f"Hostname: {hostname}")
            
            # Get OS information
            os_info = subprocess.check_output("lsb_release -a", shell=True).decode()
            self.output_text.append("\nOS Information:")
            self.output_text.append(os_info)
            
            # Get kernel information
            kernel = subprocess.check_output("uname -a", shell=True).decode().strip()
            self.output_text.append(f"\nKernel: {kernel}")
            
            # Get hardware information
            cpu_info = subprocess.check_output("cat /proc/cpuinfo | grep 'model name' | uniq", shell=True).decode().strip()
            self.output_text.append(f"\nCPU: {cpu_info.split(':')[1].strip() if ':' in cpu_info else 'Unknown'}")
            
            # Get memory information
            mem = psutil.virtual_memory()
            total_gb = mem.total / (1024 ** 3)
            self.output_text.append(f"\nTotal Memory: {total_gb:.2f} GB")
            
            # Get uptime
            uptime = subprocess.check_output("uptime -p", shell=True).decode().strip()
            self.output_text.append(f"\nUptime: {uptime}")
            
            self.status_label.setText("System information gathered successfully")
        except Exception as e:
            self.output_text.append(f"Error gathering system information: {str(e)}")
            self.status_label.setText("Failed to gather system information")
    
    def network_connections(self):
        """Display network interface information"""
        self.status_label.setText("Gathering network information...")
        self.output_text.clear()
        
        try:
            # Helper function to run command and show output directly
            def exec_command(cmd):
                try:
                    result = subprocess.check_output(cmd, shell=True, universal_newlines=True, stderr=subprocess.STDOUT)
                    self.output_text.append(result)
                    QApplication.processEvents()
                except subprocess.CalledProcessError as e:
                    self.output_text.append(f"Command error: {e.output}")
            
            separator = "\n" + "-" * 50 + "\n"
            
            # Network interfaces with ip command
            self.output_text.append("NETWORK INTERFACES (IP COMMAND):")
            exec_command("ip -br a")
            
            self.output_text.append(separator)
            
            # Detailed ifconfig output
            self.output_text.append("DETAILED INTERFACE INFO (IFCONFIG):")
            exec_command("ifconfig || echo 'ifconfig not found'")
            
            self.output_text.append(separator)
            
            # IP routes
            self.output_text.append("IP ROUTING TABLE:")
            exec_command("ip route")
            
            self.output_text.append(separator)
            
            # DNS information
            self.output_text.append("DNS CONFIGURATION:")
            if os.path.exists("/etc/resolv.conf"):
                with open("/etc/resolv.conf", "r") as f:
                    dns_config = f.read()
                self.output_text.append(dns_config)
            else:
                self.output_text.append("resolv.conf not found")
            
            self.output_text.append(separator)
            
            # Active network connections
            self.output_text.append("ACTIVE NETWORK CONNECTIONS:")
            exec_command("netstat -tuln || echo 'netstat not found'")
            
            self.output_text.append(separator)
            
            self.status_label.setText("Network information gathered successfully")
        except Exception as e:
            self.output_text.append(f"Error gathering network information: {str(e)}")
            self.status_label.setText("Failed to gather network information")

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    window = SystemManager()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
