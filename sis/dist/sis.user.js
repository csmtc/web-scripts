// ==UserScript==
// @name         sis
// @namespace    npm/vite-plugin-monkey
// @version      2025.05.18
// @author       monkey
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sis001.com
// @downloadURL  https://atcra.top:50000/web-script/sis.user.js
// @updateURL    https://atcra.top:50000/web-script/sis.user.js
// @match        https://sis001.com/*
// @match        https://sisurl.com/*
// @connect      sis001.com
// @connect      sisurl.com
// @connect      *
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(o=>{if(typeof GM_addStyle=="function"){GM_addStyle(o);return}const t=document.createElement("style");t.textContent=o,document.head.append(t)})(" .fixed-toolbar-pc{position:fixed;bottom:20px;left:20px;z-index:99}.status-bar-pc{background-color:bisque;padding:1px 0 0 1px;border:1px solid #ccc;border-radius:1px}.save-button-pc{display:inline-block;padding:1px 2px;background-color:#dcdcdc;text-align:center;text-decoration:none;color:#000;border-radius:4px;border:none;cursor:pointer;transition:background-color .3s}.save-button-pc:hover{background-color:#45a049}.save-button-pc:active{background-color:#3d8b40}.float-button{border-radius:15%;padding:15%;background:#000;color:#fff;border:none;box-shadow:0 4px 12px #00000040;cursor:pointer;transition:all .3s ease;white-space:nowrap;text-overflow:clip;display:flex;align-items:center;justify-content:center;font-size:125%}.float-button:hover{transform:scale(1.1);box-shadow:0 6px 16px #0000004d;background:gray}.float-button:active{transform:scale(.95)} ");

