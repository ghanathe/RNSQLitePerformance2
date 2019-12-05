import SQLite from "react-native-sqlite-2";
// SQLite.DEBUG(false);
// SQLite.enablePromise(true);

const database_name = "RNSQLitePerformance.db";
const database_version = "1.0";
const database_displayname = "RNSQLitePerformance Database";
const database_size = 200000;

export default class Database {

  // runQueries accepts an array of arrays with form [[sql, args], [sql, args]]
  /*async runQueries(db, sqls) {
    const data = [];
    
    await db.transaction(async (tx) => {
        for (let index = 0; index < sqls.length; index++) {
            const [sql, args] = sqls[index];
            const result = await tx.executeSql(sql, args);
            data.push(...result[1].rows.raw());
        }
    });
    return data;
  }*/

  runQueries(db, sqls) {
    let data = [];
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          sqls.forEach((array) => {
            const [sql, args] = array;
            tx.executeSql(sql, args,
              (_, result) => {
                for (let i = 0; i < result.rows.length; ++i) {
                  data.push(result.rows.item(i));
                }
              },
              reject
            );
          });
        },
        reject,
        () => resolve(data),
      );
    });
  }

  generateString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

  generateInsertValues(fieldCount) {
    return [...Array(fieldCount).keys()].map(x => '?').join(', ');
  }

  generateUpdateValues(fieldCount) {
    return [...Array(fieldCount).keys()].map(x => `test${x} = ?`).join(', ');
  }

  generateInsertArgs(id, fieldCount, fieldLength) {
    const result = Array(fieldCount).fill().map(() => this.generateString(fieldLength));
    result.unshift(id);
    return result;
  }

  generateUpdateArgs(id, fieldCount, fieldLength) {
    return Array(fieldCount).fill().map(() => this.generateString(fieldLength)).concat(id);
  }

  generateCreateValues(fieldCount) {
    return [...Array(fieldCount).keys()].map(x => `test${x}`).join(', ');
  }

  async test(recordCount, fieldCount, fieldLength) {
    const result = {
        version: '',
        insertTime: 0,
        updateTime: 0,
        deleteTime: 0,
        selectTime: 0,
        recordCount,
        fieldCount,
        fieldLength,
    }
    try {
        // await SQLite.echoTest();
        const db = await SQLite.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size
          );
        
        const versionData = await this.runQueries(db, [ ['select sqlite_version() as version', []]]);
        result.version = versionData[0].version;
        const drops = [];
        drops.push(['DROP TABLE IF EXISTS Test', []]);
        await this.runQueries(db, drops);
        
        const creates = [];
        creates.push([`CREATE TABLE IF NOT EXISTS Test (testId, ${this.generateCreateValues(fieldCount)})`, []]);
        await this.runQueries(db, creates);

        const inserts = [];
        for (let i=0;i<recordCount;i++) {
            inserts.push([`INSERT INTO Test(testId, ${this.generateCreateValues(fieldCount)}) VALUES (${this.generateInsertValues(fieldCount + 1)})`,
            this.generateInsertArgs(i, fieldCount, fieldLength)]);
        }
        const start1= Date.now();
        await this.runQueries(db, inserts);
        result.insertTime = Date.now() - start1;


        const selects = [];
        selects.push(['SELECT * FROM Test', []]);
        const start2= Date.now();
        await this.runQueries(db, selects);
        result.selectTime = Date.now() - start2;

        const updates = [];
        for(let i=0;i<recordCount;i++) {
            updates.push([`UPDATE Test SET ${this.generateUpdateValues(fieldCount)} WHERE testId = ?`,
            this.generateUpdateArgs(i, fieldCount, fieldLength)]);
        }
        const start3= Date.now();
        await this.runQueries(db, updates);
        result.updateTime = Date.now() - start3;

        const deletes = [];
        for(let i=0;i<recordCount;i++) {
            deletes.push(['DELETE FROM Test WHERE testId = ?', [i]]);
        }
        const start4= Date.now();
        await this.runQueries(db, deletes);
        result.deleteTime = Date.now() - start4;

        // await db.close();
        
        
    } catch(error) {
        console.log(error);
    }
    return result;
    
  }

}