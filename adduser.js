/**
 * Created by slshome on 31.07.14.
 */
var rand = require('RNG');
//var md5 = require('md5');
var Hashes = require('jshashes');

var SHA256 =  new Hashes.SHA256;



var orm = require("orm");
//var transaction = require("orm-transaction");
var User; //Задал переменную под модель данных
mysql_db = orm.connect("mysql://slsirk:Ktghbrjy__17@herogs.ru/HEROgs_data", function (err, db) {
    if (err) {
        console.log("Something is wrong with the connection", err);
        return;
    } else {
        console.log("Db connected!");
        db.load("./models/models", function (err) {
            // loaded!
            User = db.models.users;
        });
        User.find({ login: "slsirk" }, function (err, people) {
            // SQL: "SELECT * FROM person WHERE surname = 'Doe'"
            if(people.length > 0) {
                console.log("People found: %d", people.length);
                console.log("First person: %s, age %s", people[0].login, people[0].email);
            } else console.log("Хрен-на-нэ!");

            /*    people[0].age = 16;
             people[0].save(function (err) {
             // err.msg = "under-age";
             }); */
        });
        return db;
    }
});

/*
var User = mysql_db.define("users", {
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

*/

/*
User.create([
    {
        name      : "slsirk",
        sex       : 1,
        login     : "slsirk",
        lang      : "ru",
        rank      : 255
    }
], function (err, items) {

    console.log(err);
    // err - description of the error or null
    // items - array of inserted items
});
*/


//var password = "Ktghbrjy__17" + SHA256.hex(2);
//var pswd = SHA256.hex(password);
/*
User.get(2, function (err, John) {
    John.password = pswd;
    console.log(John);
    John.save(function (err) {
        console.log("saved!");
    });
});
*/
/*
User.find({ login: "slsirk" }, function (err, people) {
    // SQL: "SELECT * FROM person WHERE surname = 'Doe'"
    if(people.length > 0) {
        console.log("People found: %d", people.length);
        console.log("First person: %s, age %s", people[0].login, people[0].email);
    } else console.log("Хрен-на-нэ!");

//    people[0].age = 16;
//    people[0].save(function (err) {
//         err.msg = "under-age";
//    });
});
*/