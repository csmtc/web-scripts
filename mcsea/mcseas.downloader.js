// ==UserScript==
// @name         McseaDownloader
// @namespace    https://mcseas.club/
// @version      2024.12.13.2
// @description  prettify and download novel on mcsea
// @author       You!
// @match        https://mcseas.club/*
// @connect      https://mcseas.club/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mcseas.club
// @updateURL    https://raw.githubusercontent.com/csmtc/web-scripts/main/mcsea/mcseas.downloader.js
// @downloadURL  https://raw.githubusercontent.com/csmtc/web-scripts/main/mcsea/mcseas.downloader.js
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==


(function () {
    'use strict';

    function assert(checkfunc, msg = "") {
        if (!checkfunc()) {
            window.alert(msg);
            throw new EvalError("Assert Failed." + msg);
        }
    }
    function assert_neq(obj, tgt, msg = "") {
        assert(() => obj !== tgt, msg);
    }

    var _first_log_timestamp = null;
    function log_time_cost() {
        if (_first_log_timestamp == null) {
            _first_log_timestamp = new Date().getTime();
        } else {
            var cur = new Date().getTime();
            console.log("Time cost(ms):" + (cur - _first_log_timestamp));
        }
    }



    //============================简繁转换START=================================
    //功能：转换指定字符串；
    function translateText(txt, isTradition2Simplify = true) {
        //功能：简体字符转为繁体字符；
        function s2t(cc) {
            var str = '', ss = jtpy(), tt = ftpy();
            for (var i = 0; i < cc.length; i++) {
                var c = cc.charAt(i);
                if (c.charCodeAt(0) > 10000 && ss.indexOf(c) != -1) str += tt.charAt(ss.indexOf(c));
                else str += c;
            }
            return str;
        }
        //功能：繁体字符转为简体字符；
        function t2s(cc) {
            var str = '', ss = jtpy(), tt = ftpy();
            for (var i = 0; i < cc.length; i++) {
                var c = cc.charAt(i);
                if (c.charCodeAt(0) > 10000 && tt.indexOf(c) != -1) str += ss.charAt(tt.indexOf(c));
                else str += c;
            }
            return str;
        }
        function jtpy() {
            return '皑蔼碍爱翱袄奥坝罢摆败颁办绊帮绑镑谤剥饱宝报鲍辈贝钡狈备惫绷笔毕毙闭边编贬变辩辫鳖瘪濒滨宾摈饼拨钵铂驳卜补参蚕残惭惨灿苍舱仓沧厕侧册测层诧搀掺蝉馋谗缠铲产阐颤场尝长偿肠厂畅钞车彻尘陈衬撑称惩诚骋痴迟驰耻齿炽冲虫宠畴踌筹绸丑橱厨锄雏础储触处传疮闯创锤纯绰辞词赐聪葱囱从丛凑窜错达带贷担单郸掸胆惮诞弹当挡党荡档捣岛祷导盗灯邓敌涤递缔点垫电淀钓调迭谍叠钉顶锭订东动栋冻斗犊独读赌镀锻断缎兑队对吨顿钝夺鹅额讹恶饿儿尔饵贰发罚阀珐矾钒烦范贩饭访纺飞废费纷坟奋愤粪丰枫锋风疯冯缝讽凤肤辐抚辅赋复负讣妇缚该钙盖干赶秆赣冈刚钢纲岗皋镐搁鸽阁铬个给龚宫巩贡钩沟构购够蛊顾剐关观馆惯贯广规硅归龟闺轨诡柜贵刽辊滚锅国过骇韩汉阂鹤贺横轰鸿红后壶护沪户哗华画划话怀坏欢环还缓换唤痪焕涣黄谎挥辉毁贿秽会烩汇讳诲绘荤浑伙获货祸击机积饥讥鸡绩缉极辑级挤几蓟剂济计记际继纪夹荚颊贾钾价驾歼监坚笺间艰缄茧检碱硷拣捡简俭减荐槛鉴践贱见键舰剑饯渐溅涧浆蒋桨奖讲酱胶浇骄娇搅铰矫侥脚饺缴绞轿较秸阶节茎惊经颈静镜径痉竞净纠厩旧驹举据锯惧剧鹃绢杰洁结诫届紧锦仅谨进晋烬尽劲荆觉决诀绝钧军骏开凯颗壳课垦恳抠库裤夸块侩宽矿旷况亏岿窥馈溃扩阔蜡腊莱来赖蓝栏拦篮阑兰澜谰揽览懒缆烂滥捞劳涝乐镭垒类泪篱离里鲤礼丽厉励砾历沥隶俩联莲连镰怜涟帘敛脸链恋炼练粮凉两辆谅疗辽镣猎临邻鳞凛赁龄铃凌灵岭领馏刘龙聋咙笼垄拢陇楼娄搂篓芦卢颅庐炉掳卤虏鲁赂禄录陆驴吕铝侣屡缕虑滤绿峦挛孪滦乱抡轮伦仑沦纶论萝罗逻锣箩骡骆络妈玛码蚂马骂吗买麦卖迈脉瞒馒蛮满谩猫锚铆贸么霉没镁门闷们锰梦谜弥觅绵缅庙灭悯闽鸣铭谬谋亩钠纳难挠脑恼闹馁腻撵捻酿鸟聂啮镊镍柠狞宁拧泞钮纽脓浓农疟诺欧鸥殴呕沤盘庞国爱赔喷鹏骗飘频贫苹凭评泼颇扑铺朴谱脐齐骑岂启气弃讫牵扦钎铅迁签谦钱钳潜浅谴堑枪呛墙蔷强抢锹桥乔侨翘窍窃钦亲轻氢倾顷请庆琼穷趋区躯驱龋颧权劝却鹊让饶扰绕热韧认纫荣绒软锐闰润洒萨鳃赛伞丧骚扫涩杀纱筛晒闪陕赡缮伤赏烧绍赊摄慑设绅审婶肾渗声绳胜圣师狮湿诗尸时蚀实识驶势释饰视试寿兽枢输书赎属术树竖数帅双谁税顺说硕烁丝饲耸怂颂讼诵擞苏诉肃虽绥岁孙损笋缩琐锁獭挞抬摊贪瘫滩坛谭谈叹汤烫涛绦腾誊锑题体屉条贴铁厅听烃铜统头图涂团颓蜕脱鸵驮驼椭洼袜弯湾顽万网韦违围为潍维苇伟伪纬谓卫温闻纹稳问瓮挝蜗涡窝呜钨乌诬无芜吴坞雾务误锡牺袭习铣戏细虾辖峡侠狭厦锨鲜纤咸贤衔闲显险现献县馅羡宪线厢镶乡详响项萧销晓啸蝎协挟携胁谐写泻谢锌衅兴汹锈绣虚嘘须许绪续轩悬选癣绚学勋询寻驯训讯逊压鸦鸭哑亚讶阉烟盐严颜阎艳厌砚彦谚验鸯杨扬疡阳痒养样瑶摇尧遥窑谣药爷页业叶医铱颐遗仪彝蚁艺亿忆义诣议谊译异绎荫阴银饮樱婴鹰应缨莹萤营荧蝇颖哟拥佣痈踊咏涌优忧邮铀犹游诱舆鱼渔娱与屿语吁御狱誉预驭鸳渊辕园员圆缘远愿约跃钥岳粤悦阅云郧匀陨运蕴酝晕韵杂灾载攒暂赞赃脏凿枣灶责择则泽贼赠扎札轧铡闸诈斋债毡盏斩辗崭栈战绽张涨帐账胀赵蛰辙锗这贞针侦诊镇阵挣睁狰帧郑证织职执纸挚掷帜质钟终种肿众诌轴皱昼骤猪诸诛烛瞩嘱贮铸筑驻专砖转赚桩庄装妆壮状锥赘坠缀谆浊兹资渍踪综总纵邹诅组钻致钟么为只凶准启板里雳余链泄';
        }
        function ftpy() {
            return '皚藹礙愛翺襖奧壩罷擺敗頒辦絆幫綁鎊謗剝飽寶報鮑輩貝鋇狽備憊繃筆畢斃閉邊編貶變辯辮鼈癟瀕濱賓擯餅撥缽鉑駁蔔補參蠶殘慚慘燦蒼艙倉滄廁側冊測層詫攙摻蟬饞讒纏鏟産闡顫場嘗長償腸廠暢鈔車徹塵陳襯撐稱懲誠騁癡遲馳恥齒熾沖蟲寵疇躊籌綢醜櫥廚鋤雛礎儲觸處傳瘡闖創錘純綽辭詞賜聰蔥囪從叢湊竄錯達帶貸擔單鄲撣膽憚誕彈當擋黨蕩檔搗島禱導盜燈鄧敵滌遞締點墊電澱釣調叠諜疊釘頂錠訂東動棟凍鬥犢獨讀賭鍍鍛斷緞兌隊對噸頓鈍奪鵝額訛惡餓兒爾餌貳發罰閥琺礬釩煩範販飯訪紡飛廢費紛墳奮憤糞豐楓鋒風瘋馮縫諷鳳膚輻撫輔賦複負訃婦縛該鈣蓋幹趕稈贛岡剛鋼綱崗臯鎬擱鴿閣鉻個給龔宮鞏貢鈎溝構購夠蠱顧剮關觀館慣貫廣規矽歸龜閨軌詭櫃貴劊輥滾鍋國過駭韓漢閡鶴賀橫轟鴻紅後壺護滬戶嘩華畫劃話懷壞歡環還緩換喚瘓煥渙黃謊揮輝毀賄穢會燴彙諱誨繪葷渾夥獲貨禍擊機積饑譏雞績緝極輯級擠幾薊劑濟計記際繼紀夾莢頰賈鉀價駕殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗漿蔣槳獎講醬膠澆驕嬌攪鉸矯僥腳餃繳絞轎較稭階節莖驚經頸靜鏡徑痙競淨糾廄舊駒舉據鋸懼劇鵑絹傑潔結誡屆緊錦僅謹進晉燼盡勁荊覺決訣絕鈞軍駿開凱顆殼課墾懇摳庫褲誇塊儈寬礦曠況虧巋窺饋潰擴闊蠟臘萊來賴藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫撈勞澇樂鐳壘類淚籬離裏鯉禮麗厲勵礫曆瀝隸倆聯蓮連鐮憐漣簾斂臉鏈戀煉練糧涼兩輛諒療遼鐐獵臨鄰鱗凜賃齡鈴淩靈嶺領餾劉龍聾嚨籠壟攏隴樓婁摟簍蘆盧顱廬爐擄鹵虜魯賂祿錄陸驢呂鋁侶屢縷慮濾綠巒攣孿灤亂掄輪倫侖淪綸論蘿羅邏鑼籮騾駱絡媽瑪碼螞馬罵嗎買麥賣邁脈瞞饅蠻滿謾貓錨鉚貿麽黴沒鎂門悶們錳夢謎彌覓綿緬廟滅憫閩鳴銘謬謀畝鈉納難撓腦惱鬧餒膩攆撚釀鳥聶齧鑷鎳檸獰甯擰濘鈕紐膿濃農瘧諾歐鷗毆嘔漚盤龐國愛賠噴鵬騙飄頻貧蘋憑評潑頗撲鋪樸譜臍齊騎豈啓氣棄訖牽扡釺鉛遷簽謙錢鉗潛淺譴塹槍嗆牆薔強搶鍬橋喬僑翹竅竊欽親輕氫傾頃請慶瓊窮趨區軀驅齲顴權勸卻鵲讓饒擾繞熱韌認紉榮絨軟銳閏潤灑薩鰓賽傘喪騷掃澀殺紗篩曬閃陝贍繕傷賞燒紹賒攝懾設紳審嬸腎滲聲繩勝聖師獅濕詩屍時蝕實識駛勢釋飾視試壽獸樞輸書贖屬術樹豎數帥雙誰稅順說碩爍絲飼聳慫頌訟誦擻蘇訴肅雖綏歲孫損筍縮瑣鎖獺撻擡攤貪癱灘壇譚談歎湯燙濤縧騰謄銻題體屜條貼鐵廳聽烴銅統頭圖塗團頹蛻脫鴕馱駝橢窪襪彎灣頑萬網韋違圍爲濰維葦偉僞緯謂衛溫聞紋穩問甕撾蝸渦窩嗚鎢烏誣無蕪吳塢霧務誤錫犧襲習銑戲細蝦轄峽俠狹廈鍁鮮纖鹹賢銜閑顯險現獻縣餡羨憲線廂鑲鄉詳響項蕭銷曉嘯蠍協挾攜脅諧寫瀉謝鋅釁興洶鏽繡虛噓須許緒續軒懸選癬絢學勳詢尋馴訓訊遜壓鴉鴨啞亞訝閹煙鹽嚴顔閻豔厭硯彥諺驗鴦楊揚瘍陽癢養樣瑤搖堯遙窯謠藥爺頁業葉醫銥頤遺儀彜蟻藝億憶義詣議誼譯異繹蔭陰銀飲櫻嬰鷹應纓瑩螢營熒蠅穎喲擁傭癰踴詠湧優憂郵鈾猶遊誘輿魚漁娛與嶼語籲禦獄譽預馭鴛淵轅園員圓緣遠願約躍鑰嶽粵悅閱雲鄖勻隕運蘊醞暈韻雜災載攢暫贊贓髒鑿棗竈責擇則澤賊贈紮劄軋鍘閘詐齋債氈盞斬輾嶄棧戰綻張漲帳賬脹趙蟄轍鍺這貞針偵診鎮陣掙睜猙幀鄭證織職執紙摯擲幟質鍾終種腫衆謅軸皺晝驟豬諸誅燭矚囑貯鑄築駐專磚轉賺樁莊裝妝壯狀錐贅墜綴諄濁茲資漬蹤綜總縱鄒詛組鑽緻鐘麼為隻兇準啟闆裡靂餘鍊洩';
        }

        if (txt == null || txt == "") return ""
        if (parseInt(isTradition2Simplify)) { return s2t(txt) } else { return t2s(txt) }
    }

    //功能：转换对象，使用递归，逐层剥到文本；
    function translateDOM(fobj = document.body, t2s = true) {
        var obj = typeof (fobj) == "object" ? fobj.childNodes : document.body.childNodes;
        for (var i = 0; i < obj.length; i++) {
            var OO = obj.item(i)
            if ("||BR|HR|TEXTAREA|".indexOf("|" + OO.tagName + "|") > 0) continue;
            if (OO.title != "" && OO.title != null) OO.title = translateText(OO.title, t2s);
            // if (OO.alt != "" && OO.alt != null) OO.alt = transformText(OO.alt, true);
            // if (OO.tagName == "INPUT" && OO.value != "" && OO.type != "text" && OO.type != "hidden") OO.value = transformText(OO.value, true);
            if (OO.nodeType == 3) { OO.data = translateText(OO.data, t2s) }
            else translateDOM(OO, t2s)
        }
    }

    //============================简繁转换END=================================




    /**
     * 检测到目标结点发生更新时，重新刷新内容
     * @param {Element} targetNode
     */
    function observeCtxUpdate(targetNode, novel_data) {

        /**
         * 调整正文内容格式
         * @param {string} mainText 
         * @returns {string} 格式化的正文内容
         */
        function prettify(mainText) {
            // 首行缩进2格，段落间空一行
            mainText = mainText.replace(/\n\s+/g, "\n\n\t");
            // console.log(mainText);
            return mainText
        }

        /**
         * 过滤目标结点的所有垃圾子节点
         * @param {Element} targetNode
         * @returns {Number} filtered_cnt 过滤的子结点个数
         */
        function filterTrashChildren(targetNode, class_names = "") {
            assert_neq(targetNode, null, "filter fail.targetNode is null.");
            assert_neq(targetNode.children, null, "filter fail.No children belong to targetNode.");
            // style:display:none
            // font.jammer
            class_names += "jammer|pstatus|blockcode";
            if (is_paid()) {
                class_names += "|locked";
            }
            function is_jammer(element) {
                return element.tagName == "font" ||
                    element.className.search(class_names) >= 0 ||
                    element.style.cssText.search("display:\\s*none") >= 0;
            };


            let filtered_trash_children_cnt = 0;
            /**
             * @param {Element} node
             */
            function iter(node) {
                if (node) {
                    for (let i = 0; i < node.children.length;) {
                        let ch = node.children[i];
                        // console.log(!is_jammer(ch), ch.tagName, ch.className, ch.style.cssText);
                        if (is_jammer(ch)) {
                            node.removeChild(ch);
                            ++filtered_trash_children_cnt;
                        } else {
                            iter(ch); ++i;
                        }
                    }
                }
            }
            iter(targetNode);
            // console.info("Filter trash nodes cnt=" + filtered_trash_children_cnt);

            return filtered_trash_children_cnt;
        }


        // 创建一个观察器实例并监听`targetNode`元素的变动
        let update_cnt = 0;
        const do_update = (mutationsList = null, observer = null) => {
            if (filterTrashChildren(targetNode) || update_cnt === 0) {
                translateDOM(targetNode);
                let text = targetNode.textContent;
                novel_data.mainText = prettify(text);
                ++update_cnt;
                console.info("Ctx Update times:" + update_cnt + "Now word cnts = ", novel_data.mainText.length);
                log_time_cost();
            }
        }
        const observer = new MutationObserver(do_update);
        // 观察器的配置（需要观察什么变动）
        const config = { attributes: true, childList: true, subtree: true };
        observer.observe(targetNode, config);
        do_update();
    }

    /**
     * 检查文章是否为免费文章或是已购买文章
     */
    function is_paid(doc = document) {
        return doc.querySelector("a.y.viewpay") === null;
    }
    class NovelData {
        title = ""
        writer = ""
        postTime = new Date(0)
        mainText = ""
        getWriter() {
            return this.writer;
        }
        getTitle() {
            return this.title;
        }
        getMainText() {
            return this.getTitle() + "\nposton " + this.postTime + "\n" + this.mainText;
        }
    }
    function saveNovelData(data) {
        /**
         * 创建并下载文件
         * @param {String} fileName 文件名
         * @param {String} content 文件内容
         * @param {String} type 文件MIME类型，默认为普通文本
         */
        function createAndDownloadFile(fileName, data, type = "text/plain;charset=utf-8") {
            // 创建Blob对象
            const blob = new Blob([data], { type: type });
            // 创建URL对象
            const url = URL.createObjectURL(blob);
            // 创建a标签
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            // 触发下载
            a.click();
            // 释放内存
            URL.revokeObjectURL(url);
        }

        createAndDownloadFile(data.getTitle() + "-" + data.getWriter() + ".txt", data.getMainText());
    }
    /**
     * 从指定Document中抓取小说数据
     * @param {Document} doc 
     * @param {boolean} is_pc 
     * @returns 
     */
    function extractNovelData(doc, is_pc) {
        let mainpost, data = new NovelData();
        if (is_pc) {
            mainpost = doc.querySelector("td[id^=postmessage_]");
            data.writer = doc.querySelector("a.xw1[href*=space]").textContent;
            data.postTime = doc.querySelector("em[id^=authorposton]").textContent;
            data.title = doc.querySelector("#thread_subject").textContent;
        } else {
            mainpost = doc.querySelector("#ainuoloadmore .message");
            data.writer = doc.querySelectorAll("a[href*=space]")[2].textContent;
            data.postTime = doc.querySelector("div.ainuo_avatar.cl > div.info.cl > div > span").textContent;
            data.title = doc.querySelector(".tit.cl>h1").textContent;
        }
        assert_neq(mainpost, null, "Mainpost is null.");
        assert(() => typeof (data.title) === "string" && data.title.length > 0, "Match title failed.");
        let postTimeMatch = data.postTime.match(/20\d{2}-\d{1,2}-\d{1,2}/);
        if (postTimeMatch) data.postTime = postTimeMatch[0];
        observeCtxUpdate(mainpost, data);

        return data;
    }

    /**
     * 在小说阅读页面过滤乱码，追加下载按钮
     */
    function novel_page_handle() {
        let novel_data = extractNovelData(document, is_pc);
        function download_cb() {
            saveNovelData(novel_data);
        };
        // 附加下载按钮
        let container;
        let btn = document.createElement('a');
        btn.innerText = "DL"; btn.style.display = "block";
        btn.style.fontWeight = "bold"; btn.style.backgroundColor = "pink"; btn.style.color = "white";
        btn.href = "javascript:void(0)"; btn.addEventListener("click", download_cb);

        if (is_pc) {
            container = document.createElement("li");
            document.querySelector(".pls.favatar").lastElementChild.appendChild(container);
        } else { // Mobile
            container = document.querySelector("#ainuo_quick_bot");
            btn.classList.add("ainuo_quick_post");
            container.removeChild(container.firstElementChild);
        }
        container.appendChild(btn);
        // GM_registerMenuCommand('Download', download_cb);
    }

    function writer_page_handle() {
        /**
        * 异步载入网页
        * @param {string} url 
        */
        async function xhr_get(url) {
            const promise = new Promise((resolve, reject) => {
                let headers = {
                    // "referer": document.location.href,
                    // 'User-Agent': navigator.userAgent,
                    // "cookie": document.cookie,
                    'Content-Type': 'text/html;charset=utf-8',
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-CN,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
                    "cache-control": "max-age=0",
                    "upgrade-insecure-requests": "1",
                }
                // USE XHR
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                for (let key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        let doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
                        resolve(doc);
                    }
                }
                xhr.send();
            })
            return promise;
        }

        function createButton(url) {
            let btn = document.createElement("input");
            btn.type = "button";
            btn.value = "下载";
            btn.addEventListener("click", async () => {
                let doc = await xhr_get(url);
                let novel_data = extractNovelData(doc, is_pc);
                if (is_paid(doc)) {
                    // console.log(novel_data);
                    saveNovelData(novel_data);
                } else {
                    btn.value = "未购买";
                    btn.checked = true;
                }

            })
            return btn;
        }
        if (is_pc) {
            let table = document.querySelector("#delform tbody");
            for (let i = 1; i < table.children.length; ++i) {
                let th = table.children[i].querySelector("th");
                let btn = createButton(th.firstElementChild.href);
                th.insertBefore(btn, th.firstChild);
            }
        } else {
            let postlist = document.querySelector(".ainuo_piclist ul");
            for (let c of postlist.children) {
                let a = c.querySelector("a.litwo"); c.removeChild(a);
                let btn = createButton(a.href);
                let box = a.firstElementChild; a.removeChild(box);
                let tbox = box.lastElementChild; box.removeChild(tbox);
                a.appendChild(tbox);
                box.appendChild(a); box.appendChild(btn);
                c.appendChild(box);

            }
        }
    }

    function main_page_handle() {
        const do_filter = () => {
            let popup = document.querySelector("#append_parent");
            if (popup) { popup.remove(); }
        };
        const observer = new MutationObserver(() => {
            do_filter();
            observer.disconnect();
        });
        observer.observe(document.querySelector("#nv_forum"), { childList: true });
        do_filter();
    }

    let is_pc = !/Mobi|Android|iPhone/i.test(navigator.userAgent);
    log_time_cost();
    document.title = translateText(document.title);
    if (/mod=viewthread/.test(location.href)) {
        console.info("McseaAssist:Novel Page");
        novel_page_handle();
    } else if (/mod=space/.test(location.href)) {
        console.info("McseaAssist:Writer Page");
        writer_page_handle();
    }
    else if (/forum.php\/?$/.test(location.href) && /view=me/.test(location.href)) {
        console.info("McseaAssist:Main Page");
        main_page_handle();
    }
    else if (/^file/.test(location.href)) {
        console.info("McseaAssist:Other Page");
        novel_page_handle();
        // writer_page_handle()
    }
})();


