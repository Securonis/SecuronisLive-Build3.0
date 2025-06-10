#!/usr/bin/env python3
# DEVELOPER: root0emir 
import sys
import os
import json
import csv
from datetime import datetime
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QLabel, QLineEdit, QTextEdit, 
                           QPushButton, QComboBox, QListWidget, QListWidgetItem,
                           QMessageBox, QFileDialog, QCalendarWidget, QDialog,
                           QTabWidget, QFrame, QScrollArea, QCheckBox,
                           QSpinBox, QColorDialog, QFontDialog, QMenuBar,
                           QMenu, QAction, QStatusBar, QToolBar, QToolButton,
                           QInputDialog, QSplitter, QStyle, QStyleFactory,
                           QStyleOptionButton, QGroupBox)
from PyQt5.QtCore import Qt, QSize, QTimer, QDateTime, QPropertyAnimation, QEasingCurve, pyqtSignal, QDate
from PyQt5.QtGui import QFont, QIcon, QColor, QPalette, QTextCharFormat, QLinearGradient, QPainter
from cryptography.fernet import Fernet

# Securonis Notes GUI Developed by root0emir Version 2.5 

class ModernCheckBox(QCheckBox):
    def __init__(self, text, parent=None):
        super().__init__(text, parent)
        self.setStyleSheet("""
            QCheckBox {
                color: white;
                font-weight: bold;
                padding: 5px;
                border-radius: 4px;
            }
            QCheckBox::indicator {
                width: 24px;
                height: 24px;
            }
            QCheckBox::indicator:unchecked {
                border: 2px solid #4d4d4d;
                background-color: #2d2d2d;
                border-radius: 4px;
            }
            QCheckBox::indicator:checked {
                border: 2px solid #4d4d4d;
                background-color: #4d4d4d;
                border-radius: 4px;
            }
            QCheckBox::indicator:checked:hover {
                border: 2px solid #5d5d5d;
                background-color: #5d5d5d;
            }
            QCheckBox::indicator:unchecked:hover {
                border: 2px solid #5d5d5d;
                background-color: #3d3d3d;
            }
            QCheckBox::indicator:pressed {
                border: 2px solid #3d3d3d;
                background-color: #2d2d2d;
            }
        """)
        self.setCursor(Qt.PointingHandCursor)
        
    def paintEvent(self, event):
        super().paintEvent(event)
        if self.isChecked():
            painter = QPainter(self)
            painter.setPen(Qt.white)
            painter.setFont(QFont("Arial", 16))
            

            style = self.style()
            opt = QStyleOptionButton()
            self.initStyleOption(opt)
            indicator_rect = style.subElementRect(QStyle.SE_CheckBoxIndicator, opt, self)
            
           
            painter.drawText(indicator_rect, Qt.AlignCenter | Qt.AlignVCenter, "✓")

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
            }
            QPushButton:hover {
                background-color: #3d3d3d;
            }
            QPushButton:pressed {
                background-color: #1d1d1d;
            }
        """)
        self.setCursor(Qt.PointingHandCursor)
        
        # Add hover animation
        self.animation = QPropertyAnimation(self, b"geometry")
        self.animation.setDuration(100)
        self.animation.setEasingCurve(QEasingCurve.OutCubic)
        
    def enterEvent(self, event):
        self.animation.setStartValue(self.geometry())
        self.animation.setEndValue(self.geometry().adjusted(-2, -2, 2, 2))
        self.animation.start()
        
    def leaveEvent(self, event):
        self.animation.setStartValue(self.geometry())
        self.animation.setEndValue(self.geometry().adjusted(2, 2, -2, -2))
        self.animation.start()

class CategoryManager(QDialog):
    def __init__(self, parent=None, categories=None):
        super().__init__(parent)
        self.categories = categories or []
        self.setup_ui()
        
    def setup_ui(self):
        self.setWindowTitle("Category Manager")
        self.setGeometry(300, 300, 400, 500)
        self.setStyleSheet("""
            QDialog {
                background-color: #1d1d1d;
                color: white;
            }
        """)
        
        layout = QVBoxLayout()
        
        # Current categories list
        category_label = QLabel("Current Categories:")
        category_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        layout.addWidget(category_label)
        
        self.category_list = QListWidget()
        self.category_list.setStyleSheet("""
            QListWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #4d4d4d;
                color: white;
            }
            QListWidget::item:hover {
                background-color: #3d3d3d;
            }
        """)
        layout.addWidget(self.category_list)
        
        # Category add area
        add_layout = QHBoxLayout()
        self.new_category = QLineEdit()
        self.new_category.setPlaceholderText("Add new category...")
        self.new_category.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 4px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #4d4d4d;
            }
        """)
        
        add_button = ModernButton("Add")
        add_button.clicked.connect(self.add_category)
        add_layout.addWidget(self.new_category)
        add_layout.addWidget(add_button)
        layout.addLayout(add_layout)
        
        # Delete category button
        delete_button = ModernButton("Delete Selected")
        delete_button.clicked.connect(self.delete_category)
        layout.addWidget(delete_button)
        
        # Close button
        close_button = ModernButton("Close")
        close_button.clicked.connect(self.accept)
        layout.addWidget(close_button)
        
        self.setLayout(layout)
        
        # Fill category list
        self.update_category_list()
        
    def update_category_list(self):
        self.category_list.clear()
        for category in sorted(self.categories):
            self.category_list.addItem(category)
            
    def add_category(self):
        category = self.new_category.text().strip()
        if category and category not in self.categories:
            self.categories.append(category)
            self.update_category_list()
            self.new_category.clear()
            
    def delete_category(self):
        selected_items = self.category_list.selectedItems()
        if selected_items:
            category = selected_items[0].text()
            if category in self.categories:
                self.categories.remove(category)
                self.update_category_list()
                
    def get_categories(self):
        return self.categories

