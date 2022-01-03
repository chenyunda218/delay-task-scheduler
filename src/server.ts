import  express, { Express, Request, Response } from 'express';
import { end, start, Task } from './scheduler';

export const server: Express = express();

server.use(express.json())

interface CustomRequest<T> extends Request {
  body: T
}

server.post('/',(req: CustomRequest<Task>, res: Response) => {
  start(req.body).then(()=>{
    res.send();
  }).catch(()=>{
    res.status(500);
  });
})

server.post('/test',(req: CustomRequest<Task>, res: Response)=>{
  console.log(req.body); 
  res.send(200);
});

server.delete('/',(req: CustomRequest<Task>, res: Response) => {
  end(req.body).then(()=>{
    res.send();
  }).catch(()=>{
    res.status(500);
  });
})
