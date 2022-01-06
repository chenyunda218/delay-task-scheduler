import mysql, {PoolConnection} from 'mysql';
import { startSetTimeout, Task } from './scheduler';
import { mysql as config } from './config';


const mysqlConfig = {...config, supportBigNumbers: true, bigNumberStrings: true};

export let pool = mysql.createPool(mysqlConfig)

export function deleteDB(t: Task): Promise<unknown> {
  let { id,channel } = t;
  return queryRow(`DELETE FROM ${mysqlConfig.table} WHERE channel = ? AND id = ?`,
    [channel,id]);
}

export function insertDB(t: Task): Promise<unknown> {
  let { id,channel,token,url,delay,payload } = t; 
  return queryRow(`INSERT INTO ${mysqlConfig.table} 
    (id,channel,token,url,payload,action_time) VALUE 
    (?,?,?,?,?,DATE_ADD(NOW(), INTERVAL ? SECOND))`, 
    [id,channel,token,url,JSON.stringify(payload),delay])
}

export let queryRow = (sql: string, args: Array<any>): Promise<any> => {
  return new Promise((resolve,reject)=>{
    pool.getConnection((err,conn)=>{
      if(err) reject(err)
      else {
        conn.query(sql,args, (err,results)=>{
          if(err) reject(err)
          else {
            resolve(results)
          }
        })
      }
    })
  })
}

export function initMysql(){
  return new Promise((resolve, reject)=>{
    pool.getConnection((err,conn: PoolConnection)=>{
      if(err) {
        reject(err)
      } else {
        conn.query(`
        CREATE TABLE IF NOT EXISTS ${mysqlConfig.table}
        (
        id BIGINT NOT NULL,
        channel CHAR(32) NOT NULL,
        payload JSON,
        url VARCHAR(512) NOT NULL,
        creation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        action_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        token VARCHAR(512) NOT NULL,
        PRIMARY KEY(channel,id)
        )CHARSET=utf8,ENGINE=InnoDB;
        `,[],(err)=>{
          if(err){
            reject(err)
          } else {
            conn.query(`SELECT id,payload,url,channel,token, TIMESTAMPDIFF(SECOND, NOW(), action_time) AS delay 
            FROM ${mysqlConfig.table}`,[],(err,results)=>{
              if(err) reject(err);
              else {
                results.forEach((e: any )=> {
                  let t: Task = {
                    ...e,
                    payload: JSON.parse(e.payload),
                  }
                  startSetTimeout(t)
                });
                resolve(undefined)
              }
            })
          }
        })
      }
    })
  })
}