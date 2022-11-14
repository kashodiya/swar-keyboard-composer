filename=$1
# -vf "scale=-2:480" \

ffmpeg -i "$filename" -y -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2" \
-max_muxing_queue_size 1024 \
-c:v libx264 \
-preset slow \
-crf 21 \
-profile:v baseline \
-level 3.0 \
-pix_fmt yuv420p \
-r 25 \
-g 50 \
-c:a aac \
-b:a 160k \
-r:a 44100 \
-af "aformat=channel_layouts=stereo,highpass=f=40,volume=1.40,compand=attacks=0.1 0.1:decays=3.0 3.0:points=-900/-900 -100/-70 -70/-45 -45/-30 -40/-15 -20/-9 -10/-6 0/-4:soft-knee=0.50:gain=0:volume=-900:delay=3.0" \
-f mp4 \
"${filename%.*}.mkv"

