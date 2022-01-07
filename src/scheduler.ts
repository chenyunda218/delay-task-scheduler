import { insertDB,deleteDB, queryRow,updateDB } from './database';
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


function action(...args: any[] ) {
  let t = args[0][0];
  notifier(t).then(()=>{
    console.log(t);
    timeouts.get(t.channel)?.delete(t.id);
    console.log(timeouts);
    deleteDB(t)
  }).catch(()=>{
    t.delay = 30;
    retry(t);
  })
}

export function startSetTimeout(t: Task) {
  return new Promise((resolve,reject)=>{
    if(!timeouts.has(t.channel)) {
      timeouts.set(t.channel, new Map<string, NodeJS.Timeout>());
    }
    const timeout = timeouts.get(t.channel)?.get(t.id);
    const delay = (t.delay > 0 ? t.delay : 0);
    if(!timeout) {
      insertDB(t).then(()=>{
        timeouts.get(t.channel)?.set(t.id,setTimeout(action,delay * 1000, [t]));
        resolve(undefined);
      }).catch(reject)
    } else {
      updateDB(t).then(()=>{
        clearTimeout(timeout);
        timeouts.get(t.channel)?.set(t.id,setTimeout(action,delay * 1000, [t]));
        resolve(undefined);
      })
    }
  })
}

export function retry(t: Task) {
  if(!timeouts.has(t.channel)) {
    timeouts.set(t.channel, new Map<string, NodeJS.Timeout>());
  }
  const delay = (t.delay > 0 ? t.delay : 0);
  timeouts.get(t.channel)?.set(t.id,setTimeout(action,delay * 1000, [t]));
}


export function end(t: Task) {
  return deleteDB(t).then(()=>{
    const timeout = timeouts.get(t.channel)?.get(t.id);
    if(timeout) {
      clearTimeout(timeout);
      timeouts.get(t.channel)?.delete(t.id);
    }
  });
}