#!/bin/bash

SERVICE_NAME="seconionis-autowipe.service"

echo "---------------------------------------"
echo "Securonis Linux ColdBoot Def Management"
echo "---------------------------------------"
echo
echo "This service securely wipes the contents of RAM when the system shuts down."
echo "This tool uses Seconionis's Autowipe feature"
echo

while true; do
    echo "Please select an option:"
    echo "1) Enable RAM Kill service"
    echo "2) Disable RAM Kill service"
    echo "3) Exit without changes"
    echo

    read -p "Enter your choice [1-3]: " choice

    case $choice in
        1)
            echo "Enabling RAM Kill service..."
            sudo systemctl enable $SERVICE_NAME
            sudo systemctl start $SERVICE_NAME
            echo "Service enabled. RAM wiping will be performed on system shutdown."
            break
            ;;
        2)
            echo "Disabling RAM Kill service..."
            sudo systemctl stop $SERVICE_NAME
            sudo systemctl disable $SERVICE_NAME
            echo "Service disabled. Shutdown times will remain normal."
            break
            ;;
        3)
            echo "Exiting without making any changes."
            break
            ;;
        *)
            echo "Invalid choice, please try again."
            ;;
    esac
done

echo
echo "Operation completed."
