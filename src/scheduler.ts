import { pool, insertDB,deleteDB, queryRow } from './database';
import { notifier } from './notifier'
export interface Task {
  id: string;
  channel: string;
  delay: number;
  payload: object;
  url: string;
  token: string;
}

let timeouts = new Map<string, Map<string, NodeJS.Timeout>>();

function action(...args: any[]) {
  const t = args[0][0];
  timeouts.get(t.channel)?.delete(t.id);
  notifier(t).then(()=> {
    deleteDB(t);
  })
  .catch((err)=>{
    queryRow(`INSERT INTO test_data (centent) VALUE (?)`,[err.toString()])
    t.delay = 30;
    timeouts.get(t.channel)?.set(t.id, setTimeout(action, 30000, [t]));
  })
}

export function startSetTimeout(t: Task) {
  if(!timeouts.has(t.channel)){
    timeouts.set(t.channel, new Map<string, NodeJS.Timeout>());
  }
  if(!timeouts.get(t.channel)?.has(t.id)) {
    const delay = (t.delay > 0 ? t.delay : 0);
    timeouts.get(t.channel)?.set(t.id, setTimeout(action, delay * 1000, [t]));
  }
}

export function start(t: Task) {
  return new Promise((resolve,reject) => {
    insertDB(t).then(() => {
      startSetTimeout(t);
      resolve(undefined);
    }).catch((err) => {
      if(err.errno != 1062) reject(err);
      resolve(undefined);
    })
  })
}



export function end(t: Task) {
  clearTimeout(Number(timeouts.get(t.channel)?.get(t.id)));
  timeouts.get(t.channel)?.delete(t.id);
  return deleteDB(t);
}