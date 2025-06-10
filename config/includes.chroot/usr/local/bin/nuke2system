#!/bin/bash

# SECURONIS LINUX - SYSTEM NUKE UTILITY
# This script completely erases all data from selected disks/partitions
# leaving no recoverable traces behind.

# Check if system is running from live media
check_live_system() {
    # Check for common indicators of a live system
    if grep -q 'boot=casper' /proc/cmdline || \
       grep -q 'boot=live' /proc/cmdline || \
       grep -q 'overlayroot' /proc/cmdline || \
       [ -d /run/initramfs/live ] || \
       [ -d /run/live ] || \
       [ -f /usr/share/xsessions/plasma-live.desktop ] || \
       [ -f /etc/live.conf ]; then
        echo "WARNING: This script should not be run from a live system!"
        echo "Running this script from a live system could damage the wrong drives."
        echo "Exiting for safety reasons."
        exit 1
    fi
}

# Run the live system check
check_live_system

# Display prominent warning messages
echo "============================================================"
echo "                         WARNING                           "
echo "                                                            " 
echo "  THIS TOOL WILL PERMANENTLY AND IRRECOVERABLY DESTROY      "
echo "  ALL DATA ON THE SELECTED DISK/PARTITION.                  "
echo "                                                            "
echo "  THIS PROCESS CANNOT BE UNDONE. PROCEED WITH EXTREME       "
echo "  CAUTION.                                                  "
echo "============================================================"
echo

# Function to display available disks
list_disks() {
    echo "Available disks/partitions:"
    echo "--------------------------"
    lsblk -o NAME,SIZE,TYPE,MOUNTPOINT
    echo
}

# Function to show detailed disk information
show_disk_details() {
    echo "Detailed disk information:"
    echo "------------------------"
    lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE,LABEL,UUID,MODEL
    echo
    echo "Disk usage information:"
    echo "---------------------"
    df -h
    echo
    echo "Partition information:"
    echo "--------------------"
    sudo fdisk -l
    echo
    read -p "Press Enter to continue..."
}

# Function to validate disk selection
validate_disk() {
    local disk="$1"
    if [ ! -b "$disk" ]; then
        echo "Error: $disk is not a valid block device."
        return 1
    fi
    
    # Check if disk is mounted
    if mount | grep -q "$disk "; then
        echo "Error: $disk is currently mounted. Please unmount before proceeding."
        return 1
    fi
    
    return 0
}

# Function to show progress on long operations
show_operation_warning() {
    echo
    echo "WARNING: This operation may take a VERY long time depending on disk size!"
    echo "     A 1TB drive could take many hours to complete."
    echo "     Please ensure your system will not be interrupted (sleep/power loss)."
    echo
}

# Function to perform secure disk erasure using dd
nuke_with_dd() {
    local target=$1
    local size=$(blockdev --getsize64 "$target")
    local size_gb=$(printf "%.2f" "$(($size * 100 / 1073741824))e-2")
    
    show_operation_warning
    
    echo "Nuking $target ($size_gb GB) with /dev/urandom..."
    echo "Started at: $(date)"
    echo
    
    # Check if pv is installed
    if command -v pv &> /dev/null; then
        # Use pv to show progress
        pv -ptres "${size_gb}G" /dev/urandom | sudo dd of="$target" bs=1M
    else
        # Fallback to dd with status=progress
        sudo dd if=/dev/urandom of="$target" bs=1M status=progress
    fi
    
    echo
    echo "Disk nuking completed at: $(date)"
    echo "Goodnight Securonis..."
    echo "System will shutdown in 10 seconds..."
    sleep 10
    sudo shutdown -h now
}

# Function to perform secure disk erasure using shred
nuke_with_shred() {
    local target=$1
    local passes=$2
    
    show_operation_warning
    
    echo "Nuking $target with shred ($passes passes)..."
    echo "Started at: $(date)"
    echo
    
    sudo shred -vfz -n "$passes" "$target"
    
    echo
    echo "Disk nuking completed at: $(date)"
    echo "Goodnight Securonis..."
    echo "System will shutdown in 10 seconds..."
    sleep 10
    sudo shutdown -h now
}

