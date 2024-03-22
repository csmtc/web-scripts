// ==UserScript==
// @name         Cool18.downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.cool18.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cool18.com
// @require http://code.jquery.com/jquery-latest.js
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==



(function () {
  'use strict';
  /**
  *
  * @param {string} filename
  * @param {string} text
  */
  function create_file(filename, text) {
    const file = new Blob([text]);
    const tmpLink = document.createElement("a");
    const objectUrl = URL.createObjectURL(file);

    tmpLink.href = objectUrl;
    tmpLink.download = filename;
    tmpLink.click();
    URL.revokeObjectURL(file);
    console.log("DL" + text.length);
  }




  /**
   * @param {string} url 章节页面链接
   */
  function dl_chapter(url, callback = callback_dl) {
    return new Promise(function (resolve, reject) {
      let tryTimes = 0;
      let requestBody = {
        method: 'GET',
        url: url,
        headers: {
          referer: url,
          'Content-Type': 'text/html;charset=utf-8',
        },
        timeout: 15000,
        overrideMimeType: 'text/html;charset=utf-8',
        onload: function (result) {
          resolve()
          callback(result)
        },
        onerror: function (e) {
          console.warn('error:');
          console.log(e);
          reject()
        },
        ontimeout: function (e) {
          console.warn('timeout: times=' + tryTimes + ' url=' + aTag.href);
          //console.log(e);
          if (++tryTimes < 3) {
            request(url)
          }
        }
      };
      GM_xmlhttpRequest(requestBody);
    });
  }




  /**
   *
   * @param {string} title
   */
  function pure_title(title) {
    title.replace('.*【禁忌书屋】', "");
    title.replace('20[0-9]{2}.*', "");
    return title;
  }


  /**
   *
   * @param {*} result
   * @param {boolean} is_create_file
   * @returns [title, ctx] 若不创建文件，则返回内容
   */
  function callback_dl(result, is_create_file = true, skip_header = false) {
    let doc = new DOMParser().parseFromString(result.responseText, 'text/html');
    let title = pure_title(doc.querySelector(".show_content b").textContent);

    let ctx = "";
    let white_tag_list = ["P", "BR"];

    let m = doc.querySelector("td.show_content>pre");
    if (m.childElementCount < 50) {
      m = doc.querySelector(".show_content>pre font");
    }


    let elements = m.childNodes;
    let accept = function (e) {
      if (e.nodeType == 3) return true;
      else if (e.nodeType == 1 && (white_tag_list.includes(e.tagName))) return true;  // Text_Node or Element in white_list
      else if (e.tagName == "FONT" && e.getAttribute("color") == null) return true;

      return false;
    }
    elements.forEach(e => {
      // console.log(accept(e),e,e.nodeType,e.tagName);
      if (accept(e)) {
        let line = "";
        if (e.nodeType == 3) {  // text node
          if (skip_header) {
            if (e.textContent.startsWith("　　")) skip_header = false;
          } else
            line = e.textContent;
        } else if (e.nodeType == 1) {
          if (e.tagName == "P") {
            line = e.textContent + "\n\n";
          } else if (e.tagName == "BR") {
            line = "";
          } else {
            line = e.textContent;
          }
        }

        ctx = ctx + line;
      }
    });

    console.log("下载章节：" + title);
    console.log(ctx)
    if (is_create_file)
      create_file(title + ".txt", ctx);
    else
      return [title, ctx]
  }




  /**
   * 获得所有章节链接的<a>标签
   */
  function get_all_chapter_elements() {
    let elements = document.querySelectorAll(".search-content a");
    if (elements.length == 0) {
      elements = document.querySelectorAll(".dc_bar2 .t_l a");
    }
    let filter_func = (e) => {
      // console.log(e)
      // console.log(e.getAttribute('href'))
      if (e.getAttribute('href').match("keyword") != null) {
        return false;
      }
      return true;
    }
    let arr = Array()
    for (let i = 0; i < elements.length; ++i) {
      let e = elements[i];
      if (filter_func(e)) arr.push(e)
    }
    arr.reverse();
    return arr;
  }

  function get_all_chapter_links() {

    let links = get_all_chapter_elements().map((e) => {
      console.log(e)
      console.log(e.getAttribute('href'))
      return e.getAttribute('href');
    })
    return links;
  }

  let chapter_urls = []
  let last_dl_idx = 0;
  function add_btn() {
    let elements;
    // if (window.location.href.search(/threadsearch.*submit/) > 0)
    elements = get_all_chapter_elements();


    elements.forEach(a => {
      let url = a.href
      let btn = document.createElement("input");
      btn.type = "button";
      btn.value = "下载";
      btn.addEventListener("click", function (evt) {
        dl_chapter(url);
      });
      a.parentElement.insertBefore(btn, a);
      chapter_urls.push(url)
    })

    chapter_urls.reverse()
    // console.log(chapter_urls);
  }



  function dl_all() {
    chapter_urls = get_all_chapter_links();
    async function dl_func() {
      if (last_dl_idx == chapter_urls.length) last_dl_idx = 0;
      for (let i = last_dl_idx; i < chapter_urls.length; i++) {
        await dl_chapter(chapter_urls[i]);
      }
    }
    dl_func()
  }

  function dl_all_single_file() {
    // 检查是否为搜索页面
    let title = get_all_chapter_elements();
    title = pure_title(title[title.length - 1].textContent);
    // console.log("下载SingleFile：" + title);
    chapter_urls = get_all_chapter_links()

    let ctx = "";
    let ctx_arr = Array(chapter_urls.length);
    async function dl_func() {
      if (last_dl_idx == chapter_urls.length) last_dl_idx = 0;
      for (let i = last_dl_idx; i < chapter_urls.length; i++) {
        await dl_chapter(chapter_urls[i], function (result) {
          let r = callback_dl(result, false, true);
          ctx_arr[i] = r[0] + "\n" + r[1];
        })
      }
    }
    dl_func().then(() => {
      for (let i = 0; i < ctx_arr.length; ++i) {
        ctx = ctx + "\n\n\n\n\n第" + i + "部分" + ctx_arr[i];
      }
      create_file(title, ctx)
    });
  }

  console.log(window.href)
  if (window.location.href.search("act=threadview") > 0) {
    // console.log("nov_dl:内容页");

    let btn = document.createElement('input');
    btn.type = "button";
    btn.value = "Download Novel"
    btn.style.position = 'fixed';
    btn.style.top = 0;
    btn.style.left = 0;
    btn.addEventListener("click", function () {
      dl_chapter(window.location.href);
    });
    document.body.append(btn);
  } else {
    // console.log("nov_dl:目录页");
    GM_registerMenuCommand('DownloadAll', dl_all);
    GM_registerMenuCommand('DownloadAll_SingleFile', dl_all_single_file);
    add_btn()
  }
})();
