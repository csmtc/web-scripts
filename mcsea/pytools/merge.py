from typing import Iterable, List
import os
import re
from datetime import datetime

DATE_REGEX = re.compile(r"^(20\d{2}-\d{1,2}-\d{1,2}) (.*)")
MERGE_PREFIX = "SERIES-"


def mergeFiles(file_paths: Iterable[str], dst_dir: str = None):
    if dst_dir is None:
        dst_dir, dst_fname = os.path.split(file_paths[-1])
    else:
        dst_fname = os.path.split(file_paths[-1])[-1]
    match_result = re.match(DATE_REGEX, dst_fname)
    if match_result is not None:
        dst_fname = match_result.group(2)
        lastPostTime = match_result
    else:
        lastPostTime = datetime.now().strftime(r"%Y-%m-%d")
    dst_fname, fext = os.path.splitext(dst_fname)
    dst_fname = MERGE_PREFIX + dst_fname + fext
    print("Destination file:", dst_fname)
    ctxs = ""
    for fpath in file_paths:
        src_fname = os.path.split(fpath)[-1]
        if src_fname.startswith(MERGE_PREFIX):
            continue
        print(src_fname)
        with open(fpath, "r", encoding="utf-8") as f:
            ctxs = ctxs + "章节：" + f.read() + "\n\n\n"
    with open(os.path.join(dst_dir, dst_fname), "w", encoding="utf-8") as f:
        f.write(ctxs)


if __name__ == "__main__":
    dir = "/storage/emulated/0/Documents/merge"
    files = os.listdir(dir)
    key = lambda fname: float(re.search(r"([\.\d]{1,3})", fname[5:]).group(1))
    files.sort(key=key)
    files.sort()
    files = [os.path.join(dir, f) for f in files]
    mergeFiles(files)
