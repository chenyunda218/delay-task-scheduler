import axios from 'axios';
import { Task } from './scheduler';

export const notifier = (t: Task): Promise<any> => {
  return axios.post(t.url, t)
}