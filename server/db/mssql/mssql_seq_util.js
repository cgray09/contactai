var log = require('../../logger')(module);
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

module.exports.updateSeqCurrVal = function (connection, seqName, seqVal, callback) {
    var sqlStr = 'UPDATE ALLSEQUENCES SET CURRVAL = @seqVal WHERE SEQNAME = @seqName';
    var request = new Request(sqlStr, (error, rowCount, rows) => {
        if (error) {
            log.error('ERROR :' + error);
            callback(error);
        } else {
            callback(null);
        }
    });
    request.addParameter('seqVal', TYPES.Int, seqVal);
    request.addParameter('seqName', TYPES.VarChar, seqName);
    connection.execSql(request);

}

module.exports.getSeqNextVal = function (connection, seqName, callback) {
    var sqlStr = 'SELECT CURRVAL + INCR FROM ALLSEQUENCES WHERE SEQNAME = @seqName';
    var request = new Request(sqlStr, (error, rowCount, rows) => {
        if (error) {
            log.error('ERROR :' + error);
            callback(error, null);
        } else {
            var seqNextVal = rows[0][0].value;
            this.updateSeqCurrVal(connection, seqName, seqNextVal, (error) => {
                if (error) {
                    log.error('Failed to update the sequence currval :', error);
                    callback(error, null);
                } else {
                    callback(null, seqNextVal);
                }
            });
        }
    });
    request.addParameter('seqName', TYPES.VarChar, seqName);
    connection.execSql(request);
}

module.exports.getSeqNextValWithoutUpdate = function (connection, seqName, callback) {
    var sqlStr = 'SELECT CURRVAL + INCR FROM ALLSEQUENCES WHERE SEQNAME = @seqName';
    var request = new Request(sqlStr, (error, rowCount, rows) => {
        if (error) {
            log.error('ERROR :' + error);
            callback(error, null);
        } else {
            var seqNextVal = rows[0][0].value;
            callback(null, seqNextVal);
        }
    });
    request.addParameter('seqName', TYPES.VarChar, seqName);
    connection.execSql(request);
}