# Function to nuke all disks
nuke_all_disks() {
    local method=$1
    local passes=$2
    
    echo "WARNING: You are about to erase ALL disks on this system!"
    echo "The following disks will be erased:"
    
    # Get list of all disks (not partitions)
    local all_disks=($(lsblk -dnp -o NAME))
    
    # Display all disks
    for disk in "${all_disks[@]}"; do
        echo "- $disk"
    done
    
    echo
    read -p "FINAL WARNING: Type 'NUKE ALL DISKS' to confirm: " confirmation
    
    if [ "$confirmation" = "NUKE ALL DISKS" ]; then
        echo "Starting bulk disk nuking process..."
        
        for disk in "${all_disks[@]}"; do
            # Skip any mounted disks
            if mount | grep -q "$disk "; then
                echo "Skipping $disk as it is mounted."
                continue
            fi
            
            echo "Processing $disk..."
            
            if [ "$method" = "dd" ]; then
                nuke_with_dd "$disk"
            elif [ "$method" = "shred" ]; then
                nuke_with_shred "$disk" "$passes"
            fi
        done
        
        echo "All disks have been processed."
        echo "Goodnight Securonis..."
        echo "System will shutdown in 10 seconds..."
        sleep 10
        sudo shutdown -h now
    else
        echo "Bulk disk nuking canceled."
    fi
}

# Main script
while true; do
    clear
    # ASCII Art Banner using EOF
    cat << "EOF"
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣄⡀⠀⠀⠀⠀⠀
⠀⢀⣴⢾⠛⠳⡀⠀⠀⠀⠀⠀⠀⠀⡼⠀⠉⠓⢦⡀⠀⠀
⢀⡞⢡⠏⡅⠀⠱⣄⠀⠀⠀⠀⠀⣸⠃⠀⠀⠢⣌⣿⣦⠀
⣾⠀⣞⣼⢃⣴⢠⣈⡗⠂⣀⠐⢾⡋⠳⣼⢦⣄⠘⣆⣿⣷
⡏⠰⠋⠘⠋⠟⢩⣿⡾⣿⢛⣻⣷⠙⡆⠘⣆⠙⣆⠘⢿⣿
⢷⣦⣤⠶⠶⠚⠛⢹⡇⢣⣾⣻⡿⠀⣿⣤⣬⣤⣤⣤⣼⡇
⠈⠉⠀⠀⠀⠀⠀⠀⠙⠾⠟⣫⣥⠀⠀⠀⠈⠉⠉⠉⠉⠁
⠀⠀⠀⠀⠀⠀⠀⣰⣟⣒⣋⣁⡀⠳⡄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣰⣻⣿⣉⠉⠀⠀⠀⠹⣄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢰⣯⣹⣿⣭⣉⣀⡀⢀⡠⠞⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠉⠉⠉⠛⠛⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
EOF

    echo
    echo "SECURONIS LINUX - SYSTEM NUKE"
    echo "============================"
    echo

    list_disks

    echo "Select option:"
    echo "1) Fast nuke single disk (dd with /dev/urandom - single pass)"
    echo "2) Secure nuke single disk (shred - customizable passes)"
    echo "3) Show detailed disk information"
    echo "4) Nuke ALL disks (EXTREME CAUTION!)"
    echo "5) Exit"
    echo
    read -p "Enter your choice (1-5): " method_choice

case "$method_choice" in
    1)
        read -p "Enter disk/partition to nuke (e.g., /dev/sda): " target_disk
        if validate_disk "$target_disk"; then
            read -p "FINAL WARNING: Type 'NUKE $target_disk' to confirm: " confirmation
            if [ "$confirmation" = "NUKE $target_disk" ]; then
                nuke_with_dd "$target_disk"
            else
                echo "Operation canceled."
                read -p "Press Enter to return to the menu..."
            fi
        else
            read -p "Press Enter to return to the menu..."
        fi
        ;;
    2)
        read -p "Enter disk/partition to nuke (e.g., /dev/sda): " target_disk
        if validate_disk "$target_disk"; then
            read -p "Enter number of passes (1-3 recommended, more is slower): " passes
            read -p "FINAL WARNING: Type 'NUKE $target_disk' to confirm: " confirmation
            if [ "$confirmation" = "NUKE $target_disk" ]; then
                nuke_with_shred "$target_disk" "$passes"
            else
                echo "Operation canceled."
                read -p "Press Enter to return to the menu..."
            fi
        else
            read -p "Press Enter to return to the menu..."
        fi
        ;;
    3)
        show_disk_details
        ;;
    4)
        echo "Select bulk nuking method:"
        echo "1) Fast nuke all disks (dd with /dev/urandom)"
        echo "2) Secure nuke all disks (shred)"
        read -p "Enter your choice (1/2): " bulk_method
        
        case "$bulk_method" in
            1)
                nuke_all_disks "dd" ""
                ;;
            2)
                read -p "Enter number of passes (1-3 recommended): " bulk_passes
                nuke_all_disks "shred" "$bulk_passes"
                ;;
            *)
                echo "Invalid choice."
                read -p "Press Enter to return to the menu..."
                ;;
        esac
        ;;
    5)
        echo "Exiting Securonis System Nuke Utility."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please try again."
        sleep 2
        ;;
esac
done
