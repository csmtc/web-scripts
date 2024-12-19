
export function assert(checkfunc, msg = "") {
    if (!checkfunc()) {
        window.alert(msg);
        throw new EvalError("Assert Failed." + msg);
    }
}
export function assert_neq(obj, tgt, msg = "") {
    assert(() => obj !== tgt, msg);
}

let _first_log_timestamp: number | null = null;
export function log_time_cost() {
    if (_first_log_timestamp == null) {
        _first_log_timestamp = new Date().getTime();
    } else {
        var cur = new Date().getTime();
        console.log("Time cost(ms):" + (cur - _first_log_timestamp));
    }
}
