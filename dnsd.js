var dnsd = require('dnsd');
var dns = require('native-dns');
var fs = require('fs');
// var conf = require(__dirname + '/dnsd.conf');
// var conf = require(__dirname + '/' + process.argv[2]);
var conf = JSON.parse(fs.readFileSync('dnsd.conf', 'utf-8'));

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

dnsd.createServer(function(req, res) {
    var question = res.question[0];
    var dNow = new Date();
    var localdate = (dNow.getMonth() + 1) + '/' + dNow.getDate() + '/' + dNow.getFullYear() + ' ' + dNow.getHours() + ':' + dNow.getMinutes();
    console.log('[%s] %s:%s -> %s (%s)', localdate ,req.connection.remoteAddress, req.connection.remotePort, question.name, question.type);

    if(question.type !== 'A') {
        return res.end();
    }

    var found = false;
    Object.keys(conf.match_rules).forEach(function(rule) {
        if(question.name.endsWith(rule)) {
            console.log('Response -> ' + conf.match_rules[rule]);
            found = true;
            res.answer.push({
                name: rule,
                type: 'A',
                data: conf.match_rules[rule],
                ttl: Math.floor(Math.random() * 3600)
            });
            return res.end();
        }
    });

    if(!found && conf.dns_relay) {
        console.log('Forward the query to ' + conf.relay_server);

        var relay = dns.Request({
            question: dns.Question({
                name: question.name,
                type: 'A',
            }),
            server: {
                address: conf.relay_server,
                port: 53,
                type: 'udp'
            },
        });

        relay.on('message', function (err, answer) {
            answer.answer.forEach(function (a) {
                //console.dir(a);
                if(!a.address) {
                    return;
                }
                console.log('-> ' + a.address);
                res.answer.push({
                    name: a.name,
                    type: 'A',
                    data: a.address,
                    ttl: a.ttl
                });
            });
        });

        relay.on('timeout', function () {
            //console.log('Timeout in making request');
            res.end();
        });

        relay.on('end', function () {
            res.end();
        });

        relay.send();
    } else {
        return res.end();
    }

}).listen(conf.bind_port, conf.bind_ip);

console.log('DNS Server is running ' + conf.bind_ip + ':' + conf.bind_port);