class TagManager(QDialog):
    def __init__(self, parent=None, tags=None):
        super().__init__(parent)
        self.tags = tags or []
        self.setup_ui()
        
    def setup_ui(self):
        self.setWindowTitle("Tag Manager")
        self.setGeometry(300, 300, 400, 500)
        self.setStyleSheet("""
            QDialog {
                background-color: #1d1d1d;
                color: white;
            }
        """)
        
        layout = QVBoxLayout()
        
        # Current tags list
        tag_label = QLabel("Current Tags:")
        tag_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        layout.addWidget(tag_label)
        
        self.tag_list = QListWidget()
        self.tag_list.setStyleSheet("""
            QListWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #4d4d4d;
                color: white;
            }
            QListWidget::item:hover {
                background-color: #3d3d3d;
            }
        """)
        layout.addWidget(self.tag_list)
        
        # Tag add area
        add_layout = QHBoxLayout()
        self.new_tag = QLineEdit()
        self.new_tag.setPlaceholderText("Add new tag...")
        self.new_tag.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;8
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 4px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #4d4d4d;
            }
        """)
        
        add_button = ModernButton("Add")
        add_button.clicked.connect(self.add_tag)
        add_layout.addWidget(self.new_tag)
        add_layout.addWidget(add_button)
        layout.addLayout(add_layout)
        
        # Delete tag button
        delete_button = ModernButton("Delete Selected")
        delete_button.clicked.connect(self.delete_tag)
        layout.addWidget(delete_button)
        
        # Close button
        close_button = ModernButton("Close")
        close_button.clicked.connect(self.accept)
        layout.addWidget(close_button)
        
        self.setLayout(layout)
        
        # Fill tag list
        self.update_tag_list()
        
    def update_tag_list(self):
        self.tag_list.clear()
        for tag in sorted(self.tags):
            self.tag_list.addItem(tag)
            
    def add_tag(self):
        tag = self.new_tag.text().strip()
        if tag and tag not in self.tags:
            self.tags.append(tag)
            self.update_tag_list()
            self.new_tag.clear()
            
    def delete_tag(self):
        selected_items = self.tag_list.selectedItems()
        if selected_items:
            tag = selected_items[0].text()
            if tag in self.tags:
                self.tags.remove(tag)
                self.update_tag_list()
                
    def get_tags(self):
        return self.tags

class Note:
    def __init__(self, title="", content="", tags=None, priority="low",
                 due_date=None, category="general", color="#ffffff",
                 font_family="Arial", font_size=10, is_encrypted=False,
                 encryption_password_hash=None):
        self.title = title
        self.content = content
        self.tags = tags or []
        self.priority = priority
        self.due_date = due_date or datetime.now()
        self.category = category
        self.color = color
        self.font_family = font_family
        self.font_size = font_size
        self.is_encrypted = is_encrypted
        self.encryption_password_hash = encryption_password_hash
        self.created_at = datetime.now()
        self.modified_at = datetime.now()
        self.attachments = []  
        self.reminder = None
        self.is_favorite = False
        self.is_archived = False
        
    def __eq__(self, other):
    
        if not isinstance(other, Note):
            return False
        return (self.title == other.title and 
                self.content == other.content and
                self.created_at == other.created_at)
        
    def add_attachment(self, file_path):
        # File attachment function
        file_name = os.path.basename(file_path)
        
        # File size check (10MB limit)
        file_size = os.path.getsize(file_path)
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise ValueError("File size exceeds the 10MB limit.")
            
        # Extension check
        allowed_extensions = ['.txt', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif']
        file_extension = os.path.splitext(file_name)[1].lower()
        if file_extension not in allowed_extensions:
            raise ValueError(f"File type {file_extension} is not allowed.")
            
        try:
            with open(file_path, 'rb') as file:
                file_content = file.read()
                # Base64 encoding
                import base64
                encoded_content = base64.b64encode(file_content).decode('utf-8')
                
                # File count limit (10 attachments)
                if len(self.attachments) >= 10:
                    raise ValueError("Maximum 10 attachments allowed per note.")
                    
                self.attachments.append({
                    'name': file_name,
                    'content': encoded_content,
                    'size': file_size,
                    'type': file_extension,
                    'added_time': datetime.now().isoformat()
                })
                return True
        except Exception as e:
            print(f"File attachment error: {str(e)}")
            raise e
            
    def get_attachment(self, file_name):
    
        for attachment in self.attachments:
            if attachment['name'] == file_name:
                import base64
                return base64.b64decode(attachment['content'])
        return None

    def to_dict(self):
      
        return {
            'title': self.title,
            'content': self.content,
            'tags': self.tags,
            'priority': self.priority,
            'due_date': self.due_date.isoformat(),
            'category': self.category,
            'color': self.color,
            'font_family': self.font_family,
            'font_size': self.font_size,
            'is_encrypted': self.is_encrypted,
            'encryption_password_hash': self.encryption_password_hash if hasattr(self, 'encryption_password_hash') else None,
            'created_at': self.created_at.isoformat(),
            'modified_at': self.modified_at.isoformat(),
            'attachments': self.attachments,
            'reminder': self.reminder.isoformat() if self.reminder else None,
            'is_favorite': self.is_favorite,
            'is_archived': self.is_archived
        }
        
    @classmethod
    def from_dict(cls, data):
        # Create Note object from dictionary
        note = cls()
        note.title = data.get('title', '')
        note.content = data.get('content', '')
        note.tags = data.get('tags', [])
        note.priority = data.get('priority', 'low')
        
        # Process date fields more safely
        try:
            note.due_date = datetime.fromisoformat(data.get('due_date', datetime.now().isoformat()))
        except (ValueError, TypeError):
            note.due_date = datetime.now()
            
        try:
            note.created_at = datetime.fromisoformat(data.get('created_at', datetime.now().isoformat()))
        except (ValueError, TypeError):
            note.created_at = datetime.now()
            
        try:
            note.modified_at = datetime.fromisoformat(data.get('modified_at', datetime.now().isoformat()))
        except (ValueError, TypeError):
            note.modified_at = datetime.now()
            
        note.category = data.get('category', 'general')
        note.color = data.get('color', '#ffffff')
        note.font_family = data.get('font_family', 'Arial')
        note.font_size = data.get('font_size', 10)
        note.is_encrypted = data.get('is_encrypted', False)
        note.encryption_password_hash = data.get('encryption_password_hash', None)
        note.attachments = data.get('attachments', [])
        
        # Process reminder field safely
        reminder_str = data.get('reminder')
        if reminder_str:
            try:
                note.reminder = datetime.fromisoformat(reminder_str)
            except (ValueError, TypeError):
                note.reminder = None
        else:
            note.reminder = None
            
        note.is_favorite = data.get('is_favorite', False)
        note.is_archived = data.get('is_archived', False)
        return note

class NoteEditor(QWidget):
    reminder_changed = pyqtSignal(int)  # Reminder change signal
    attachment_changed = pyqtSignal(int)  # Attachment change signal
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(10)
        layout.setContentsMargins(10, 10, 10, 10)
        

        title_label = QLabel("Title:")
        title_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.title_edit = QLineEdit()
        self.title_edit.setPlaceholderText("Enter note title...")
        self.title_edit.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 10px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
            }
            QLineEdit:focus {
                border: 1px solid #4d9de0;
                background-color: #333333;
            }
        """)
        layout.addWidget(title_label)
        layout.addWidget(self.title_edit)
        

        content_label = QLabel("Content:")
        content_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.content_edit = QTextEdit()
        self.content_edit.setStyleSheet("""
            QTextEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 10px;
                border-radius: 5px;
                font-size: 14px;
                line-height: 1.5;
            }
            QTextEdit:focus {
                border: 1px solid #4d9de0;
                background-color: #333333;
            }
        """)
        layout.addWidget(content_label)
        layout.addWidget(self.content_edit)
        

        bottom_layout = QHBoxLayout()

        left_panel = QVBoxLayout()
        
        tags_label = QLabel("Tags:")
        tags_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.tags_edit = QLineEdit()
        self.tags_edit.setPlaceholderText("Enter tags separated by commas...")
        self.tags_edit.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 5px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #4d9de0;
                background-color: #333333;
            }
        """)
        left_panel.addWidget(tags_label)
        left_panel.addWidget(self.tags_edit)
        

        priority_label = QLabel("Priority:")
        priority_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.priority_combo = QComboBox()
        self.priority_combo.addItems(["low", "medium", "high"])
        self.priority_combo.setStyleSheet("""
            QComboBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 5px;
                font-size: 14px;
                min-width: 150px;
            }
            QComboBox:focus {
                border: 1px solid #4d9de0;
                background-color: #333333;
            }
            QComboBox::drop-down {
                subcontrol-origin: padding;
                subcontrol-position: top right;
                width: 30px;
                border-left: 1px solid #3d3d3d;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: white;
                selection-background-color: #4d9de0;
                selection-color: white;
            }
        """)
        left_panel.addWidget(priority_label)
        left_panel.addWidget(self.priority_combo)
        
   
        category_label = QLabel("Category:")
        category_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.category_combo = QComboBox()
        self.category_combo.setEditable(False)
        self.category_combo.addItems(["general", "work", "personal", "ideas", "tasks"])
        self.category_combo.setStyleSheet("""
            QComboBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 5px;
                font-size: 14px;
                min-width: 150px;
            }
            QComboBox:focus {
                border: 1px solid #4d9de0;
                background-color: #333333;
            }
            QComboBox::drop-down {
                subcontrol-origin: padding;
                subcontrol-position: top right;
                width: 30px;
                border-left: 1px solid #3d3d3d;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: white;
                selection-background-color: #4d9de0;
                selection-color: white;
            }
        """)
        left_panel.addWidget(category_label)
        left_panel.addWidget(self.category_combo)
        

        # Right panel (date, checkboxes)
        right_panel = QVBoxLayout()
        
   
        # Due date
        due_date_label = QLabel("Due Date:")
        due_date_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.due_date_edit = QLineEdit()
        self.due_date_edit.setText(datetime.now().strftime("%Y-%m-%d %H:%M"))
        self.due_date_edit.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 5px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #4d9de0;
                background-color: #333333;
            }
        """)
        calendar_button = ModernButton("📅")
        calendar_button.setFixedSize(40, 35)
        calendar_button.clicked.connect(self.show_calendar)
        due_date_layout = QHBoxLayout()
        due_date_layout.addWidget(self.due_date_edit)
        due_date_layout.addWidget(calendar_button)
        right_panel.addWidget(due_date_label)
        right_panel.addLayout(due_date_layout)
        

        check_label = QLabel("Options:")
        check_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        right_panel.addWidget(check_label)
        

        self.encrypt_check = ModernCheckBox("Encrypt")
        right_panel.addWidget(self.encrypt_check)
        

        self.favorite_check = ModernCheckBox("Favorite")
        right_panel.addWidget(self.favorite_check)
        

        self.archive_check = ModernCheckBox("Archive")
        right_panel.addWidget(self.archive_check)
        

        self.reminder_check = ModernCheckBox("Set Reminder")
        self.reminder_check.stateChanged.connect(self.on_reminder_changed)
        right_panel.addWidget(self.reminder_check)
        
        self.attachment_check = ModernCheckBox("Attachments")
        self.attachment_check.stateChanged.connect(self.on_attachment_changed)
        right_panel.addWidget(self.attachment_check)
        

        bottom_layout.addLayout(left_panel)
        bottom_layout.addLayout(right_panel)
        layout.addLayout(bottom_layout)
        
 
        button_layout = QHBoxLayout()
        
     
        save_button = ModernButton("Save")
        save_button.setStyleSheet("""
            QPushButton {
                background-color: #4d9de0;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #5db9e6;
            }
            QPushButton:pressed {
                background-color: #3d7de0;
            }
        """)
        save_button.clicked.connect(self.save_note)
        button_layout.addWidget(save_button)
        

        clear_button = ModernButton("Clear Form")
        clear_button.clicked.connect(self.clear_form)
        button_layout.addWidget(clear_button)
        

        color_button = ModernButton("Text Color")
        color_button.clicked.connect(self.choose_color)
        button_layout.addWidget(color_button)
        
   
        font_button = ModernButton("Text Font")
        font_button.clicked.connect(self.choose_font)
        button_layout.addWidget(font_button)
        
        layout.addLayout(button_layout)
        
        self.setLayout(layout)
    
    def choose_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            self.content_edit.setTextColor(color)
    
    def choose_font(self):
        font, ok = QFontDialog.getFont()
        if ok:
            self.content_edit.setFont(font)

    def clear_form(self):
        self.title_edit.clear()
        self.content_edit.clear()
        self.tags_edit.clear()
        self.priority_combo.setCurrentText("low")
        self.category_combo.setCurrentText("general")
        self.due_date_edit.setText(datetime.now().strftime("%Y-%m-%d %H:%M"))
        self.encrypt_check.setChecked(False)
        self.favorite_check.setChecked(False)
        self.archive_check.setChecked(False)
        self.reminder_check.setChecked(False)
        self.attachment_check.setChecked(False)
        
    def save_note(self):
    
        main_window = self.get_main_window()
        if main_window:
            main_window.save_note()
        else:
        
            note = Note()
            note.title = self.title_edit.text()
            note.content = self.content_edit.toPlainText()
            note.tags = [tag.strip() for tag in self.tags_edit.text().split(",") if tag.strip()]
            note.priority = self.priority_combo.currentText()
            note.category = self.category_combo.currentText()
            note.due_date = datetime.strptime(self.due_date_edit.text(), "%Y-%m-%d %H:%M")
            note.is_encrypted = self.encrypt_check.isChecked()
            note.is_favorite = self.favorite_check.isChecked()
            note.is_archived = self.archive_check.isChecked()
            note.modified_at = datetime.now()
            

            main_window = self.get_main_window()
            if main_window:
                main_window.add_note(note)
                QMessageBox.information(self, "Success", "Note saved successfully!")
            else:
                QMessageBox.warning(self, "Error", "Note could not be saved: Main window not found.")

    def get_main_window(self):

        parent = self.parent()
        while parent is not None and not isinstance(parent, MainWindow):
            parent = parent.parent()
        return parent

    def show_calendar(self):

        dialog = QDialog(self)
        dialog.setWindowTitle("Select Date")
        dialog.setGeometry(300, 300, 400, 400)
        dialog.setStyleSheet("""
            QDialog {
                background-color: #2d2d2d;
                color: white;
            }
        """)
        
        layout = QVBoxLayout()
        
        calendar = QCalendarWidget()
        calendar.setStyleSheet("""
            QCalendarWidget {
                background-color: #2d2d2d;
                color: white;
            }
            QCalendarWidget QToolButton {
                color: white;
                background-color: #3d3d3d;
                border: 1px solid #4d4d4d;
                border-radius: 4px;
            }
            QCalendarWidget QMenu {
                background-color: #2d2d2d;
                color: white;
            }
            QCalendarWidget QSpinBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #4d4d4d;
            }
            QCalendarWidget QAbstractItemView:enabled {
                color: white;
                background-color: #3d3d3d;
                selection-background-color: #4d9de0;
                selection-color: white;
            }
            QCalendarWidget QWidget#qt_calendar_navigationbar {
                background-color: #2d2d2d;
            }
        """)
        layout.addWidget(calendar)
        
        time_layout = QHBoxLayout()
        time_label = QLabel("Time (HH:MM):")
        time_label.setStyleSheet("color: white;")
        time_edit = QLineEdit()
        time_edit.setText(datetime.now().strftime("%H:%M"))
        time_edit.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 5px;
                border-radius: 4px;
            }
        """)
        time_layout.addWidget(time_label)
        time_layout.addWidget(time_edit)
        layout.addLayout(time_layout)
        
        button_layout = QHBoxLayout()
        ok_button = ModernButton("OK")
        cancel_button = ModernButton("Cancel")
        button_layout.addWidget(ok_button)
        button_layout.addWidget(cancel_button)
        layout.addLayout(button_layout)
        
        dialog.setLayout(layout)
        
        def update_date():
            selected_date = calendar.selectedDate().toPyDate()
            time_text = time_edit.text()
            try:
                selected_time = datetime.strptime(time_text, "%H:%M").time()
                full_datetime = datetime.combine(selected_date, selected_time)
                self.due_date_edit.setText(full_datetime.strftime("%Y-%m-%d %H:%M"))
                dialog.accept()
            except ValueError:
                QMessageBox.warning(dialog, "Error", "Invalid time format. Use HH:MM.")
        
        ok_button.clicked.connect(update_date)
        cancel_button.clicked.connect(dialog.reject)
        
        dialog.exec_()

    def on_reminder_changed(self, state):
        self.reminder_changed.emit(state)
    
    def on_attachment_changed(self, state):
        self.attachment_changed.emit(state)

class NoteList(QWidget):
 
    note_selected = pyqtSignal(object)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(10)
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Search with modern styling
        search_layout = QHBoxLayout()
        search_label = QLabel("Search:")
        search_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Search notes...")
        self.search_edit.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 4px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #4d4d4d;
            }
        """)
        self.search_edit.textChanged.connect(self.on_search_changed)
        search_layout.addWidget(search_label)
        search_layout.addWidget(self.search_edit)
        layout.addLayout(search_layout)
        
        # Filters with modern styling
        filter_layout = QHBoxLayout()
        
        self.priority_filter = QComboBox()
        self.priority_filter.addItems(["All", "Low", "Medium", "High"])
        self.priority_filter.setStyleSheet("""
            QComboBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 6px;
                border-radius: 4px;
                font-size: 14px;
            }
            QComboBox:focus {
                border: 1px solid #4d4d4d;
            }
            QComboBox::drop-down {
                subcontrol-origin: padding;
                subcontrol-position: top right;
                width: 20px;
                border-left: 1px solid #3d3d3d;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: white;
                selection-background-color: #4d4d4d;
                selection-color: white;
            }
        """)
        self.priority_filter.currentIndexChanged.connect(self.on_filter_changed)
        filter_layout.addWidget(QLabel("Priority:"))
        filter_layout.addWidget(self.priority_filter)
        
        layout.addLayout(filter_layout)
        
        # View options
        view_layout = QHBoxLayout()
        view_layout.setSpacing(10)
        
        self.show_favorites = ModernCheckBox("Show Favorites")
        self.show_favorites.stateChanged.connect(self.on_filter_changed)
        view_layout.addWidget(self.show_favorites)
        
        self.show_archived = ModernCheckBox("Show Archived")
        self.show_archived.stateChanged.connect(self.on_filter_changed)
        view_layout.addWidget(self.show_archived)
        
        self.show_encrypted = ModernCheckBox("Show Encrypted")
        self.show_encrypted.stateChanged.connect(self.on_filter_changed)
        view_layout.addWidget(self.show_encrypted)
        
        layout.addLayout(view_layout)
        
        # Note List with modern styling
        self.note_list = QListWidget()
        self.note_list.setStyleSheet("""
            QListWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #4d4d4d;
                color: white;
            }
            QListWidget::item:hover {
                background-color: #3d3d3d;
            }
        """)
        layout.addWidget(self.note_list)
        
        self.note_list.itemClicked.connect(self.on_note_clicked)
        
        # Statistics
        stats_layout = QHBoxLayout()
        
        self.total_notes = QLabel("Total Notes: 0")
        self.total_notes.setStyleSheet("color: #ffffff; font-size: 12px;")
        stats_layout.addWidget(self.total_notes)
        
        self.favorite_notes = QLabel("Favorites: 0")
        self.favorite_notes.setStyleSheet("color: #ffffff; font-size: 12px;")
        stats_layout.addWidget(self.favorite_notes)
        
        self.archived_notes = QLabel("Archived: 0")
        self.archived_notes.setStyleSheet("color: #ffffff; font-size: 12px;")
        stats_layout.addWidget(self.archived_notes)
        
        layout.addLayout(stats_layout)
        
        self.setLayout(layout)
        
    def update_statistics(self, notes):
        total = len(notes)
        favorites = sum(1 for note in notes if note.is_favorite)
        archived = sum(1 for note in notes if note.is_archived)
        
        self.total_notes.setText(f"Total Notes: {total}")
        self.favorite_notes.setText(f"Favorites: {favorites}")
        self.archived_notes.setText(f"Archived: {archived}")

    def on_note_clicked(self, item):
        note = item.data(Qt.UserRole)
        self.note_selected.emit(note)

    def on_search_changed(self):
        # Get the main window and trigger filter_notes
        main_window = self.get_main_window()
        if main_window:
            main_window.filter_notes()
            
    def on_filter_changed(self):
        # Get the main window and trigger filter_notes
        main_window = self.get_main_window()
        if main_window:
            main_window.filter_notes()
            
    def get_main_window(self):
        parent = self.parent()
        while parent is not None and not isinstance(parent, QMainWindow):
            parent = parent.parent()
        return parent

