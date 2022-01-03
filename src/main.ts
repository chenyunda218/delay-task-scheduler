import { initMysql } from './database';
import { server } from './server';

initMysql().then(()=>{
 server.listen(5213, () => {
   console.log("listen:5213")
 })
})

