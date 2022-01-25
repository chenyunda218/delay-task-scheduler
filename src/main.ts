//import { initMysql } from './database';
//import { server } from './server';
//
//initMysql().then(()=>{
// server.listen(5213, () => {
//   console.log("listen:5213")
// })
//})

import  express, { Express, Request, Response } from 'express';
import axios from 'axios';

interface CustomRequest<T> extends Request {
  body: T
}

export interface Task {
  id: string;
  channel: string;
  delay: number;
  payload: object;
  url: string;
  token: string;
}

let timeouts = new Map<string, Map<string, NodeJS.Timeout>>();

export const server: Express = express();

server.use(express.json());

server.put('/',(req: CustomRequest<Task>, res: Response) => {
  let task: Task = req.body;
  createTask(task);
  res.send();
});

function createTask(task: Task) {
  task.delay = (task.delay > 0 ?task.delay : 0)
  if(!timeouts.has(task.channel)) {
    timeouts.set(task.channel, new Map<string, NodeJS.Timeout>());
  }
  const channel = timeouts.get(task.channel);
  if(channel.has(task.id)){
    deleteTimeout(task,true);
  }
  const timeout = setTimeout(() => {
    deleteTimeout(task);
    axios.post(task.url, task)
    .then(()=>{
      console.log("finish");
    }).catch(()=>{
      task.delay = 5;
      createTask(task);
    });
  }, task.delay * 1000);
  channel.set(task.id,timeout);
}

function deleteTimeout(task: Task,clear?: boolean) {
  if(clear) {
    clearTimeout(timeouts.get(task.channel).get(task.id));
  }
  timeouts.get(task.channel).delete(task.id);
}

server.delete('/',(req: CustomRequest<Task>, res: Response) => {
  let task = req.body;
  deleteTimeout(task,true);
  res.send();
});

server.post('/test',(req: CustomRequest<Task>, res: Response) => {
  let task = req.body;
  console.log(task);
  res.send();
});

server.listen(5213);