class CalendarView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout()
        
        self.calendar = QCalendarWidget()
        self.calendar.setStyleSheet("""
            QCalendarWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
            }
            QCalendarWidget QToolButton {
                color: white;
                background-color: #2d2d2d;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QCalendarWidget QMenu {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QCalendarWidget QSpinBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
            }
        """)
        self.calendar.clicked.connect(self.on_date_selected)
        layout.addWidget(self.calendar)
        
        self.note_list = QListWidget()
        self.note_list.setStyleSheet("""
            QListWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #4d4d4d;
                color: white;
            }
            QListWidget::item:hover {
                background-color: #3d3d3d;
            }
        """)
        layout.addWidget(self.note_list)
        
        self.setLayout(layout)
        
    def on_date_selected(self, date):

        self.note_list.clear()
        if hasattr(self.parent(), 'notes'):
            selected_date = date.toPyDate()
            for note in self.parent().notes:
                if note.due_date.date() == selected_date:
                    item = QListWidgetItem(note.title)
                    item.setData(Qt.UserRole, note)
                    self.note_list.addItem(item)
                    
    def update_notes(self, notes):
 
        if hasattr(self, 'calendar'):
         
            self.calendar.setDateTextFormat(QDate(), QTextCharFormat())
            
         
            for note in notes:
                date = note.due_date.date()
                format = QTextCharFormat()
                format.setBackground(QColor(42, 130, 218))
                format.setForeground(QColor(255, 255, 255))
                self.calendar.setDateTextFormat(date, format)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.notes = []
        self.current_note = None
        
        # Master password for session
        self.master_password = None
        
        try:
            self.setup_ui()
        except Exception as e:
            QMessageBox.critical(self, "Setup Error", 
                               f"Error setting up UI: {str(e)}")
            raise e
        
        try:
            self.load_notes()
        except Exception as e:
            QMessageBox.warning(self, "Load Error", 
                              f"Error loading notes: {str(e)}\nA new empty note file will be created.")
            self.notes = []
            
        # Check reminders periodically
        self.reminder_timer = QTimer(self)
        self.reminder_timer.timeout.connect(self.check_reminders)
        self.reminder_timer.start(60000)  # Check every minute
        
        # Setup status bar
        self.statusBar().showMessage("Ready")
        
    def setup_ui(self):
        # Create central widget and main layout
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        main_layout = QHBoxLayout()
        main_layout.setSpacing(10)
        
        # Create left panel (note list)
        left_panel = QVBoxLayout()
        

        search_layout = QHBoxLayout()
        search_label = QLabel("Search:")
        search_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Search in notes...")
        self.search_edit.setStyleSheet("""
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 4px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 1px solid #4d4d4d;
            }
        """)
        self.search_edit.textChanged.connect(self.filter_notes)
        search_layout.addWidget(search_label)
        search_layout.addWidget(self.search_edit)
        left_panel.addLayout(search_layout)
        
  
        tag_filter_layout = QHBoxLayout()
        tag_filter_label = QLabel("Filter by tag:")
        tag_filter_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        self.tag_filter_combo = QComboBox()
        self.tag_filter_combo.setStyleSheet("""
            QComboBox {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 6px;
                border-radius: 4px;
                font-size: 14px;
            }
            QComboBox:focus {
                border: 1px solid #4d4d4d;
            }
            QComboBox::drop-down {
                subcontrol-origin: padding;
                subcontrol-position: top right;
                width: 20px;
                border-left: 1px solid #3d3d3d;
            }
            QComboBox QAbstractItemView {
                background-color: #2d2d2d;
                color: white;
                selection-background-color: #4d4d4d;
                selection-color: white;
            }
        """)
        self.tag_filter_combo.addItem("All Tags")
        self.tag_filter_combo.currentIndexChanged.connect(self.filter_notes)
        tag_filter_layout.addWidget(tag_filter_label)
        tag_filter_layout.addWidget(self.tag_filter_combo)
        left_panel.addLayout(tag_filter_layout)
        

        self.note_list = NoteList()
        left_panel.addWidget(self.note_list)
        
        # Create right panel (note editor)
        right_panel = QVBoxLayout()
        self.note_editor = NoteEditor()
        right_panel.addWidget(self.note_editor)
        
        # Connect note selection signal
        self.note_list.note_selected.connect(self.on_note_selected)
        
        # Connect editor signals
        self.note_editor.reminder_changed.connect(self.setup_reminder)
        self.note_editor.attachment_changed.connect(self.handle_attachment)
        
        # Connect NoteList filter signals from existing checkboxes
        self.note_list.show_favorites.stateChanged.connect(self.filter_notes)
        self.note_list.show_archived.stateChanged.connect(self.filter_notes)
        self.note_list.show_encrypted.stateChanged.connect(self.filter_notes)
        
        # Add panels to main layout
        main_layout.addLayout(left_panel, 1)
        main_layout.addLayout(right_panel, 2)
        
        self.central_widget.setLayout(main_layout)
        
        # Set window properties
        self.setWindowTitle("Securonis Notes")
        self.setGeometry(100, 100, 1200, 800)
        self.setWindowIcon(QIcon("icon.png"))
        
        # Statü çubuğu
        self.statusBar().setStyleSheet("background-color: #1d1d1d; color: white;")
        
        # Setup menu and toolbar
        self.setup_menu()
        self.setup_toolbar()
        self.statusBar().showMessage("Ready")
        
    def setup_menu(self):
        menubar = self.menuBar()
        menubar.setStyleSheet("""
            QMenuBar {
                background-color: #1d1d1d;
                color: white;
            }
            QMenuBar::item {
                background-color: #1d1d1d;
                color: white;
                padding: 6px 12px;
            }
            QMenuBar::item:selected {
                background-color: #3d3d3d;
            }
        """)
        
        # File menu
        file_menu = menubar.addMenu("&File")
        file_menu.setStyleSheet("""
            QMenu {
                background-color: #1d1d1d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QMenu::item {
                padding: 6px 25px 6px 20px;
            }
            QMenu::item:selected {
                background-color: #3d3d3d;
            }
        """)
        
        new_action = QAction("&New Note", self)
        new_action.setShortcut("Ctrl+N")
        new_action.triggered.connect(self.new_note)
        file_menu.addAction(new_action)
        
        save_action = QAction("&Save Note", self)
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.save_note)
        file_menu.addAction(save_action)
        
        delete_action = QAction("&Delete Note", self)
        delete_action.setShortcut("Delete")
        delete_action.triggered.connect(self.delete_note)
        file_menu.addAction(delete_action)
        
        file_menu.addSeparator()
        
        backup_action = QAction("&Backup Notes", self)
        backup_action.triggered.connect(self.backup_notes)
        file_menu.addAction(backup_action)
        
        restore_action = QAction("&Restore Notes", self)
        restore_action.triggered.connect(self.restore_notes)
        file_menu.addAction(restore_action)
        
        file_menu.addSeparator()
        
        import_action = QAction("&Import Notes", self)
        import_action.triggered.connect(self.import_notes)
        file_menu.addAction(import_action)
        
        export_action = QAction("&Export Notes", self)
        export_action.triggered.connect(self.export_notes)
        file_menu.addAction(export_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("&Exit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # Edit menu
        edit_menu = menubar.addMenu("&Edit")
        edit_menu.setStyleSheet("""
            QMenu {
                background-color: #1d1d1d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QMenu::item {
                padding: 6px 25px 6px 20px;
            }
            QMenu::item:selected {
                background-color: #3d3d3d;
            }
        """)
        
        color_action = QAction("Choose &Color", self)
        color_action.triggered.connect(self.choose_color)
        edit_menu.addAction(color_action)
        
        font_action = QAction("Choose &Font", self)
        font_action.triggered.connect(self.choose_font)
        edit_menu.addAction(font_action)
        
        encrypt_action = QAction("&Encrypt/Decrypt", self)
        encrypt_action.triggered.connect(self.toggle_encryption)
        edit_menu.addAction(encrypt_action)
        
        edit_menu.addSeparator()
        

        manage_menu = menubar.addMenu("&Manage")
        manage_menu.setStyleSheet("""
            QMenu {
                background-color: #1d1d1d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QMenu::item {
                padding: 6px 25px 6px 20px;
            }
            QMenu::item:selected {
                background-color: #3d3d3d;
            }
        """)
        
        manage_categories_action = QAction("Manage &Categories", self)
        manage_categories_action.triggered.connect(self.manage_categories)
        manage_menu.addAction(manage_categories_action)
        
        manage_tags_action = QAction("Manage &Tags", self)
        manage_tags_action.triggered.connect(self.manage_tags)
        manage_menu.addAction(manage_tags_action)
        
        # View menu
        view_menu = menubar.addMenu("&View")
        view_menu.setStyleSheet("""
            QMenu {
                background-color: #1d1d1d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QMenu::item {
                padding: 6px 25px 6px 20px;
            }
            QMenu::item:selected {
                background-color: #3d3d3d;
            }
        """)
        
        category_action = QAction("Manage &Categories", self)
        category_action.triggered.connect(self.manage_categories)
        view_menu.addAction(category_action)
        
        tag_action = QAction("Manage &Tags", self)
        tag_action.triggered.connect(self.manage_tags)
        view_menu.addAction(tag_action)
        
        view_menu.addSeparator()
        
        calendar_action = QAction("&Calendar View", self)
        calendar_action.triggered.connect(self.show_calendar)
        view_menu.addAction(calendar_action)
        
        # Help menu
        help_menu = menubar.addMenu("&Help")
        help_menu.setStyleSheet("""
            QMenu {
                background-color: #1d1d1d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QMenu::item {
                padding: 6px 25px 6px 20px;
            }
            QMenu::item:selected {
                background-color: #3d3d3d;
            }
        """)
        
        about_action = QAction("&About", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
        
    def setup_toolbar(self):
        toolbar = QToolBar()
        toolbar.setMovable(False)
        toolbar.setStyleSheet("""
            QToolBar {
                background-color: #2d2d2d;
                border: none;
                spacing: 5px;
                padding: 5px;
            }
        """)
        self.addToolBar(toolbar)
        
        # New note button
        new_btn = QToolButton()
        new_btn.setText("New")
        new_btn.setToolTip("New Note (Ctrl+N)")
        new_btn.clicked.connect(self.new_note)
        toolbar.addWidget(new_btn)
        
        # Save button
        save_btn = QToolButton()
        save_btn.setText("Save")
        save_btn.setToolTip("Save Note (Ctrl+S)")
        save_btn.clicked.connect(self.save_note)
        toolbar.addWidget(save_btn)
        
        toolbar.addSeparator()
        
        # Calendar button only
        calendar_btn = QToolButton()
        calendar_btn.setText("Calendar")
        calendar_btn.setToolTip("Calendar View (Ctrl+Shift+C)")
        calendar_btn.clicked.connect(self.show_calendar)
        toolbar.addWidget(calendar_btn)
        
    def setup_reminder(self, state):
        if not self.current_note:
            self.current_note = Note()
            
        if state == Qt.Checked:
            dialog = QDialog(self)
            dialog.setWindowTitle("Set Reminder")
            dialog.setGeometry(200, 200, 400, 200)
            
            layout = QVBoxLayout()
            
            # Date picker
            date_label = QLabel("Date:")
            date_label.setStyleSheet("color: #ffffff; font-weight: bold;")
            date_picker = QCalendarWidget()
            date_picker.setStyleSheet("""
                QCalendarWidget {
                    background-color: #2d2d2d;
                    color: white;
                    border: 1px solid #3d3d3d;
                    border-radius: 4px;
                }
            """)
            layout.addWidget(date_label)
            layout.addWidget(date_picker)
            
            # Time picker
            time_label = QLabel("Time:")
            time_label.setStyleSheet("color: #ffffff; font-weight: bold;")
            time_edit = QLineEdit()
            time_edit.setText("00:00")
            time_edit.setStyleSheet("""
                QLineEdit {
                    background-color: #2d2d2d;
                    color: white;
                    border: 1px solid #3d3d3d;
                    padding: 8px;
                    border-radius: 4px;
                }
            """)
            layout.addWidget(time_label)
            layout.addWidget(time_edit)
            
            # Buttons
            button_layout = QHBoxLayout()
            
            ok_btn = ModernButton("OK")
            ok_btn.clicked.connect(dialog.accept)
            button_layout.addWidget(ok_btn)
            
            cancel_btn = ModernButton("Cancel")
            cancel_btn.clicked.connect(dialog.reject)
            button_layout.addWidget(cancel_btn)
            
            layout.addLayout(button_layout)
            
            dialog.setLayout(layout)
            
            if dialog.exec_() == QDialog.Accepted:
                date = date_picker.selectedDate()
                time = time_edit.text()
                self.current_note.reminder = datetime.combine(
                    date.toPyDate(),
                    datetime.strptime(time, "%H:%M").time()
                )
                self.statusBar().showMessage(
                    f"Reminder set for {self.current_note.reminder.strftime('%Y-%m-%d %H:%M')}"
                )
        else:
            self.current_note.reminder = None
            self.statusBar().showMessage("Reminder removed")
            
    def handle_attachment(self, state):
        if not self.current_note:
            return
            
        if state:
            # Select file to attach
            file_path, _ = QFileDialog.getOpenFileName(
                self, 
                "Select File to Attach", 
                "", 
                "All Files (*);;Text Files (*.txt);;Images (*.png *.jpg *.jpeg *.gif);;Documents (*.pdf *.doc *.docx)"
            )
            
            if file_path:
                try:
                    # Add file attachment
                    self.current_note.add_attachment(file_path)
                    
                    # Show file list
                    attached_files = [att['name'] for att in self.current_note.attachments]
                    QMessageBox.information(
                        self, 
                        "Attachment Added", 
                        f"Attached file: {os.path.basename(file_path)}\n\nTotal attachments: {len(attached_files)}"
                    )
                    
                    # Update note status
                    self.update_editor()
                    self.save_notes()
                except ValueError as e:
                    # Validation errors
                    QMessageBox.warning(self, "Attachment Error", str(e))
                    self.note_editor.attachment_check.setChecked(False)
                except Exception as e:
                    # Other errors
                    QMessageBox.critical(self, "Error", f"Error adding attachment: {str(e)}")
                    self.note_editor.attachment_check.setChecked(False)
        else:
            # Attachment management
            if self.current_note.attachments:
                # File list
                attachment_names = [att['name'] for att in self.current_note.attachments]
                file_name, ok = QInputDialog.getItem(
                    self, 
                    "Manage Attachments", 
                    "Select attachment to manage:", 
                    attachment_names, 
                    0, 
                    False
                )
                
                if ok and file_name:
                    # Options menu
                    action, ok = QInputDialog.getItem(
                        self, 
                        "Attachment Options", 
                        f"What do you want to do with {file_name}?", 
                        ["View/Open", "Save to disk", "Delete"], 
                        0, 
                        False
                    )
                    
                    if ok:
                        if action == "View/Open":
                            # Save file temporarily and open
                            attachment_content = None
                            for att in self.current_note.attachments:
                                if att['name'] == file_name:
                                    attachment_content = att['content']
                                    break
                                    
                            if attachment_content:
                                import base64
                                import tempfile
                                import subprocess
                                import platform
                                
                                # Create temporary file
                                temp_dir = tempfile.gettempdir()
                                temp_file_path = os.path.join(temp_dir, file_name)
                                
                                with open(temp_file_path, 'wb') as f:
                                    f.write(base64.b64decode(attachment_content))
                                
                                # Open file
                                if platform.system() == 'Windows':
                                    os.startfile(temp_file_path)
                                elif platform.system() == 'Darwin':  # macOS
                                    subprocess.call(['open', temp_file_path])
                                else:  # Linux
                                    subprocess.call(['xdg-open', temp_file_path])
                        
                        elif action == "Save to disk":
                            # Save file
                            save_path, _ = QFileDialog.getSaveFileName(
                                self, 
                                "Save Attachment", 
                                file_name
                            )
                            
                            if save_path:
                                attachment_content = None
                                for att in self.current_note.attachments:
                                    if att['name'] == file_name:
                                        attachment_content = att['content']
                                        break
                                        
                                if attachment_content:
                                    import base64
                                    with open(save_path, 'wb') as f:
                                        f.write(base64.b64decode(attachment_content))
                                    
                                    QMessageBox.information(
                                        self, 
                                        "Success", 
                                        f"Attachment saved to {save_path}"
                                    )
                        
                        elif action == "Delete":
                            # Delete file
                            reply = QMessageBox.question(
                                self, 
                                "Confirm Delete", 
                                f"Are you sure you want to delete {file_name}?", 
                                QMessageBox.Yes | QMessageBox.No
                            )
                            
                            if reply == QMessageBox.Yes:
                                for i, att in enumerate(self.current_note.attachments):
                                    if att['name'] == file_name:
                                        del self.current_note.attachments[i]
                                        break
                                
                                QMessageBox.information(
                                    self, 
                                    "Success", 
                                    f"Attachment {file_name} deleted."
                                )
                                
                                # Update note status
                                self.update_editor()
                                self.save_notes()
                
                # Checkbox durumunu güncelle
                self.note_editor.attachment_check.setChecked(len(self.current_note.attachments) > 0)
            else:
                QMessageBox.information(
                    self, 
                    "No Attachments", 
                    "This note has no attachments."
                )
                self.note_editor.attachment_check.setChecked(False)
        
    def filter_notes(self):
        # Filter notes (search and tag filters)
        search_text = self.search_edit.text().lower() if hasattr(self, 'search_edit') else ""
        selected_tag = self.tag_filter_combo.currentText() if hasattr(self, 'tag_filter_combo') else "All Tags"
        
        # Priority filter
        selected_priority = self.note_list.priority_filter.currentText().lower() if hasattr(self.note_list, 'priority_filter') else "all"
        
        # Favorites, archive and encryption filters
        # Use the checkboxes from the sidebar instead of menu actions
        show_favorites = self.note_list.show_favorites.isChecked() if hasattr(self.note_list, 'show_favorites') else False
        show_archived = self.note_list.show_archived.isChecked() if hasattr(self.note_list, 'show_archived') else False
        show_encrypted = self.note_list.show_encrypted.isChecked() if hasattr(self.note_list, 'show_encrypted') else False
        
        # Clear note list
        self.note_list.note_list.clear()
        
        # Apply filters
        for note in self.notes:
            # Search filter
            title_match = search_text in note.title.lower()
            content_match = search_text in note.content.lower()
            tags_match = any(search_text in tag.lower() for tag in note.tags)
            search_match = title_match or content_match or tags_match
            
            # Tag filter
            tag_match = (selected_tag == "All Tags" or selected_tag in note.tags)
            
            # Priority filter
            priority_match = (selected_priority == "all" or note.priority.lower() == selected_priority.lower())
                
            # Other filters - changed the logic to show only if checked
            favorite_match = (not show_favorites or (show_favorites and note.is_favorite))
            archived_match = (not show_archived or (show_archived and note.is_archived))
            encrypted_match = (not show_encrypted or (show_encrypted and note.is_encrypted))
            
            # Add note to list if all filters match
            if (search_match and tag_match and priority_match and favorite_match and
                archived_match and encrypted_match):
                item = QListWidgetItem(note.title)
                item.setData(Qt.UserRole, note)
                self.note_list.note_list.addItem(item)
        
        # Update statistics
        self.note_list.update_statistics(self.notes)
        
    def new_note(self):
        self.current_note = Note()
        self.update_editor()
        
    def save_note(self):
        if not self.current_note:
            self.current_note = Note()
            
        # Veri doğrulama
        # Data validation
        title = self.note_editor.title_edit.text().strip()
        if not title:
            QMessageBox.warning(self, "Validation Error", "Title cannot be empty.")
            self.note_editor.title_edit.setFocus()
            return
            
        content = self.note_editor.content_edit.toPlainText().strip()
        if not content:
            QMessageBox.warning(self, "Validation Error", "Content cannot be empty.")
            self.note_editor.content_edit.setFocus()
            return
            

        # Date format validation
        due_date_str = self.note_editor.due_date_edit.text()
        try:
            due_date = datetime.strptime(due_date_str, "%Y-%m-%d %H:%M")
        except ValueError:
            QMessageBox.warning(self, "Validation Error", "Invalid date format. Use YYYY-MM-DD HH:MM format.")
            self.note_editor.due_date_edit.setFocus()
            return
            
        # Check if encryption status has changed
        encrypt_checkbox_checked = self.note_editor.encrypt_check.isChecked()
        
        # Update note data from editor
        self.current_note.title = title
        self.current_note.content = content
        self.current_note.tags = [tag.strip() for tag in self.note_editor.tags_edit.text().split(",") if tag.strip()]
        self.current_note.priority = self.note_editor.priority_combo.currentText()
        self.current_note.category = self.note_editor.category_combo.currentText()
        self.current_note.due_date = due_date
        self.current_note.is_favorite = self.note_editor.favorite_check.isChecked()
        self.current_note.is_archived = self.note_editor.archive_check.isChecked()
        self.current_note.modified_at = datetime.now()
        
        # Handle encryption if the encryption status has changed
        if encrypt_checkbox_checked != self.current_note.is_encrypted:
            if encrypt_checkbox_checked:
                # Need to encrypt the note
                self.toggle_encryption()
                # If encryption was cancelled, update checkbox to match actual state
                self.note_editor.encrypt_check.setChecked(self.current_note.is_encrypted)
                if not self.current_note.is_encrypted:
                    QMessageBox.information(self, "Information", "Encryption was cancelled.")
        
        # Add or update note in list
        if self.current_note not in self.notes:
            self.notes.append(self.current_note)
            
        self.update_note_list()
        self.update_tag_filter()  # Update tag filter
        self.save_notes()
        
        QMessageBox.information(self, "Success", "Note saved successfully!")
        
    def delete_note(self):
        if not self.current_note:
            return
            
        reply = QMessageBox.question(self, "Confirm Delete",
                                   "Are you sure you want to delete this note?",
                                   QMessageBox.Yes | QMessageBox.No)
                                   
        if reply == QMessageBox.Yes:
            self.notes.remove(self.current_note)
            self.current_note = None
            self.update_editor()
            self.update_note_list()
            self.save_notes()
            
    def on_note_selected(self, item):

        if isinstance(item, QListWidgetItem):
            note = item.data(Qt.UserRole)
            if note:
                self.current_note = note
                self.update_editor()
        else:

            self.current_note = item
            self.update_editor()
        
    def update_editor(self):
        if not self.current_note:
            self.note_editor.title_edit.clear()
            self.note_editor.content_edit.clear()
            self.note_editor.tags_edit.clear()
            self.note_editor.priority_combo.setCurrentText("low")
            self.note_editor.category_combo.setCurrentText("general")
            self.note_editor.due_date_edit.setText(datetime.now().strftime("%Y-%m-%d %H:%M"))
            self.note_editor.encrypt_check.setChecked(False)
            self.note_editor.favorite_check.setChecked(False)
            self.note_editor.archive_check.setChecked(False)
            self.note_editor.reminder_check.setChecked(False)
            self.note_editor.attachment_check.setChecked(False)
        else:
            self.note_editor.title_edit.setText(self.current_note.title)
            self.note_editor.content_edit.setText(self.current_note.content)
            self.note_editor.tags_edit.setText(", ".join(self.current_note.tags))
            self.note_editor.priority_combo.setCurrentText(self.current_note.priority)
            self.note_editor.category_combo.setCurrentText(self.current_note.category)
            self.note_editor.due_date_edit.setText(self.current_note.due_date.strftime("%Y-%m-%d %H:%M"))
            self.note_editor.encrypt_check.setChecked(self.current_note.is_encrypted)
            self.note_editor.favorite_check.setChecked(self.current_note.is_favorite)
            self.note_editor.archive_check.setChecked(self.current_note.is_archived)
            self.note_editor.reminder_check.setChecked(self.current_note.reminder is not None)
            self.note_editor.attachment_check.setChecked(len(self.current_note.attachments) > 0)
            
    def update_note_list(self):
        self.note_list.note_list.clear()
        for note in self.notes:
            item = QListWidgetItem(note.title)
            item.setData(Qt.UserRole, note)
            self.note_list.note_list.addItem(item)
            
    def show_calendar(self):
        # Calendar widget for date selection dialog
        dialog = QDialog(self)
        dialog.setWindowTitle("Calendar View")
        dialog.setGeometry(200, 200, 800, 600)
        
        layout = QVBoxLayout()
        

        calendar_view = CalendarView(dialog)
        calendar_view.update_notes(self.notes)
        layout.addWidget(calendar_view)
        

        note_list_label = QLabel("Notes for Selected Date:")
        note_list_label.setStyleSheet("color: #ffffff; font-weight: bold; font-size: 14px;")
        layout.addWidget(note_list_label)
        

        note_list = QListWidget()
        note_list.setStyleSheet("""
            QListWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-radius: 4px;
            }
            QListWidget::item:selected {
                background-color: #4d4d4d;
                color: white;
            }
            QListWidget::item:hover {
                background-color: #3d3d3d;
            }
        """)
        layout.addWidget(note_list)
        
  
        def on_calendar_date_selected(date):
            note_list.clear()
            selected_date = date.toPyDate()
            for note in self.notes:
                if note.due_date.date() == selected_date:
                    item = QListWidgetItem(note.title)
                    item.setData(Qt.UserRole, note)
                    note_list.addItem(item)
        
        calendar_view.calendar.clicked.connect(on_calendar_date_selected)
        

        def on_note_selected(item):
            note = item.data(Qt.UserRole)
            self.current_note = note
            self.update_editor()
            dialog.accept()
        
        note_list.itemDoubleClicked.connect(on_note_selected)
        

        button_layout = QHBoxLayout()
        
        close_btn = ModernButton("Close")
        close_btn.clicked.connect(dialog.accept)
        button_layout.addWidget(close_btn)
        
        layout.addLayout(button_layout)
        
        dialog.setLayout(layout)
        dialog.exec_()
        
    def backup_notes(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Backup Notes",
                                                 "", "JSON files (*.json)")
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as file:
                    notes_data = [note.to_dict() for note in self.notes]
                    json.dump(notes_data, file, ensure_ascii=False, indent=2)
                QMessageBox.information(self, "Success",
                                      "Notes backed up successfully!")
            except Exception as e:
                QMessageBox.critical(self, "Error",
                                   f"Error during backup: {str(e)}")
                
    def restore_notes(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Restore Notes",
                                                 "", "JSON files (*.json)")
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    notes_data = json.load(file)
                    self.notes = [Note.from_dict(data) for data in notes_data]
                self.update_note_list()
                QMessageBox.information(self, "Success",
                                      "Notes restored successfully!")
            except Exception as e:
                QMessageBox.critical(self, "Error",
                                   f"Error during restore: {str(e)}")
                
    def import_notes(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Import Notes",
                                                 "", "CSV files (*.csv)")
        if file_path:
            try:
                with open(file_path, 'r') as file:
                    reader = csv.DictReader(file)
                    for row in reader:
                        note = Note(
                            title=row['title'],
                            content=row['content'],
                            tags=row['tags'].split(','),
                            priority=row['priority'],
                            due_date=datetime.strptime(row['due_date'],
                                                     "%Y-%m-%d %H:%M"),
                            category=row['category']
                        )
                        self.notes.append(note)
                self.update_note_list()
                self.save_notes()
                QMessageBox.information(self, "Success",
                                      "Notes imported successfully!")
            except Exception as e:
                QMessageBox.critical(self, "Error",
                                   f"Error during import: {str(e)}")
                
    def export_notes(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Export Notes",
                                                 "", "CSV files (*.csv)")
        if file_path:
            try:
                with open(file_path, 'w', newline='') as file:
                    writer = csv.DictWriter(file,
                                          fieldnames=['title', 'content', 'tags',
                                                    'priority', 'due_date',
                                                    'category'])
                    writer.writeheader()
                    for note in self.notes:
                        writer.writerow({
                            'title': note.title,
                            'content': note.content,
                            'tags': ','.join(note.tags),
                            'priority': note.priority,
                            'due_date': note.due_date.strftime("%Y-%m-%d %H:%M"),
                            'category': note.category
                        })
                QMessageBox.information(self, "Success",
                                      "Notes exported successfully!")
            except Exception as e:
                QMessageBox.critical(self, "Error",
                                   f"Error during export: {str(e)}")
                
    def show_about(self):
        QMessageBox.about(self, "About Advanced Notes",
                         "Securonis Notes v2.5\n\n"
                         "A modern note-taking application.\n"
                         "Developed by root0emir")
                         
    def choose_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            self.note_editor.content_edit.setTextColor(color)
            
    def choose_font(self):
        font, ok = QFontDialog.getFont()
        if ok:
            self.note_editor.content_edit.setFont(font)
            
    def toggle_encryption(self):
        if not self.current_note:
            return
            
        if not self.current_note.is_encrypted:
            # If no master password set, ask for one
            if not self.master_password:
                password, ok = QInputDialog.getText(
                    self, "Set Master Password", 
                    "Enter master password for encrypted notes:", 
                    QLineEdit.Password
                )
                
                if ok and password:
                    self.master_password = password
                else:
                    QMessageBox.information(self, "Cancelled", "Note will not be encrypted without a password.")
                    return
            
            # Just mark the note as encrypted
            self.current_note.is_encrypted = True
            self.note_editor.encrypt_check.setChecked(True)
            self.statusBar().showMessage("Note marked for encryption. It will be encrypted when saved.")
        else:
            # Unmark the note as encrypted
            self.current_note.is_encrypted = False
            self.note_editor.encrypt_check.setChecked(False)
            if hasattr(self.current_note, 'encryption_password_hash'):
                delattr(self.current_note, 'encryption_password_hash')
            self.statusBar().showMessage("Note will no longer be encrypted when saved.")
        
        self.update_editor()
        
    def load_encryption_key(self):
        import base64
        import hashlib
        import os
        
        key_file = 'encryption_key.key'
        
        # Check if encryption key exists
        if os.path.exists(key_file):
            # Ask for password
            password, ok = QInputDialog.getText(
                self, "Enter Password", 
                "Enter encryption password:", 
                QLineEdit.Password
            )
            
            if not ok:
                # User canceled - exit application for existing key file
                QMessageBox.warning(self, "Authentication Required", 
                                   "Authentication is required to use this application.")
       
                os._exit(1)
            
            try:
                # Load key from file
                with open(key_file, 'rb') as file:
                    stored_key_data = file.read()
                
                
         
                key_from_password = hashlib.sha256(password.encode()).digest()
                
        
                try:
                    encrypted_bytes = base64.urlsafe_b64decode(stored_key_data)
                except Exception:
                    QMessageBox.critical(self, "Authentication Failed", 
                                      "Stored key is corrupted. Authentication cannot continue.")
                    os._exit(1)
                
          
                decrypted_bytes = bytearray()
                for i in range(len(encrypted_bytes)):
                    decrypted_bytes.append(encrypted_bytes[i] ^ key_from_password[i % len(key_from_password)])
                
            
                if len(decrypted_bytes) != 32:
             
                    QMessageBox.critical(self, "Authentication Failed", 
                                      "Invalid password. Decryption key length mismatch.")
                    os._exit(1)
                
             
                try:
                    fernet_key = base64.urlsafe_b64encode(bytes(decrypted_bytes))
                    
                   
                    test_fernet = Fernet(fernet_key)
         
                    test_message = b"test_message"
                    encrypted_test = test_fernet.encrypt(test_message)
                    decrypted_test = test_fernet.decrypt(encrypted_test)
                    
                    if decrypted_test != test_message:
                        QMessageBox.critical(self, "Authentication Failed", 
                                         "Invalid password. Decryption test failed.")
                        os._exit(1)
                    
                    # Şifre doğru, anahtarı kaydediyoruz
                    self.encryption_key = fernet_key
                except Exception as e:
                    QMessageBox.critical(self, "Authentication Failed", 
                                      f"Invalid password or corrupted key: {str(e)}")
                    os._exit(1)
                    
            except Exception as e:
                QMessageBox.critical(self, "Authentication Failed", 
                                   f"Error during authentication: {str(e)}")
                os._exit(1)
        else:
            # First use - create new key
            # Ask for password
            while True:
                password, ok = QInputDialog.getText(
                    self, "Create Password", 
                    "Create encryption password (min 8 chars):", 
                    QLineEdit.Password
                )
                
                if not ok:
                    # User canceled - exit application for new key setup
                    QMessageBox.warning(self, "Password Required", 
                                       "You must set up a password to use this application.")
                    os._exit(1)
                
                # Validate password
                if len(password) < 8:
                    QMessageBox.warning(self, "Warning", "Password must be at least 8 characters.")
                    continue
                
                confirm, ok = QInputDialog.getText(
                    self, "Confirm Password", 
                    "Confirm encryption password:", 
                    QLineEdit.Password
                )
                
                if not ok or password != confirm:
                    QMessageBox.warning(self, "Warning", "Passwords don't match. Try again.")
                    continue
                
                try:
            
                    raw_key = os.urandom(32)  # Generate 32 random bytes
                    
               
                    key_from_password = hashlib.sha256(password.encode()).digest()
                    
             
                    encrypted_bytes = bytearray()
                    for i in range(len(raw_key)):
                        encrypted_bytes.append(raw_key[i] ^ key_from_password[i % len(key_from_password)])
                    
                    with open(key_file, 'wb') as file:
                        file.write(base64.urlsafe_b64encode(encrypted_bytes))
                    
            
                    self.encryption_key = base64.urlsafe_b64encode(raw_key)
                    
                    test_fernet = Fernet(self.encryption_key)
                    test_message = b"test_message"
                    encrypted_test = test_fernet.encrypt(test_message)
                    decrypted_test = test_fernet.decrypt(encrypted_test)
                    
                    if decrypted_test != test_message:
                        raise ValueError("Encryption key validation failed")
                    
                    QMessageBox.information(self, "Success", 
                                          "Encryption key created and secured with your password.")
                    break
                except Exception as e:
                    QMessageBox.critical(self, "Error", f"Error creating encryption key: {str(e)}")
                    os._exit(1)
        
        # Final check to ensure encryption key is valid
        if self.encryption_key is None:
            QMessageBox.critical(self, "Authentication Failed", 
                                "Could not create or validate encryption key. Application will close.")
            os._exit(1)
        
    def check_reminders(self):
        # Check reminders
        current_time = datetime.now()
        for note in self.notes:
            if note.reminder and note.reminder <= current_time:
                # Reminder time reached
                QMessageBox.information(self, "Reminder", 
                                       f"Note: {note.title}\n\n{note.content}")
                # Clear reminder
                note.reminder = None
                self.save_notes()
        
    def save_notes(self):
        try:
            serialized_notes = []
            
            # Check if we need to ask for master password
            encrypted_notes_exist = any(note.is_encrypted for note in self.notes)
            
            if encrypted_notes_exist and not self.master_password:
                # Ask for master password once for all encrypted notes
                password, ok = QInputDialog.getText(
                    self, "Set Encryption Password", 
                    "Enter master password for encrypted notes:", 
                    QLineEdit.Password
                )
                
                if ok and password:
                    self.master_password = password
                else:
                    reply = QMessageBox.question(self, "No Password",
                        "Without a password, encrypted notes will be saved unencrypted. Continue?",
                        QMessageBox.Yes | QMessageBox.No)
                    
                    if reply == QMessageBox.No:
                        QMessageBox.information(self, "Save Cancelled", "Notes were not saved.")
                        return
            
            for note in self.notes:
                note_dict = note.to_dict()
                
                # Encrypt the content if encryption is enabled
                if note.is_encrypted and self.master_password:
                    try:
                        import hashlib
                        import base64
                        from cryptography.fernet import Fernet
                        
                        # Create key from password
                        key_bytes = hashlib.sha256(self.master_password.encode()).digest()
                        encryption_key = base64.urlsafe_b64encode(key_bytes)
                        
                        # Store password hash for verification
                        note_dict['encryption_password_hash'] = hashlib.sha256(self.master_password.encode()).hexdigest()
                        
                        # Encrypt content
                        fernet = Fernet(encryption_key)
                        encrypted_content = fernet.encrypt(note_dict['content'].encode('utf-8'))
                        note_dict['content'] = encrypted_content.decode('utf-8')
                    except Exception as e:
                        QMessageBox.warning(self, "Encryption Error", 
                                           f"Could not encrypt note '{note.title}': {str(e)}")
                        note_dict['is_encrypted'] = False
                elif note.is_encrypted and not self.master_password:
                    # No master password but note is marked as encrypted
                    # Save unencrypted but inform user
                    note_dict['is_encrypted'] = False
                
                serialized_notes.append(note_dict)
                
            with open('notes.json', 'w', encoding='utf-8') as file:
                json.dump(serialized_notes, file, ensure_ascii=False, indent=2)
                
            self.statusBar().showMessage(f"{len(self.notes)} notes saved.")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error saving notes: {str(e)}")
            
    def load_notes(self):
        try:
            if os.path.exists('notes.json'):
                with open('notes.json', 'r', encoding='utf-8') as file:
                    notes_data = json.load(file)
                    
                    # Check if there are encrypted notes and collect their password hashes
                    has_encrypted_notes = False
                    password_hashes = set()
                    
                    for data in notes_data:
                        if data.get('is_encrypted', False):
                            has_encrypted_notes = True
                            hash_value = data.get('encryption_password_hash')
                            if hash_value:
                                password_hashes.add(hash_value)
                    
                    # Ask for master password only once if there are encrypted notes
                    if has_encrypted_notes:
                        password, ok = QInputDialog.getText(
                            self, "Enter Master Password", 
                            "Enter master password to decrypt notes:", 
                            QLineEdit.Password
                        )
                        
                        if not ok:
                            # User cancelled password dialog
                            QMessageBox.critical(self, "Authentication Required", 
                                "Password is required to access encrypted notes. Application will exit.")
                            os._exit(0)
                            return
                            
                        # Verify if the password matches at least one encrypted note
                        if password:
                            import hashlib
                            entered_hash = hashlib.sha256(password.encode()).hexdigest()
                            
                            if entered_hash not in password_hashes:
                                QMessageBox.critical(self, "Incorrect Password", 
                                    "The password you entered is incorrect. Application will exit.")
                                os._exit(0)
                                return
                            
                            # Password is correct
                            self.master_password = password
                        else:
                            # Empty password
                            QMessageBox.critical(self, "Password Required",
                                "Password cannot be empty. Application will exit.")
                            os._exit(0)
                            return
                    
                    loaded_notes = []
                    for data in notes_data:
                        is_encrypted = data.get('is_encrypted', False)
                        
                        if is_encrypted and self.master_password:
                            # Try to decrypt with master password
                            content = data.get('content', '')
                            password_hash = data.get('encryption_password_hash')
                            
                            if content and password_hash:
                                import hashlib
                                import base64
                                from cryptography.fernet import Fernet
                                
                                # Verify password hash
                                entered_hash = hashlib.sha256(self.master_password.encode()).hexdigest()
                                
                                if entered_hash == password_hash:
                                    try:
                                        # Create key from password
                                        key_bytes = hashlib.sha256(self.master_password.encode()).digest()
                                        encryption_key = base64.urlsafe_b64encode(key_bytes)
                                        
                                        # Decrypt content
                                        fernet = Fernet(encryption_key)
                                        decrypted_content = fernet.decrypt(content.encode('utf-8'))
                                        data['content'] = decrypted_content.decode('utf-8')
                                    except Exception as e:
                                        # If decryption fails, show placeholder
                                        data['content'] = f"[Encrypted note - could not decrypt: {str(e)}]"
                                else:
                                    # This shouldn't happen with a single master password,
                                    # but we'll handle it just in case
                                    data['content'] = "[Encrypted note - password mismatch]"
                            else:
                                # Corrupted encrypted note
                                data['content'] = "[Encrypted note - missing data]"
                        elif is_encrypted and not self.master_password:
                            # No master password provided (should not happen with our checks)
                            data['content'] = "[Encrypted note - no password provided]"
                            
                        loaded_notes.append(Note.from_dict(data))
                    
                    self.notes = loaded_notes
                    
                self.update_note_list()
                self.update_tag_filter()
                self.update_category_combo()
                self.statusBar().showMessage(f"{len(self.notes)} notes loaded.")
            else:
                self.statusBar().showMessage("Note file not found. You can create new notes.")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error loading notes: {str(e)}")
            os._exit(1)

    def closeEvent(self, event):
        try:
            self.save_notes()
            if hasattr(self, 'reminder_timer'):
                self.reminder_timer.stop()
            event.accept()
        except Exception as e:
                
            with open('error.log', 'a') as f:
                import datetime
                f.write(f"\n[{datetime.datetime.now()}] Error during close: {str(e)}\n")
            event.accept()     

    def add_note(self, note):
        # Add new note
        self.notes.append(note)
        self.current_note = note
        self.update_note_list()
        self.save_notes()
        self.statusBar().showMessage(f"Note added: {note.title}")

    def update_tag_filter(self):
        # Update tag filter combo box
        current_tag = self.tag_filter_combo.currentText()
        self.tag_filter_combo.clear()
        self.tag_filter_combo.addItem("All Tags")
        
        # Collect all tags from notes
        all_tags = set()
        for note in self.notes:
            all_tags.update(note.tags)
        
        # Add tags alphabetically sorted to combo box
        for tag in sorted(all_tags):
            self.tag_filter_combo.addItem(tag)
            
        # Restore previous selection (if possible)
        index = self.tag_filter_combo.findText(current_tag)
        if index >= 0:
            self.tag_filter_combo.setCurrentIndex(index)

    def manage_categories(self):
        # Get all existing categories
        all_categories = set()
        for note in self.notes:
            all_categories.add(note.category)
        
        # Show category manager
        dialog = CategoryManager(self, list(all_categories))
        if dialog.exec_() == QDialog.Accepted:
            # Get updated categories
            updated_categories = dialog.get_categories()
            
            # Apply category changes
            category_map = {}
            for old_cat in all_categories:
                if old_cat not in updated_categories:
                    # Ask for new category name
                    new_cat, ok = QInputDialog.getItem(
                        self, "Update Category", 
                        f"Category '{old_cat}' was removed. Map notes to:",
                        updated_categories, 0, False
                    )
                    if ok:
                        category_map[old_cat] = new_cat
                    else:
                        category_map[old_cat] = "general"  # Default
            
            # Update notes
            for note in self.notes:
                if note.category in category_map:
                    note.category = category_map[note.category]
            
            # Update category list in note editor
            self.note_editor.category_combo.clear()
            for category in sorted(updated_categories):
                self.note_editor.category_combo.addItem(category)
            
            # Update note list
            self.update_note_list()
            self.save_notes()
            
    def manage_tags(self):
        # Varolan tüm etiketleri al
        all_tags = set()
        for note in self.notes:
            all_tags.update(note.tags)
        
        # Etiket yöneticisini göster
        dialog = TagManager(self, list(all_tags))
        if dialog.exec_() == QDialog.Accepted:
            # Güncellenmiş etiketleri al
            updated_tags = dialog.get_tags()
            
            # Etiket filtresini güncelle
            self.update_tag_filter()

    def update_category_combo(self):
        # Update the category combo box in note editor
        categories = set()
        categories.add("general")  # Default category should always be present
        categories.add("work")
        categories.add("personal")
        categories.add("ideas")
        categories.add("tasks")
        
        # Add categories from existing notes
        for note in self.notes:
            if note.category:
                categories.add(note.category)
                
        # Update combo box
        current_category = self.note_editor.category_combo.currentText()
        self.note_editor.category_combo.clear()
        
        # Sort alphabetically and add
        for category in sorted(categories):
            self.note_editor.category_combo.addItem(category)
            
        # Restore previous selection if possible
        index = self.note_editor.category_combo.findText(current_category)
        if index >= 0:
            self.note_editor.category_combo.setCurrentIndex(index)
    
    def load_notes(self):
        try:
            if os.path.exists('notes.json'):
                with open('notes.json', 'r', encoding='utf-8') as file:
                    notes_data = json.load(file)
                    
                    # Check if there are encrypted notes and collect their password hashes
                    has_encrypted_notes = False
                    password_hashes = set()
                    
                    for data in notes_data:
                        if data.get('is_encrypted', False):
                            has_encrypted_notes = True
                            hash_value = data.get('encryption_password_hash')
                            if hash_value:
                                password_hashes.add(hash_value)
                    
                    # Ask for master password only once if there are encrypted notes
                    if has_encrypted_notes:
                        password, ok = QInputDialog.getText(
                            self, "Enter Master Password", 
                            "Enter master password to decrypt notes:", 
                            QLineEdit.Password
                        )
                        
                        if not ok:
                            # User cancelled password dialog
                            QMessageBox.critical(self, "Authentication Required", 
                                "Password is required to access encrypted notes. Application will exit.")
                            os._exit(0)
                            return
                            
                        # Verify if the password matches at least one encrypted note
                        if password:
                            import hashlib
                            entered_hash = hashlib.sha256(password.encode()).hexdigest()
                            
                            if entered_hash not in password_hashes:
                                QMessageBox.critical(self, "Incorrect Password", 
                                    "The password you entered is incorrect. Application will exit.")
                                os._exit(0)
                                return
                            
                            # Password is correct
                            self.master_password = password
                        else:
                            # Empty password
                            QMessageBox.critical(self, "Password Required",
                                "Password cannot be empty. Application will exit.")
                            os._exit(0)
                            return
                    
                    loaded_notes = []
                    for data in notes_data:
                        is_encrypted = data.get('is_encrypted', False)
                        
                        if is_encrypted and self.master_password:
                            # Try to decrypt with master password
                            content = data.get('content', '')
                            password_hash = data.get('encryption_password_hash')
                            
                            if content and password_hash:
                                import hashlib
                                import base64
                                from cryptography.fernet import Fernet
                                
                                # Verify password hash
                                entered_hash = hashlib.sha256(self.master_password.encode()).hexdigest()
                                
                                if entered_hash == password_hash:
                                    try:
                                        # Create key from password
                                        key_bytes = hashlib.sha256(self.master_password.encode()).digest()
                                        encryption_key = base64.urlsafe_b64encode(key_bytes)
                                        
                                        # Decrypt content
                                        fernet = Fernet(encryption_key)
                                        decrypted_content = fernet.decrypt(content.encode('utf-8'))
                                        data['content'] = decrypted_content.decode('utf-8')
                                    except Exception as e:
                                        # If decryption fails, show placeholder
                                        data['content'] = f"[Encrypted note - could not decrypt: {str(e)}]"
                                else:
                                    # This shouldn't happen with a single master password,
                                    # but we'll handle it just in case
                                    data['content'] = "[Encrypted note - password mismatch]"
                            else:
                                # Corrupted encrypted note
                                data['content'] = "[Encrypted note - missing data]"
                        elif is_encrypted and not self.master_password:
                            # No master password provided (should not happen with our checks)
                            data['content'] = "[Encrypted note - no password provided]"
                            
                        loaded_notes.append(Note.from_dict(data))
                    
                    self.notes = loaded_notes
                    
                self.update_note_list()
                self.update_tag_filter()
                self.update_category_combo()
                self.statusBar().showMessage(f"{len(self.notes)} notes loaded.")
            else:
                self.statusBar().showMessage("Note file not found. You can create new notes.")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error loading notes: {str(e)}")
            os._exit(1)

def handle_exception(exctype, value, traceback):

    error_message = f"{exctype.__name__}: {value}"
    print(f"Error occurred: {error_message}")
  
    app = QApplication.instance()
    for widget in app.topLevelWidgets():
        if isinstance(widget, QMainWindow):
            QMessageBox.critical(widget, "Error", 
                               f"An unexpected error occurred:\n\n{error_message}\n\nThe application will try to continue.")
   
            try:
                with open('error.log', 'a') as f:
                    import datetime
                    f.write(f"\n[{datetime.datetime.now()}] {error_message}\n")
                    import traceback as tb
                    tb.print_exc(file=f)
            except:
                pass
            break
    
    sys.__excepthook__(exctype, value, traceback)

def validate_password():
    import os
    import base64
    import hashlib
    from cryptography.fernet import Fernet
    from PyQt5.QtWidgets import QInputDialog, QMessageBox, QApplication, QLineEdit
    import sys
    
    global global_encryption_key
    
    try:
        # Temporary application to show dialogs
        temp_app = QApplication(sys.argv) if not QApplication.instance() else QApplication.instance()
        
        key_file = 'encryption_key.key'
        
        # If key file exists, ask for password
        if os.path.exists(key_file):
            password, ok = QInputDialog.getText(
                None, "Securonis Notes - Authentication", 
                "Enter encryption password:", 
                QLineEdit.Password
            )
            
            if not ok:
                # User canceled
                print("Authentication required")
                return False
            
            try:
                # Simple key derivation from password
                key_bytes = hashlib.sha256(password.encode()).digest()
                # Create Fernet key from password hash
                global_encryption_key = base64.urlsafe_b64encode(key_bytes)
                
                # Test key validity
                test_fernet = Fernet(global_encryption_key)
                return True
                
            except Exception as e:
                print(f"Authentication error: {str(e)}")
                return False
        else:
            # First time use - create a new password
            password, ok = QInputDialog.getText(
                None, "Securonis Notes - Create Password", 
                "Create encryption password (min 8 chars):", 
                QLineEdit.Password
            )
            
            if not ok:
                # User canceled
                print("Password creation required")
                return False
                
            if len(password) < 8:
                QMessageBox.warning(None, "Warning", "Password must be at least 8 characters.")
                return False
                
            # Confirm password
            confirm, ok = QInputDialog.getText(
                None, "Securonis Notes - Confirm Password", 
                "Confirm encryption password:", 
                QLineEdit.Password
            )
            
            if not ok or password != confirm:
                QMessageBox.warning(None, "Warning", "Passwords don't match.")
                return False
                
            try:
                # Simple key derivation from password
                key_bytes = hashlib.sha256(password.encode()).digest()
                # Create and store key
                global_encryption_key = base64.urlsafe_b64encode(key_bytes)
                
                # Save key hash for future verification
                with open(key_file, 'wb') as f:
                    # Store a hash of the key, not the key itself
                    key_hash = hashlib.sha256(global_encryption_key).digest()
                    f.write(key_hash)
                    
                return True
                
            except Exception as e:
                print(f"Key creation error: {str(e)}")
                return False
                
    except Exception as e:
        print(f"Validation error: {str(e)}")
        return False
    
    return False


global_encryption_key = None

def main():
    app = QApplication(sys.argv)
    

    sys.excepthook = handle_exception
    
    # Set application style
    app.setStyle('Fusion')
    
    # Create dark palette with modern colors
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor(30, 30, 30))
    palette.setColor(QPalette.WindowText, Qt.white)
    palette.setColor(QPalette.Base, QColor(25, 25, 25))
    palette.setColor(QPalette.AlternateBase, QColor(35, 35, 35))
    palette.setColor(QPalette.ToolTipBase, Qt.white)
    palette.setColor(QPalette.ToolTipText, Qt.white)
    palette.setColor(QPalette.Text, Qt.white)
    palette.setColor(QPalette.Button, QColor(35, 35, 35))
    palette.setColor(QPalette.ButtonText, Qt.white)
    palette.setColor(QPalette.BrightText, Qt.red)
    palette.setColor(QPalette.Link, QColor(42, 130, 218))
    palette.setColor(QPalette.Highlight, QColor(42, 130, 218))
    palette.setColor(QPalette.HighlightedText, Qt.black)
    app.setPalette(palette)
    
    # Set application font
    app.setFont(QFont("Segoe UI", 9))
    
    try:

        window = MainWindow()
        window.show()
        sys.exit(app.exec_())
    except Exception as e:
  
        QMessageBox.critical(None, "Critical Error", 
                           f"A critical error occurred during startup:\n\n{str(e)}\n\nThe application will now exit.")
       
        try:
            with open('critical_error.log', 'a') as f:
                import datetime
                f.write(f"\n[{datetime.datetime.now()}] Critical Error: {str(e)}\n")
                import traceback
                traceback.print_exc(file=f)
        except:
            pass
        sys.exit(1)

if __name__ == "__main__":
    main() 
