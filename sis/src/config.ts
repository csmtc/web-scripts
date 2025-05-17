export const hooks = {

    novelPage: {
        mb: {
            posts: "th[id^=\"postmessage\"]",
            title: "title",
            toolBar: "#bottomNav"
        },
        "pc": {
            posts: "div[id^=\"postmessage\"]>div[id^=\"postmessage\"]",
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
}

export const toolBarClass = 'tool';
export const serverURL = "https://atcra.top:58000"