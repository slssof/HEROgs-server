/**
 * Created by slshome on 02.08.14.
 */

module.exports = function (db, cb) {
    db.define("users", {
        id        : { type: "serial", key: true },
        name      : { type: "text", size: 50 },
        birthday  : { type: "date", time: false },
        sex       : { type: "integer", size: 4},
        login     : { type: "text", size: 50 },
        password  : { type: "text", size: 64 },
        email     : { type: "text", size: 50 },
        workLevel : { type: "integer", size: 4},
        join      : { type: "date", time: false },
        lastVisit : { type: "date", time: true },
        lastIp    : { type: "text", size: 50 },
        sitter    : { type: "text", size: 50 },
        mute      : { type: "integer", size: 4},
        lang      : { type: "integer", size: 11},
        avatar    : { type: "text", size: 255 },
        rank      : { type: "integer", size: 4},
        lastLogin : { type: "date", time: true },
        otpusk    : { type: "date", time: false }
    });

    return cb();
};