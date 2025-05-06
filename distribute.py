import os
import shutil

dst_dir = "C:/SoftwareGreen/nginx/html/dist/web-script"

for proj in os.listdir("./"):
    src_dir = os.path.join(os.path.join("./",proj),"dist")
    if os.path.exists(src_dir):
        print("copy:",src_dir)
        for fname in os.listdir(src_dir):
            shutil.copy(os.path.join(src_dir,fname),os.path.join(dst_dir,fname))
        # shutil.copytree(src_dir,dst_dir,symlinks=True,dirs_exist_ok=True)