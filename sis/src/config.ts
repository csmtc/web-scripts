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
}

export const toolBarClass = 'tool';