(function () {
  'use strict';

  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  const hooks = {
    novelPage: {
      mb: {
        posts: 'th[id^="postmessage"]',
        title: "title",
        toolBar: "#bottomNav"
      },
      "pc": {
        posts: 'div[id^="postmessage"]>div[id^="postmessage"]',
        title: "h1",
        toolBar: "body"
      }
    },
    oldNovelPage: {
      pc: {
        posts: "form[method='post'] tbody[id*='thread'] span[id*='thread'] a",
        toolBar: "body"
      }
    }
  };
  const serverURL = "https://atcra.top:58000";
  function createAndDownloadFile(fileName, data, type = "text/plain;charset=utf-8") {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
  function get_device_type() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
  }
  function pure_title(title) {
    title = title.replace(/[\\/:*?"<>|]/g, "");
    return title;
  }
  function getPostText(post, is_mobile) {
    console.log("getPostText of", post);
    var ctx = "";
    var white_tag_list = ["P", "BR"];
    var elements = post.childNodes;
    var accept = function(e) {
      if (e.nodeType == 3) return true;
      else if (e.nodeType == 1 && white_tag_list.some((x) => x == e.tagName)) return true;
      return false;
    };
    elements.forEach((e_) => {
      var e = e_;
      if (accept(e)) {
        var line;
        if (e.nodeType == 3) {
          line = e.textContent;
        } else if (e.nodeType == 1) {
          if (e.tagName == "P") {
            line = e.textContent + "\n\n";
          } else if (e.tagName == "BR") {
            if (is_mobile) line = "\n";
            else
              line = "";
          } else {
            line = e.textContent;
          }
        }
        if (line) {
          ctx += line;
        }
      }
    });
    var tail_index = ctx.lastIndexOf("[]");
    if (tail_index > 0) {
      ctx = ctx.substring(0, tail_index);
    }
    return ctx;
  }
  function getPost(doc, is_mobile = get_device_type()) {
    var _a;
    var config2 = hooks.novelPage[is_mobile ? "mb" : "pc"];
    var _title = (_a = doc.querySelector(config2.title)) == null ? void 0 : _a.textContent;
    let title = pure_title(_title != null ? _title : doc.title);
    let posts2 = doc.querySelectorAll(config2.posts);
    let ctx = "";
    var first_checkbox = posts2[0].querySelector("input[type='checkbox']");
    if (first_checkbox == null) {
      ctx = getPostText(posts2[0], is_mobile);
    } else {
      posts2.forEach((post) => {
        const checkbox = post.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
          let text = getPostText(post, is_mobile);
          ctx += text;
        }
      });
    }
    return { title, content: ctx };
  }
  function download_page(url) {
    return new Promise(function(resolve, reject) {
      let requestBody = {
        tryTimes: 0,
        method: "GET",
        url,
        headers: {
          referer: url,
          "USER-AGENT": navigator.userAgent,
          "Content-Type": "text/html;charset=" + document.characterSet
        },
        timeout: 15e3,
        overrideMimeType: "text/html;charset=" + document.characterSet,
        onload: function(result) {
          var doc = new DOMParser().parseFromString(result.responseText, "text/html");
          resolve(doc);
        },
        onerror: function(e) {
          console.warn("error:");
          console.log(e);
          reject();
        },
        ontimeout: function() {
          console.warn("timeout: times=" + this.tryTimes + " url=" + url);
          if (++this.tryTimes < 3) {
            _GM_xmlhttpRequest(this);
          }
        }
      };
      _GM_xmlhttpRequest(requestBody);
    });
  }
  async function check_file_exists(filename, serverUrl = serverURL) {
    try {
      return new Promise((resolve) => {
        _GM_xmlhttpRequest({
          method: "POST",
          url: serverUrl + "/check_file",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({ "filename": filename }),
          onload: function(response) {
            console.log("check_file_exists", response.responseText);
            let ans = JSON.parse(response.responseText);
            resolve(ans.exists);
          },
          onerror: function(error) {
            console.error("Error checking file existence:", error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error("Error checking file existence:", error);
      return false;
    }
  }
  async function send_file_to_server(fileName, content, serverUrl = serverURL) {
    return new Promise((resolve) => {
      _GM_xmlhttpRequest({
        method: "POST",
        url: serverUrl + "/upload",
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify({ "filename": fileName, "content": content }),
        onload: function(response) {
          console.log("send_file_to_server", response.responseText);
          let ans = JSON.parse(response.responseText);
          if (ans.success) {
            resolve(true);
          } else {
            resolve(false);
            console.log("Error uploading file:", ans.error);
          }
        }
      });
    });
  }
  function save(document2, is_mobile = get_device_type()) {
    var { title, content: ctx } = getPost(document2, is_mobile);
    console.log("下载章节：" + title);
    console.log(ctx);
    createAndDownloadFile(title + ".txt", ctx);
  }
  function create_download_button() {
    var _a;
    var is_mobile = get_device_type();
    var config2 = hooks.novelPage[is_mobile ? "mb" : "pc"];
    const container = document.createElement("div");
    if (is_mobile) {
      container.classList.add("col");
      container.classList.add("footer-col");
    } else {
      container.classList.add("fixed-toolbar-pc");
    }
    const button = document.createElement("input");
    button.type = "button";
    button.value = "下载";
    button.classList.add("float-button");
    button.addEventListener("click", () => save(document));
    container.appendChild(button);
    (_a = document.querySelector(config2.toolBar)) == null ? void 0 : _a.appendChild(container);
  }
  function create_checkboxs() {
    var config2 = hooks.novelPage[get_device_type() ? "mb" : "pc"];
    var posts2 = document.querySelectorAll(config2.posts);
    posts2.forEach((div) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.innerText = "";
      const label = document.createElement("span");
      label.textContent = "下载本楼 ";
      const card_toolbar = document.createElement("div");
      card_toolbar.appendChild(label);
      card_toolbar.appendChild(checkbox);
      div.prepend(card_toolbar);
    });
    var first_checkbox = posts2[0].querySelector("input[type='checkbox']");
    first_checkbox.checked = true;
  }
  function novel_page_setup() {
    console.log("novel page");
    create_download_button();
    create_checkboxs();
  }
  const config = hooks.oldNovelPage.pc;
  const posts = document.querySelectorAll(config.posts);
  function interface_init() {
    var _a;
    const container = document.createElement("div");
    container.classList.add("fixed-toolbar-pc");
    const btn_save_all = document.createElement("button");
    btn_save_all.classList.add("float-button");
    btn_save_all.textContent = "保存所有";
    btn_save_all.onclick = save_all_posts;
    container.appendChild(btn_save_all);
    (_a = document.querySelector(config.toolBar)) == null ? void 0 : _a.appendChild(container);
    add_save_buttons();
  }
  function add_save_buttons() {
    posts.forEach((post) => {
      var _a;
      let btn = document.createElement("a");
      btn.textContent = "Save";
      btn.classList.add("save-button-pc");
      btn.onclick = () => {
        save_post(post);
      };
      let common = (_a = post.parentElement) == null ? void 0 : _a.parentElement;
      if (common) {
        common.appendChild(btn);
      }
    });
  }
  async function save_post(post) {
    var _a;
    let status = document.createElement("span");
    status.classList.add("status-bar-pc");
    (_a = post.parentElement) == null ? void 0 : _a.appendChild(status);
    var title = post.textContent;
    if (title != null) {
      console.log(title, post.href);
      if (await check_file_exists(title)) {
        console.log(title + " 已存在");
        status.textContent = "文件存在";
      } else {
        status.textContent = "正在解析";
        let doc = await download_page(post.href);
        let { content } = getPost(doc, false);
        status.textContent = "解析成功";
        send_file_to_server(title, content).then((res) => {
          if (res) {
            status.textContent = "保存成功";
          } else {
            status.textContent = "保存失败";
          }
        });
      }
    }
  }
  async function save_all_posts() {
    for (const post of posts) {
      await save_post(post);
    }
  }
  function oldNovelPageSetup() {
    if (get_device_type()) throw new Error("This function is only for pc");
    interface_init();
  }
  console.log(location.href);
  if (location.href.search("thread") > 0) {
    novel_page_setup();
  } else if (location.href.search("fid=359") > 0) {
    console.log("旧文展览馆");
    oldNovelPageSetup();
  }

})();