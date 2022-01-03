import axios from 'axios';
import { Task } from './scheduler';

export const notifier = (t: Task): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(t.url, t)
      .then(resolve)
      .catch(reject)
  })
}