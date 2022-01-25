import  express, { Express, Request, Response } from 'express';
import { queryRow } from './database';
import { end, startSetTimeout, Task } from './scheduler';

export const server: Express = express();

server.use(express.json())

interface CustomRequest<T> extends Request {
  body: T
}

server.put('/',(req: CustomRequest<Task>, res: Response) => {
  startSetTimeout(req.body).then(()=>{
    res.send();
  }).catch((err)=>{
    console.log(err)
    res.sendStatus(500);
  });
});

server.post('/test',(req: CustomRequest<Task>, res: Response)=>{
  console.log('/test',req.body); 
  res.sendStatus(200);
});

server.delete('/',(req: CustomRequest<Task>, res: Response) => {
  end(req.body).then(()=>{
    res.send();
  }).catch(()=>{
    res.sendStatus(500);
  });
});
