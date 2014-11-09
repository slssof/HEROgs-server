/**
 * Created by slshome on 31.07.14.
 */
var NodeRSA = require('node-rsa'); //Подключили библиотеку RSA
var rand = require('RNG'); //Мой ГПСЧ
var Hashes = require('jshashes'); // Генератор хэшей

var SHA256 =  new Hashes.SHA256; //Объект для хэша

var io = require('socket.io')(); //Создаем и запускаем сервер
io.on('connection', onconnect);
io.listen(3000);


function onconnect(socket) { //Что делать при коннекте клиента

    //Генерируем пары ключ/пароль для сервера и клиента
    var keyServer = new NodeRSA({b: 256});
    var keyClient = new NodeRSA({b: 256});
    privKeyServ = keyServer.getPrivatePEM();
    pubKeyServ = keyServer.getPublicPEM();
    privKeyClient = keyClient.getPrivatePEM();
    pubKeyClient = keyClient.getPublicPEM();
    /*console.log(privKeyServ);
    console.log(pubKeyServ);
    console.log(privKeyClient);
    console.log(pubKeyClient);*/
//    console.log(socket.id);
//    console.log(pubKeyServ);
    console.log('Encypr = ' + keyServer.encrypt("s"));
    console.log('Decrypt = ' + keyServer.decrypt(keyServer.encrypt("s")));
    var key = {};
    key.pub = pubKeyServ;
    key.priv = privKeyClient;
    message = JSON.stringify(key);
    socket.emit('sendKey', Encode(message, socket.id));

//Обработчик запроса занятости имени юзера
    socket.on('checkLoginName', function (data) {
//        login = JSON.parse(data);
//        console.log('Шифрованная строка = '+ login.login);
        checkName(keyServer.decrypt(JSON.parse(data)));
    });

//Обработчик запроса логина
    socket.on('login', function (data) {
        checkLogin(keyServer.decrypt(JSON.parse(data)));
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
                rez = true;
            } else {
                rez = false;
            }
            socket.emit('otvCheckLoginName', { exist: rez });
        });
    }

    function addUser(regData) {
        var validate = validator.matches(regData.login, /^[0-9A-Za-zА-Яа-яЁё\s!@#$()+.=]+$/) *
            validator.matches(regData.password, /^[0-9A-Za-zА-Яа-яЁё\s!@#$()+.=_]+$/) *
            validator.isEmail(regData.email) *
            validator.matches(regData.realName, /^[0-9A-Za-zА-Яа-яЁё\s]+$/) *
            validator.isDate(regData.birthDay);
        if ((regData.sex == 0)|| (regData.sex == 1)) validate = validate * 1; else validate = validate * 0;
        if ((regData.lang == 0)||(regData.lang == 1)) validate = validate * 1; else validate = validate * 0;

        if(validate) {
            console.log('validete = ' + validate);
            var dateReg = new Date();
//Добавляем юзера, сперва создаем юзера, потом берем его id делаем из него соль и с этой солью генерим пароль, записываем
            User.create([
                {
                    name      : regData.realName,
                    birthday  : regData.birthDay,
                    sex       : regData.sex,
                    login     : regData.login,
                    email     : regData.email,
                    workLevel : 0,
                    join      : dateReg,
                    lang      : regData.lang,
                    rank      : 0
                }
            ], function (err, items) {
                console.log(err);
                var userId;
                User.find({login: regData.login}, function (err, user) {
                    console.log("user= " + user);
                    if(user.length > 0) {
                        console.log("user[0].id= " + user[0].id);
                        userId = user[0].id;
                    } else {
                        console.log("User no created");
                    }
                    var password = SHA256.hex(regData.password + SHA256.hex(userId));
                    console.log("password = " + password);
                    user[0].password = password;
                    user[0].save(function (err) {
                        if(!err) socket.emit('userAdded',{rez: 0}); else console.log("Password not added");
                    });
                });

            });
        }
    }

}

var orm = require("orm"); //Подключили библиотеку БД
var transaction = require("orm-transaction"); // Подключили к ней транзакции

var User; //Задал переменную под модель данных
mysql_db = orm.connect("mysql://slsirk:Ktghbrjy__17@herogs.ru/HEROgs_data", function (err, db) {
    if (err) {
        console.log("Something is wrong with the connection", err);
        return;
    } else {
        console.log("Db connected!");
        db.use(transaction);
        db.load("./models/models", function (err) {
            // loaded!
            User = db.models.users;
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

