// ==UserScript==
// @name         sis
// @namespace    npm/vite-plugin-monkey
// @version      2025.05.06
// @author       monkey
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sis001.com
// @downloadURL  https://atcra.top:50000/web-script/sis.user.js
// @updateURL    https://atcra.top:50000/web-script/sis.user.js
// @match        https://sis001.com/*
// @match        https://sisurl.com/*
// @connect      https://sis001.com/*
// @connect      https://sisurl.com/*
// @grant        GM_addStyle
// ==/UserScript==

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const o=document.createElement("style");o.textContent=e,document.head.append(o)})(" .fixed-toolbar{position:fixed;top:20px;left:20px;z-index:99;background-color:#f0f0f0;padding:20px;border:1px solid #ccc;border-radius:5px;border:none;box-shadow:0 4px 12px #00000040;cursor:pointer;transition:all .3s ease} ");

(function () {
  'use strict';

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
    const regex = /^([^-]+)/;
    const match = title.match(regex);
    return match ? match[1].trim() : title;
  }
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
    }
  };
  let is_mobile = get_device_type();
  let config = is_mobile ? hooks.novelPage.mb : hooks.novelPage.pc;
  function getPostText(post) {
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
        console.log(e);
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
  function create_download_button() {
    var _a;
    const container = document.createElement("div");
    if (is_mobile) {
      container.classList.add("col");
      container.classList.add("footer-col");
    } else {
      container.classList.add("fixed-toolbar");
    }
    const button = document.createElement("input");
    button.type = "button";
    button.value = "Save";
    button.addEventListener("click", save);
    container.appendChild(button);
    (_a = document.querySelector(config.toolBar)) == null ? void 0 : _a.appendChild(container);
  }
  function create_checkboxs() {
    var posts = document.querySelectorAll(config.posts);
    posts.forEach((div) => {
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
    var first_checkbox = posts[0].querySelector("input[type='checkbox']");
    first_checkbox.checked = true;
  }
  function save() {
    var _a;
    var _title = (_a = document.querySelector(config.title)) == null ? void 0 : _a.textContent;
    let title = pure_title(_title != null ? _title : document.title);
    let posts = document.querySelectorAll(config.posts);
    let ctx = "";
    posts.forEach((post) => {
      const checkbox = post.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        let text = getPostText(post);
        ctx += text;
      }
    });
    console.log("下载章节：" + title);
    console.log(ctx);
    createAndDownloadFile(title + ".txt", ctx);
  }
  function novel_page_setup() {
    console.log("novel page");
    create_download_button();
    create_checkboxs();
  }
  console.log(location.href);
  if (location.href.search("thread") > 0) {
    novel_page_setup();
  }

})();