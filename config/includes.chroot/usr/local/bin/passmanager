#!/usr/bin/env python3
import sys
import os
import json
import csv
import secrets
import string
from cryptography.fernet import Fernet
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QLabel, QPushButton, QLineEdit,
                           QTextEdit, QMessageBox, QFileDialog, QSpinBox,
                           QFrame, QGridLayout, QScrollArea, QComboBox, QDialog,
                           QTableWidget, QTableWidgetItem, QHeaderView)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QPalette, QColor, QPixmap


class PasswordManager:
    def __init__(self, file_path=None):
        if file_path is None:
            # Use cross-platform path for both Windows and Linux
            file_path = os.path.join(os.path.expanduser('~'), '.passmanager', 'passwords.json')
        self.file_path = file_path
        self.key = self.load_key()
        self.fernet = Fernet(self.key)
        self.passwords = self.load_passwords()
        # Default categories with meaningful names
        self.categories = ["Internet", "Gaming", "Coding", "Shopping", "Social", "Computer", "World"]
        if "categories" not in self.passwords:
            self.passwords["categories"] = {}
            for category in self.categories:
                self.passwords["categories"][category] = {}
            self.save_passwords()
        
        # Check if migration is needed
        self.check_and_migrate_categories()

    def load_key(self):
        # Use cross-platform path for both Windows and Linux
        key_path = os.path.join(os.path.expanduser('~'), '.passmanager', 'secret.key')
        os.makedirs(os.path.dirname(key_path), exist_ok=True)
        if os.path.exists(key_path):
            with open(key_path, 'rb') as key_file:
                return key_file.read()
        else:
            key = Fernet.generate_key()
            with open(key_path, 'wb') as key_file:
                key_file.write(key)
            # Use platform-neutral way to set permissions
            try:
                os.chmod(key_path, 0o600)  # Set permissions to read/write for owner only
            except Exception:
                # On Windows, chmod doesn't fully work, but it's OK
                pass
            return key

    def load_passwords(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, 'rb') as file:
                encrypted_data = file.read()
                decrypted_data = self.fernet.decrypt(encrypted_data).decode()
                return json.loads(decrypted_data)
        return {}

    def save_passwords(self):
        encrypted_data = self.fernet.encrypt(json.dumps(self.passwords).encode('utf-8'))
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        with open(self.file_path, 'wb') as file:
            file.write(encrypted_data)

    def check_and_migrate_categories(self):
        """Check if categories need migration and migrate them"""
        # Old and new categories
        old_categories = ["1", "2", "3", "4"]
        
        # Check if migration is needed
        needs_migration = False
        for old_cat in old_categories:
            if old_cat in self.passwords["categories"]:
                needs_migration = True
                break
        
        if needs_migration:
            self.migrate_categories()
    
    def migrate_categories(self):
        """Migrate old numeric categories to new named ones"""
        old_categories = ["1", "2", "3", "4"]
        new_categories = ["Internet", "Gaming", "Coding", "Shopping", "Social", "Computer", "World"]
        
        # First make sure all new categories exist
        for new_cat in new_categories:
            if new_cat not in self.passwords["categories"]:
                self.passwords["categories"][new_cat] = {}
        
        # Copy data from old categories to new ones if old categories exist
        for i, old_cat in enumerate(old_categories):
            if old_cat in self.passwords["categories"] and i < len(new_categories):
                new_cat = new_categories[i]
                # Copy passwords from old category to new category
                for service, data in self.passwords["categories"][old_cat].items():
                    self.passwords["categories"][new_cat][service] = data
                # Remove old category using pop to avoid KeyError if not present
                self.passwords["categories"].pop(old_cat, None)
        
        self.save_passwords()

    def add_password(self, service, username, password, category="Internet", tags=None):
        if category not in self.passwords["categories"]:
            self.passwords["categories"][category] = {}
        
        # Initialize tags if not provided
        if tags is None:
            tags = []
        
        self.passwords["categories"][category][service] = {
            'username': username, 
            'password': password,
            'tags': tags
        }
        self.save_passwords()

    def get_password(self, service, category=None):
        if category:
            if category in self.passwords["categories"] and service in self.passwords["categories"][category]:
                return self.passwords["categories"][category][service]
        else:
            # Search in all categories
            for cat, services in self.passwords["categories"].items():
                if service in services:
                    return services[service]
        return None

    def update_password(self, service, username, password, category=None, tags=None):
        # Preserve existing tags if not provided
        existing_tags = []
        
        if category:
            if category in self.passwords["categories"] and service in self.passwords["categories"][category]:
                # Keep existing tags if not provided
                if tags is None and 'tags' in self.passwords["categories"][category][service]:
                    existing_tags = self.passwords["categories"][category][service]['tags']
                
                self.passwords["categories"][category][service] = {
                    'username': username, 
                    'password': password,
                    'tags': tags if tags is not None else existing_tags
                }
                self.save_passwords()
                return True
        else:
            # Search and update in all categories
            for cat, services in self.passwords["categories"].items():
                if service in services:
                    # Keep existing tags if not provided
                    if tags is None and 'tags' in services[service]:
                        existing_tags = services[service]['tags']
                    
                    services[service] = {
                        'username': username, 
                        'password': password,
                        'tags': tags if tags is not None else existing_tags
                    }
                    self.save_passwords()
                    return True
        return False

    def delete_password(self, service, category=None):
        """Delete a password entry
        
        Args:
            service: The service name to delete
            category: The category containing the service, or None to search all categories
            
        Returns:
            True if deletion was successful, False otherwise
        """
        if category:
            # Delete from specific category
            if category in self.passwords["categories"] and service in self.passwords["categories"][category]:
                del self.passwords["categories"][category][service]
                self.save_passwords()
                return True
        else:
            # Search in all categories
            for cat, services in self.passwords["categories"].items():
                if service in services:
                    del self.passwords["categories"][cat][service]
                    self.save_passwords()
                    return True
        return False

    def search_password(self, keyword, category=None, tag=None):
        results = {}
        if category:
            if category in self.passwords["categories"]:
                cat_services = self.passwords["categories"][category]
                for service, creds in cat_services.items():
                    # Check if the keyword matches the service name
                    keyword_match = keyword.lower() in service.lower()
                    
                    # Check if tag filter is applied and matches
                    tag_match = True
                    if tag:
                        tag_match = False
                        if 'tags' in creds and creds['tags']:
                            tag_match = tag.lower() in [t.lower() for t in creds['tags']]
                    
                    if keyword_match and tag_match:
                        results[service] = creds
        else:
            # Search in all categories
            for cat, services in self.passwords["categories"].items():
                for service, creds in services.items():
                    # Check if the keyword matches the service name
                    keyword_match = keyword.lower() in service.lower()
                    
                    # Check if tag filter is applied and matches
                    tag_match = True
                    if tag:
                        tag_match = False
                        if 'tags' in creds and creds['tags']:
                            tag_match = tag.lower() in [t.lower() for t in creds['tags']]
                    
                    if keyword_match and tag_match:
                        results[service] = creds
        return results

    def get_categories(self):
        return list(self.passwords["categories"].keys())

    def import_passwords(self, csv_file):
        try:
            with open(csv_file, 'r') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    service = row['service']
                    username = row['username']
                    password = row['password']
                    category = row.get('category', '1')  # Default to category 1 if not specified
                    self.add_password(service, username, password, category)
            return True
        except Exception as e:
            print(f"Error importing passwords: {e}")
            return False

    def export_passwords(self, csv_file):
        try:
            with open(csv_file, 'w', newline='') as file:
                fieldnames = ['category', 'service', 'username', 'password']
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                writer.writeheader()
                for category, services in self.passwords["categories"].items():
                    for service, creds in services.items():
                        writer.writerow({
                            'category': category,
                            'service': service, 
                            'username': creds['username'], 
                            'password': creds['password']
                        })
            return True
        except Exception as e:
            print(f"Error exporting passwords: {e}")
            return False

    def generate_password(self, length=12):
        characters = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(characters) for i in range(length))
        return password

class PasswordManagerGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.password_manager = PasswordManager()
        self.setup_ui()
        
    def setup_ui(self):
        self.setWindowTitle("Securonis Password Manager")
        self.setGeometry(100, 100, 700, 500)
        
        # Set application-wide style to eliminate white spaces
        app = QApplication.instance()
        app.setStyleSheet("""
            QMainWindow, QDialog, QWidget {
                background-color: #1a1a1a;
                color: white;
            }
            QScrollBar:vertical {
                border: none;
                background: #1a1a1a;
                width: 8px;
                margin: 0px;
            }
            QScrollBar::handle:vertical {
                background: #3d3d3d;
                min-height: 20px;
                border-radius: 4px;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
            QScrollBar:horizontal {
                border: none;
                background: #1a1a1a;
                height: 8px;
                margin: 0px;
            }
            QScrollBar::handle:horizontal {
                background: #3d3d3d;
                min-width: 20px;
                border-radius: 4px;
            }
            QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
                width: 0px;
            }
        """)
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setSpacing(0)
        main_layout.setContentsMargins(0, 0, 0, 0)
        
        # Left sidebar for buttons
        sidebar = QWidget()
        sidebar.setFixedWidth(180)
        sidebar.setStyleSheet("""
            QWidget {
                background-color: #1a1a1a;
                border-right: 1px solid #333333;
            }
        """)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setSpacing(8)
        sidebar_layout.setContentsMargins(10, 20, 10, 20)
        
        # Modern button style
        button_style = """
            QPushButton {
                background-color: #2d2d2d;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 5px;
                font-weight: bold;
                font-size: 12px;
                text-align: left;
                margin: 2px 0px;
            }
            QPushButton:hover {
                background-color: #3d3d3d;
                border-left: 3px solid #42d4d4;
                color: #42d4d4;
            }
            QPushButton:pressed {
                background-color: #1d1d1d;
            }
            QPushButton:disabled {
                background-color: #1d1d1d;
                color: #666666;
            }
        """
        
        # No title for sidebar as requested
        
        
        menu_buttons = [
            ("Add Password", self.show_add_password),
            ("Get Password", self.show_get_password),
            ("Update Password", self.show_update_password),
            ("Delete Password", self.show_delete_password),
            ("Search Passwords", self.show_search_password),
            ("Security", self.show_security_check),
            ("Generate Password", self.show_generate_password),
            ("Show All Passwords", self.show_all_passwords),
            ("Import CSV", self.import_passwords),
            ("Export CSV", self.export_passwords)
        ]

        # Add buttons vertically in the sidebar
        for text, callback in menu_buttons:
            btn = QPushButton(text)
            btn.setStyleSheet(button_style)
            btn.setCursor(Qt.PointingHandCursor)
            btn.clicked.connect(callback)
            sidebar_layout.addWidget(btn)
        
        # Add spacer at the bottom of sidebar
        sidebar_layout.addStretch()
        
        # Add sidebar to main layout
        main_layout.addWidget(sidebar)

        self.output_text = QTextEdit()
        self.output_text.setReadOnly(True)
        self.output_text.setMinimumHeight(250)
        self.output_text.setStyleSheet("""
            QTextEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 5px;
                padding: 10px;
                font-family: 'Consolas', monospace;
                font-size: 12px;
                line-height: 1.5;
                margin-top: 15px;
            }
            QScrollBar:vertical {
                border: none;
                background-color: #2d2d2d;
                width: 8px;
                margin: 0px;
            }
            QScrollBar::handle:vertical {
                background-color: #42d4d4;
                border-radius: 4px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #3d3d3d;
            }
            QScrollBar::add-line:vertical,
            QScrollBar::sub-line:vertical {
                height: 0px;
            }
        """)
        
        # Content area
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)
        content_layout.setContentsMargins(15, 15, 15, 15)
        
        # Welcome message
        welcome_label = QLabel("Welcome to Securonis Password Manager")
        welcome_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
            }
        """)
        content_layout.addWidget(welcome_label)
        
        # Instructions
        instructions = QLabel("Select an option from the menu on the left to manage your passwords.")
        instructions.setStyleSheet("color: #cccccc; font-size: 12px;")
        content_layout.addWidget(instructions)
        
        # Output text area
        content_layout.addWidget(self.output_text)
        
        # Add content area to main layout
        main_layout.addWidget(content_area)
        
        self.set_dark_theme()
        
    def set_dark_theme(self):
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(26, 26, 26))
        palette.setColor(QPalette.WindowText, Qt.white)
        palette.setColor(QPalette.Base, QColor(45, 45, 45))
        palette.setColor(QPalette.AlternateBase, QColor(35, 35, 35))
        palette.setColor(QPalette.ToolTipBase, Qt.white)
        palette.setColor(QPalette.ToolTipText, Qt.white)
        palette.setColor(QPalette.Text, Qt.white)
        palette.setColor(QPalette.Button, QColor(45, 45, 45))
        palette.setColor(QPalette.ButtonText, Qt.white)
        self.setPalette(palette)
        
    def show_add_password(self):
        dialog = QWidget()
        dialog.setWindowTitle("Add Password")
        dialog.setGeometry(200, 200, 400, 330)  # Increased height for tags
        dialog.setStyleSheet("""
            QWidget {
                background-color: #1a1a1a;
            }
            QLabel {
                color: white;
                font-size: 12px;
            }
            QLineEdit, QComboBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 6px;
                font-size: 12px;
            }
            QLineEdit:focus, QComboBox:focus {
                border: 1px solid #42d4d4;
            }
            QPushButton {
                background-color: #2d2d2d;
                color: white;
                border: none;
                padding: 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #3d3d3d;
                border: 1px solid #42d4d4;
                color: #42d4d4;
            }
            QComboBox::drop-down {
                border: 0px;
            }
            QComboBox::down-arrow {
                image: url(down_arrow.png);
                width: 12px;
                height: 12px;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: white;
                selection-background-color: #3d3d3d;
                selection-color: #42d4d4;
            }
        """)
        layout = QVBoxLayout(dialog)
        layout.setSpacing(10)
        layout.setContentsMargins(15, 15, 15, 15)

        category_label = QLabel("Category:")
        category_combo = QComboBox()
        for category in self.password_manager.get_categories():
            category_combo.addItem(category)
        
        service_label = QLabel("Service Name:")
        service_input = QLineEdit()
        service_input.setPlaceholderText("Enter service name")
        
        username_label = QLabel("Username:")
        username_input = QLineEdit()
        username_input.setPlaceholderText("Enter username")
        
        password_label = QLabel("Password:")
        password_input = QLineEdit()
        password_input.setPlaceholderText("Enter password")
        password_input.setEchoMode(QLineEdit.Password)
        
        # Add tags field
        tags_label = QLabel("Tags (comma separated):")
        tags_input = QLineEdit()
        tags_input.setPlaceholderText("e.g., work, personal, important")
        
        layout.addWidget(category_label)
        layout.addWidget(category_combo)
        layout.addWidget(service_label)
        layout.addWidget(service_input)
        layout.addWidget(username_label)
        layout.addWidget(username_input)
        layout.addWidget(password_label)
        layout.addWidget(password_input)
        layout.addWidget(tags_label)
        layout.addWidget(tags_input)
        
        button_layout = QHBoxLayout()
        save_btn = QPushButton("Save")
        cancel_btn = QPushButton("Cancel")
        
        save_btn.clicked.connect(lambda: self.add_password(
            service_input.text(),
            username_input.text(),
            password_input.text(),
            category_combo.currentText(),
            tags_input.text(),
            dialog
        ))
        cancel_btn.clicked.connect(dialog.close)
        
        button_layout.addWidget(save_btn)
        button_layout.addWidget(cancel_btn)
        layout.addLayout(button_layout)
        
        dialog.show()
        
    def add_password(self, service, username, password, category, tags, dialog):
        if not all([service, username, password]):
            QMessageBox.warning(dialog, "Error", "Please fill all fields!")
            return
        
        # Process tags - split by comma and strip whitespace
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        self.password_manager.add_password(service, username, password, category, tag_list)
        
        # Show confirmation with tags if any were added
        if tag_list:
            self.output_text.setText(f"Password added for service: {service} (Category: {category}, Tags: {', '.join(tag_list)})")
        else:
            self.output_text.setText(f"Password added for service: {service} (Category: {category})")
        
        dialog.close()
        
    def show_get_password(self):
        dialog = QWidget()
        dialog.setWindowTitle("Get Password")
        dialog.setGeometry(200, 200, 400, 200)
        dialog.setStyleSheet("""
            QWidget {
                background-color: #1a1a1a;
            }
            QLabel {
                color: white;
                font-size: 11px;
            }
            QLineEdit, QComboBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 4px;
                font-size: 11px;
            }
            QLineEdit:focus, QComboBox:focus {
                border: 1px solid #42d4d4;
            }
            QPushButton {
                background-color: #2d2d2d;
                color: white;
                border: none;
                padding: 5px;
                border-radius: 3px;
                font-weight: bold;
                font-size: 11px;
            }
            QPushButton:hover {
                background-color: #3d3d3d;
                border: 1px solid #42d4d4;
                color: #42d4d4;
            }
            QComboBox::drop-down {
                border: 0px;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: white;
                selection-background-color: #3d3d3d;
                selection-color: #42d4d4;
            }
        """)
        layout = QVBoxLayout(dialog)
        layout.setSpacing(5)
        layout.setContentsMargins(10, 10, 10, 10)
        
        category_label = QLabel("Category (optional):")
        category_combo = QComboBox()
        category_combo.addItem("All Categories")
        for category in self.password_manager.get_categories():
            category_combo.addItem(category)
        
        service_label = QLabel("Service Name:")
        service_input = QLineEdit()
        service_input.setPlaceholderText("Enter service name")
        
        # Add tag filter
        tag_label = QLabel("Filter by tag (optional):")
        tag_input = QLineEdit()
        tag_input.setPlaceholderText("Enter tag to filter by")
        
        layout.addWidget(category_label)
        layout.addWidget(category_combo)
        layout.addWidget(service_label)
        layout.addWidget(service_input)
        layout.addWidget(tag_label)
        layout.addWidget(tag_input)
        
        button_layout = QHBoxLayout()
        get_btn = QPushButton("Get")
        cancel_btn = QPushButton("Cancel")
        
        get_btn.clicked.connect(lambda: self.get_password(
            service_input.text(), 
            None if category_combo.currentText() == "All Categories" else category_combo.currentText(),
            tag_input.text(),
            dialog
        ))
        cancel_btn.clicked.connect(dialog.close)
        
        button_layout.addWidget(get_btn)
        button_layout.addWidget(cancel_btn)
        layout.addLayout(button_layout)
        
        dialog.show()

    def get_password(self, service, category, tag, dialog):
        if not service:
            QMessageBox.warning(dialog, "Error", "Please enter service name!")
            return
        
        # First try to get the exact password by service name
        password_info = self.password_manager.get_password(service, category)
        
        # If found and tag is specified, check if it has the tag
        if password_info and tag:
            if 'tags' not in password_info or tag.lower() not in [t.lower() for t in password_info['tags']]:
                password_info = None  # Reset if tag doesn't match
        
        if password_info:
            # Display tags if they exist
            tags_str = ""
            if 'tags' in password_info and password_info['tags']:
                tags_str = f"\nTags: {', '.join(password_info['tags'])}"
            
            self.output_text.setText(f"Service: {service}\nUsername: {password_info['username']}\nPassword: {password_info['password']}{tags_str}")
        else:
            # If not found by exact match, try searching
            results = self.password_manager.search_password(service, category, tag)
            if results:
                if len(results) == 1:
                    # If only one result, show it directly
                    service_name = list(results.keys())[0]
                    password_info = results[service_name]
                    
                    # Display tags if they exist
                    tags_str = ""
                    if 'tags' in password_info and password_info['tags']:
                        tags_str = f"\nTags: {', '.join(password_info['tags'])}"
                    
                    self.output_text.setText(f"Service: {service_name}\nUsername: {password_info['username']}\nPassword: {password_info['password']}{tags_str}")
                else:
                    # Multiple results, show a list
                    output = "Multiple matches found:\n\n"
                    for service_name, info in results.items():
                        tags_str = ""
                        if 'tags' in info and info['tags']:
                            tags_str = f" [Tags: {', '.join(info['tags'])}]"
                        output += f"Service: {service_name}{tags_str}\n"
                    self.output_text.setText(output)
            else:
                self.output_text.setText("No matching services found.")
        dialog.close()

    def show_search_password(self):
        dialog = QDialog(self)
        dialog.setWindowTitle("Search Passwords")
        dialog.setGeometry(200, 200, 450, 280)
        dialog.setStyleSheet("""
        QDialog {
            background-color: #1a1a1a;
        }
        QLabel {
            color: white;
            font-size: 11px;
        }
        QLineEdit, QComboBox {
            background-color: #2d2d2d;
            color: white;
            border: 1px solid #3d3d3d;
            border-radius: 3px;
            padding: 4px;
            font-size: 11px;
        }
        QPushButton {
            background-color: #2d2d2d;
            color: white;
            border: 1px solid #42d4d4;
            border-radius: 3px;
            padding: 5px;
            font-size: 11px;
        }
        QPushButton:hover {
            background-color: #3d3d3d;
            border: 1px solid #42d4d4;
            color: #42d4d4;
        }
        """)
        
        layout = QVBoxLayout(dialog)
        layout.setSpacing(5)
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Create search form
        form_layout = QFormLayout()
        
        keyword_input = QLineEdit()
        keyword_input.setPlaceholderText("Enter search keyword")
        form_layout.addRow("Search Keyword:", keyword_input)
        
        category_combo = QComboBox()
        category_combo.addItem("All Categories")
        for category in self.password_manager.get_categories():
            category_combo.addItem(category)
        form_layout.addRow("Category:", category_combo)
        
        tag_input = QLineEdit()
        tag_input.setPlaceholderText("Filter by tag (optional)")
        form_layout.addRow("Filter by Tag:", tag_input)
        
        layout.addLayout(form_layout)
        
        # Add buttons
        button_layout = QHBoxLayout()
        search_btn = QPushButton("Search")
        search_btn.setDefault(True)
        cancel_btn = QPushButton("Cancel")
        
        button_layout.addWidget(search_btn)
        button_layout.addWidget(cancel_btn)
        
        layout.addLayout(button_layout)
        
        # Add results area
        results_label = QLabel("Search Results:")
        results_label.setStyleSheet("margin-top: 10px;")
        layout.addWidget(results_label)
        
        results_text = QTextEdit()
        results_text.setReadOnly(True)
        results_text.setStyleSheet("background-color: #2d2d2d; color: white;")
        layout.addWidget(results_text)
        
        # Connect search functionality
        def perform_search():
            keyword = keyword_input.text()
            category = None if category_combo.currentText() == "All Categories" else category_combo.currentText()
            tag = tag_input.text() if tag_input.text() else None
            
            if not keyword:
                QMessageBox.warning(dialog, "Error", "Please enter a search keyword!")
                return
            
            try:
                results = self.password_manager.search_password(keyword, category, tag)
                
                if results:
                    output = ""
                    for service, info in results.items():
                        output += f"Service: {service}\n"
                        output += f"  Username: {info['username']}\n"
                        output += f"  Password: {info['password']}\n"
                        if 'tags' in info and info['tags']:
                            output += f"  Tags: {', '.join(info['tags'])}\n"
                        output += "\n"
                    results_text.setText(output)
                    self.output_text.setText(f"Found {len(results)} matching password(s)")
                else:
                    results_text.setText("No results found matching your criteria.")
                    self.output_text.setText("No matching passwords found")
            except Exception as e:
                QMessageBox.critical(dialog, "Error", f"An error occurred: {str(e)}")
        
        search_btn.clicked.connect(perform_search)
        cancel_btn.clicked.connect(dialog.reject)
        
        dialog.show()
        
    def show_delete_password(self):
        dialog = QDialog(self)
        dialog.setWindowTitle("Delete Password")
        dialog.setGeometry(200, 200, 400, 220)
        dialog.setStyleSheet("""
        QDialog {
            background-color: #1a1a1a;
        }
        QLabel {
            color: white;
            font-size: 11px;
        }
        QLineEdit, QComboBox {
            background-color: #2d2d2d;
            color: white;
            border: 1px solid #3d3d3d;
            border-radius: 3px;
            padding: 4px;
            font-size: 11px;
        }
        QPushButton {
            background-color: #2d2d2d;
            color: white;
            border: 1px solid #42d4d4;
            border-radius: 3px;
            padding: 5px;
            font-size: 11px;
        }
        QPushButton:hover {
            background-color: #3d3d3d;
            border: 1px solid #42d4d4;
            color: #42d4d4;
        }
        """)
        
        layout = QVBoxLayout(dialog)
        layout.setSpacing(5)
        layout.setContentsMargins(10, 10, 10, 10)
        
        category_label = QLabel("Category (optional):")
        category_combo = QComboBox()
        category_combo.addItem("All Categories")
        for category in self.password_manager.get_categories():
            category_combo.addItem(category)
        
        service_label = QLabel("Service Name:")
        service_input = QLineEdit()
        service_input.setPlaceholderText("Enter service name to delete")
        
        layout.addWidget(category_label)
        layout.addWidget(category_combo)
        layout.addWidget(service_label)
        layout.addWidget(service_input)
        
        # Add warning label
        warning_label = QLabel("Warning: This action cannot be undone!")
        warning_label.setStyleSheet("color: #ff5555; font-weight: bold;")
        layout.addWidget(warning_label)
        
        button_layout = QHBoxLayout()
        delete_btn = QPushButton("Delete")
        cancel_btn = QPushButton("Cancel")
        
        def delete_action():
            service = service_input.text()
            category = None if category_combo.currentText() == "All Categories" else category_combo.currentText()
            
            if not service:
                QMessageBox.warning(dialog, "Error", "Please enter a service name!")
                return
                
            # Confirm deletion
            confirm = QMessageBox.question(
                dialog, "Confirm Deletion", 
                f"Are you sure you want to delete password for '{service}'?", 
                QMessageBox.Yes | QMessageBox.No
            )
            
            if confirm == QMessageBox.Yes:
                # Try to delete the password
                try:
                    success = self.password_manager.delete_password(service, category)
                    if success:
                        self.output_text.setText(f"Password deleted for service: {service}")
                        dialog.accept()
                    else:
                        QMessageBox.warning(
                            dialog, "Error", 
                            f"Service '{service}' not found in the selected category!"
                        )
                except Exception as e:
                    QMessageBox.critical(dialog, "Error", f"An error occurred: {str(e)}")
        
        delete_btn.clicked.connect(delete_action)
        cancel_btn.clicked.connect(dialog.reject)
        
        button_layout.addWidget(delete_btn)
        button_layout.addWidget(cancel_btn)
        layout.addLayout(button_layout)
        
        dialog.show()
        
    def show_update_password(self):
        dialog = QWidget()
        dialog.setWindowTitle("Update Password")
        dialog.setGeometry(200, 200, 400, 300)
        dialog.setStyleSheet("""
        QWidget {
            background-color: #1a1a1a;
        }
        QLabel {
            color: white;
            font-size: 11px;
        }
        QLineEdit, QComboBox {
            background-color: #2d2d2d;
            color: white;
            border: 1px solid #3d3d3d;
            border-radius: 3px;
            padding: 4px;
            font-size: 11px;
        }
        QLineEdit:focus, QComboBox:focus {
            border: 1px solid #42d4d4;
        }
        QPushButton {
            background-color: #2d2d2d;
            color: white;
            border: none;
            padding: 5px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 11px;
        }
        QPushButton:hover {
            background-color: #3d3d3d;
            border: 1px solid #42d4d4;
            color: #42d4d4;
        }
        QComboBox::drop-down {
            border: 0px;
        }
        QComboBox QAbstractItemView {
            background-color: #2d2d2d;
            color: white;
            selection-background-color: #3d3d3d;
            selection-color: #42d4d4;
        }
    """)
        layout = QVBoxLayout(dialog)
        layout.setSpacing(5)
        layout.setContentsMargins(10, 10, 10, 10)
        
        category_label = QLabel("Category (optional):")
        category_combo = QComboBox()
        category_combo.addItem("All Categories")
        for category in self.password_manager.get_categories():
            category_combo.addItem(category)
        
        service_label = QLabel("Service Name:")
        service_input = QLineEdit()
        service_input.setPlaceholderText("Enter service name")
        
        username_label = QLabel("New Username:")
        username_input = QLineEdit()
        username_input.setPlaceholderText("Enter new username")
        
        password_label = QLabel("New Password:")
        password_input = QLineEdit()
        password_input.setPlaceholderText("Enter new password")
        password_input.setEchoMode(QLineEdit.Password)
        
        # Add tags field
        tags_label = QLabel("Tags (comma separated):")
        tags_input = QLineEdit()
        tags_input.setPlaceholderText("e.g., work, personal, important")
        
        layout.addWidget(category_label)
        layout.addWidget(category_combo)
        layout.addWidget(service_label)
        layout.addWidget(service_input)
        layout.addWidget(username_label)
        layout.addWidget(username_input)
        layout.addWidget(password_label)
        layout.addWidget(password_input)
        layout.addWidget(tags_label)
        layout.addWidget(tags_input)
        
        button_layout = QHBoxLayout()
        update_btn = QPushButton("Update")
        cancel_btn = QPushButton("Cancel")
        
        # Wrap update_password in try-except to prevent crashes
        def safe_update():
            try:
                self.update_password(
                    service_input.text(),
                    username_input.text(),
                    password_input.text(),
                    None if category_combo.currentText() == "All Categories" else category_combo.currentText(),
                    tags_input.text(),
                    dialog
                )
            except Exception as e:
                QMessageBox.critical(dialog, "Error", f"An error occurred: {str(e)}")
            
        update_btn.clicked.connect(safe_update)
        cancel_btn.clicked.connect(dialog.close)

        button_layout.addWidget(update_btn)
        button_layout.addWidget(cancel_btn)
        layout.addLayout(button_layout)

        dialog.show()

    def update_password(self, service, username, password, category, tags, dialog):
        try:
            if not all([service, username, password]):
                QMessageBox.warning(dialog, "Error", "Please fill all fields!")
                return
            
            # Process tags - split by comma and strip whitespace
            tag_list = []
            if tags:
                tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            
            # Update the password with tags
            success = self.password_manager.update_password(service, username, password, category, tag_list)

            if success:
                # Show confirmation with tags if any were added
                if tag_list:
                    self.output_text.setText(f"Password updated for service: {service} (Category: {category if category else 'found'}, Tags: {', '.join(tag_list)})")
                else:
                    self.output_text.setText(f"Password updated for service: {service} (Category: {category if category else 'found'})")
                dialog.close()
            else:
                QMessageBox.warning(dialog, "Error", f"Service '{service}' not found in the selected category!")
        except Exception as e:
            QMessageBox.critical(dialog, "Error", f"An error occurred: {str(e)}")
        
    def import_passwords(self):
        # Modified to better recognize CSV files
        file_path, _ = QFileDialog.getOpenFileName(
            self, 
            "Select CSV File", 
            "", 
            "CSV Files (*.csv);;All Files (*)"
        )
        if file_path:
            success = self.password_manager.import_passwords(file_path)
            if success:
                self.output_text.setText("Passwords imported successfully.")
            else:
                self.output_text.setText("Error importing passwords. Please check file format.")
            
    def export_passwords(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Save CSV File", "", "CSV Files (*.csv)")
        if file_path:
            # Ensure the file has .csv extension
            if not file_path.lower().endswith('.csv'):
                file_path += '.csv'
                
            success = self.password_manager.export_passwords(file_path)
            if success:
                self.output_text.setText(f"Passwords exported to {file_path}")
            else:
                self.output_text.setText("Error exporting passwords.")
                
    def show_generate_password(self):
        dialog = QWidget()
        dialog.setWindowTitle("Generate Password")
        dialog.setGeometry(200, 200, 300, 120)
        dialog.setStyleSheet("""
            QWidget {
                background-color: #1a1a1a;
            }
            QLabel {
                color: white;
                font-size: 11px;
            }
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 4px;
                font-size: 11px;
            }
            QLineEdit:focus {
                border: 1px solid #42d4d4;
            }
            QPushButton {
                background-color: #2d2d2d;
                color: white;
                border: none;
                padding: 5px;
                border-radius: 3px;
                font-weight: bold;
                font-size: 11px;
            }
            QPushButton:hover {
                background-color: #3d3d3d;
                border: 1px solid #42d4d4;
                color: #42d4d4;
            }
            QSpinBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 3px;
                padding: 4px;
                font-size: 11px;
            }
        """)
        layout = QVBoxLayout(dialog)
        layout.setSpacing(5)
        layout.setContentsMargins(10, 10, 10, 10)
        

        length_layout = QHBoxLayout()
        length_label = QLabel("Password Length:")
        length_spin = QSpinBox()
        length_spin.setRange(8, 32)
        length_spin.setValue(12)
        length_layout.addWidget(length_label)
        length_layout.addWidget(length_spin)
        layout.addLayout(length_layout)

        password_display = QLineEdit()
        password_display.setReadOnly(True)
        password_display.setPlaceholderText("Generated password will appear here")
        layout.addWidget(password_display)
        
        button_layout = QHBoxLayout()
        generate_btn = QPushButton("Generate")
        copy_btn = QPushButton("Copy")
        cancel_btn = QPushButton("Cancel")
        
        def generate():
            password = self.password_manager.generate_password(length_spin.value())
            password_display.setText(password)
            
        def copy():
            if password_display.text():
                QApplication.clipboard().setText(password_display.text())
                QMessageBox.information(dialog, "Success", "Password copied to clipboard!")
                
        generate_btn.clicked.connect(generate)
        copy_btn.clicked.connect(copy)
        cancel_btn.clicked.connect(dialog.close)
        
        button_layout.addWidget(generate_btn)
        button_layout.addWidget(copy_btn)
        button_layout.addWidget(cancel_btn)
        layout.addLayout(button_layout)
        
        dialog.show()

    def show_all_passwords(self):
        output = "All Passwords by Category:\n\n"
        
        for category in self.password_manager.get_categories():
            category_passwords = self.password_manager.passwords["categories"][category]
            if category_passwords:
                output += f"Category: {category}\n"
                output += "-" * 40 + "\n"
                
                for service, creds in category_passwords.items():
                    output += f"Service: {service}\n"
                    output += f"Username: {creds['username']}\n"
                    output += f"Password: {creds['password']}\n"
                    output += "-" * 30 + "\n"
                
                output += "\n"
        
        if output == "All Passwords by Category:\n\n":
            output += "No passwords stored."
        
        self.output_text.setText(output)
    
    def check_password_strength(self, password):
        """Evaluate the strength of a password"""
        score = 0
        feedback = []
        
        # Check length
        if len(password) < 8:
            feedback.append("Password is too short (minimum 8 characters)")
        elif len(password) >= 12:
            score += 25
        else:
            score += 10
        
        # Check for uppercase letters
        if any(c.isupper() for c in password):
            score += 10
        else:
            feedback.append("Add uppercase letters")
        
        # Check for lowercase letters
        if any(c.islower() for c in password):
            score += 10
        else:
            feedback.append("Add lowercase letters")
        
        # Check for digits
        if any(c.isdigit() for c in password):
            score += 10
        else:
            feedback.append("Add numbers")
        
        # Check for special characters
        if any(not c.isalnum() for c in password):
            score += 15
        else:
            feedback.append("Add special characters")
        
        # Check for common patterns
        common_patterns = ['123456', 'password', 'qwerty', 'admin']
        if any(pattern in password.lower() for pattern in common_patterns):
            score -= 20
            feedback.append("Avoid common patterns")
        
        # Determine strength category and color
        if score < 30:
            strength = "Weak"
            color = "#FF0000"  # Red
        elif score < 50:
            strength = "Moderate"
            color = "#FFA500"  # Orange
        elif score < 70:
            strength = "Strong"
            color = "#FFFF00"  # Yellow
        else:
            strength = "Very Strong"
            color = "#00FF00"  # Green
        
        # Prepare feedback message
        if feedback:
            feedback_msg = f"{strength} - {', '.join(feedback)}"
        else:
            feedback_msg = strength
        
        return score, feedback_msg, color
    

    
    def show_security_check(self):
        """Show a separate security check dialog window"""
        # Create a proper dialog window
        dialog = QDialog(self)
        dialog.setWindowTitle("Password Security Check")
        dialog.setFixedSize(450, 400)
        dialog.setStyleSheet("""
            QDialog {
                background-color: #1a1a1a;
            }
            QLabel {
                color: white;
            }
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 6px;
            }
            QPushButton {
                background-color: #2d2d2d;
                color: white;
                border: none;
                padding: 8px;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #3d3d3d;
                border: 1px solid #42d4d4;
                color: #42d4d4;
            }
        """)
        
        # Main layout
        layout = QVBoxLayout(dialog)
        layout.setSpacing(10)
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Title
        title_label = QLabel("Password Security Checker")
        title_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white; margin-bottom: 10px;")
        layout.addWidget(title_label)
        
        # Instructions
        instructions = QLabel("Enter a password below to check its security strength")
        layout.addWidget(instructions)
        
        # Password input
        password_input = QLineEdit()
        password_input.setPlaceholderText("Enter password to check")
        password_input.setEchoMode(QLineEdit.Password)
        layout.addWidget(password_input)
        
        # Show/Hide button
        show_hide_btn = QPushButton("Show Password")
        layout.addWidget(show_hide_btn)
        
        # Strength meter label
        meter_label = QLabel("Password Strength:")
        layout.addWidget(meter_label)
        
        # Strength meter container
        meter_container = QFrame()
        meter_container.setStyleSheet("background-color: #2d2d2d; border-radius: 4px;")
        meter_container.setFixedHeight(20)
        meter_layout = QHBoxLayout(meter_container)
        meter_layout.setContentsMargins(2, 2, 2, 2)
        meter_layout.setSpacing(0)
        
        # Strength bar
        strength_bar = QFrame()
        strength_bar.setFixedWidth(0)  # Initially empty
        strength_bar.setStyleSheet("background-color: #666; border-radius: 2px;")
        meter_layout.addWidget(strength_bar)
        meter_layout.addStretch()
        
        layout.addWidget(meter_container)
        
        # Results area
        result_label = QLabel("Results will appear here")
        result_label.setWordWrap(True)
        result_label.setStyleSheet("""
            background-color: #2d2d2d;
            color: white;
            padding: 15px;
            border-radius: 4px;
            min-height: 80px;
        """)
        layout.addWidget(result_label)
        
        # Buttons
        button_layout = QHBoxLayout()
        check_btn = QPushButton("Check Strength")
        close_btn = QPushButton("Close")
        
        button_layout.addWidget(check_btn)
        button_layout.addWidget(close_btn)
        layout.addLayout(button_layout)
        
        # Functions
        def toggle_password_visibility():
            if password_input.echoMode() == QLineEdit.Password:
                password_input.setEchoMode(QLineEdit.Normal)
                show_hide_btn.setText("Hide Password")
            else:
                password_input.setEchoMode(QLineEdit.Password)
                show_hide_btn.setText("Show Password")
        
        def check_security():
            password = password_input.text()
            if not password:
                result_label.setText("Please enter a password to check")
                return
            
            # Get password strength
            score, feedback, color = self.check_password_strength(password)
            
            # Update result text
            result_label.setText(feedback)
            result_label.setStyleSheet(f"""
                background-color: #2d2d2d;
                color: {color};
                padding: 15px;
                border-radius: 4px;
                min-height: 80px;
            """)
            
            # Update strength bar
            bar_width = int((meter_container.width() - 4) * score / 100)
            strength_bar.setFixedWidth(max(bar_width, 4))  # At least 4px wide
            strength_bar.setStyleSheet(f"background-color: {color}; border-radius: 2px;")
        
        # Connect signals
        show_hide_btn.clicked.connect(toggle_password_visibility)
        check_btn.clicked.connect(check_security)
        close_btn.clicked.connect(dialog.accept)
        
        # Show the dialog
        dialog.exec_()

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    # Try to handle platform-specific settings
    if sys.platform.startswith('linux'):
        # Additional Linux-specific setup if needed
        pass
    
    window = PasswordManagerGUI()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
