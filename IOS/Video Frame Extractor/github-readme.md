# Video Frame Extractor

🎥 A macOS Automator Quick Action to easily extract frames from videos using FFmpeg. Transform any video into frame sequences with a simple right-click in Finder, allowing for custom frame rates or complete frame extraction.

## Category
macOS Automation & Video Processing

## Description
Video Frame Extractor is a powerful macOS Quick Action that allows you to extract frames from any video file directly from Finder. Built using Automator and FFmpeg, it provides a simple right-click interface to convert videos into sequences of image frames with customizable frame rates.

### Key Features
- Extract frames with custom frame rates or get all frames
- Right-click integration in Finder
- Automatic output folder creation
- Support for all video formats compatible with FFmpeg
- User-friendly frame rate selection dialog
- Maintains original video quality

## Prerequisites
- macOS
- Homebrew
- FFmpeg

## Installation

### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install FFmpeg
```bash
brew install ffmpeg
```

### 3. Configure System Permissions
1. Open System Settings > Privacy & Security
2. Select Full Disk Access
3. Click "+" and add Automator (and Finder if needed)

### 4. Install the Quick Action
1. Open Automator
2. Create a New Document
3. Select "Quick Action"
4. Configure workflow to receive files or folders in Finder
5. Add "Run Shell Script" action
6. Copy and paste the following script:

```bash
#!/bin/bash
# Ensure FFmpeg is available from Homebrew
export PATH="/opt/homebrew/bin:$PATH"
# Prompt the user for a frame rate using an AppleScript dialog.
# Enter a number (e.g., 1) for frames per second or leave empty for all frames.
FRAME_RATE=$(osascript -e 'Tell application "System Events" to display dialog "Enter desired frame rate (leave empty for all frames):" default answer ""' -e 'text returned of result' 2>/dev/null)
# Loop through each file passed to the script
for f in "$@"
do
# Get the file's directory and base name (without extension)
dir=$(dirname "$f")
base=$(basename "$f")
filename="${base%.*}"
# Create a new folder for the frames in the same directory as the video
output_dir="${dir}/${filename}_frames"
mkdir -p "$output_dir"
# Check if a frame rate was provided; if yes, apply the fps filter.
if [ -n "$FRAME_RATE" ]; then
/opt/homebrew/bin/ffmpeg -i "$f" -vf fps=$FRAME_RATE "${output_dir}/frame_%04d.png"
else
/opt/homebrew/bin/ffmpeg -i "$f" "${output_dir}/frame_%04d.png"
fi
done
```

7. Save as "Extract Frames" or your preferred name for the automation

## Usage
1. Right-click any video file in Finder
2. Select "Extract Frames (Custom Rate)" from the context menu
3. Enter desired frame rate (or leave empty for all frames)
4. Find extracted frames in a new folder named `<video_name>_frames`

## Technical Details
The script uses FFmpeg's frame extraction capabilities with the following features:
- Dynamic frame rate selection through AppleScript dialog
- Automatic output directory creation
- Homebrew path configuration
- PNG format output with sequential naming
- Error handling for invalid inputs

## Tags
`macos`, `automator`, `ffmpeg`, `video-processing`, `quick-action`, `frame-extraction`, `automation`, `video-tools`, `image-sequence`, `utility`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments
- FFmpeg team for the amazing video processing tool
- Homebrew project for package management
- macOS Automator for automation capabilities