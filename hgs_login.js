/**
 * Created by slshome on 31.07.14.
 */

var NodeRSA = require('node-rsa'); //Подключили библиотеку RSA
var rand = require('RNG'); //Мой ГПСЧ
var Hashes = require('jshashes'); // Генератор хэшей
var SHA256 =  new Hashes.SHA256; //Объект для хэша
var io = require('socket.io')(); //Создаем и запускаем сервер
io.on('connection', onconnect);
io.listen(3055);


function onconnect(socket) { //Что делать при коннекте клиента

    //Генерируем пары ключ/пароль для сервера и клиента
    var keyServer = new NodeRSA({b: 256});
    var keyClient = new NodeRSA({b: 256});
    privKeyServ = keyServer.getPrivatePEM();
    pubKeyServ = keyServer.getPublicPEM();
    privKeyClient = keyClient.getPrivatePEM();
    pubKeyClient = keyClient.getPublicPEM();
    var key = {};
    key.pub = pubKeyServ;
    key.priv = privKeyClient;
    var User = mysql_db.models.users;
    var Session = mysql_db.models.sessions;
    socket.emit('sendKey', Encode(JSON.stringify(key), socket.id));

//Обработчик запроса занятости имени юзера
    socket.on('checkLoginName', function (data) {
        checkName(keyServer.decrypt(JSON.parse(data)));
    });

//Обработчик запроса логина
    socket.on('login', function (data) {
        var oLogin = {};
        oLogin.login = keyServer.decrypt(data.login);
        oLogin.password = keyServer.decrypt(data.password);
        checkLogin(oLogin);
    });

//Обработчик запроса добавления юзера
    socket.on('regUser', function (data) {
        console.log(data);
        addUser(data);
    });

    //Функция проверки занятости имени
    function checkName(name) {
        var rez;
        User.find({ login: name }, function (err, people) {
            if(people.length > 0) {
                socket.emit('otvCheckLoginName', { exist: true });
            } else {
                socket.emit('otvCheckLoginName', { exist: false });
            }
        });
    };

    function addUser(regData) {
        var validate = validator.matches(regData.login, /^[0-9A-Za-zА-Яа-яЁё\s!@#$()+.=]+$/) *
            validator.matches(regData.password, /^[0-9A-Za-zА-Яа-яЁё\s!@#$()+.=_]+$/) *
            validator.isEmail(regData.email);
        if(validate) {
            console.log('validete = ' + validate);
            var dateReg = new Date();
//Добавляем юзера, сперва создаем юзера, потом берем его id делаем из него соль и с этой солью генерим пароль, записываем
            if (User) {
                User.create([
                    {
                        name: " ",
                        birthday: dateReg,
                        sex: 1,
                        login: regData.login,
                        email: regData.email,
                        workLevel: 0,
                        join: dateReg,
                        lang: 0,
                        rank: 0
                    }
                ], function (err, items) {
                    console.log(err);
                    var userId;
                    User.find({login: regData.login}, function (err, user) {
                        if (user.length > 0) {
                            userId = user[0].id;
                        } else {
                            console.log("User not created");
                        }
                        var password = SHA256.hex(regData.password + SHA256.hex(userId));
                        console.log("password = " + password);
                        user[0].save(function (err) {
                            if (!err) socket.emit('userAdded', {rez: 0}); else console.log("Password not added");
                        });
                    });
                });
            }
        }
    }

// Проверка логина
    function checkLogin(regData) {
        var userId;
        var userPassword;
        var validate = validator.matches(regData.login, /^[0-9A-Za-zА-Яа-яЁё\s!@#$()+.=]+$/) *
            validator.matches(regData.password, /^[0-9A-Za-zА-Яа-яЁё\s!@#$()+.=_]+$/);
        if(validate) {
//Находим юзера
            if (User) {
                User.find({login: regData.login}, function (err, user) {
                    if (user.length > 0) {
                        userId = user[0].id;
                        userPassword = user[0].password;
                        var password = SHA256.hex(regData.password + SHA256.hex(userId));
                        if (password === userPassword) {
                            console.log("create session");
                            createSession(userId);
                        } else {
                            socket.emit('loginError');
                        }
                    } else {
                        socket.emit('loginError');
                    }
                });
            }
        }
    }

    function createSession(data) {
        console.log("socket.handshake.address = " + socket.handshake.address.address);
        var datetime = new Date();
        if (Session) {
            Session.create([
                {
                    user: data,
                    ip: socket.handshake.address.address,
                    key: socket.id,
                    privKeyServ: keyServer.getPrivatePEM(),
                    pubKeyServ: keyServer.getPublicPEM(),
                    privKeyClient: keyClient.getPrivatePEM(),
                    pubKeyClient: keyClient.getPublicPEM(),
                    timeOpen: datetime
                }
            ], function (err, items) {
                console.log("CreateSession error = " + err);
                var oSess = {};

                Session.find({user: data}).order('-id').one(function (err, user) {
                    if (user.id > 0) {
                        socket.emit('createSession', user);
                        console.log("Session sended to Client");
                    } else {
                        console.log("Session not created");
                    }
                });

            });
        }
    }

}

var orm = require("orm"); //Подключили библиотеку БД

mysql_db = orm.connect("mysql://slsirk:Ktghbrjy__17@herogs.ru/HEROgs_data", function (err, db) {
    if (err) {
        console.log("Something is wrong with the connection", err);
        return;
    } else {
        console.log("Db connected!");
        db.load("./models/models", function (err) {
            // loaded!
            console.log("Models loaded");
//            User = db.models.users;
//            Session = db.models.sessions;
        });

        return db;
    }
});




//var validator = require('node-validator');
var validator = require('validator');




function Encode(to_enc, xor_key) // Функция шифрования
{
    var the_res="";
    var key_i = 0;
    for(i=0;i<to_enc.length;++i)
    {
        the_res+=String.fromCharCode(xor_key.charCodeAt(key_i++)^to_enc.charCodeAt(i));
        if (key_i > xor_key.length) key_i = 0;

    }
    return the_res;
}

function Decode(to_dec, xor_key) //Функция дешифровки
{
    var dec_res = "";
    var key_i = 0;
    for(i=0;i<to_dec.length;i++)
    {
        dec_res += String.fromCharCode(xor_key.charCodeAt(key_i++)^to_dec.charCodeAt(i));
        if (key_i > xor_key.length) key_i = 0;
    }
    return dec_res;
}

